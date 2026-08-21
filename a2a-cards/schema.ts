/**
 * A2A Protocol v1.0 — AgentCard TypeScript Interfaces
 *
 * Per Google A2A v1.0 specification (May 2026 GA).
 * Defines the full AgentCard structure and all sub-types used by the
 * DSH Plugin Toolkit A2A card generator.
 *
 * @see https://a2a-protocol.org
 * @module schema
 */

// =============================================================================
// Core AgentCard
// =============================================================================

/** A2A v1.0 AgentCard — describes a single agent participating in the protocol */
export interface AgentCard {
  /** Unique human-readable name of the agent */
  name: string

  /** Detailed description of what the agent does and its capabilities */
  description: string

  /** Base URL where this agent's A2A endpoint can be reached */
  url: string

  /** Version string, semver recommended (e.g. "1.0.0") */
  version: string

  /** Optional URL to the agent's documentation or homepage */
  documentationUrl?: string

  /** Capabilities supported by this agent */
  capabilities: AgentCapabilities

  /** Authentication scheme(s) required to interact with this agent */
  authentication: AuthenticationScheme

  /** Supported input MIME types for task submission */
  defaultInputModes: string[]

  /** Supported output MIME types for task results */
  defaultOutputModes: string[]

  /** Skills (tools) exposed by this agent */
  skills: AgentSkill[]
}

// =============================================================================
// Capabilities
// =============================================================================

/** Feature flags describing what extended capabilities the agent supports */
export interface AgentCapabilities {
  /** Whether the agent supports streaming responses via Server-Sent Events */
  streaming?: boolean

  /** Whether the agent supports push notifications for task status changes */
  pushNotifications?: boolean

  /** Whether the agent records and exposes state transition history */
  stateTransitionHistory?: boolean

  /** Whether the agent supports delegated task execution to sub-agents */
  delegation?: boolean

  /** Whether the agent supports skill discovery at runtime */
  skillDiscovery?: boolean
}

// =============================================================================
// Authentication
// =============================================================================

/** Authentication requirements for the agent endpoint */
export interface AuthenticationScheme {
  /** List of supported authentication scheme identifiers */
  schemes: string[]

  /** Optional credential or token required (for "bearer" or "api_key" schemes) */
  credentials?: string
}

// =============================================================================
// Skills
// =============================================================================

/** A single skill (tool) that the agent can execute on behalf of a caller */
export interface AgentSkill {
  /** Unique identifier for this skill within the agent */
  id: string

  /** Human-readable name of the skill */
  name: string

  /** Detailed description of what the skill does */
  description: string

  /** Free-form tags for categorisation and discovery */
  tags: string[]

  /** Example natural-language prompts that would invoke this skill */
  examples: string[]

  /** Override input modes for this skill (falls back to agent defaults) */
  inputModes?: string[]

  /** Override output modes for this skill (falls back to agent defaults) */
  outputModes?: string[]
}

// =============================================================================
// Internal: Cordis.yml parsed structure
// =============================================================================

/** Parsed representation of a DSH plugin cordis.yml manifest */
export interface CordisManifest {
  /** Plugin identifier (directory name) */
  id: string

  /** Plugin display name */
  name: string

  /** Plugin version */
  version: string

  /** Plugin description (may be multi-line) */
  description: string

  /** Author identifier */
  author: string

  /**
   * List of tool identifiers registered by this plugin.
   * Some manifests store this as a bare count (e.g. `tools: 8`) instead of
   * an enumerated list; in that case `tools` holds the raw string and the
   * generator falls back to discovering tools from source code.
   */
  tools: string | string[]
}

/** Enriched tool descriptor with description extracted from source code */
export interface ToolDescriptor {
  /** Tool identifier (snake_case) */
  id: string

  /** Human-readable tool name */
  name: string

  /** Tool description extracted from defineTool() in src/index.ts */
  description: string

  /** Input parameter names */
  inputParams: string[]
}
