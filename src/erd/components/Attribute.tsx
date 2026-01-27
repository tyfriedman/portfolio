'use client';

import { Ellipse, Text, Group } from 'react-konva';
import { Attribute as AttributeType } from '../types/diagram';
import { useState, useRef, useEffect, useMemo } from 'react';

interface AttributeProps {
  attribute: AttributeType;
  isSelected: boolean;
  onSelect: () => void;
  onDoubleClick?: () => void;
  onDragEnd: (e: any) => void;
  onUpdate: (updates: Partial<AttributeType>) => void;
  onDelete: () => void;
}

const ATTRIBUTE_WIDTH = 80;
const ATTRIBUTE_HEIGHT = 40;

export const Attribute = ({
  attribute,
  isSelected,
  onSelect,
  onDoubleClick,
  onDragEnd,
  onUpdate,
  onDelete,
}: AttributeProps) => {
  const [isEditing, setIsEditing] = useState(attribute.isNew || false);
  const [editText, setEditText] = useState(attribute.label);
  const textRef = useRef<any>(null);

  // Sync editText with attribute.label when it changes externally (e.g., from sidebar)
  useEffect(() => {
    if (!isEditing) {
      setEditText(attribute.label);
    }
  }, [attribute.label, isEditing]);

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
      setEditText(attribute.label);
    }
  };

  const handleTextChange = (e: any) => {
    setEditText(e.target.value());
  };

  const handleTextBlur = () => {
    setIsEditing(false);
    onUpdate({ label: editText || 'Attribute', isNew: false });
  };

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {
      e.target.blur();
    } else if (e.key === 'Escape') {
      setEditText(attribute.label);
      setIsEditing(false);
    }
  };

  // Force Text component to remount when label changes
  const textComponent = useMemo(() => (
    <Text
      key={`attribute-label-${attribute.id}-${attribute.label}`}
      x={-ATTRIBUTE_WIDTH / 2 + 5}
      y={-10}
      width={ATTRIBUTE_WIDTH - 10}
      height={20}
      text={attribute.label}
      fontSize={12}
      fontFamily="Arial"
      fill="#1e293b"
      align="center"
      verticalAlign="middle"
    />
  ), [attribute.id, attribute.label]);

  return (
    <Group
      key={`attribute-group-${attribute.id}-${attribute.label}`}
      x={attribute.x}
      y={attribute.y}
      draggable
      onDragEnd={onDragEnd}
      onClick={onSelect}
      onTap={onSelect}
      onDblClick={handleDoubleClick}
      onDblTap={handleDoubleClick}
    >
      <Ellipse
        radiusX={ATTRIBUTE_WIDTH / 2}
        radiusY={ATTRIBUTE_HEIGHT / 2}
        fill="#ffffff"
        stroke={isSelected ? "#3b82f6" : "#1e293b"}
        strokeWidth={isSelected ? 3 : 1.5}
        shadowBlur={isSelected ? 5 : 0}
        shadowColor="#3b82f6"
      />
      {isEditing ? (
        <Text
          ref={textRef}
          x={-ATTRIBUTE_WIDTH / 2 + 5}
          y={-10}
          width={ATTRIBUTE_WIDTH - 10}
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
