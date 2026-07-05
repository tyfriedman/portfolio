'use client';

import { Line, Text, Group } from 'react-konva';
import { useState } from 'react';
import Konva from 'konva';
import { Relationship as RelationshipType } from '../types/diagram';
import { CanvasTheme } from '../theme';
import { RELATIONSHIP_SIZE } from '../lib/geometry';

interface RelationshipProps {
  relationship: RelationshipType;
  theme: CanvasTheme;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
}

const halfSize = RELATIONSHIP_SIZE / 2;
const diamondPoints = [0, -halfSize, halfSize, 0, 0, halfSize, -halfSize, 0, 0, -halfSize];

export const Relationship = ({
  relationship,
  theme,
  isSelected,
  onSelect,
  onDragEnd,
}: RelationshipProps) => {
  const [hovered, setHovered] = useState(false);

  const stroke = isSelected ? theme.accent : hovered ? theme.accentSoft : theme.shapeStroke;

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
      x={relationship.x}
      y={relationship.y}
      draggable
      onDragEnd={onDragEnd}
      onClick={onSelect}
      onTap={onSelect}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Line
        points={diamondPoints}
        fill={theme.shapeFill}
        closed
        stroke={stroke}
        strokeWidth={isSelected ? 2.5 : 1.5}
        shadowBlur={isSelected ? 12 : hovered ? 8 : 0}
        shadowColor={theme.accent}
        shadowOpacity={0.5}
      />
      <Text
        x={-RELATIONSHIP_SIZE / 2 + 5}
        y={-RELATIONSHIP_SIZE / 2}
        width={RELATIONSHIP_SIZE - 10}
        height={RELATIONSHIP_SIZE}
        text={relationship.label}
        fontSize={12}
        fontFamily="system-ui, -apple-system, sans-serif"
        fill={theme.shapeText}
        align="center"
        verticalAlign="middle"
        listening={false}
      />
    </Group>
  );
};
