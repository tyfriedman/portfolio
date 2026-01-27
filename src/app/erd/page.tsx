'use client';

import { useState, useEffect, useRef } from 'react';
import { Canvas } from '@/erd/components/Canvas';
import { Toolbar } from '@/erd/components/Toolbar';
import { Sidebar } from '@/erd/components/Sidebar';
import { useDiagram } from '@/erd/hooks/useDiagram';
import { Diagram } from '@/erd/types/diagram';

export default function ErdPage() {
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 });
  const containerRef = useRef<HTMLDivElement>(null);
  const {
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
    updateRelationshipCardinality,
    selectItem,
    deselect,
    loadDiagram,
    clearDiagram,
    version,
  } = useDiagram();

  const [pendingAction, setPendingAction] = useState<
    'entity' | 'attribute' | 'relationship' | null
  >(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const sidebarWidth = sidebarOpen ? 320 : 0; // 80 * 4 = 320px
        setCanvasSize({
          width: rect.width - sidebarWidth,
          height: rect.height - 60, // Account for toolbar
        });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [sidebarOpen]);

  const handleAddEntity = () => {
    setPendingAction('entity');
  };

  const handleAddAttribute = () => {
    if (diagram.entities.length === 0) {
      alert('Please add an entity first');
      return;
    }
    setPendingAction('attribute');
  };

  const handleAddRelationship = () => {
    setPendingAction('relationship');
  };

  const handleSave = () => {
    const dataStr = JSON.stringify(diagram, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'erd-diagram.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLoad = (diagramData: Diagram) => {
    loadDiagram(diagramData);
  };

  const handleUpdateSelected = (updates: any) => {
    if (selectedId && selectedType) {
      // Clear isNew flag when updating
      const updatesWithIsNew = { ...updates, isNew: false };
      if (selectedType === 'entity') {
        updateEntity(selectedId, updatesWithIsNew);
      } else if (selectedType === 'attribute') {
        updateAttribute(selectedId, updatesWithIsNew);
      } else if (selectedType === 'relationship') {
        updateRelationship(selectedId, updatesWithIsNew);
      }
    }
  };

  const handleUpdateCardinality = (entityId: string, cardinality: '1' | '*' | '0..1' | '1..*') => {
    if (selectedId && selectedType === 'relationship') {
      updateRelationshipCardinality(selectedId, entityId, cardinality);
    }
  };

  const handleSelectItem = (id: string, type: 'entity' | 'attribute' | 'relationship', openSidebar: boolean = false) => {
    selectItem(id, type);
    setSidebarOpen(openSidebar);
  };

  const handleDeselect = () => {
    deselect();
    setSidebarOpen(false);
  };

  // Wrapper functions that add items and automatically open the sidebar
  const handleAddEntityWithSidebar = (x: number, y: number) => {
    const id = addEntity(x, y);
    selectItem(id, 'entity');
    setSidebarOpen(true);
  };

  const handleAddAttributeWithSidebar = (entityId: string, x: number, y: number) => {
    const id = addAttribute(entityId, x, y);
    selectItem(id, 'attribute');
    setSidebarOpen(true);
  };

  const handleAddRelationshipWithSidebar = (x: number, y: number) => {
    const id = addRelationship(x, y);
    selectItem(id, 'relationship');
    setSidebarOpen(true);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50">
      <Toolbar
        onAddEntity={handleAddEntity}
        onAddAttribute={handleAddAttribute}
        onAddRelationship={handleAddRelationship}
        onSave={handleSave}
        onLoad={handleLoad}
        onClear={clearDiagram}
      />
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden relative"
        style={{ cursor: pendingAction ? 'crosshair' : 'default' }}
      >
        {pendingAction && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-blue-100 text-blue-800 px-4 py-2 rounded-md text-sm z-10">
            {pendingAction === 'entity' && 'Click on canvas to add entity'}
            {pendingAction === 'attribute' && 'Click near an entity to add attribute'}
            {pendingAction === 'relationship' && 'Click on canvas to add relationship'}
          </div>
        )}
        <Canvas
          width={canvasSize.width}
          height={canvasSize.height}
          diagram={diagram}
          version={version}
          selectedId={selectedId}
          selectedType={selectedType}
          pendingAction={pendingAction}
          onUpdateEntity={updateEntity}
          onUpdateAttribute={updateAttribute}
          onUpdateRelationship={updateRelationship}
          onDeleteEntity={deleteEntity}
          onDeleteAttribute={deleteAttribute}
          onDeleteRelationship={deleteRelationship}
          onSelectItem={handleSelectItem}
          onDeselect={handleDeselect}
          onAddEntity={handleAddEntityWithSidebar}
          onAddAttribute={handleAddAttributeWithSidebar}
          onAddRelationship={handleAddRelationshipWithSidebar}
          onCancelPendingAction={() => setPendingAction(null)}
          onConnectRelationshipToEntity={connectRelationshipToEntity}
        />
        {sidebarOpen && (
          <Sidebar
            selectedId={selectedId}
            selectedType={selectedType}
            diagram={diagram}
            onUpdate={handleUpdateSelected}
            onUpdateCardinality={handleUpdateCardinality}
            onClose={handleDeselect}
          />
        )}
      </div>
    </div>
  );
}
