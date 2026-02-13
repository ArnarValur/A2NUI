/**
 * A2UI v0.10 Message Processor
 *
 * Parses JSONL messages and builds a reactive component tree.
 * Inspired by web_core's A2uiMessageProcessor but native to v0.10.
 */
import type {
  A2uiEnvelope,
  RawComponent,
  ResolvedNode,
  Surface
} from './types'

/**
 * Process a single A2UI message and mutate the surface state.
 */
export function processMessage(
  surfaces: Map<string, Surface>,
  message: A2uiEnvelope
): string | null {
  if (message.createSurface) {
    const cs = message.createSurface
    const surface: Surface = {
      surfaceId: cs.surfaceId,
      catalogId: cs.catalogId,
      theme: cs.theme ?? {},
      sendDataModel: cs.sendDataModel ?? false,
      components: new Map(),
      dataModel: {},
      rootNode: null
    }
    surfaces.set(cs.surfaceId, surface)
    return cs.surfaceId
  }

  if (message.updateComponents) {
    const uc = message.updateComponents
    const surface = surfaces.get(uc.surfaceId)
    if (!surface) {
      console.warn(`[A2UI] Surface "${uc.surfaceId}" not found for updateComponents`)
      return null
    }
    for (const comp of uc.components) {
      surface.components.set(comp.id, comp)
    }
    surface.rootNode = rebuildTree(surface)
    return uc.surfaceId
  }

  if (message.updateDataModel) {
    const udm = message.updateDataModel
    const surface = surfaces.get(udm.surfaceId)
    if (!surface) {
      console.warn(`[A2UI] Surface "${udm.surfaceId}" not found for updateDataModel`)
      return null
    }
    const path = udm.path ?? '/'
    if (path === '/' && typeof udm.value === 'object' && udm.value !== null) {
      surface.dataModel = udm.value as Record<string, unknown>
    } else if (path !== '/') {
      setByPath(surface.dataModel, path, udm.value)
    }
    // Rebuild tree to re-resolve data bindings
    surface.rootNode = rebuildTree(surface)
    return udm.surfaceId
  }

  if (message.deleteSurface) {
    surfaces.delete(message.deleteSurface.surfaceId)
    return message.deleteSurface.surfaceId
  }

  return null
}

/**
 * Parse a JSONL string (potentially multiple lines) into individual messages.
 */
export function parseJsonl(text: string): A2uiEnvelope[] {
  const messages: A2uiEnvelope[] = []
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue
    try {
      const parsed = JSON.parse(trimmed) as A2uiEnvelope
      if (parsed.version === 'v0.10') {
        messages.push(parsed)
      }
    } catch {
      // Skip malformed lines — expected during streaming
    }
  }
  return messages
}

// --- Tree Building ---

function rebuildTree(surface: Surface): ResolvedNode | null {
  const rootComp = surface.components.get('root')
  if (!rootComp) return null

  const visited = new Set<string>()
  return buildNode('root', surface, visited, '/')
}

function buildNode(
  componentId: string,
  surface: Surface,
  visited: Set<string>,
  dataContextPath: string
): ResolvedNode | null {
  if (visited.has(componentId)) {
    console.warn(`[A2UI] Circular reference detected: "${componentId}"`)
    return null
  }

  const raw = surface.components.get(componentId)
  if (!raw) return null

  visited.add(componentId)

  const { id, component: type, weight, ...rest } = raw
  const properties: Record<string, unknown> = { ...rest }
  const children: ResolvedNode[] = []

  // Resolve child references — children can be an array of IDs
  if (Array.isArray(properties.children)) {
    for (const childId of properties.children) {
      if (typeof childId === 'string') {
        const childNode = buildNode(childId, surface, visited, dataContextPath)
        if (childNode) children.push(childNode)
      }
    }
    delete properties.children
  }

  // Resolve single child reference
  if (typeof properties.child === 'string' && surface.components.has(properties.child)) {
    const childNode = buildNode(properties.child, surface, visited, dataContextPath)
    if (childNode) children.push(childNode)
    delete properties.child
  }

  // Resolve tabItems children
  if (Array.isArray(properties.tabItems)) {
    properties.tabItems = (properties.tabItems as Array<Record<string, unknown>>).map((tab) => {
      const resolved = { ...tab }
      if (typeof tab.child === 'string' && surface.components.has(tab.child)) {
        const childNode = buildNode(tab.child, surface, visited, dataContextPath)
        if (childNode) resolved.childNode = childNode
      }
      return resolved
    })
  }

  // Resolve entryPointChild and contentChild (Modal)
  if (typeof properties.entryPointChild === 'string' && surface.components.has(properties.entryPointChild)) {
    const node = buildNode(properties.entryPointChild, surface, visited, dataContextPath)
    if (node) properties.entryPointNode = node
  }
  if (typeof properties.contentChild === 'string' && surface.components.has(properties.contentChild)) {
    const node = buildNode(properties.contentChild, surface, visited, dataContextPath)
    if (node) properties.contentNode = node
  }

  // Resolve data bindings for dynamic values
  resolveDataBindings(properties, surface.dataModel, dataContextPath)

  visited.delete(componentId)

  return {
    id,
    type,
    properties,
    children: children.length > 0 ? children : undefined,
    dataContextPath,
    weight
  }
}

/**
 * Resolve dynamic data bindings in properties.
 * If a property value is { path: "/some/path" }, replace it with the actual
 * data from the surface's data model.
 */
function resolveDataBindings(
  properties: Record<string, unknown>,
  dataModel: Record<string, unknown>,
  _dataContextPath: string
): void {
  for (const [key, value] of Object.entries(properties)) {
    if (isPathObject(value)) {
      const resolved = getByPath(dataModel, value.path)
      if (resolved !== undefined) {
        properties[key] = resolved
      }
    }
  }
}

function isPathObject(value: unknown): value is { path: string } {
  return typeof value === 'object' && value !== null && 'path' in value && typeof (value as { path: string }).path === 'string'
}

// --- Data Model Utilities ---

function getByPath(obj: Record<string, unknown>, path: string): unknown {
  const segments = normalizePath(path).split('/').filter(Boolean)
  let current: unknown = obj
  for (const segment of segments) {
    if (current === null || current === undefined) return undefined
    if (typeof current === 'object') {
      current = (current as Record<string, unknown>)[segment]
    } else {
      return undefined
    }
  }
  return current
}

function setByPath(obj: Record<string, unknown>, path: string, value: unknown): void {
  const segments = normalizePath(path).split('/').filter(Boolean)
  if (segments.length === 0) return

  let current: Record<string, unknown> = obj
  for (let i = 0; i < segments.length - 1; i++) {
    const seg = segments[i]
    if (!(seg in current) || typeof current[seg] !== 'object' || current[seg] === null) {
      current[seg] = {}
    }
    current = current[seg] as Record<string, unknown>
  }
  current[segments[segments.length - 1]] = value
}

function normalizePath(path: string): string {
  return path.startsWith('/') ? path : `/${path}`
}
