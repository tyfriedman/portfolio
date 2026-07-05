'use client';

import { Rect, Text, Group } from 'react-konva';
import { useState } from 'react';
import Konva from 'konva';
import { Entity as EntityType } from '../types/diagram';
import { CanvasTheme } from '../theme';

interface EntityProps {
  entity: EntityType;
  theme: CanvasTheme;
  isSelected: boolean;
  /** Highlighted as the target for a pending connect/attach action */
  isConnectTarget?: boolean;
  onSelect: () => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
}

export const Entity = ({
  entity,
  theme,
  isSelected,
  isConnectTarget = false,
  onSelect,
  onDragEnd,
}: EntityProps) => {
  const [hovered, setHovered] = useState(false);

  const highlighted = isSelected || isConnectTarget;
  const stroke = isSelected
    ? theme.accent
    : isConnectTarget || hovered
      ? theme.accentSoft
      : theme.shapeStroke;

  const handleMouseEnter = (e: Konva.KonvaEventObject<MouseEvent>) => {
    setHovered(true);
    const container = e.target.getStage()?.container();
    if (container) container.style.cursor = 'pointer';
  };

  const handleMouseLeave = (e: Konva.KonvaEventObject<MouseEvent>) => {
    setHovered(false);
    const container = e.target.getStage()?.container();
    if (container) container.style.cursor = '';
  };

  return (
    <Group
      x={entity.x}
      y={entity.y}
      draggable
      onDragEnd={onDragEnd}
      onClick={onSelect}
      onTap={onSelect}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Rect
        width={entity.width}
        height={entity.height}
        fill={theme.shapeFill}
        stroke={stroke}
        strokeWidth={highlighted ? 2.5 : 1.5}
        cornerRadius={6}
        shadowBlur={highlighted ? 12 : hovered ? 8 : 0}
        shadowColor={theme.accent}
        shadowOpacity={0.5}
      />
      {entity.isWeak && (
        <Rect
          x={5}
          y={5}
          width={entity.width - 10}
          height={entity.height - 10}
          fill="transparent"
          stroke={stroke}
          strokeWidth={1.5}
          cornerRadius={4}
          listening={false}
        />
      )}
      <Text
        x={8}
        y={0}
        width={entity.width - 16}
        height={entity.height}
        text={entity.label}
        fontSize={14}
        fontStyle="600"
        fontFamily="system-ui, -apple-system, sans-serif"
        fill={theme.shapeText}
        align="center"
        verticalAlign="middle"
        listening={false}
      />
    </Group>
  );
};
