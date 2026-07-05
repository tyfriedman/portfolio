export type Cardinality = '1' | '*' | '0..1' | '1..*';

export type ElementType = 'entity' | 'attribute' | 'relationship';

export const DATA_TYPES = [
  'VARCHAR(255)',
  'TEXT',
  'INT',
  'BIGINT',
  'DECIMAL(10,2)',
  'BOOLEAN',
  'DATE',
  'TIMESTAMP',
  'UUID',
] as const;

export type DataType = (typeof DATA_TYPES)[number];

export interface Entity {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  isWeak?: boolean;
  isNew?: boolean;
}

export interface Attribute {
  id: string;
  entityId: string;
  x: number;
  y: number;
  label: string;
  isPrimaryKey?: boolean;
  isMultivalued?: boolean;
  isDerived?: boolean;
  dataType?: DataType;
  isNew?: boolean;
}

export interface Relationship {
  id: string;
  x: number;
  y: number;
  label: string;
  connectedEntities: string[];
  cardinalities?: Record<string, Cardinality>; // entityId (or `${entityId}_self_${i}`) -> cardinality
  isNew?: boolean;
}

export interface Diagram {
  id?: string;
  name?: string;
  entities: Entity[];
  attributes: Attribute[];
  relationships: Relationship[];
}

export interface DiagramMeta {
  id: string;
  name: string;
  updatedAt: number;
  entityCount: number;
}
