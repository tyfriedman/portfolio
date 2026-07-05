'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type Konva from 'konva';
import { Toolbar, ActionBar, DiagramPill, ExportFormat } from '@/erd/components/Toolbar';
import { Sidebar } from '@/erd/components/Sidebar';
import { ZoomControls } from '@/erd/components/ZoomControls';
import { DiagramManager } from '@/erd/components/DiagramManager';
import { SqlModal } from '@/erd/components/SqlModal';
import { ConfirmDialog } from '@/erd/components/ConfirmDialog';
import { Toasts, useToasts } from '@/erd/components/Toast';
import { useDiagram } from '@/erd/hooks/useDiagram';
import { useDiagramStore, validateDiagram } from '@/erd/hooks/useDiagramStore';
import { ElementType } from '@/erd/types/diagram';
import { ThemeMode, getCanvasTheme, getChromeVars, THEME_STORAGE_KEY } from '@/erd/theme';
import { getDiagramBounds } from '@/erd/lib/geometry';
import { generateSql } from '@/erd/lib/sqlGenerator';
import { exportSvg } from '@/erd/lib/exportSvg';
import { exportPng } from '@/erd/lib/exportPng';
import { downloadText, slugify } from '@/erd/lib/download';
import { ViewState, MIN_SCALE, MAX_SCALE } from '@/erd/lib/view';

// Konva is browser-only, so the canvas must skip SSR
const Canvas = dynamic(() => import('@/erd/components/CanvasWrapper'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-[var(--text-muted)]">
      Loading canvas…
    </div>
  ),
});

const SNAP_STORAGE_KEY = 'erd-snap';

interface ConfirmState {
  title: string;
  message: string;
  confirmLabel: string;
  action: () => void;
}

