/**
 * A2UI Protocol v0.10 — TypeScript Types
 */

// --- Message Types ---

export interface A2uiEnvelope {
  version: 'v0.10'
  createSurface?: CreateSurface
  updateComponents?: UpdateComponents
  updateDataModel?: UpdateDataModel
  deleteSurface?: DeleteSurface
}

export interface CreateSurface {
  surfaceId: string
  catalogId: string
  theme?: Record<string, string>
  sendDataModel?: boolean
}

export interface UpdateComponents {
  surfaceId: string
  components: RawComponent[]
}

export interface UpdateDataModel {
  surfaceId: string
  path?: string
  value?: unknown
}

export interface DeleteSurface {
  surfaceId: string
}

// --- Component Types ---

export interface RawComponent {
  id: string
  component: string
  weight?: number
  [key: string]: unknown
}

export interface ResolvedNode {
  id: string
  type: string
  properties: Record<string, unknown>
  children?: ResolvedNode[]
  dataContextPath: string
  weight?: number
}

// --- Surface State ---

export interface Surface {
  surfaceId: string
  catalogId: string
  theme: Record<string, string>
  sendDataModel: boolean
  components: Map<string, RawComponent>
  dataModel: Record<string, unknown>
  rootNode: ResolvedNode | null
}

// --- Data Binding ---

export interface DynamicPath {
  path: string
}

export type DynamicValue<T> = T | DynamicPath

export function isPath(value: unknown): value is DynamicPath {
  return typeof value === 'object' && value !== null && 'path' in value && typeof (value as DynamicPath).path === 'string'
}
