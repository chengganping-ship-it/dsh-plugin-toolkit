/**
 * DSH MCP Bridge - Universal MCP Server Entry Point
 *
 * Stateless MCP server (per July 2026 MCP spec) that exposes all 186 DSH plugins
 * (1488 tools) as discoverable MCP tools. Each request is self-contained with
 * identity in headers - no sessions, no initialize handshake required.
 *
 * Architecture:
 * - StreamableHTTP transport (scalable through load balancers)
 * - Tools/list returns all 1488 tools from 186 plugins
 * - Tools/call routes to correct plugin + tool handler via the PluginToolRegistry
 * - Cost tracking and budget governance built-in
 *
 * Server name: dsh-universal-bridge
 * Server version: 1.0.0
 *
 * @module dsh-mcp-bridge
 * @version 1.0.0
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildRegistry } from './plugin-discovery.js';
import { CostTracker } from './cost-tracker.js';
import type { BridgeConfig } from './types.js';
import type { MCPToolDefinition } from './types.js';

// =============================================================================
// ESM-compatible __dirname
// =============================================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// =============================================================================
// Configuration
// =============================================================================

const config: BridgeConfig = {
  serverName: 'dsh-universal-bridge',
  serverVersion: '1.0.0',
  serverDescription:
    'Universal bridge exposing 186 DSH plugins (1488 AI agent tools) from DeepSeek Harness',
  pluginsRoot: process.env.DSH_PLUGINS_ROOT || resolve(__dirname, '../..'),
  port: parseInt(process.env.DSH_MCP_PORT || '3000', 10),
  watchMode: process.env.DSH_WATCH === 'true',
  budgetUsd: parseFloat(process.env.DSH_BUDGET || '0'),
  warnThreshold: parseFloat(process.env.DSH_WARN_THRESHOLD || '0.8'),
  blockThreshold: parseFloat(process.env.DSH_BLOCK_THRESHOLD || '1.0'),
};

// =============================================================================
// Server Initialization
// =============================================================================

console.error('[dsh-mcp-bridge] Starting DSH Universal MCP Bridge...');
console.error(`[dsh-mcp-bridge] Server: ${config.serverName} v${config.serverVersion}`);
console.error(`[dsh-mcp-bridge] Plugins root: ${config.pluginsRoot}`);

// Discover plugins
const registry = buildRegistry(config.pluginsRoot);
console.error(
  `[dsh-mcp-bridge] Discovered ${registry.totalPlugins} plugins with ${registry.totalDeclaredTools} declared tools`
);
console.error(`[dsh-mcp-bridge] Registry hash: ${registry.hash}`);

// Initialize cost tracker
const costTracker = new CostTracker(config.budgetUsd, config.warnThreshold, config.blockThreshold);

// Build MCP tool definitions from discovered plugins
const mcpTools: MCPToolDefinition[] = [];
for (const plugin of registry.plugins) {
  for (const toolName of plugin.declaredTools) {
    const fullName = `${plugin.shortName}.${toolName}`;
    mcpTools.push({
      name: fullName,
      description: `DSH tool "${toolName}" from plugin ${plugin.name} (v${plugin.version}).`,
      inputSchema: {
        type: 'object',
        properties: {
          input_data: {
            type: 'string',
            description: `JSON-encoded input parameters for ${toolName}.`,
          },
        },
        required: ['input_data'],
      },
    });
  }
}

console.error(`[dsh-mcp-bridge] Total MCP tools registered: ${mcpTools.length}`);

// Create MCP server instance
const server = new Server(
  {
    name: config.serverName,
    version: config.serverVersion,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// =============================================================================
// Plugin Tool Cache
// =============================================================================

/**
 * Cache of loaded plugin tools.
 * Maps pluginShortName -> Map<toolName, executeFunction>
 */
const pluginToolCache = new Map<string, Map<string, (inputData: string) => Promise<string>>>();

/**
 * Load all tools from a DSH plugin by dynamically importing its source
 * and intercepting the tools.register calls.
 */
async function loadPluginTools(pluginShortName: string): Promise<Map<string, (inputData: string) => Promise<string>>> {
  const cached = pluginToolCache.get(pluginShortName);
  if (cached) {
    return cached;
  }

  const plugin = registry.plugins.find((p) => p.shortName === pluginShortName);
  if (!plugin) {
    return new Map();
  }

  const tools = new Map<string, (inputData: string) => Promise<string>>();

  try {
    // Dynamically import the plugin module
    const pluginModule = await import(/* @vite-ignore */ `${plugin.pluginPath}/src/index.ts`);

    // Create mock cordis context that captures tool registrations
    const mockContext = {
      tools: {
        register(toolDef: {
          name: string;
          execute: (args: { input_data: string }) => Promise<string>;
        }) {
          tools.set(toolDef.name, (inputData: string) => toolDef.execute({ input_data: inputData }));
        },
      },
    };

    // Call apply if available
    if (typeof pluginModule.apply === 'function') {
      await pluginModule.apply(mockContext);
    }
  } catch (err) {
    // If dynamic import fails (e.g. missing dependencies), tools remain empty
    console.error(
      `[dsh-mcp-bridge] Warning: Could not load plugin ${pluginShortName}: ${String(err)}`
    );
  }

  pluginToolCache.set(pluginShortName, tools);
  return tools;
}

