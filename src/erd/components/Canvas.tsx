'use client';

import React from 'react';
import { Stage, Layer, Text } from 'react-konva';
import { Entity } from './Entity';
import { Attribute } from './Attribute';
import { Relationship } from './Relationship';
import { ConnectionLine, getAttributeConnectionPoints, getRelationshipConnectionPoints } from './ConnectionLine';
import { useEffect, useRef } from 'react';
import { Diagram } from '../types/diagram';

interface CanvasProps {
  width: number;
  height: number;
  diagram: Diagram;
  version: number;
  selectedId: string | null;
  selectedType: 'entity' | 'attribute' | 'relationship' | null;
  pendingAction: 'entity' | 'attribute' | 'relationship' | null;
  onUpdateEntity: (id: string, updates: Partial<import('../types/diagram').Entity>) => void;
  onUpdateAttribute: (id: string, updates: Partial<import('../types/diagram').Attribute>) => void;
  onUpdateRelationship: (id: string, updates: Partial<import('../types/diagram').Relationship>) => void;
  onDeleteEntity: (id: string) => void;
  onDeleteAttribute: (id: string) => void;
  onDeleteRelationship: (id: string) => void;
  onSelectItem: (id: string, type: 'entity' | 'attribute' | 'relationship', openSidebar?: boolean) => void;
  onDeselect: () => void;
  onAddEntity: (x: number, y: number) => void;
  onAddAttribute: (entityId: string, x: number, y: number) => void;
  onAddRelationship: (x: number, y: number) => void;
  onCancelPendingAction: () => void;
  onConnectRelationshipToEntity: (relationshipId: string, entityId: string) => void;
}

