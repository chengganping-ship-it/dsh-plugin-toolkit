/**
 * DSH MCP Bridge - DSH to MCP Schema Converter
 *
 * Converts DSH defineTool format into MCP-compatible tool schema:
 *   DSH:  { name, description, parameters: { input_data: { type: 'string' } }, output: { schema, render }, execute }
 *   MCP:  { name, description, inputSchema: { type: 'object', properties: { input_data: { type: 'string' } } } }
 *
 * Key behaviors:
 * - Prefixes all tool names with plugin name (e.g. carbontradingagent.carbon_price_predictor)
 * - Parses input_data string parameter as JSON for flexible input
 * - Wraps DSH execute functions in MCP-compatible error handling
 *
 * @module dsh-mcp-bridge/tool-adapter
 * @version 1.0.0
 */

import type {
  DSHDefineTool,
  MCPToolDefinition,
  MCPToolSchema,
  BridgeToolDefinition,
} from './types.js';
import type { DiscoveredPlugin } from './types.js';

// =============================================================================
// Schema Conversion
// =============================================================================

/**
 * Convert a DSH defineTool parameters block to MCP JSON Schema.
 *
 * The DSH format always uses a single `input_data` string parameter
 * that contains a JSON-encoded object. The MCP schema exposes this
 * as a structured object property for better client comprehension.
 */
export function convertDSHSchemaToMCP(dshTool: DSHDefineTool): MCPToolSchema {
  const inputDataParam = dshTool.parameters.input_data;

  return {
    type: 'object',
    properties: {
      input_data: {
        type: 'string',
        description: inputDataParam.description || 'JSON-encoded input data for the tool',
      },
    },
    required: inputDataParam.required ? ['input_data'] : [],
  };
}

/**
 * Convert a single DSH defineTool definition to MCP tool format.
 *
 * @param dshTool - The DSH tool definition
 * @param pluginName - The short plugin name to use as prefix
 * @returns MCP-compatible tool definition
 */
export function convertDSHToolToMCP(dshTool: DSHDefineTool, pluginName: string): MCPToolDefinition {
  return {
    name: `${pluginName}.${dshTool.name}`,
    description: dshTool.description,
    inputSchema: convertDSHSchemaToMCP(dshTool),
  };
}

// =============================================================================
// Bridge Tool Factory
// =============================================================================

/**
 * Create a full BridgeToolDefinition (MCP schema + execute handler)
 * from a DSH defineTool and its parent plugin info.
 */
export function createBridgeTool(
  dshTool: DSHDefineTool,
  plugin: DiscoveredPlugin
): BridgeToolDefinition {
  return {
    name: `${plugin.shortName}.${dshTool.name}`,
    description: dshTool.description,
    inputSchema: convertDSHSchemaToMCP(dshTool),
    pluginName: plugin.shortName,
    originalName: dshTool.name,
    execute: dshTool.execute,
  };
}

// =============================================================================
// Input Parsing
// =============================================================================

/**
 * Safely parse input_data from a tool call.
 * The DSH convention is that input_data is a JSON string containing
 * the actual tool parameters.
 *
 * If parsing fails, the raw string is passed through.
 */
export function parseInputData(inputData: string): unknown {
  if (!inputData || typeof inputData !== 'string') {
    return inputData;
  }

  const trimmed = inputData.trim();
  if (!trimmed) {
    return {};
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    // If the input is not valid JSON, return it as-is
    return inputData;
  }
}

// =============================================================================
// Execution Wrapper
// =============================================================================

/**
 * Result of executing a bridge tool.
 */
export interface ToolExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  inputTokens: number;
  outputTokens: number;
}

/**
 * Execute a bridge tool with the given input_data string.
 * Wraps the DSH execute function with error handling and token estimation.
 */
export async function executeBridgeTool(
  tool: BridgeToolDefinition,
  inputData: string
): Promise<ToolExecutionResult> {
  const inputTokens = Math.ceil(inputData.length / 4);

  try {
    const output = await tool.execute({ input_data: inputData });
    const outputTokens = Math.ceil(output.length / 4);

    return {
      success: true,
      output,
      inputTokens,
      outputTokens,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    const output = `Error executing ${tool.name}: ${errorMessage}`;
    const outputTokens = Math.ceil(output.length / 4);

    return {
      success: false,
      output,
      error: errorMessage,
      inputTokens,
      outputTokens,
    };
  }
}

// =============================================================================
// Batch Tool Generation
// =============================================================================

/**
 * Generate MCP tool definitions from a plugin's discovered tools.
 * For plugins where we know tool names but don't have the actual
 * defineTool objects (from cordis.yml or source extraction),
 * we create stub MCP tools that route through the generic executor.
 *
 * @param plugin - The discovered plugin
 * @param knownTools - Map of tool name to DSH defineTool (if available)
 * @returns Array of MCP tool definitions for this plugin
 */
export function generateMCPToolsForPlugin(
  plugin: DiscoveredPlugin,
  knownTools?: Map<string, DSHDefineTool>
): MCPToolDefinition[] {
  const tools: MCPToolDefinition[] = [];

  for (const toolName of plugin.declaredTools) {
    const dshTool = knownTools?.get(toolName);

    if (dshTool) {
      tools.push(convertDSHToolToMCP(dshTool, plugin.shortName));
    } else {
      // Stub tool for tools known only by name
      tools.push({
        name: `${plugin.shortName}.${toolName}`,
        description: `DSH tool: ${toolName} from plugin ${plugin.name}`,
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

// =============================================================================
// Generic Executor (for dynamically loaded tools)
// =============================================================================

/**
 * Creates a generic execute handler for a plugin.
 * This loads the plugin module dynamically and calls the correct tool.
 *
 * Since DSH plugins export their tools via the apply(ctx) function,
 * the bridge maintains an in-memory registry of loaded tools after
 * plugin initialization.
 */
export class PluginToolRegistry {
  private tools: Map<string, BridgeToolDefinition> = new Map();

  /**
   * Register a tool in the registry.
   */
  register(tool: BridgeToolDefinition): void {
    this.tools.set(tool.name, tool);
  }

  /**
   * Register multiple tools.
   */
  registerAll(tools: BridgeToolDefinition[]): void {
    for (const tool of tools) {
      this.register(tool);
    }
  }

  /**
   * Get a tool by its full MCP name.
   */
  get(name: string): BridgeToolDefinition | undefined {
    return this.tools.get(name);
  }

  /**
   * Get all registered tools.
   */
  getAll(): BridgeToolDefinition[] {
    return Array.from(this.tools.values());
  }

  /**
   * Find a tool by plugin short name and original tool name.
   */
  findByOriginalName(pluginShortName: string, toolName: string): BridgeToolDefinition | undefined {
    const fullName = `${pluginShortName}.${toolName}`;
    return this.tools.get(fullName);
  }

  /**
   * Get the total number of registered tools.
   */
  get size(): number {
    return this.tools.size;
  }

  /**
   * Clear all registered tools.
   */
  clear(): void {
    this.tools.clear();
  }

  /**
   * Get all unique plugin names that have tools registered.
   */
  getPluginNames(): string[] {
    const names = new Set<string>();
    for (const tool of this.tools.values()) {
      names.add(tool.pluginName);
    }
    return Array.from(names).sort();
  }
}
