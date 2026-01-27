export interface Entity {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  isNew?: boolean;
}

export interface Attribute {
  id: string;
  entityId: string;
  x: number;
  y: number;
  label: string;
  isNew?: boolean;
}

export interface Relationship {
  id: string;
  x: number;
  y: number;
  label: string;
  connectedEntities: string[];
  cardinalities?: Record<string, '1' | '*' | '0..1' | '1..*'>; // entityId -> cardinality
  isNew?: boolean;
}

export interface Diagram {
  entities: Entity[];
  attributes: Attribute[];
  relationships: Relationship[];
}
