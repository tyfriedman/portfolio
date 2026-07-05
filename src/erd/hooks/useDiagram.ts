'use client';

import { useState, useCallback, useRef } from 'react';
import { Diagram, Entity, Attribute, Relationship, Cardinality, ElementType } from '../types/diagram';

const emptyDiagram = (): Diagram => ({
  entities: [],
  attributes: [],
  relationships: [],
});

const HISTORY_LIMIT = 100;
const MERGE_WINDOW_MS = 1000;

interface History {
  past: Diagram[];
  present: Diagram;
  future: Diagram[];
}

let idCounter = 0;
const makeId = (prefix: string) => `${prefix}-${Date.now()}-${idCounter++}`;

/** Remove an entity id from relationships (connections + cardinality keys). */
const pruneEntityFromRelationships = (relationships: Relationship[], entityId: string): Relationship[] =>
  relationships.map((r) => {
    if (!r.connectedEntities.includes(entityId)) return r;
    const cardinalities = { ...(r.cardinalities || {}) };
    for (const key of Object.keys(cardinalities)) {
      if (key === entityId || key.startsWith(`${entityId}_self_`)) {
        delete cardinalities[key];
      }
    }
    return {
      ...r,
      connectedEntities: r.connectedEntities.filter((id) => id !== entityId),
      cardinalities,
    };
  });

