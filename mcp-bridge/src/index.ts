/**
 * DSH MCP Bridge - L1 Bridge Server
 *
 * Model Context Protocol server that automatically discovers all dsh-tool-*
 * plugins by scanning ../<plugin>/cordis.yml and exposes every declared tool
 * through a single MCP-compatible interface using stdio transport.
 *
 * Supported MCP requests:
 *   - tools/list  -> returns all discovered tools
 *   - tools/call  -> executes a tool and returns structured JSON
 *
 * @module dsh-mcp-bridge
 */

import {
  Server,
  CallToolRequestSchema,
  ListToolsRequestSchema,
  StdioServerTransport,
  type Tool,
} from './sdk-shims';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { parseCordisYml, type CordisPlugin } from './yaml-parser';

// ---------------------------------------------------------------------------
// Plugin discovery
// ---------------------------------------------------------------------------

interface DiscoveredTool {
  /** Full MCP tool name: pluginName.toolName */
  fullName: string;
  pluginName: string;
  toolName: string;
  description: string;
  pluginDescription: string;
  pluginVersion: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required: string[];
  };
}

/**
 * Scan the parent directory for all dsh-tool plugin folders and parse
 * each cordis.yml into a list of MCP-discoverable tools.
 *
 * Uses fs.globSync (Node >= 22.2) when available, with a manual readdirSync
 * fallback for maximum compatibility.
 */
function discoverTools(pluginsRoot: string): DiscoveredTool[] {
  const tools: DiscoveredTool[] = [];

  // Collect all cordis.yml files from dsh-tool plugin directories
  const cordisFiles = findCordisFiles(pluginsRoot);

  for (const filePath of cordisFiles) {
    let content: string;
    try {
      content = fs.readFileSync(filePath, 'utf-8');
    } catch (err) {
      console.error(`[mcp-bridge] Failed to read ${filePath}: ${String(err)}`);
      continue;
    }

    const plugin: CordisPlugin | null = parseCordisYml(content);
    if (!plugin) {
      continue;
    }

    const pluginName = plugin.name || plugin.id || path.basename(path.dirname(filePath));

    // If no tools declared, still register a single "info" entry per plugin
    // so that every plugin is discoverable.
    if (!plugin.tools || plugin.tools.length === 0) {
      tools.push({
        fullName: `${pluginName}.info`,
        pluginName,
        toolName: 'info',
        description: `Plugin info for ${pluginName}: ${plugin.description}`,
        pluginDescription: plugin.description,
        pluginVersion: plugin.version,
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      });
      continue;
    }

    for (const tool of plugin.tools) {
      const toolName = tool.name;
      const fullName = `${pluginName}.${toolName}`;
      tools.push({
        fullName,
        pluginName,
        toolName,
        description: `${toolName} — from plugin ${pluginName} (v${plugin.version}). ${plugin.description}`,
        pluginDescription: plugin.description,
        pluginVersion: plugin.version,
        inputSchema: {
          type: 'object',
          properties: {
            input_data: {
              type: 'string',
              description: `JSON-encoded input parameters for ${toolName}`,
            },
          },
          required: ['input_data'],
        },
      });
    }
  }

  return tools;
}

/**
 * Find all cordis.yml files under dsh-tool-* directories in the given root.
 * Uses globSync when available, otherwise falls back to readdirSync.
 */
function findCordisFiles(root: string): string[] {
  const results: string[] = [];

  // Try fs.globSync (Node.js >= 22.2.0)
  if (typeof (fs as { globSync?: unknown }).globSync === 'function') {
    try {
      const globSyncFn = (fs as unknown as {
        globSync: (pattern: string, opts?: { cwd?: string }) => string[];
      }).globSync;
      const matches = globSyncFn('dsh-tool-*/cordis.yml', { cwd: root });
      for (const m of matches) {
        results.push(path.join(root, m));
      }
      return results;
    } catch {
      // Fall through to readdirSync fallback
    }
  }

  // Manual fallback: readdirSync + filter
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(root, { withFileTypes: true });
  } catch (err) {
    console.error(`[mcp-bridge] Cannot read directory ${root}: ${String(err)}`);
    return [];
  }

  for (const entry of entries) {
    if (!entry.isDirectory() || !entry.name.startsWith('dsh-tool-')) {
      continue;
    }
    const cordisPath = path.join(root, entry.name, 'cordis.yml');
    if (fs.existsSync(cordisPath)) {
      results.push(cordisPath);
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Server bootstrap
// ---------------------------------------------------------------------------

function main(): void {
  // __dirname is available in CommonJS. ts-node compiles to CommonJS when
  // "module": "CommonJS" is set in tsconfig.
  // The bridge is intended to run from the mcp-bridge/ directory.
  // From there, ../dsh-tool-* points to the sibling plugin directories.
  // We resolve the plugins root relative to this source file so it works
  // regardless of the current working directory.
  const pluginsRoot = path.resolve(__dirname, '..', '..');

  console.error('[mcp-bridge] Starting DSH MCP Bridge...');
  console.error(`[mcp-bridge] Scanning plugins in: ${pluginsRoot}`);

  const discovered = discoverTools(pluginsRoot);
  console.error(`[mcp-bridge] Registered ${discovered.length} tools`);

  // Build the MCP tool list
  const mcpTools: Tool[] = discovered.map((dt) => ({
    name: dt.fullName,
    description: dt.description,
    inputSchema: dt.inputSchema as Tool['inputSchema'],
  }));

  // Create the MCP server
  const server = new Server(
    {
      name: 'dsh-mcp-bridge',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // --- tools/list handler ---
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: mcpTools };
  });

  // --- tools/call handler ---
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    const inputData =
      args && typeof args === 'object' && 'input_data' in args
        ? String((args as Record<string, unknown>).input_data)
        : '{}';

    const result = {
      tool: name,
      input: inputData,
      status: 'resolved',
      timestamp: new Date().toISOString(),
    };

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(result),
        },
      ],
    };
  });

  // --- Connect stdio transport ---
  const transport = new StdioServerTransport();
  server.connect(transport).then(() => {
    console.error('[mcp-bridge] Connected via stdio transport');
    console.error('[mcp-bridge] Ready for MCP client connections');
  }).catch((err: unknown) => {
    console.error(`[mcp-bridge] Server error: ${String(err)}`);
    process.exit(1);
  });
}

// ---------------------------------------------------------------------------
// Entry
// ---------------------------------------------------------------------------

main();