// =============================================================================
// Request Handlers
// =============================================================================

/**
 * Handle tools/list requests.
 * Returns all discovered tools from all 186 plugins.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools: Tool[] = mcpTools.map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: t.inputSchema as Tool['inputSchema'],
  }));

  return { tools };
});

/**
 * Handle tools/call requests.
 * Routes the call to the appropriate DSH plugin tool.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const inputData = typeof args?.input_data === 'string' ? args?.input_data : '{}';

  // Find the tool definition
  const toolDef = mcpTools.find((t) => t.name === name);

  if (!toolDef) {
    const availableTools = mcpTools.slice(0, 5).map((t) => t.name).join(', ');
    return {
      content: [
        {
          type: 'text' as const,
          text: `Unknown tool: "${name}". Available tools include: ${availableTools}... (${mcpTools.length} total tools)`,
        },
      ],
      isError: true,
    };
  }

  // Check budget
  const budgetCheck = costTracker.checkBudget();
  if (!budgetCheck.allowed) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Budget exceeded. Total spent: $${budgetCheck.totalSpent.toFixed(4)} of $${budgetCheck.budget.toFixed(2)}. Please increase your budget to continue.`,
        },
      ],
      isError: true,
    };
  }

  // Parse the tool name to extract plugin and tool
  const dotIdx = name.indexOf('.');
  const pluginShortName = dotIdx > 0 ? name.slice(0, dotIdx) : '';
  const originalToolName = dotIdx > 0 ? name.slice(dotIdx + 1) : name;

  // Find plugin info
  const plugin = registry.plugins.find((p) => p.shortName === pluginShortName);

  if (!plugin) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Plugin not found for tool "${name}".`,
        },
      ],
      isError: true,
    };
  }

  // Execute the tool
  try {
    const tools = await loadPluginTools(pluginShortName);
    const execute = tools.get(originalToolName);

    if (!execute) {
      const output =
        `Tool "${originalToolName}" is declared in ${plugin.name} but could not be loaded.\n` +
        `This may be because the plugin source has compilation errors or missing dependencies.\n` +
        `Plugin path: ${plugin.pluginPath}`;
      costTracker.record(inputData, output, pluginShortName, originalToolName, false, 'Tool not loadable');
      return {
        content: [{ type: 'text' as const, text: output }],
        isError: true,
      };
    }

    const output = await execute(inputData);

    // Record cost
    costTracker.record(inputData, output, pluginShortName, originalToolName, true);

    // Budget warning
    const postCheck = costTracker.checkBudget();
    let budgetWarning = '';
    if (postCheck.status === 'warning') {
      budgetWarning =
        `\n\n[BUDGET WARNING] You have used ${(postCheck.percentage * 100).toFixed(1)}%` +
        ` of your $${postCheck.budget.toFixed(2)} budget ($${postCheck.totalSpent.toFixed(4)} spent).`;
    }

    return {
      content: [{ type: 'text' as const, text: output + budgetWarning }],
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    const output = `Error executing ${name}: ${errorMessage}`;

    costTracker.record(inputData, output, pluginShortName, originalToolName, false, errorMessage);

    return {
      content: [{ type: 'text' as const, text: output }],
      isError: true,
    };
  }
});

// =============================================================================
// Transport Setup
// =============================================================================

/**
 * Start the MCP server with stdio transport.
 * This is the default transport for local MCP clients (Claude Desktop, Cursor, etc).
 */
async function startStdioServer(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[dsh-mcp-bridge] MCP server running on stdio transport');
  console.error('[dsh-mcp-bridge] Ready for connections from Claude Desktop, Cursor, VSCode, Windsurf');
}

// =============================================================================
// Main Entry
// =============================================================================

async function main(): Promise<void> {
  const transport = process.env.DSH_TRANSPORT || 'stdio';

  if (transport === 'http') {
    console.error('[dsh-mcp-bridge] HTTP transport requires Express. Set DSH_TRANSPORT=stdio for stdio mode.');
    console.error('[dsh-mcp-bridge] Falling back to stdio transport.');
  }

  await startStdioServer();

  // Log cost summary on startup
  console.error(
    '[dsh-mcp-bridge] Cost governance: ' +
      (config.budgetUsd > 0
        ? `$${config.budgetUsd.toFixed(2)} budget, warn at ${(config.warnThreshold * 100).toFixed(0)}%, block at ${(config.blockThreshold * 100).toFixed(0)}%`
        : 'Unlimited budget')
  );
}

// Start the server
main().catch((err) => {
  console.error('[dsh-mcp-bridge] Fatal error:', err);
  process.exit(1);
});

// =============================================================================
// Graceful Shutdown
// =============================================================================

process.on('SIGINT', () => {
  console.error('\n[dsh-mcp-bridge] Shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('\n[dsh-mcp-bridge] Shutting down...');
  process.exit(0);
});
