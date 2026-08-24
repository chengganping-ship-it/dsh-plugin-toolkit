/**
 * Minimal YAML parser for cordis.yml files.
 *
 * Handles the specific structure used across all dsh-tool-* plugins:
 *
 *   # Comment
 *   - id: dsh-tool-xxx
 *     name: dsh-tool-xxx
 *     version: 0.1.0
 *     description: ...
 *     author: ...
 *     tools:
 *       - tool_name_1
 *       - tool_name_2
 *
 * Limitations: does not handle nested objects beyond one level of list
 * indentation. This is sufficient for the cordis.yml format.
 */

export interface CordisToolDecl {
  /** Tool name as listed under the tools: section */
  name: string;
}

export interface CordisPlugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  tools: CordisToolDecl[];
}

/**
 * Strip inline comments from a YAML value, respecting quotes.
 */
function stripInlineComment(raw: string): string {
  let inSingle = false;
  let inDouble = false;

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
    } else if (ch === '"' && !inSingle) {
      inDouble = !inDouble;
    } else if (ch === '#' && !inSingle && !inDouble) {
      return raw.slice(0, i);
    }
  }
  return raw;
}

/**
 * Remove surrounding single or double quotes from a string value.
 */
function unquote(raw: string): string {
  const t = raw.trim();
  if (
    (t.startsWith("'") && t.endsWith("'")) ||
    (t.startsWith('"') && t.endsWith('"'))
  ) {
    return t.slice(1, -1);
  }
  return t;
}

/**
 * Parse a single cordis.yml file content into a CordisPlugin.
 * Returns null if the file does not contain a valid plugin entry.
 */
export function parseCordisYml(content: string): CordisPlugin | null {
  const lines = content.split(/\r?\n/);

  let currentPlugin: CordisPlugin | null = null;
  let currentKey: string | null = null;
  let pendingList: string[] | null = null;

  for (const rawLine of lines) {
    // Preserve leading whitespace for indent calculation
    const line = rawLine.replace(/[\r\n]+$/, '');
    const stripped = line.trim();

    // Skip empty lines and full-line comments
    if (!stripped || stripped.startsWith('#')) {
      continue;
    }

    const indent = line.length - line.trimStart().length;

    // --- List item detection ---
    if (stripped.startsWith('- ')) {
      const itemText = stripped.slice(2).trim();

      // Flush any pending list before processing a new item
      if (currentKey && pendingList && currentPlugin) {
        if (currentKey === 'tools') {
          currentPlugin.tools = pendingList.map((t) => ({ name: t }));
        }
        currentKey = null;
        pendingList = null;
      }

      // Indented list item (tools list member)
      if (indent >= 2 && currentPlugin) {
        const cleanItem = unquote(stripInlineComment(itemText));
        if (cleanItem) {
          if (pendingList) {
            pendingList.push(cleanItem);
          } else {
            pendingList = [cleanItem];
            // Try to infer key from context
            currentKey = 'tools';
          }
        }
        continue;
      }

      // Top-level list item: "- id: xxx" or "- name: xxx"
      const colonIdx = itemText.indexOf(':');
      if (colonIdx > 0) {
        const key = itemText.slice(0, colonIdx).trim();
        const rawVal = itemText.slice(colonIdx + 1).trim();
        const value = unquote(stripInlineComment(rawVal));

        currentPlugin = {
          id: key === 'id' ? value : '',
          name: '',
          version: '',
          description: '',
          author: '',
          tools: [],
        };

        if (key !== 'id' && value) {
          // First key is not id, store under actual key
          // (should not normally happen, but be safe)
        }
      }
      continue;
    }

    // --- Key-value pair ---
    const colonIdx = stripped.indexOf(':');
    if (colonIdx > 0) {
      const key = stripped.slice(0, colonIdx).trim();
      const rawVal = stripped.slice(colonIdx + 1).trim();
      const value = unquote(stripInlineComment(rawVal));

      // Flush any pending list from previous key
      if (currentKey && pendingList && currentPlugin) {
        if (currentKey === 'tools') {
          currentPlugin.tools = pendingList.map((t) => ({ name: t }));
        }
        currentKey = null;
        pendingList = null;
      }

      if (value) {
        // Scalar value
        if (currentPlugin) {
          switch (key) {
            case 'id':
              currentPlugin.id = value;
              break;
            case 'name':
              currentPlugin.name = value;
              break;
            case 'version':
              currentPlugin.version = value;
              break;
            case 'description':
              currentPlugin.description = value;
              break;
            case 'author':
              currentPlugin.author = value;
              break;
          }
        }
      } else {
        // Value on subsequent lines (opens a list)
        currentKey = key;
        pendingList = [];
      }
      continue;
    }
  }

  // Flush trailing pending list
  if (currentKey && pendingList && currentPlugin) {
    if (currentKey === 'tools') {
      currentPlugin.tools = pendingList.map((t) => ({ name: t }));
    }
  }

  return currentPlugin;
}
