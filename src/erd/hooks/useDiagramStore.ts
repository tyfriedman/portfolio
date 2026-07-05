'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Diagram, DiagramMeta } from '../types/diagram';

const INDEX_KEY = 'erd-diagrams';
const ACTIVE_KEY = 'erd-active-diagram';
const LEGACY_KEY = 'erd-diagram';
const diagramKey = (id: string) => `erd-diagram:${id}`;

const AUTOSAVE_DEBOUNCE_MS = 400;

let idCounter = 0;
const makeDiagramId = () => `diagram-${Date.now()}-${idCounter++}`;

const emptyDiagram = (id: string, name: string): Diagram => ({
  id,
  name,
  entities: [],
  attributes: [],
  relationships: [],
});

const readIndex = (): DiagramMeta[] => {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeIndex = (index: DiagramMeta[]) => {
  localStorage.setItem(INDEX_KEY, JSON.stringify(index));
};

const readDiagram = (id: string): Diagram | null => {
  try {
    const raw = localStorage.getItem(diagramKey(id));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.entities)) return null;
    return parsed as Diagram;
  } catch {
    return null;
  }
};

const writeDiagram = (diagram: Diagram) => {
  if (!diagram.id) return;
  localStorage.setItem(diagramKey(diagram.id), JSON.stringify(diagram));
};

/** Basic structural validation for imported JSON. */
export const validateDiagram = (data: unknown): data is Diagram => {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  if (!Array.isArray(d.entities) || !Array.isArray(d.attributes) || !Array.isArray(d.relationships)) {
    return false;
  }
  const validEntity = (e: unknown) => {
    if (!e || typeof e !== 'object') return false;
    const obj = e as Record<string, unknown>;
    return typeof obj.id === 'string' && typeof obj.x === 'number' && typeof obj.y === 'number' && typeof obj.label === 'string';
  };
  return (
    d.entities.every(validEntity) &&
    (d.attributes as unknown[]).every((a) => {
      if (!a || typeof a !== 'object') return false;
      const obj = a as Record<string, unknown>;
      return typeof obj.id === 'string' && typeof obj.entityId === 'string' && typeof obj.x === 'number' && typeof obj.y === 'number' && typeof obj.label === 'string';
    }) &&
    (d.relationships as unknown[]).every((r) => {
      if (!r || typeof r !== 'object') return false;
      const obj = r as Record<string, unknown>;
      return typeof obj.id === 'string' && typeof obj.x === 'number' && typeof obj.y === 'number' && typeof obj.label === 'string' && Array.isArray(obj.connectedEntities);
    })
  );
};

/**
 * Manages the collection of saved diagrams in localStorage.
 * The active diagram's contents are edited via useDiagram; this store
 * persists them (debounced) and handles the diagram index.
 */
