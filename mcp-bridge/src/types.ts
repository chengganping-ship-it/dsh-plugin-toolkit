/**
 * DSH MCP Bridge - Shared Types
 *
 * Type definitions for the Universal MCP Adapter that exposes all 186 DSH plugins
 * (1488 tools) as MCP-compatible tool servers.
 *
 * @module dsh-mcp-bridge
 * @version 1.0.0
 */

// =============================================================================
// DSH Plugin Discovery Types
// =============================================================================

/**
 * Represents a single tool within a DSH plugin as declared in cordis.yml.
 * The cordis.yml format lists tools as simple string names.
 */
export interface CordisToolDeclaration {
  /** Tool name as registered by the plugin's defineTool call */
  name: string;
}

/**
 * Parsed cordis.yml structure (two known formats).
 *
 * Format 1 (legacy - e.g. carbontradingagent):
 *   - id: dsh-tool-xxx
 *   - name: dsh-tool-xxx
 *   - version: 0.1.0
 *   - description: ...
 *   - author: ...
 *   - tools: [tool_name_1, tool_name_2, ...]
 *
 * Format 2 (compact - e.g. energyagentpro):
 *   - name: energyagentpro
 *   - version: 1.0.0
 *   - description: ...
 *   - author: ...
 *   - tools: 8  (count only, not a list)
 */
export interface CordisYml {
  id?: string;
  name: string;
  version: string;
  description: string;
  author?: string;
  tools?: string[] | number;
  homepage?: string;
  repository?: string;
}

/**
 * A discovered DSH plugin with metadata extracted from cordis.yml.
 */
export interface DiscoveredPlugin {
  /** Plugin directory name (e.g. "dsh-tool-carbontradingagent") */
  directoryName: string;
  /** Short plugin name (e.g. "carbontradingagent") */
  shortName: string;
  /** Full plugin id/name from cordis.yml */
  name: string;
  /** Plugin version */
  version: string;
  /** Plugin description */
  description: string;
  /** Author */
  author: string;
  /** Absolute path to cordis.yml */
  cordisPath: string;
  /** Absolute path to the plugin directory */
  pluginPath: string;
  /** List of tool names declared in cordis.yml (may be empty for compact format) */
  declaredTools: string[];
  /** Tool count hint (from compact-format cordis.yml where tools is a number) */
  toolCountHint: number;
}

// =============================================================================
// MCP Tool Adapter Types
// =============================================================================

/**
 * DSH defineTool format as found in plugin source.
 */
export interface DSHDefineTool {
  name: string;
  description: string;
  parameters: {
    input_data: {
      type: string;
      required: boolean;
      description: string;
    };
  };
  output: {
    schema: { type: string };
    render: (args: unknown, value: unknown) => MCPOutputContent[];
  };
  execute: (args: { input_data: string }) => Promise<string>;
}

/**
 * MCP-compatible tool inputSchema (JSON Schema).
 */
export interface MCPToolSchema {
  type: 'object';
  properties: Record<string, unknown>;
  required?: string[];
}

/**
 * MCP output content types.
 */
export type MCPOutputContent =
  | { type: 'text'; text: string }
  | { type: 'image'; data: string; mimeType: string }
  | { type: 'resource'; resource: { uri: string; mimeType?: string; text?: string; blob?: string } };

/**
 * Full MCP tool definition returned by tools/list.
 */
export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: MCPToolSchema;
}

/**
 * Internal representation of an executable tool in the bridge.
 */
export interface BridgeToolDefinition extends MCPToolDefinition {
  /** Plugin that owns this tool */
  pluginName: string;
  /** Original DSH tool name (without plugin prefix) */
  originalName: string;
  /** The DSH execute function */
  execute: (args: { input_data: string }) => Promise<string>;
}

// =============================================================================
// Cost Tracker Types
// =============================================================================

/**
 * Cost tracking record for a single tool invocation.
 */
export interface ToolCallRecord {
  /** Plugin name */
  plugin: string;
  /** Tool name (full MCP-prefixed name) */
  tool: string;
  /** Timestamp */
  timestamp: Date;
  /** Estimated input token count */
  inputTokens: number;
  /** Estimated output token count */
  outputTokens: number;
  /** Estimated cost in USD (rough heuristic) */
  estimatedCostUsd: number;
  /** Whether the call succeeded */
  success: boolean;
  /** Error message if failed */
  error?: string;
}

/**
 * Aggregated cost report per plugin.
 */
export interface PluginCostReport {
  plugin: string;
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalEstimatedCostUsd: number;
}

/**
 * Overall cost governance state.
 */
export interface CostGovernanceState {
  /** All call records */
  records: ToolCallReport[];
  /** Per-plugin aggregation */
  byPlugin: Map<string, PluginCostReport>;
  /** Total budget in USD */
  budgetUsd: number;
  /** Warning threshold (0.0 to 1.0) */
  warnThreshold: number;
  /** Block threshold (0.0 to 1.0) */
  blockThreshold: number;
}

/**
 * Serialized cost record for export.
 */
export interface ToolCallReport {
  plugin: string;
  tool: string;
  timestamp: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
  success: boolean;
  error?: string;
}

// =============================================================================
// Server Types
// =============================================================================

/**
 * Configuration for the MCP Bridge server.
 */
export interface BridgeConfig {
  /** Server name advertised to MCP clients */
  serverName: string;
  /** Server version */
  serverVersion: string;
  /** Server description */
  serverDescription: string;
  /** Parent directory to scan for dsh-tool-* plugins */
  pluginsRoot: string;
  /** HTTP port for StreamableHTTP transport */
  port: number;
  /** Whether to enable watch mode for hot-reload */
  watchMode: boolean;
  /** Budget in USD (0 = unlimited) */
  budgetUsd: number;
  /** Warning threshold (0.0 to 1.0, default 0.8) */
  warnThreshold: number;
  /** Block threshold (0.0 to 1.0, default 1.0) */
  blockThreshold: number;
}

/**
 * Default bridge configuration.
 */
export const DEFAULT_BRIDGE_CONFIG: BridgeConfig = {
  serverName: 'dsh-universal-bridge',
  serverVersion: '1.0.0',
  serverDescription:
    'Universal bridge exposing 186 DSH plugins (1488 AI agent tools) from DeepSeek Harness',
  pluginsRoot: '..',
  port: 3000,
  watchMode: false,
  budgetUsd: 0,
  warnThreshold: 0.8,
  blockThreshold: 1.0,
};
