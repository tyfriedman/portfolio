'use client';

import { Line, Text, Group } from 'react-konva';
import { Relationship as RelationshipType } from '../types/diagram';
import { useState, useRef, useEffect, useMemo } from 'react';

interface RelationshipProps {
  relationship: RelationshipType;
  isSelected: boolean;
  onSelect: () => void;
  onDoubleClick?: () => void;
  onDragEnd: (e: any) => void;
  onUpdate: (updates: Partial<RelationshipType>) => void;
  onDelete: () => void;
}

const RELATIONSHIP_SIZE = 80;

export const Relationship = ({
  relationship,
  isSelected,
  onSelect,
  onDoubleClick,
  onDragEnd,
  onUpdate,
  onDelete,
}: RelationshipProps) => {
  const [isEditing, setIsEditing] = useState(relationship.isNew || false);
  const [editText, setEditText] = useState(relationship.label);
  const textRef = useRef<any>(null);

  // Sync editText with relationship.label when it changes externally (e.g., from sidebar)
  useEffect(() => {
    if (!isEditing) {
      setEditText(relationship.label);
    }
  }, [relationship.label, isEditing]);

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
      setEditText(relationship.label);
    }
  };

  const handleTextChange = (e: any) => {
    setEditText(e.target.value());
  };

  const handleTextBlur = () => {
    setIsEditing(false);
    onUpdate({ label: editText || 'Relationship', isNew: false });
  };

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {
      e.target.blur();
    } else if (e.key === 'Escape') {
      setEditText(relationship.label);
      setIsEditing(false);
    }
  };

  // Diamond shape: top, right, bottom, left points
  const halfSize = RELATIONSHIP_SIZE / 2;
  const diamondPoints = [
    0, -halfSize,      // top
    halfSize, 0,       // right
    0, halfSize,       // bottom
    -halfSize, 0,      // left
    0, -halfSize,      // close the shape
  ];

  // Force Text component to remount when label changes
  const textComponent = useMemo(() => (
    <Text
      key={`relationship-label-${relationship.id}-${relationship.label}`}
      x={-RELATIONSHIP_SIZE / 2 + 5}
      y={-10}
      width={RELATIONSHIP_SIZE - 10}
      height={20}
      text={relationship.label}
      fontSize={12}
      fontFamily="Arial"
      fill="#1e293b"
      align="center"
      verticalAlign="middle"
    />
  ), [relationship.id, relationship.label]);

  return (
    <Group
      key={`relationship-group-${relationship.id}-${relationship.label}`}
      x={relationship.x}
      y={relationship.y}
      draggable
      onDragEnd={onDragEnd}
      onClick={onSelect}
      onTap={onSelect}
      onDblClick={handleDoubleClick}
      onDblTap={handleDoubleClick}
    >
      <Line
        points={diamondPoints}
        fill="#ffffff"
        closed
        stroke={isSelected ? "#3b82f6" : "#1e293b"}
        strokeWidth={isSelected ? 3 : 1.5}
        shadowBlur={isSelected ? 5 : 0}
        shadowColor="#3b82f6"
      />
      {isEditing ? (
        <Text
          ref={textRef}
          x={-RELATIONSHIP_SIZE / 2 + 5}
          y={-10}
          width={RELATIONSHIP_SIZE - 10}
          height={20}
          text={editText}
          fontSize={12}
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
