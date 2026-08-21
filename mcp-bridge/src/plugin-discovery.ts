/**
 * DSH MCP Bridge - Plugin Auto-Discovery Engine
 *
 * Scans the parent directory for all dsh-tool-* plugins, parses each
 * cordis.yml to extract plugin name, version, and tools list.
 * Returns a registry of all discovered plugins with their tools.
 * Supports hot-reload (watch mode) via fs.watch on cordis.yml files.
 *
 * @module dsh-mcp-bridge/plugin-discovery
 * @version 1.0.0
 */

import { readdirSync, readFileSync, existsSync, watch, FSWatcher } from 'node:fs';
import { join, resolve, basename } from 'node:path';
import { createHash } from 'node:crypto';
import type { DiscoveredPlugin, CordisYml } from './types.js';

// =============================================================================
// YAML Lightweight Parser
// =============================================================================

/**
 * Minimal YAML parser for cordis.yml files.
 * Handles the two known formats used across all 186 DSH plugins:
 *
 * Format 1 (list tools):
 *   tools:
 *     - tool_name_1
 *     - tool_name_2
 *
 * Format 2 (count):
 *   tools: 8
 *
 * Does NOT handle nested objects beyond one level (sufficient for cordis.yml).
 */
function parseSimpleYaml(content: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = content.split('\n');
  let currentKey: string | null = null;
  let currentList: string[] | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    // Skip empty lines and comments
    if (!line.trim() || line.trim().startsWith('#')) {
      continue;
    }

    const indent = line.length - line.trimStart().length;

    // List item
    if (line.trimStart().startsWith('- ') && indent >= 2) {
      if (currentList) {
        const item = line.trimStart().slice(2).trim();
        // Remove inline comments and quotes
        const cleanItem = item
          .replace(/#.*$/, '')
          .trim()
          .replace(/^["']|["']$/g, '');
        if (cleanItem) {
          currentList.push(cleanItem);
        }
      }
      continue;
    }

    // Key-value pair
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim();

      // If there is already a pending list, save it before starting a new key
      if (currentKey && currentList) {
        result[currentKey] = currentList;
        currentKey = null;
        currentList = null;
      }

      // If value is present on the same line
      if (value) {
        // Remove inline comments (outside quotes)
        const cleanValue = value.replace(/#.*$/, '').trim().replace(/^["']|["']$/g, '');

        // Try number
        if (/^-?\d+(\.\d+)?$/.test(cleanValue)) {
          result[key] = parseFloat(cleanValue);
        } else if (cleanValue === 'true') {
          result[key] = true;
        } else if (cleanValue === 'false') {
          result[key] = false;
        } else {
          result[key] = cleanValue;
        }
      } else {
        // Value on subsequent lines (list or object)
        currentKey = key;
        currentList = [];
      }
    }
  }

  // Save last pending list
  if (currentKey && currentList) {
    result[currentKey] = currentList;
  }

  return result;
}

// =============================================================================
// Plugin Discovery
// =============================================================================

/**
 * Discover all DSH plugins in the given root directory.
 * Scans for dsh-tool-* plugin directories and parses their cordis.yml metadata.
 *
 * @param pluginsRoot - Absolute path to the directory containing dsh-tool-* folders
 * @returns Array of discovered plugins sorted by name
 */
export function discoverPlugins(pluginsRoot: string): DiscoveredPlugin[] {
  const resolvedRoot = resolve(pluginsRoot);
  const plugins: DiscoveredPlugin[] = [];

  let entries: string[];
  try {
    entries = readdirSync(resolvedRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && entry.name.startsWith('dsh-tool-'))
      .map((entry) => entry.name);
  } catch {
    console.error(`[plugin-discovery] Cannot read directory: ${resolvedRoot}`);
    return [];
  }

  for (const dirName of entries) {
    const cordisPath = join(resolvedRoot, dirName, 'cordis.yml');

    if (!existsSync(cordisPath)) {
      // Plugin exists but has no cordis.yml - still discover with minimal info
      const shortName = dirName.replace(/^dsh-tool-/, '');
      plugins.push({
        directoryName: dirName,
        shortName,
        name: dirName,
        version: '0.0.0',
        description: `DSH Plugin: ${dirName}`,
        author: 'unknown',
        cordisPath: '',
        pluginPath: join(resolvedRoot, dirName),
        declaredTools: [],
        toolCountHint: 0,
      });
      continue;
    }

    try {
      const raw = readFileSync(cordisPath, 'utf-8');
      const parsed = parseSimpleYaml(raw);

      const name = (parsed.name as string) || dirName;
      const version = (parsed.version as string) || '0.1.0';
      const description = (parsed.description as string) || '';
      const author = (parsed.author as string) || 'unknown';

      const shortName = dirName.replace(/^dsh-tool-/, '');

      let declaredTools: string[] = [];
      let toolCountHint = 0;

      if (Array.isArray(parsed.tools)) {
        declaredTools = parsed.tools as string[];
        toolCountHint = declaredTools.length;
      } else if (typeof parsed.tools === 'number') {
        toolCountHint = parsed.tools;
      }

      plugins.push({
        directoryName: dirName,
        shortName,
        name,
        version,
        description,
        author,
        cordisPath,
        pluginPath: join(resolvedRoot, dirName),
        declaredTools,
        toolCountHint,
      });
    } catch (err) {
      console.warn(`[plugin-discovery] Failed to parse ${cordisPath}: ${String(err)}`);
      // Still add the plugin with minimal info
      const shortName = dirName.replace(/^dsh-tool-/, '');
      plugins.push({
        directoryName: dirName,
        shortName,
        name: dirName,
        version: '0.0.0',
        description: `DSH Plugin: ${dirName} (parse error)`,
        author: 'unknown',
        cordisPath,
        pluginPath: join(resolvedRoot, dirName),
        declaredTools: [],
        toolCountHint: 0,
      });
    }
  }

  // Sort by name for deterministic output
  plugins.sort((a, b) => a.name.localeCompare(b.name));

  return plugins;
}

// =============================================================================
// Tool Extraction from Source
// =============================================================================

/**
 * Extract tool definitions from a plugin's source code.
 * Parses the src/index.ts file to find tools.register(defineTool({...})) calls.
 *
 * This enables the bridge to discover tools even when cordis.yml uses
 * the compact format (tools: N count only).
 *
 * @param pluginPath - Absolute path to the plugin directory
 * @returns Array of tool names extracted from source
 */
export function extractToolsFromSource(pluginPath: string): string[] {
  const indexPath = join(pluginPath, 'src', 'index.ts');
  if (!existsSync(indexPath)) {
    return [];
  }

  try {
    const source = readFileSync(indexPath, 'utf-8');
    const tools: string[] = [];

    // Match defineTool({ ... name: 'tool_name' ... })
    // Also matches name: "tool_name"
    const toolDefineRegex = /defineTool\s*\(\s*\{[\s\S]*?name\s*:\s*['"]([^'"]+)['"]/g;
    let match: RegExpExecArray | null;

    while ((match = toolDefineRegex.exec(source)) !== null) {
      tools.push(match[1]);
    }

    return tools;
  } catch {
    return [];
  }
}

// =============================================================================
// Rich Discovery (with source fallback)
// =============================================================================

/**
 * Discover plugins with full tool extraction.
 * For plugins with compact cordis.yml (tools: N), falls back to
 * parsing src/index.ts to get actual tool names.
 *
 * @param pluginsRoot - Absolute path to the directory containing dsh-tool-* folders
 * @returns Array of discovered plugins with resolved tool lists
 */
export function discoverPluginsDeep(pluginsRoot: string): DiscoveredPlugin[] {
  const plugins = discoverPlugins(pluginsRoot);

  for (const plugin of plugins) {
    if (plugin.declaredTools.length === 0 && plugin.toolCountHint > 0) {
      // Compact format - extract from source
      const sourceTools = extractToolsFromSource(plugin.pluginPath);
      if (sourceTools.length > 0) {
        plugin.declaredTools = sourceTools;
        plugin.toolCountHint = sourceTools.length;
      }
    } else if (plugin.declaredTools.length === 0 && plugin.cordisPath) {
      // No tools listed at all - try source extraction
      const sourceTools = extractToolsFromSource(plugin.pluginPath);
      if (sourceTools.length > 0) {
        plugin.declaredTools = sourceTools;
        plugin.toolCountHint = sourceTools.length;
      }
    }
  }

  return plugins;
}

// =============================================================================
// Discovery Registry
// =============================================================================

/**
 * Computed registry of all discovered plugins and tools.
 */
export interface PluginRegistry {
  plugins: DiscoveredPlugin[];
  totalPlugins: number;
  totalDeclaredTools: number;
  /** MD5 hash of the discovery result (for change detection) */
  hash: string;
  /** Discovery timestamp */
  discoveredAt: Date;
}

/**
 * Build a complete registry from the plugins root directory.
 * This is the primary entry point for the MCP server.
 *
 * @param pluginsRoot - Absolute path to the directory containing dsh-tool-* folders
 * @returns Complete plugin registry
 */
export function buildRegistry(pluginsRoot: string): PluginRegistry {
  const plugins = discoverPluginsDeep(pluginsRoot);
  const totalDeclaredTools = plugins.reduce((sum, p) => sum + p.declaredTools.length, 0);

  const hashInput = plugins.map((p) => `${p.name}:${p.version}:${p.declaredTools.join(',')}`).join('|');
  const hash = createHash('md5').update(hashInput).digest('hex');

  return {
    plugins,
    totalPlugins: plugins.length,
    totalDeclaredTools,
    hash,
    discoveredAt: new Date(),
  };
}

// =============================================================================
// Watch Mode (Hot Reload)
// =============================================================================

/**
 * Watch the plugins directory for changes to cordis.yml files.
 * Triggers a callback when changes are detected for hot-reload support.
 *
 * @param pluginsRoot - Absolute path to the directory containing dsh-tool-* folders
 * @param onChange - Callback invoked when a cordis.yml changes
 * @returns FSWatcher instance (call .close() to stop watching)
 */
export function watchPlugins(pluginsRoot: string, onChange: (pluginDir: string) => void): FSWatcher {
  const resolvedRoot = resolve(pluginsRoot);

  const watcher = watch(resolvedRoot, { persistent: true }, (eventType, filename) => {
    if (filename && filename.startsWith('dsh-tool-')) {
      // Debounce: wait a moment for file writes to settle
      setTimeout(() => {
        onChange(filename);
      }, 100);
    }
  });

  return watcher;
}

// =============================================================================
// Utility
// =============================================================================

/**
 * Get a summary string of the discovered registry.
 */
export function getRegistrySummary(registry: PluginRegistry): string {
  const lines: string[] = [];
  lines.push(`Discovered ${registry.totalPlugins} plugins with ${registry.totalDeclaredTools} declared tools`);
  lines.push(`Registry hash: ${registry.hash}`);
  lines.push(`Discovered at: ${registry.discoveredAt.toISOString()}`);
  lines.push('');
  lines.push('Plugins:');
  for (const p of registry.plugins) {
    const toolCount = p.declaredTools.length || p.toolCountHint;
    lines.push(`  - ${p.name} (v${p.version}) - ${toolCount} tools`);
  }
  return lines.join('\n');
}
