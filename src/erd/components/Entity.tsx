'use client';

import { Rect, Text, Group } from 'react-konva';
import { Entity as EntityType } from '../types/diagram';
import { useState, useRef, useEffect, useMemo } from 'react';

interface EntityProps {
  entity: EntityType;
  isSelected: boolean;
  onSelect: () => void;
  onDoubleClick?: () => void;
  onDragEnd: (e: any) => void;
  onUpdate: (updates: Partial<EntityType>) => void;
  onDelete: () => void;
}

export const Entity = ({
  entity,
  isSelected,
  onSelect,
  onDoubleClick,
  onDragEnd,
  onUpdate,
  onDelete,
}: EntityProps) => {
  const [isEditing, setIsEditing] = useState(entity.isNew || false);
  const [editText, setEditText] = useState(entity.label);
  const textRef = useRef<any>(null);

  // Sync editText with entity.label when it changes externally (e.g., from sidebar)
  useEffect(() => {
    if (!isEditing) {
      setEditText(entity.label);
    }
  }, [entity.label, isEditing]);

  // Focus text input when editing starts
  useEffect(() => {
    if (isEditing && textRef.current) {
      setTimeout(() => {
        textRef.current?.focus();
      }, 0);
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    if (onDoubleClick) {
      onDoubleClick();
    } else {
      setIsEditing(true);
      setEditText(entity.label);
    }
  };

  const handleTextChange = (e: any) => {
    setEditText(e.target.value());
  };

  const handleTextBlur = () => {
    setIsEditing(false);
    onUpdate({ label: editText || 'Entity', isNew: false });
  };

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {
      e.target.blur();
    } else if (e.key === 'Escape') {
      setEditText(entity.label);
      setIsEditing(false);
    }
  };

  // Force Text component to remount when label changes
  const textComponent = useMemo(() => (
    <Text
      key={`entity-label-${entity.id}-${entity.label}`}
      x={10}
      y={entity.height / 2 - 10}
      width={entity.width - 20}
      height={20}
      text={entity.label}
      fontSize={14}
      fontFamily="Arial"
      fill="#1e293b"
      align="center"
      verticalAlign="middle"
      listening={false}
    />
  ), [entity.id, entity.label, entity.height, entity.width]);

  return (
    <Group
      key={`entity-group-${entity.id}-${entity.label}`}
      x={entity.x}
      y={entity.y}
      draggable
      onDragEnd={onDragEnd}
      onClick={onSelect}
      onTap={onSelect}
      onDblClick={onDoubleClick}
      onDblTap={onDoubleClick}
    >
      <Rect
        width={entity.width}
        height={entity.height}
        fill="#ffffff"
        stroke={isSelected ? "#3b82f6" : "#1e293b"}
        strokeWidth={isSelected ? 3 : 1.5}
        cornerRadius={4}
        shadowBlur={isSelected ? 5 : 0}
        shadowColor="#3b82f6"
      />
      {isEditing ? (
        <Text
          ref={textRef}
          x={10}
          y={entity.height / 2 - 10}
          width={entity.width - 20}
          height={20}
          text={editText}
          fontSize={14}
          fontFamily="Arial"
          fill="#1e293b"
          align="center"
          verticalAlign="middle"
          editable
          onTextChange={handleTextChange}
          onBlur={handleTextBlur}
          onKeyDown={handleKeyDown}
        />
      ) : (
        textComponent
      )}
    </Group>
  );
};