export default function ErdPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 });

  const store = useDiagramStore();
  const d = useDiagram();
  const { toasts, showToast } = useToasts();

  const [mode, setMode] = useState<ThemeMode>('dark');
  const [pendingAction, setPendingAction] = useState<ElementType | null>(null);
  const [view, setView] = useState<ViewState>({ scale: 1, x: 0, y: 0 });
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);
  const [sqlPreview, setSqlPreview] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [stage, setStage] = useState<Konva.Stage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadedRef = useRef(false);

  const canvasTheme = getCanvasTheme(mode);
  const chromeVars = getChromeVars(mode);

  // Restore preferences
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') setMode(savedTheme);
    setSnapToGrid(localStorage.getItem(SNAP_STORAGE_KEY) === 'true');
  }, []);

  // Load the active diagram once the store is ready
  useEffect(() => {
    if (store.ready && store.initialDiagram && !loadedRef.current) {
      loadedRef.current = true;
      d.loadDiagram(store.initialDiagram);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.ready, store.initialDiagram]);

  // Auto-save the active diagram (debounced inside the store)
  useEffect(() => {
    if (!loadedRef.current) return;
    store.saveActive(d.diagram);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d.diagram]);

  // Canvas fills the viewport
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({ width: rect.width, height: rect.height });
      }
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  const toggleTheme = () => {
    const next = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
  };

  const toggleSnap = () => {
    setSnapToGrid((prev) => {
      localStorage.setItem(SNAP_STORAGE_KEY, String(!prev));
      return !prev;
    });
  };

  const handleSetPendingAction = useCallback(
    (action: ElementType) => {
      if (action === 'attribute' && d.diagram.entities.length === 0) {
        showToast('Add an entity first — attributes attach to entities', 'error');
        return;
      }
      setPendingAction((current) => (current === action ? null : action));
    },
    [d.diagram.entities.length, showToast]
  );

  const deleteSelected = useCallback(() => {
    if (!d.selectedId || !d.selectedType) return;
    if (d.selectedType === 'entity') d.deleteEntity(d.selectedId);
    else if (d.selectedType === 'attribute') d.deleteAttribute(d.selectedId);
    else d.deleteRelationship(d.selectedId);
  }, [d]);

  const handleExportJson = useCallback(() => {
    const name = store.activeMeta?.name || 'erd-diagram';
    const data = { ...d.diagram, id: undefined, name };
    downloadText(JSON.stringify(data, null, 2), `${slugify(name)}.json`, 'application/json');
    showToast('Diagram exported as JSON', 'success');
  }, [d.diagram, store.activeMeta, showToast]);

  const handleExport = (format: ExportFormat) => {
    const name = store.activeMeta?.name || 'erd-diagram';
    const namedDiagram = { ...d.diagram, name };
    switch (format) {
      case 'png': {
        if (!stage) return;
        // Drop selection highlight and ghost preview before rasterizing
        d.deselect();
        setPendingAction(null);
        setTimeout(() => {
          const ok = exportPng(stage, namedDiagram, canvasTheme.canvasBg);
          if (ok) showToast('PNG exported', 'success');
          else showToast('Nothing to export — the diagram is empty', 'error');
        }, 60);
        break;
      }
      case 'svg': {
        const ok = exportSvg(namedDiagram, canvasTheme);
        if (ok) showToast('SVG exported', 'success');
        else showToast('Nothing to export — the diagram is empty', 'error');
        break;
      }
      case 'json':
        handleExportJson();
        break;
      case 'sql':
        setSqlPreview(generateSql(namedDiagram));
        break;
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!validateDiagram(parsed)) {
          showToast('Invalid diagram file — missing or malformed data', 'error');
          return;
        }
        store.flushSave(d.diagram);
        const name = typeof parsed.name === 'string' && parsed.name ? parsed.name : 'Imported diagram';
        const fresh = store.createDiagram(name);
        d.loadDiagram({ ...parsed, id: fresh.id, name });
        showToast(`Imported "${name}"`, 'success');
      } catch {
        showToast('Could not read that file — is it valid JSON?', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleConnectRelationship = (relationshipId: string, entityId: string) => {
    const connected = d.connectRelationshipToEntity(relationshipId, entityId);
    if (!connected) {
      showToast('This relationship already has two connections', 'error');
    }
  };

  /* ------------------------------ zoom ------------------------------ */

  const zoomAtCenter = (factor: number) => {
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, view.scale * factor));
    const modelX = (centerX - view.x) / view.scale;
    const modelY = (centerY - view.y) / view.scale;
    setView({
      scale: newScale,
      x: centerX - modelX * newScale,
      y: centerY - modelY * newScale,
    });
  };

  const resetZoom = () => {
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;
    const modelX = (centerX - view.x) / view.scale;
    const modelY = (centerY - view.y) / view.scale;
    setView({ scale: 1, x: centerX - modelX, y: centerY - modelY });
  };

  const fitToContent = useCallback(() => {
    const bounds = getDiagramBounds(d.diagram);
    if (!bounds) {
      showToast('The diagram is empty', 'info');
      return;
    }
    const padding = 80;
    const scaleX = (canvasSize.width - padding * 2) / bounds.width;
    const scaleY = (canvasSize.height - padding * 2) / bounds.height;
    const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.min(scaleX, scaleY, 1.25)));
    setView({
      scale,
      x: canvasSize.width / 2 - (bounds.x + bounds.width / 2) * scale,
      y: canvasSize.height / 2 - (bounds.y + bounds.height / 2) * scale,
    });
  }, [d.diagram, canvasSize, showToast]);

  /* -------------------------- diagram manager ----------------------- */

  const handleOpenDiagram = (id: string) => {
    if (id === store.activeId) return;
    store.flushSave(d.diagram);
    const diagram = store.openDiagram(id);
    if (diagram) {
      d.loadDiagram(diagram);
      setView({ scale: 1, x: 0, y: 0 });
    }
  };

  const handleCreateDiagram = () => {
    store.flushSave(d.diagram);
    const fresh = store.createDiagram();
    d.loadDiagram(fresh);
    setView({ scale: 1, x: 0, y: 0 });
    setManagerOpen(false);
  };

  const handleDuplicateDiagram = (id: string) => {
    if (id === store.activeId) store.flushSave(d.diagram);
    store.duplicateDiagram(id);
    showToast('Diagram duplicated', 'success');
  };

  const handleDeleteDiagram = (id: string) => {
    const meta = store.diagrams.find((m) => m.id === id);
    setConfirm({
      title: 'Delete diagram?',
      message: `"${meta?.name || 'Untitled diagram'}" will be permanently deleted.`,
      confirmLabel: 'Delete',
      action: () => {
        const next = store.deleteDiagram(id);
        if (next) {
          d.loadDiagram(next);
          setView({ scale: 1, x: 0, y: 0 });
        }
        setConfirm(null);
      },
    });
  };

  const handleClearCanvas = () => {
    setConfirm({
      title: 'Clear canvas?',
      message: 'All shapes on this diagram will be removed. You can undo afterwards.',
      confirmLabel: 'Clear',
      action: () => {
        d.clearDiagram();
        setConfirm(null);
        showToast('Canvas cleared — press ⌘Z to undo', 'info');
      },
    });
  };

  /* -------------------------- keyboard shortcuts -------------------- */

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing =
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if (e.key === 'Escape') {
        if (sqlPreview !== null) setSqlPreview(null);
        else if (managerOpen) setManagerOpen(false);
        else if (confirm) setConfirm(null);
        else if (pendingAction) setPendingAction(null);
        else d.deselect();
        return;
      }

      if (typing) return;

      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) d.redo();
        else d.undo();
        return;
      }
      if (meta && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleExportJson();
        return;
      }
      if (meta) return;

      switch (e.key.toLowerCase()) {
        case 'delete':
        case 'backspace':
          deleteSelected();
          break;
        case 'e':
          handleSetPendingAction('entity');
          break;
        case 'a':
          handleSetPendingAction('attribute');
          break;
        case 'r':
          handleSetPendingAction('relationship');
          break;
        case 'f':
          fitToContent();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [d, sqlPreview, managerOpen, confirm, pendingAction, deleteSelected, handleSetPendingAction, handleExportJson, fitToContent]);

  const pendingHint =
    pendingAction === 'entity'
      ? 'Click anywhere to place the entity'
      : pendingAction === 'attribute'
        ? 'Click on or near an entity to attach the attribute'
        : pendingAction === 'relationship'
          ? 'Click anywhere to place the relationship'
          : null;

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-screen overflow-hidden"
      style={{ ...chromeVars, background: canvasTheme.canvasBg } as React.CSSProperties}
    >
      <Canvas
        width={canvasSize.width}
        height={canvasSize.height}
        diagram={d.diagram}
        theme={canvasTheme}
        selectedId={d.selectedId}
        selectedType={d.selectedType}
        pendingAction={pendingAction}
        snapToGrid={snapToGrid}
        view={view}
        onViewChange={setView}
        onStageReady={setStage}
        onMoveEntity={d.moveEntity}
        onMoveAttribute={(id, x, y) => d.updateAttribute(id, { x, y })}
        onMoveRelationship={(id, x, y) => d.updateRelationship(id, { x, y })}
        onSelectItem={d.selectItem}
        onDeselect={d.deselect}
        onAddEntity={(x, y) => d.selectItem(d.addEntity(x, y), 'entity')}
        onAddAttribute={(entityId, x, y) => d.selectItem(d.addAttribute(entityId, x, y), 'attribute')}
        onAddRelationship={(x, y) => d.selectItem(d.addRelationship(x, y), 'relationship')}
        onCancelPendingAction={() => setPendingAction(null)}
        onConnectRelationshipToEntity={handleConnectRelationship}
        onPlacementMiss={() => showToast('Click closer to an entity to attach the attribute', 'error')}
      />

      <DiagramPill
        activeMeta={store.activeMeta}
        onRename={(name) => store.activeId && store.renameDiagram(store.activeId, name)}
        onOpenManager={() => setManagerOpen(true)}
      />

      <Toolbar pendingAction={pendingAction} onSetPendingAction={handleSetPendingAction} />

      <ActionBar
        mode={mode}
        canUndo={d.canUndo}
        canRedo={d.canRedo}
        snapToGrid={snapToGrid}
        onUndo={d.undo}
        onRedo={d.redo}
        onToggleSnap={toggleSnap}
        onExport={handleExport}
        onImport={() => fileInputRef.current?.click()}
        onToggleTheme={toggleTheme}
        onClear={handleClearCanvas}
      />

      {pendingHint && (
        <div className="pointer-events-none absolute top-[4.5rem] left-1/2 z-30 -translate-x-1/2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 text-xs text-[var(--text-muted)] shadow-md backdrop-blur">
          {pendingHint}
          <span className="ml-2 rounded border border-[var(--border)] bg-[var(--hover)] px-1 text-[10px]">Esc</span>
          <span className="ml-1">to cancel</span>
        </div>
      )}

      <ZoomControls
        scale={view.scale}
        onZoomIn={() => zoomAtCenter(1.2)}
        onZoomOut={() => zoomAtCenter(1 / 1.2)}
        onReset={resetZoom}
        onFit={fitToContent}
      />

      {d.selectedId && d.selectedType && (
        <Sidebar
          selectedId={d.selectedId}
          selectedType={d.selectedType}
          diagram={d.diagram}
          onUpdate={(updates) => {
            if (d.selectedType === 'entity') d.updateEntity(d.selectedId!, updates);
            else if (d.selectedType === 'attribute') d.updateAttribute(d.selectedId!, updates);
            else if (d.selectedType === 'relationship') d.updateRelationship(d.selectedId!, updates);
          }}
          onUpdateCardinality={(entityId, cardinality, connectionIndex) => {
            if (d.selectedId) d.updateRelationshipCardinality(d.selectedId, entityId, cardinality, connectionIndex);
          }}
          onDisconnect={(entityId) => {
            if (d.selectedId) d.disconnectRelationshipFromEntity(d.selectedId, entityId);
          }}
          onDelete={deleteSelected}
          onClose={d.deselect}
        />
      )}

      <DiagramManager
        open={managerOpen}
        diagrams={store.diagrams}
        activeId={store.activeId}
        onOpen={handleOpenDiagram}
        onCreate={handleCreateDiagram}
        onRename={store.renameDiagram}
        onDuplicate={handleDuplicateDiagram}
        onDelete={handleDeleteDiagram}
        onClose={() => setManagerOpen(false)}
      />

      <SqlModal
        open={sqlPreview !== null}
        sql={sqlPreview || ''}
        onClose={() => setSqlPreview(null)}
        onDownload={() => {
          const name = store.activeMeta?.name || 'erd-diagram';
          downloadText(sqlPreview || '', `${slugify(name)}.sql`, 'text/plain');
        }}
        onCopied={() => showToast('SQL copied to clipboard', 'success')}
      />

      <ConfirmDialog
        open={confirm !== null}
        title={confirm?.title || ''}
        message={confirm?.message || ''}
        confirmLabel={confirm?.confirmLabel}
        onConfirm={() => confirm?.action()}
        onCancel={() => setConfirm(null)}
      />

      <Toasts toasts={toasts} />

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleImportFile}
        className="hidden"
      />
    </div>
  );
}