export const useDiagramStore = () => {
  const [diagrams, setDiagrams] = useState<DiagramMeta[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [initialDiagram, setInitialDiagram] = useState<Diagram | null>(null);
  const [ready, setReady] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load index on mount, migrating the legacy single-diagram key if present.
  useEffect(() => {
    let index = readIndex();

    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy && index.length === 0) {
      try {
        const parsed = JSON.parse(legacy);
        if (validateDiagram(parsed)) {
          const id = makeDiagramId();
          const migrated: Diagram = { ...parsed, id, name: 'Untitled diagram' };
          writeDiagram(migrated);
          index = [{ id, name: 'Untitled diagram', updatedAt: Date.now(), entityCount: migrated.entities.length }];
          writeIndex(index);
        }
      } catch {
        // Ignore corrupt legacy data
      }
      localStorage.removeItem(LEGACY_KEY);
    }

    if (index.length === 0) {
      const id = makeDiagramId();
      const fresh = emptyDiagram(id, 'Untitled diagram');
      writeDiagram(fresh);
      index = [{ id, name: 'Untitled diagram', updatedAt: Date.now(), entityCount: 0 }];
      writeIndex(index);
    }

    const savedActive = localStorage.getItem(ACTIVE_KEY);
    const active = index.find((m) => m.id === savedActive) ? savedActive! : index[0].id;
    const diagram = readDiagram(active) || emptyDiagram(active, index.find((m) => m.id === active)?.name || 'Untitled diagram');

    setDiagrams(index);
    setActiveId(active);
    setInitialDiagram(diagram);
    setReady(true);
  }, []);

  useEffect(() => {
    if (activeId) {
      localStorage.setItem(ACTIVE_KEY, activeId);
    }
  }, [activeId]);

  /** Debounced auto-save of the active diagram's contents. */
  const saveActive = useCallback((diagram: Diagram) => {
    if (!activeId) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const meta = readIndex();
      const name = meta.find((m) => m.id === activeId)?.name || 'Untitled diagram';
      writeDiagram({ ...diagram, id: activeId, name });
      const updated = meta.map((m) =>
        m.id === activeId ? { ...m, updatedAt: Date.now(), entityCount: diagram.entities.length } : m
      );
      writeIndex(updated);
      setDiagrams(updated);
    }, AUTOSAVE_DEBOUNCE_MS);
  }, [activeId]);

  /** Immediately flush any pending save (used before switching diagrams). */
  const flushSave = useCallback((diagram: Diagram) => {
    if (!activeId) return;
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    const meta = readIndex();
    const name = meta.find((m) => m.id === activeId)?.name || 'Untitled diagram';
    writeDiagram({ ...diagram, id: activeId, name });
    const updated = meta.map((m) =>
      m.id === activeId ? { ...m, updatedAt: Date.now(), entityCount: diagram.entities.length } : m
    );
    writeIndex(updated);
    setDiagrams(updated);
  }, [activeId]);

  const createDiagram = useCallback((name = 'Untitled diagram'): Diagram => {
    const id = makeDiagramId();
    const fresh = emptyDiagram(id, name);
    writeDiagram(fresh);
    const updated = [...readIndex(), { id, name, updatedAt: Date.now(), entityCount: 0 }];
    writeIndex(updated);
    setDiagrams(updated);
    setActiveId(id);
    return fresh;
  }, []);

  const openDiagram = useCallback((id: string): Diagram | null => {
    const diagram = readDiagram(id);
    if (!diagram) return null;
    setActiveId(id);
    return diagram;
  }, []);

  const renameDiagram = useCallback((id: string, name: string) => {
    const trimmed = name.trim() || 'Untitled diagram';
    const updated = readIndex().map((m) => (m.id === id ? { ...m, name: trimmed } : m));
    writeIndex(updated);
    setDiagrams(updated);
    const diagram = readDiagram(id);
    if (diagram) writeDiagram({ ...diagram, name: trimmed });
  }, []);

  const duplicateDiagram = useCallback((id: string) => {
    const source = readDiagram(id);
    const sourceMeta = readIndex().find((m) => m.id === id);
    if (!source || !sourceMeta) return;
    const newId = makeDiagramId();
    const name = `${sourceMeta.name} copy`;
    writeDiagram({ ...source, id: newId, name });
    const updated = [...readIndex(), { id: newId, name, updatedAt: Date.now(), entityCount: source.entities.length }];
    writeIndex(updated);
    setDiagrams(updated);
  }, []);

  /**
   * Delete a diagram. If it was active, returns the diagram that should
   * become active (creating a fresh one when none remain).
   */
  const deleteDiagram = useCallback((id: string): Diagram | null => {
    localStorage.removeItem(diagramKey(id));
    let updated = readIndex().filter((m) => m.id !== id);

    if (id !== activeId) {
      writeIndex(updated);
      setDiagrams(updated);
      return null;
    }

    if (updated.length === 0) {
      const newId = makeDiagramId();
      const fresh = emptyDiagram(newId, 'Untitled diagram');
      writeDiagram(fresh);
      updated = [{ id: newId, name: 'Untitled diagram', updatedAt: Date.now(), entityCount: 0 }];
      writeIndex(updated);
      setDiagrams(updated);
      setActiveId(newId);
      return fresh;
    }

    writeIndex(updated);
    setDiagrams(updated);
    const nextId = updated[0].id;
    setActiveId(nextId);
    return readDiagram(nextId) || emptyDiagram(nextId, updated[0].name);
  }, [activeId]);

  const activeMeta = diagrams.find((m) => m.id === activeId) || null;

  return {
    ready,
    diagrams,
    activeId,
    activeMeta,
    initialDiagram,
    saveActive,
    flushSave,
    createDiagram,
    openDiagram,
    renameDiagram,
    duplicateDiagram,
    deleteDiagram,
  };
};
