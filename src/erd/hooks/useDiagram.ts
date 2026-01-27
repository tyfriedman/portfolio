'use client';

import { useState, useCallback, useEffect } from 'react';
import { Diagram, Entity, Attribute, Relationship } from '../types/diagram';

const STORAGE_KEY = 'erd-diagram';

const defaultDiagram: Diagram = {
  entities: [],
  attributes: [],
  relationships: [],
};

export const useDiagram = () => {
  const [diagram, setDiagram] = useState<Diagram>(defaultDiagram);
  const [version, setVersion] = useState(0); // Version counter to force remounts
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'entity' | 'attribute' | 'relationship' | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setDiagram(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load diagram:', e);
      }
    }
  }, []);

  // Save to localStorage whenever diagram changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(diagram));
  }, [diagram]);

  const addEntity = useCallback((x: number, y: number) => {
    const entity: Entity = {
      id: `entity-${Date.now()}`,
      x,
      y,
      width: 120,
      height: 60,
      label: 'Entity',
      isNew: true,
    };
    setDiagram((prev) => ({
      ...prev,
      entities: [...prev.entities, entity],
    }));
    return entity.id;
  }, []);

  const addAttribute = useCallback((entityId: string, x: number, y: number) => {
    const attribute: Attribute = {
      id: `attribute-${Date.now()}`,
      entityId,
      x,
      y,
      label: 'Attribute',
      isNew: true,
    };
    setDiagram((prev) => ({
      ...prev,
      attributes: [...prev.attributes, attribute],
    }));
    return attribute.id;
  }, []);

  const addRelationship = useCallback((x: number, y: number) => {
    const relationship: Relationship = {
      id: `relationship-${Date.now()}`,
      x,
      y,
      label: 'Relationship',
      connectedEntities: [],
      isNew: true,
    };
    setDiagram((prev) => ({
      ...prev,
      relationships: [...prev.relationships, relationship],
    }));
    return relationship.id;
  }, []);

  const updateEntity = useCallback((id: string, updates: Partial<Entity>) => {
    setDiagram((prev) => ({
      ...prev,
      entities: prev.entities.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
    // Increment version to force remount when label changes
    if (updates.label !== undefined) {
      setVersion((v) => v + 1);
    }
  }, []);

  const updateAttribute = useCallback((id: string, updates: Partial<Attribute>) => {
    setDiagram((prev) => ({
      ...prev,
      attributes: prev.attributes.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    }));
    // Increment version to force remount when label changes
    if (updates.label !== undefined) {
      setVersion((v) => v + 1);
    }
  }, []);

  const updateRelationship = useCallback((id: string, updates: Partial<Relationship>) => {
    setDiagram((prev) => ({
      ...prev,
      relationships: prev.relationships.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    }));
    // Increment version to force remount when label changes
    if (updates.label !== undefined) {
      setVersion((v) => v + 1);
    }
  }, []);

  const deleteEntity = useCallback((id: string) => {
    setDiagram((prev) => ({
      ...prev,
      entities: prev.entities.filter((e) => e.id !== id),
      attributes: prev.attributes.filter((a) => a.entityId !== id),
    }));
    if (selectedId === id) {
      setSelectedId(null);
      setSelectedType(null);
    }
  }, [selectedId]);

  const deleteAttribute = useCallback((id: string) => {
    setDiagram((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((a) => a.id !== id),
    }));
    if (selectedId === id) {
      setSelectedId(null);
      setSelectedType(null);
    }
  }, [selectedId]);

  const deleteRelationship = useCallback((id: string) => {
    setDiagram((prev) => ({
      ...prev,
      relationships: prev.relationships.filter((r) => r.id !== id),
    }));
    if (selectedId === id) {
      setSelectedId(null);
      setSelectedType(null);
    }
  }, [selectedId]);

  const connectRelationshipToEntity = useCallback((relationshipId: string, entityId: string) => {
    setDiagram((prev) => {
      const relationship = prev.relationships.find((r) => r.id === relationshipId);
      if (!relationship) return prev;
      if (relationship.connectedEntities.includes(entityId)) return prev;
      return {
        ...prev,
        relationships: prev.relationships.map((r) =>
          r.id === relationshipId
            ? { ...r, connectedEntities: [...r.connectedEntities, entityId] }
            : r
        ),
      };
    });
  }, []);

  const disconnectRelationshipFromEntity = useCallback((relationshipId: string, entityId: string) => {
    setDiagram((prev) => ({
      ...prev,
      relationships: prev.relationships.map((r) =>
        r.id === relationshipId
          ? { ...r, connectedEntities: r.connectedEntities.filter((id) => id !== entityId) }
          : r
      ),
    }));
  }, []);

  const updateRelationshipCardinality = useCallback((relationshipId: string, entityId: string, cardinality: '1' | '*' | '0..1' | '1..*') => {
    setDiagram((prev) => ({
      ...prev,
      relationships: prev.relationships.map((r) => {
        if (r.id !== relationshipId) return r;
        const cardinalities = r.cardinalities || {};
        return {
          ...r,
          cardinalities: { ...cardinalities, [entityId]: cardinality },
        };
      }),
    }));
  }, []);

  const loadDiagram = useCallback((newDiagram: Diagram) => {
    setDiagram(newDiagram);
    setSelectedId(null);
    setSelectedType(null);
  }, []);

  const clearDiagram = useCallback(() => {
    setDiagram(defaultDiagram);
    setSelectedId(null);
    setSelectedType(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const selectItem = useCallback((id: string, type: 'entity' | 'attribute' | 'relationship') => {
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
    addEntity,
    addAttribute,
    addRelationship,
    updateEntity,
    updateAttribute,
    updateRelationship,
    deleteEntity,
    deleteAttribute,
    deleteRelationship,
    connectRelationshipToEntity,
    disconnectRelationshipFromEntity,
    loadDiagram,
    clearDiagram,
    selectItem,
    deselect,
    updateRelationshipCardinality,
    version,
  };
};