export const Canvas = ({
  width,
  height,
  diagram,
  version,
  selectedId,
  selectedType,
  pendingAction,
  onUpdateEntity,
  onUpdateAttribute,
  onUpdateRelationship,
  onDeleteEntity,
  onDeleteAttribute,
  onDeleteRelationship,
  onSelectItem,
  onDeselect,
  onAddEntity,
  onAddAttribute,
  onAddRelationship,
  onCancelPendingAction,
  onConnectRelationshipToEntity,
}: CanvasProps) => {
  const stageRef = useRef<any>(null);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't delete if user is typing in an input field
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId && selectedType) {
          if (selectedType === 'entity') {
            onDeleteEntity(selectedId);
          } else if (selectedType === 'attribute') {
            onDeleteAttribute(selectedId);
          } else if (selectedType === 'relationship') {
            onDeleteRelationship(selectedId);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, selectedType, onDeleteEntity, onDeleteAttribute, onDeleteRelationship]);

  const handleStageClick = (e: any) => {
    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();
    
    // If clicking on empty space (the stage itself)
    if (e.target === stage) {
      if (pendingAction) {
        // Handle pending action
        if (pendingAction === 'entity') {
          onAddEntity(pointerPos.x - 60, pointerPos.y - 30);
          onCancelPendingAction();
        } else if (pendingAction === 'attribute') {
          // Find nearest entity
          let nearestEntity = diagram.entities[0];
          let minDist = Infinity;
          for (const entity of diagram.entities) {
            const entityCenterX = entity.x + entity.width / 2;
            const entityCenterY = entity.y + entity.height / 2;
            const dist = Math.sqrt(
              Math.pow(pointerPos.x - entityCenterX, 2) + Math.pow(pointerPos.y - entityCenterY, 2)
            );
            if (dist < minDist) {
              minDist = dist;
              nearestEntity = entity;
            }
          }
          if (minDist < 200) {
            onAddAttribute(nearestEntity.id, pointerPos.x - 40, pointerPos.y - 20);
            onCancelPendingAction();
          }
        } else if (pendingAction === 'relationship') {
          onAddRelationship(pointerPos.x - 40, pointerPos.y - 40);
          onCancelPendingAction();
        }
      } else {
        // Deselect if clicking on empty space
        onDeselect();
      }
    }
  };

  const handleStageDoubleClick = (e: any) => {
    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();
    
    // If double-clicking on empty space (the stage itself) and no pending action
    if (e.target === stage && !pendingAction) {
      // Add entity at double-click location
      onAddEntity(pointerPos.x - 60, pointerPos.y - 30);
    }
  };

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      onClick={handleStageClick}
      onTap={handleStageClick}
      onDblClick={handleStageDoubleClick}
      onDblTap={handleStageDoubleClick}
      style={{ cursor: 'default' }}
    >
      <Layer key={`canvas-layer-${version}`}>
        {/* Render connection lines first (behind shapes) */}
        {diagram.attributes.map((attribute) => {
          const entity = diagram.entities.find((e) => e.id === attribute.entityId);
          if (!entity) return null;
          const { from, to } = getAttributeConnectionPoints(attribute, entity);
          return <ConnectionLine key={`attr-line-${attribute.id}`} from={from} to={to} />;
        })}

        {diagram.relationships.map((relationship) => {
          return relationship.connectedEntities.map((entityId, index) => {
            const entity = diagram.entities.find((e) => e.id === entityId);
            if (!entity) return null;
            
            // Get connection points (closest diamond corner to closest entity point)
            const { diamondCorner, entityPoint } = getRelationshipConnectionPoints(
              relationship,
              entity
            );
            
            // Get cardinality for this connection
            const cardinality = relationship.cardinalities?.[entityId] || '1';
            
            // Calculate label position (slightly offset from entity connection point)
            const dx = entityPoint.x - diamondCorner.x;
            const dy = entityPoint.y - diamondCorner.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const offset = 15; // pixels from connection point
            const labelX = entityPoint.x - (dx / distance) * offset;
            const labelY = entityPoint.y - (dy / distance) * offset;
            
            return (
              <React.Fragment key={`rel-line-${relationship.id}-${entityId}-${index}`}>
                <ConnectionLine
                  from={entityPoint}
                  to={diamondCorner}
                />
                <Text
                  x={labelX}
                  y={labelY}
                  text={cardinality}
                  fontSize={16}
                  fontFamily="Arial"
                  fill="#1e293b"
                  align="center"
                  verticalAlign="middle"
                  offsetX={8}
                  offsetY={8}
                  listening={false}
                />
              </React.Fragment>
            );
          });
        })}

        {/* Render entities */}
        {diagram.entities.map((entity) => {
          // Helper function to find non-overlapping position for attribute
          const findNonOverlappingPosition = (entity: import('../types/diagram').Entity): { x: number; y: number } => {
            const ATTRIBUTE_WIDTH = 80;
            const ATTRIBUTE_HEIGHT = 40;
            const SPACING = 20; // Minimum spacing from entity edge
            
            // Try positions around the entity: top, right, bottom, left
            const positions = [
              // Top
              { x: entity.x + entity.width / 2, y: entity.y - SPACING - ATTRIBUTE_HEIGHT / 2 },
              // Right
              { x: entity.x + entity.width + SPACING + ATTRIBUTE_WIDTH / 2, y: entity.y + entity.height / 2 },
              // Bottom
              { x: entity.x + entity.width / 2, y: entity.y + entity.height + SPACING + ATTRIBUTE_HEIGHT / 2 },
              // Left
              { x: entity.x - SPACING - ATTRIBUTE_WIDTH / 2, y: entity.y + entity.height / 2 },
            ];
            
            // Check each position for overlaps
            for (const pos of positions) {
              const attrLeft = pos.x - ATTRIBUTE_WIDTH / 2;
              const attrRight = pos.x + ATTRIBUTE_WIDTH / 2;
              const attrTop = pos.y - ATTRIBUTE_HEIGHT / 2;
              const attrBottom = pos.y + ATTRIBUTE_HEIGHT / 2;
              
              // Check overlap with entity
              const overlapsEntity = !(
                attrRight < entity.x ||
                attrLeft > entity.x + entity.width ||
                attrBottom < entity.y ||
                attrTop > entity.y + entity.height
              );
              
              if (overlapsEntity) continue;
              
              // Check overlap with other attributes of this entity
              let overlapsAttribute = false;
              for (const attr of diagram.attributes) {
                if (attr.entityId === entity.id) {
                  const otherAttrLeft = attr.x - ATTRIBUTE_WIDTH / 2;
                  const otherAttrRight = attr.x + ATTRIBUTE_WIDTH / 2;
                  const otherAttrTop = attr.y - ATTRIBUTE_HEIGHT / 2;
                  const otherAttrBottom = attr.y + ATTRIBUTE_HEIGHT / 2;
                  
                  const overlaps = !(
                    attrRight < otherAttrLeft ||
                    attrLeft > otherAttrRight ||
                    attrBottom < otherAttrTop ||
                    attrTop > otherAttrBottom
                  );
                  
                  if (overlaps) {
                    overlapsAttribute = true;
                    break;
                  }
                }
              }
              
              if (!overlapsAttribute) {
                return pos;
              }
            }
            
            // If all positions overlap, default to top position
            return positions[0];
          };

          return (
            <Entity
              key={entity.id}
              entity={entity}
              isSelected={selectedId === entity.id && selectedType === 'entity'}
              onSelect={() => {
                // If adding attribute and clicking on entity, auto-place attribute
                if (pendingAction === 'attribute') {
                  const position = findNonOverlappingPosition(entity);
                  onAddAttribute(entity.id, position.x, position.y);
                  onCancelPendingAction();
                } else if (selectedType === 'relationship' && selectedId) {
                  // If a relationship is selected, connect it to this entity
                  onConnectRelationshipToEntity(selectedId, entity.id);
                } else {
                  onSelectItem(entity.id, 'entity', false);
                }
              }}
            onDoubleClick={() => {
              onSelectItem(entity.id, 'entity', true);
            }}
            onDragEnd={(e) => {
              const newX = e.target.x();
              const newY = e.target.y();
              const deltaX = newX - entity.x;
              const deltaY = newY - entity.y;
              
              // Update entity position
              onUpdateEntity(entity.id, {
                x: newX,
                y: newY,
              });
              
              // Move all attributes of this entity by the same delta
              diagram.attributes
                .filter((attr) => attr.entityId === entity.id)
                .forEach((attr) => {
                  onUpdateAttribute(attr.id, {
                    x: attr.x + deltaX,
                    y: attr.y + deltaY,
                  });
                });
            }}
            onUpdate={(updates) => onUpdateEntity(entity.id, updates)}
            onDelete={() => onDeleteEntity(entity.id)}
            />
          );
        })}

        {/* Render attributes */}
        {diagram.attributes.map((attribute) => (
          <Attribute
            key={attribute.id}
            attribute={attribute}
            isSelected={selectedId === attribute.id && selectedType === 'attribute'}
            onSelect={() => onSelectItem(attribute.id, 'attribute', false)}
            onDoubleClick={() => onSelectItem(attribute.id, 'attribute', true)}
            onDragEnd={(e) => {
              onUpdateAttribute(attribute.id, {
                x: e.target.x(),
                y: e.target.y(),
              });
            }}
            onUpdate={(updates) => onUpdateAttribute(attribute.id, updates)}
            onDelete={() => onDeleteAttribute(attribute.id)}
          />
        ))}

        {/* Render relationships */}
        {diagram.relationships.map((relationship) => (
          <Relationship
            key={relationship.id}
            relationship={relationship}
            isSelected={selectedId === relationship.id && selectedType === 'relationship'}
            onSelect={() => onSelectItem(relationship.id, 'relationship', false)}
            onDoubleClick={() => onSelectItem(relationship.id, 'relationship', true)}
            onDragEnd={(e) => {
              onUpdateRelationship(relationship.id, {
                x: e.target.x(),
                y: e.target.y(),
              });
            }}
            onUpdate={(updates) => onUpdateRelationship(relationship.id, updates)}
            onDelete={() => onDeleteRelationship(relationship.id)}
          />
        ))}
      </Layer>
    </Stage>
  );
};
