'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Stage, Layer, Text, Shape, Rect, Ellipse, Line } from 'react-konva';
import Konva from 'konva';
import { Entity } from './Entity';
import { Attribute } from './Attribute';
import { Relationship } from './Relationship';
import { ConnectionLine } from './ConnectionLine';
import { Diagram, ElementType, Entity as EntityType } from '../types/diagram';
import { CanvasTheme } from '../theme';
import {
  ATTRIBUTE_WIDTH,
  ATTRIBUTE_HEIGHT,
  RELATIONSHIP_SIZE,
  ENTITY_WIDTH,
  ENTITY_HEIGHT,
  getAttributeConnectionPoints,
  getRelationshipConnectionPoints,
  getSelfReferencingConnectionPoints,
  Point,
} from '../lib/geometry';
import { ViewState, MIN_SCALE, MAX_SCALE, GRID_SIZE } from '../lib/view';

const ATTRIBUTE_ATTACH_RADIUS = 250;

interface CanvasProps {
  width: number;
  height: number;
  diagram: Diagram;
  theme: CanvasTheme;
  selectedId: string | null;
  selectedType: ElementType | null;
  pendingAction: ElementType | null;
  snapToGrid: boolean;
  view: ViewState;
  onViewChange: React.Dispatch<React.SetStateAction<ViewState>>;
  onStageReady: (stage: Konva.Stage | null) => void;
  onMoveEntity: (id: string, x: number, y: number) => void;
  onMoveAttribute: (id: string, x: number, y: number) => void;
  onMoveRelationship: (id: string, x: number, y: number) => void;
  onSelectItem: (id: string, type: ElementType) => void;
  onDeselect: () => void;
  onAddEntity: (x: number, y: number) => void;
  onAddAttribute: (entityId: string, x: number, y: number) => void;
  onAddRelationship: (x: number, y: number) => void;
  onCancelPendingAction: () => void;
  onConnectRelationshipToEntity: (relationshipId: string, entityId: string) => void;
  onPlacementMiss: () => void;
}

/** Find a free spot around an entity for a newly attached attribute. */
const findNonOverlappingPosition = (entity: EntityType, diagram: Diagram): Point => {
  const SPACING = 24;
  const positions = [
    { x: entity.x + entity.width / 2, y: entity.y - SPACING - ATTRIBUTE_HEIGHT / 2 },
    { x: entity.x + entity.width + SPACING + ATTRIBUTE_WIDTH / 2, y: entity.y + entity.height / 2 },
    { x: entity.x + entity.width / 2, y: entity.y + entity.height + SPACING + ATTRIBUTE_HEIGHT / 2 },
    { x: entity.x - SPACING - ATTRIBUTE_WIDTH / 2, y: entity.y + entity.height / 2 },
  ];

  for (const pos of positions) {
    const overlaps = diagram.attributes.some((attr) => {
      if (attr.entityId !== entity.id) return false;
      return (
        Math.abs(attr.x - pos.x) < ATTRIBUTE_WIDTH &&
        Math.abs(attr.y - pos.y) < ATTRIBUTE_HEIGHT
      );
    });
    if (!overlaps) return pos;
  }
  return positions[0];
};