export const useDiagram = () => {
  const [history, setHistory] = useState<History>({
    past: [],
    present: emptyDiagram(),
    future: [],
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<ElementType | null>(null);
  const mergeRef = useRef<{ key: string; time: number } | null>(null);

  const diagram = history.present;
  // Latest diagram for synchronous reads inside callbacks (state updaters may run lazily)
  const diagramRef = useRef(diagram);
  diagramRef.current = diagram;

  /**
   * Apply an update to the diagram, pushing the previous state onto the undo
   * stack. Consecutive commits sharing the same mergeKey within a short window
   * collapse into a single history entry (e.g. while typing a label).
   */
  const commit = useCallback((updater: (prev: Diagram) => Diagram, mergeKey?: string) => {
    setHistory((h) => {
      const next = updater(h.present);
      if (next === h.present) return h;
      const now = Date.now();
      const shouldMerge =
        mergeKey !== undefined &&
        mergeRef.current !== null &&
        mergeRef.current.key === mergeKey &&
        now - mergeRef.current.time < MERGE_WINDOW_MS;
      mergeRef.current = mergeKey !== undefined ? { key: mergeKey, time: now } : null;
      if (shouldMerge) {
        return { ...h, present: next };
      }
      return {
        past: [...h.past, h.present].slice(-HISTORY_LIMIT),
        present: next,
        future: [],
      };
    });
  }, []);

  const undo = useCallback(() => {
    mergeRef.current = null;
    setHistory((h) => {
      if (h.past.length === 0) return h;
      const previous = h.past[h.past.length - 1];
      return {
        past: h.past.slice(0, -1),
        present: previous,
        future: [h.present, ...h.future],
      };
    });
    setSelectedId(null);
    setSelectedType(null);
  }, []);

  const redo = useCallback(() => {
    mergeRef.current = null;
    setHistory((h) => {
      if (h.future.length === 0) return h;
      const next = h.future[0];
      return {
        past: [...h.past, h.present].slice(-HISTORY_LIMIT),
        present: next,
        future: h.future.slice(1),
      };
    });
    setSelectedId(null);
    setSelectedType(null);
  }, []);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const addEntity = useCallback((x: number, y: number) => {
    const entity: Entity = {
      id: makeId('entity'),
      x,
      y,
      width: 120,
      height: 60,
      label: 'Entity',
      isNew: true,
    };
    commit((prev) => ({ ...prev, entities: [...prev.entities, entity] }));
    return entity.id;
  }, [commit]);

  const addAttribute = useCallback((entityId: string, x: number, y: number) => {
    const attribute: Attribute = {
      id: makeId('attribute'),
      entityId,
      x,
      y,
      label: 'Attribute',
      isNew: true,
    };
    commit((prev) => ({ ...prev, attributes: [...prev.attributes, attribute] }));
    return attribute.id;
  }, [commit]);

  const addRelationship = useCallback((x: number, y: number) => {
    const relationship: Relationship = {
      id: makeId('relationship'),
      x,
      y,
      label: 'Relationship',
      connectedEntities: [],
      isNew: true,
    };
    commit((prev) => ({ ...prev, relationships: [...prev.relationships, relationship] }));
    return relationship.id;
  }, [commit]);

  const updateEntity = useCallback((id: string, updates: Partial<Entity>) => {
    const mergeKey = updates.label !== undefined ? `entity-label-${id}` : undefined;
    commit((prev) => ({
      ...prev,
      entities: prev.entities.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }), mergeKey);
  }, [commit]);

  const updateAttribute = useCallback((id: string, updates: Partial<Attribute>) => {
    const mergeKey = updates.label !== undefined ? `attribute-label-${id}` : undefined;
    commit((prev) => ({
      ...prev,
      attributes: prev.attributes.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    }), mergeKey);
  }, [commit]);

  const updateRelationship = useCallback((id: string, updates: Partial<Relationship>) => {
    const mergeKey = updates.label !== undefined ? `relationship-label-${id}` : undefined;
    commit((prev) => ({
      ...prev,
      relationships: prev.relationships.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    }), mergeKey);
  }, [commit]);

  /** Move an entity and all of its attributes in a single history entry. */
  const moveEntity = useCallback((id: string, x: number, y: number) => {
    commit((prev) => {
      const entity = prev.entities.find((e) => e.id === id);
      if (!entity) return prev;
      const deltaX = x - entity.x;
      const deltaY = y - entity.y;
      return {
        ...prev,
        entities: prev.entities.map((e) => (e.id === id ? { ...e, x, y } : e)),
        attributes: prev.attributes.map((a) =>
          a.entityId === id ? { ...a, x: a.x + deltaX, y: a.y + deltaY } : a
        ),
      };
    });
  }, [commit]);

  const deleteEntity = useCallback((id: string) => {
    commit((prev) => ({
      ...prev,
      entities: prev.entities.filter((e) => e.id !== id),
      attributes: prev.attributes.filter((a) => a.entityId !== id),
      relationships: pruneEntityFromRelationships(prev.relationships, id),
    }));
    if (selectedId === id) {
      setSelectedId(null);
      setSelectedType(null);
    }
  }, [commit, selectedId]);

  const deleteAttribute = useCallback((id: string) => {
    commit((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((a) => a.id !== id),
    }));
    if (selectedId === id) {
      setSelectedId(null);
      setSelectedType(null);
    }
  }, [commit, selectedId]);

  const deleteRelationship = useCallback((id: string) => {
    commit((prev) => ({
      ...prev,
      relationships: prev.relationships.filter((r) => r.id !== id),
    }));
    if (selectedId === id) {
      setSelectedId(null);
      setSelectedType(null);
    }
  }, [commit, selectedId]);

  const connectRelationshipToEntity = useCallback((relationshipId: string, entityId: string): boolean => {
    const relationship = diagramRef.current.relationships.find((r) => r.id === relationshipId);
    if (!relationship) return false;
    // Chen binary relationships: at most 2 connections total
    // (two distinct entities, or the same entity twice for a self-reference)
    if (relationship.connectedEntities.length >= 2) return false;
    commit((prev) => ({
      ...prev,
      relationships: prev.relationships.map((r) =>
        r.id === relationshipId
          ? { ...r, connectedEntities: [...r.connectedEntities, entityId] }
          : r
      ),
    }));
    return true;
  }, [commit]);

  /** Disconnect one occurrence of an entity from a relationship. */
  const disconnectRelationshipFromEntity = useCallback((relationshipId: string, entityId: string) => {
    commit((prev) => ({
      ...prev,
      relationships: prev.relationships.map((r) => {
        if (r.id !== relationshipId) return r;
        const idx = r.connectedEntities.indexOf(entityId);
        if (idx === -1) return r;
        const connectedEntities = [...r.connectedEntities];
        connectedEntities.splice(idx, 1);
        const cardinalities = { ...(r.cardinalities || {}) };
        if (!connectedEntities.includes(entityId)) {
          for (const key of Object.keys(cardinalities)) {
            if (key === entityId || key.startsWith(`${entityId}_self_`)) {
              delete cardinalities[key];
            }
          }
        }
        return { ...r, connectedEntities, cardinalities };
      }),
    }));
  }, [commit]);

  const updateRelationshipCardinality = useCallback(
    (relationshipId: string, entityId: string, cardinality: Cardinality, connectionIndex?: number) => {
      commit((prev) => ({
        ...prev,
        relationships: prev.relationships.map((r) => {
          if (r.id !== relationshipId) return r;
          const key = connectionIndex !== undefined ? `${entityId}_self_${connectionIndex}` : entityId;
          return {
            ...r,
            cardinalities: { ...(r.cardinalities || {}), [key]: cardinality },
          };
        }),
      }));
    },
    [commit]
  );

  /** Replace the diagram entirely and reset history (used for open/import). */
  const loadDiagram = useCallback((newDiagram: Diagram) => {
    mergeRef.current = null;
    setHistory({ past: [], present: newDiagram, future: [] });
    setSelectedId(null);
    setSelectedType(null);
  }, []);

  /** Clear the canvas as an undoable action. */
  const clearDiagram = useCallback(() => {
    commit((prev) => ({ ...prev, entities: [], attributes: [], relationships: [] }));
    setSelectedId(null);
    setSelectedType(null);
  }, [commit]);

  const selectItem = useCallback((id: string, type: ElementType) => {
    setSelectedId(id);
    setSelectedType(type);
  }, []);

  const deselect = useCallback(() => {
    setSelectedId(null);
    setSelectedType(null);
  }, []);

  return {
    diagram,
    selectedId,
    selectedType,
    canUndo,
    canRedo,
    undo,
    redo,
    addEntity,
    addAttribute,
    addRelationship,
    updateEntity,
    updateAttribute,
    updateRelationship,
    moveEntity,
    deleteEntity,
    deleteAttribute,
    deleteRelationship,
    connectRelationshipToEntity,
    disconnectRelationshipFromEntity,
    updateRelationshipCardinality,
    loadDiagram,
    clearDiagram,
    selectItem,
    deselect,
  };
};
