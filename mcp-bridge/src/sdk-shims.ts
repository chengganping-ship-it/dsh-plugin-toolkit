/**
 * Runtime shims for @modelcontextprotocol/sdk subpath imports.
 *
 * The SDK's package.json "exports" map uses extensionless targets
 * ("./dist/cjs/*") which Node 24 does not resolve correctly for require().
 * These shims re-export the actual CJS modules via their direct file paths,
 * with locally-defined structural types to avoid cross-module type naming.
 */

// ---------------------------------------------------------------------------
// Module type references (from SDK declaration files)
// ---------------------------------------------------------------------------

type ServerModule = typeof import('../node_modules/@modelcontextprotocol/sdk/dist/cjs/server/index.js');
type TypesModule = typeof import('../node_modules/@modelcontextprotocol/sdk/dist/cjs/types.js');
type StdioModule = typeof import('../node_modules/@modelcontextprotocol/sdk/dist/cjs/server/stdio.js');

// ---------------------------------------------------------------------------
// Runtime requires (bypass the broken exports map)
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-var-requires
const serverModule = require('../node_modules/@modelcontextprotocol/sdk/dist/cjs/server/index.js') as ServerModule;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const typesModule = require('../node_modules/@modelcontextprotocol/sdk/dist/cjs/types.js') as TypesModule;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const stdioModule = require('../node_modules/@modelcontextprotocol/sdk/dist/cjs/server/stdio.js') as StdioModule;

// ---------------------------------------------------------------------------
// Re-exports
// ---------------------------------------------------------------------------

export const Server: ServerModule['Server'] = serverModule.Server;
export const CallToolRequestSchema: TypesModule['CallToolRequestSchema'] = typesModule.CallToolRequestSchema;
export const ListToolsRequestSchema: TypesModule['ListToolsRequestSchema'] = typesModule.ListToolsRequestSchema;
export const StdioServerTransport: StdioModule['StdioServerTransport'] = stdioModule.StdioServerTransport;

// ---------------------------------------------------------------------------
// Local type definitions (structurally compatible with SDK types)
// ---------------------------------------------------------------------------

/**
 * MCP Tool definition — structurally compatible with the SDK's Tool type.
 */
export interface Tool {
  name: string;
  description?: string;
  inputSchema: {
    type: 'object';
    properties?: Record<string, unknown>;
    required?: string[];
  };
  annotations?: Record<string, unknown>;
}