export const Canvas = ({
  width,
  height,
  diagram,
  theme,
  selectedId,
  selectedType,
  pendingAction,
  snapToGrid,
  view,
  onViewChange,
  onStageReady,
  onMoveEntity,
  onMoveAttribute,
  onMoveRelationship,
  onSelectItem,
  onDeselect,
  onAddEntity,
  onAddAttribute,
  onAddRelationship,
  onCancelPendingAction,
  onConnectRelationshipToEntity,
  onPlacementMiss,
}: CanvasProps) => {
  const stageRef = useRef<Konva.Stage | null>(null);
  const [spaceDown, setSpaceDown] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const panLast = useRef<Point | null>(null);
  const [ghostPos, setGhostPos] = useState<Point | null>(null);

  useEffect(() => {
    onStageReady(stageRef.current);
    return () => onStageReady(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Space-bar hold enables panning
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setSpaceDown(true);
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') setSpaceDown(false);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  const snap = useCallback(
    (v: number) => (snapToGrid ? Math.round(v / GRID_SIZE) * GRID_SIZE : v),
    [snapToGrid]
  );

  /** Convert a screen (stage container) point to model coordinates. */
  const toModel = useCallback(
    (screen: Point): Point => ({
      x: (screen.x - view.x) / view.scale,
      y: (screen.y - view.y) / view.scale,
    }),
    [view]
  );

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    if (e.evt.ctrlKey || e.evt.metaKey) {
      // Pinch gesture / ctrl+wheel: zoom toward cursor
      const pointer = stage.getPointerPosition();
      if (!pointer) return;
      const zoomFactor = Math.exp(-e.evt.deltaY * 0.01);
      onViewChange((v) => {
        const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, v.scale * zoomFactor));
        const modelX = (pointer.x - v.x) / v.scale;
        const modelY = (pointer.y - v.y) / v.scale;
        return {
          scale: newScale,
          x: pointer.x - modelX * newScale,
          y: pointer.y - modelY * newScale,
        };
      });
    } else {
      // Plain wheel / two-finger scroll: pan
      const { deltaX, deltaY } = e.evt;
      onViewChange((v) => ({ ...v, x: v.x - deltaX, y: v.y - deltaY }));
    }
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const isMiddle = e.evt.button === 1;
    if (spaceDown || isMiddle) {
      e.evt.preventDefault();
      setIsPanning(true);
      panLast.current = { x: e.evt.clientX, y: e.evt.clientY };
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isPanning && panLast.current) {
      const dx = e.evt.clientX - panLast.current.x;
      const dy = e.evt.clientY - panLast.current.y;
      panLast.current = { x: e.evt.clientX, y: e.evt.clientY };
      onViewChange((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
      return;
    }
    if (pendingAction) {
      const stage = stageRef.current;
      const pointer = stage?.getPointerPosition();
      if (pointer) setGhostPos(toModel(pointer));
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      panLast.current = null;
    }
  };

  useEffect(() => {
    if (!pendingAction) setGhostPos(null);
  }, [pendingAction]);

  const nearestEntityTo = (point: Point): { entity: EntityType; dist: number } | null => {
    let best: { entity: EntityType; dist: number } | null = null;
    for (const entity of diagram.entities) {
      const cx = entity.x + entity.width / 2;
      const cy = entity.y + entity.height / 2;
      const dist = Math.hypot(point.x - cx, point.y - cy);
      if (!best || dist < best.dist) best = { entity, dist };
    }
    return best;
  };

  // Entity highlighted as attach target while placing an attribute
  const attachTarget =
    pendingAction === 'attribute' && ghostPos
      ? (() => {
          const nearest = nearestEntityTo(ghostPos);
          return nearest && nearest.dist < ATTRIBUTE_ATTACH_RADIUS ? nearest.entity : null;
        })()
      : null;

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent | Event>) => {
    if (isPanning || spaceDown) return;
    const stage = e.target.getStage();
    if (!stage || e.target !== stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const model = toModel(pointer);

    if (pendingAction === 'entity') {
      onAddEntity(snap(model.x - ENTITY_WIDTH / 2), snap(model.y - ENTITY_HEIGHT / 2));
      onCancelPendingAction();
    } else if (pendingAction === 'attribute') {
      const nearest = nearestEntityTo(model);
      if (nearest && nearest.dist < ATTRIBUTE_ATTACH_RADIUS) {
        onAddAttribute(nearest.entity.id, snap(model.x), snap(model.y));
        onCancelPendingAction();
      } else {
        onPlacementMiss();
      }
    } else if (pendingAction === 'relationship') {
      onAddRelationship(snap(model.x), snap(model.y));
      onCancelPendingAction();
    } else {
      onDeselect();
    }
  };

  const handleStageDoubleClick = (e: Konva.KonvaEventObject<MouseEvent | Event>) => {
    if (spaceDown) return;
    const stage = e.target.getStage();
    if (!stage || e.target !== stage || pendingAction) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const model = toModel(pointer);
    onAddEntity(snap(model.x - ENTITY_WIDTH / 2), snap(model.y - ENTITY_HEIGHT / 2));
  };

  // Visible model-space region for the dot grid
  const gridRegion = {
    left: -view.x / view.scale,
    top: -view.y / view.scale,
    right: (width - view.x) / view.scale,
    bottom: (height - view.y) / view.scale,
  };

  const cursor = isPanning
    ? 'grabbing'
    : spaceDown
      ? 'grab'
      : pendingAction
        ? 'crosshair'
        : 'default';

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      scaleX={view.scale}
      scaleY={view.scale}
      x={view.x}
      y={view.y}
      onClick={handleStageClick}
      onTap={handleStageClick}
      onDblClick={handleStageDoubleClick}
      onDblTap={handleStageDoubleClick}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ cursor, background: theme.canvasBg }}
    >
      <Layer name="grid-layer" listening={false}>
        <Shape
          sceneFunc={(ctx, shape) => {
            const startX = Math.floor(gridRegion.left / GRID_SIZE) * GRID_SIZE;
            const startY = Math.floor(gridRegion.top / GRID_SIZE) * GRID_SIZE;
            ctx.beginPath();
            for (let gx = startX; gx <= gridRegion.right; gx += GRID_SIZE) {
              for (let gy = startY; gy <= gridRegion.bottom; gy += GRID_SIZE) {
                ctx.moveTo(gx, gy);
                ctx.arc(gx, gy, 1, 0, Math.PI * 2);
              }
            }
            ctx.fillStyle = theme.gridDot;
            ctx.fill();
            ctx.fillStrokeShape(shape);
          }}
        />
      </Layer>
      <Layer listening={!spaceDown && !isPanning}>
        {/* Connection lines behind shapes */}
        {diagram.attributes.map((attribute) => {
          const entity = diagram.entities.find((e) => e.id === attribute.entityId);
          if (!entity) return null;
          const { from, to } = getAttributeConnectionPoints(attribute, entity);
          const highlighted =
            (selectedId === attribute.id && selectedType === 'attribute') ||
            (selectedId === entity.id && selectedType === 'entity');
          return (
            <ConnectionLine
              key={`attr-line-${attribute.id}`}
              from={from}
              to={to}
              stroke={theme.connection}
              highlighted={highlighted}
              highlightColor={theme.accentSoft}
            />
          );
        })}

        {diagram.relationships.map((relationship) => {
          const processedEntities = new Set<string>();
          const relSelected = selectedId === relationship.id && selectedType === 'relationship';

          return relationship.connectedEntities.map((entityId, index) => {
            const entity = diagram.entities.find((e) => e.id === entityId);
            if (!entity) return null;

            const count = relationship.connectedEntities.filter((id) => id === entityId).length;
            const isSelfReference = count === 2;
            if (processedEntities.has(entityId)) return null;
            processedEntities.add(entityId);

            const renderConnection = (
              diamondCorner: Point,
              entityPoint: Point,
              cardinality: string,
              key: string
            ) => {
              const dx = entityPoint.x - diamondCorner.x;
              const dy = entityPoint.y - diamondCorner.y;
              const distance = Math.hypot(dx, dy) || 1;
              const offset = 15;
              const labelX = entityPoint.x - (dx / distance) * offset;
              const labelY = entityPoint.y - (dy / distance) * offset;
              return (
                <React.Fragment key={key}>
                  <ConnectionLine
                    from={entityPoint}
                    to={diamondCorner}
                    stroke={theme.connection}
                    highlighted={relSelected}
                    highlightColor={theme.accentSoft}
                  />
                  <Text
                    x={labelX}
                    y={labelY}
                    text={cardinality}
                    fontSize={14}
                    fontFamily="system-ui, -apple-system, sans-serif"
                    fill={theme.cardinalityText}
                    align="center"
                    verticalAlign="middle"
                    offsetX={8}
                    offsetY={8}
                    listening={false}
                  />
                </React.Fragment>
              );
            };

            if (isSelfReference) {
              const connectionPoints = getSelfReferencingConnectionPoints(relationship, entity);
              return (
                <React.Fragment key={`rel-self-${relationship.id}-${entityId}`}>
                  {connectionPoints.map(({ diamondCorner, entityPoint }, connectionIndex) => {
                    const cardinality =
                      relationship.cardinalities?.[`${entityId}_self_${connectionIndex}`] ||
                      relationship.cardinalities?.[entityId] ||
                      '1';
                    return renderConnection(
                      diamondCorner,
                      entityPoint,
                      cardinality,
                      `rel-self-line-${relationship.id}-${entityId}-${connectionIndex}`
                    );
                  })}
                </React.Fragment>
              );
            }

            const { diamondCorner, entityPoint } = getRelationshipConnectionPoints(relationship, entity);
            const cardinality = relationship.cardinalities?.[entityId] || '1';
            return renderConnection(
              diamondCorner,
              entityPoint,
              cardinality,
              `rel-line-${relationship.id}-${entityId}-${index}`
            );
          });
        })}

        {/* Entities */}
        {diagram.entities.map((entity) => (
          <Entity
            key={entity.id}
            entity={entity}
            theme={theme}
            isSelected={selectedId === entity.id && selectedType === 'entity'}
            isConnectTarget={attachTarget?.id === entity.id}
            onSelect={() => {
              if (spaceDown || isPanning) return;
              if (pendingAction === 'attribute') {
                const position = findNonOverlappingPosition(entity, diagram);
                onAddAttribute(entity.id, snap(position.x), snap(position.y));
                onCancelPendingAction();
              } else if (selectedType === 'relationship' && selectedId) {
                const selectedRelationship = diagram.relationships.find((r) => r.id === selectedId);
                if (selectedRelationship && selectedRelationship.connectedEntities.length < 2) {
                  onConnectRelationshipToEntity(selectedId, entity.id);
                } else {
                  // Relationship already complete: treat the click as a normal selection
                  onSelectItem(entity.id, 'entity');
                }
              } else {
                onSelectItem(entity.id, 'entity');
              }
            }}
            onDragEnd={(e) => {
              onMoveEntity(entity.id, snap(e.target.x()), snap(e.target.y()));
            }}
          />
        ))}

        {/* Attributes */}
        {diagram.attributes.map((attribute) => (
          <Attribute
            key={attribute.id}
            attribute={attribute}
            theme={theme}
            isSelected={selectedId === attribute.id && selectedType === 'attribute'}
            onSelect={() => {
              if (spaceDown || isPanning) return;
              onSelectItem(attribute.id, 'attribute');
            }}
            onDragEnd={(e) => {
              onMoveAttribute(attribute.id, snap(e.target.x()), snap(e.target.y()));
            }}
          />
        ))}

        {/* Relationships */}
        {diagram.relationships.map((relationship) => (
          <Relationship
            key={relationship.id}
            relationship={relationship}
            theme={theme}
            isSelected={selectedId === relationship.id && selectedType === 'relationship'}
            onSelect={() => {
              if (spaceDown || isPanning) return;
              onSelectItem(relationship.id, 'relationship');
            }}
            onDragEnd={(e) => {
              onMoveRelationship(relationship.id, snap(e.target.x()), snap(e.target.y()));
            }}
          />
        ))}

        {/* Ghost preview while placing */}
        {pendingAction && ghostPos && (
          <>
            {pendingAction === 'entity' && (
              <Rect
                x={snap(ghostPos.x - ENTITY_WIDTH / 2)}
                y={snap(ghostPos.y - ENTITY_HEIGHT / 2)}
                width={ENTITY_WIDTH}
                height={ENTITY_HEIGHT}
                stroke={theme.ghost}
                strokeWidth={1.5}
                dash={[6, 4]}
                cornerRadius={6}
                opacity={0.6}
                listening={false}
              />
            )}
            {pendingAction === 'attribute' && (
              <Ellipse
                x={snap(ghostPos.x)}
                y={snap(ghostPos.y)}
                radiusX={ATTRIBUTE_WIDTH / 2}
                radiusY={ATTRIBUTE_HEIGHT / 2}
                stroke={attachTarget ? theme.ghost : theme.connection}
                strokeWidth={1.5}
                dash={[6, 4]}
                opacity={0.6}
                listening={false}
              />
            )}
            {pendingAction === 'relationship' && (
              <Line
                x={snap(ghostPos.x)}
                y={snap(ghostPos.y)}
                points={[
                  0, -RELATIONSHIP_SIZE / 2,
                  RELATIONSHIP_SIZE / 2, 0,
                  0, RELATIONSHIP_SIZE / 2,
                  -RELATIONSHIP_SIZE / 2, 0,
                ]}
                closed
                stroke={theme.ghost}
                strokeWidth={1.5}
                dash={[6, 4]}
                opacity={0.6}
                listening={false}
              />
            )}
          </>
        )}
      </Layer>
    </Stage>
  );
};
