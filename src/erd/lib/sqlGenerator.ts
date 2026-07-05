import { Diagram, Entity, Attribute, Relationship, Cardinality } from '../types/diagram';

const snake = (label: string) =>
  label
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase() || 'unnamed';

const isMany = (c: Cardinality) => c === '*' || c === '1..*';

interface TableInfo {
  entity: Entity;
  tableName: string;
  pkColumn: string;
  pkType: string;
  /** True when we synthesized a surrogate id because no attribute was marked PK */
  surrogatePk: boolean;
}

/** Generate PostgreSQL DDL from the Chen-model diagram. */
export const generateSql = (diagram: Diagram): string => {
  if (diagram.entities.length === 0) {
    return '-- Add entities to the diagram to generate SQL.';
  }

  const statements: string[] = [];
  const usedNames = new Set<string>();
  const uniqueName = (base: string) => {
    let name = base;
    let i = 2;
    while (usedNames.has(name)) {
      name = `${base}_${i++}`;
    }
    usedNames.add(name);
    return name;
  };

  const tables = new Map<string, TableInfo>();

  // Entity tables
  for (const entity of diagram.entities) {
    const tableName = uniqueName(snake(entity.label));
    const attributes = diagram.attributes.filter((a) => a.entityId === entity.id);
    const pkAttrs = attributes.filter((a) => a.isPrimaryKey && !a.isMultivalued);

    const columns: string[] = [];
    let pkColumn: string;
    let pkType: string;
    let surrogatePk = false;

    if (pkAttrs.length > 0) {
      pkColumn = snake(pkAttrs[0].label);
      pkType = pkAttrs[0].dataType || 'VARCHAR(255)';
    } else {
      pkColumn = 'id';
      pkType = 'INT';
      surrogatePk = true;
      columns.push('  id SERIAL PRIMARY KEY');
    }

    const columnNames = new Set<string>(surrogatePk ? ['id'] : []);
    for (const attr of attributes) {
      if (attr.isMultivalued) continue; // handled as a separate table below
      if (attr.isDerived) {
        columns.push(`  -- ${snake(attr.label)}: derived attribute (compute in queries or views)`);
        continue;
      }
      let colName = snake(attr.label);
      while (columnNames.has(colName)) colName = `${colName}_2`;
      columnNames.add(colName);
      const type = attr.dataType || 'VARCHAR(255)';
      const pk = attr.isPrimaryKey ? ' PRIMARY KEY' : '';
      const notNull = attr.isPrimaryKey ? '' : ' NOT NULL';
      columns.push(`  ${colName} ${type}${pk}${pk ? '' : notNull}`);
    }

    statements.push(
      `-- Entity: ${entity.label}${entity.isWeak ? ' (weak entity)' : ''}\nCREATE TABLE ${tableName} (\n${columns.join(',\n')}\n);`
    );
    tables.set(entity.id, { entity, tableName, pkColumn, pkType, surrogatePk });

    // Multivalued attributes become their own tables
    for (const attr of attributes.filter((a) => a.isMultivalued)) {
      const attrCol = snake(attr.label);
      const mvTable = uniqueName(`${tableName}_${attrCol}`);
      const type = attr.dataType || 'VARCHAR(255)';
      statements.push(
        `-- Multivalued attribute: ${entity.label}.${attr.label}\nCREATE TABLE ${mvTable} (\n  ${tableName}_${pkColumn} ${pkType.replace('SERIAL', 'INT')} NOT NULL REFERENCES ${tableName}(${pkColumn}),\n  ${attrCol} ${type} NOT NULL,\n  PRIMARY KEY (${tableName}_${pkColumn}, ${attrCol})\n);`
      );
    }
  }

  // Relationships
  for (const relationship of diagram.relationships) {
    const connected = relationship.connectedEntities
      .map((id) => tables.get(id))
      .filter((t): t is TableInfo => t !== undefined);
    if (connected.length < 2) continue;

    const [a, b] = connected;
    const isSelf = a.entity.id === b.entity.id;
    const cardA: Cardinality = isSelf
      ? relationship.cardinalities?.[`${a.entity.id}_self_0`] || relationship.cardinalities?.[a.entity.id] || '1'
      : relationship.cardinalities?.[a.entity.id] || '1';
    const cardB: Cardinality = isSelf
      ? relationship.cardinalities?.[`${b.entity.id}_self_1`] || relationship.cardinalities?.[b.entity.id] || '1'
      : relationship.cardinalities?.[b.entity.id] || '1';

    const relName = snake(relationship.label);
    const fkType = (t: TableInfo) => t.pkType.replace('SERIAL', 'INT');

    if (isMany(cardA) && isMany(cardB)) {
      // Many-to-many: junction table
      const junction = uniqueName(relName === 'relationship' || relName === 'unnamed' ? `${a.tableName}_${b.tableName}` : relName);
      const colA = `${a.tableName}_${a.pkColumn}`;
      const colB = isSelf ? `${b.tableName}_${b.pkColumn}_2` : `${b.tableName}_${b.pkColumn}`;
      statements.push(
        `-- Relationship: ${relationship.label} (${a.entity.label} ${cardA} — ${cardB} ${b.entity.label})\nCREATE TABLE ${junction} (\n  ${colA} ${fkType(a)} NOT NULL REFERENCES ${a.tableName}(${a.pkColumn}),\n  ${colB} ${fkType(b)} NOT NULL REFERENCES ${b.tableName}(${b.pkColumn}),\n  PRIMARY KEY (${colA}, ${colB})\n);`
      );
    } else {
      // One side holds the foreign key: the "many" side references the "one" side.
      // For one-to-one, the second entity holds a UNIQUE foreign key.
      const [manySide, oneSide] = isMany(cardA) ? [a, b] : isMany(cardB) ? [b, a] : [b, a];
      const oneToOne = !isMany(cardA) && !isMany(cardB);
      const optional = (manySide === a ? cardB : cardA) === '0..1';
      const fkCol = isSelf
        ? `${relName === 'relationship' || relName === 'unnamed' ? 'parent' : relName}_${oneSide.pkColumn}`
        : `${oneSide.tableName}_${oneSide.pkColumn}`;
      const nullability = optional || oneToOne ? '' : ' NOT NULL';
      const unique = oneToOne ? ' UNIQUE' : '';
      statements.push(
        `-- Relationship: ${relationship.label} (${a.entity.label} ${cardA} — ${cardB} ${b.entity.label})\nALTER TABLE ${manySide.tableName}\n  ADD COLUMN ${fkCol} ${fkType(oneSide)}${nullability}${unique} REFERENCES ${oneSide.tableName}(${oneSide.pkColumn});`
      );
    }
  }

  const header = `-- Generated from ER diagram${diagram.name ? `: ${diagram.name}` : ''}\n-- PostgreSQL DDL\n`;
  return `${header}\n${statements.join('\n\n')}\n`;
};
