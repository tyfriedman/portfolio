'use client';

import { Ellipse, Text, Group } from 'react-konva';
import { useState } from 'react';
import Konva from 'konva';
import { Attribute as AttributeType } from '../types/diagram';
import { CanvasTheme } from '../theme';
import { ATTRIBUTE_WIDTH, ATTRIBUTE_HEIGHT } from '../lib/geometry';

interface AttributeProps {
  attribute: AttributeType;
  theme: CanvasTheme;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
}

export const Attribute = ({
  attribute,
  theme,
  isSelected,
  onSelect,
  onDragEnd,
}: AttributeProps) => {
  const [hovered, setHovered] = useState(false);

  const stroke = isSelected ? theme.accent : hovered ? theme.accentSoft : theme.shapeStroke;
  const dash = attribute.isDerived ? [4, 4] : undefined;
  const fontStyle = attribute.isDerived ? 'italic' : 'normal';

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
      x={attribute.x}
      y={attribute.y}
      draggable
      onDragEnd={onDragEnd}
      onClick={onSelect}
      onTap={onSelect}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Ellipse
        radiusX={ATTRIBUTE_WIDTH / 2}
        radiusY={ATTRIBUTE_HEIGHT / 2}
        fill={theme.shapeFill}
        stroke={stroke}
        strokeWidth={isSelected ? 2.5 : 1.5}
        dash={dash}
        shadowBlur={isSelected ? 12 : hovered ? 8 : 0}
        shadowColor={theme.accent}
        shadowOpacity={0.5}
      />
      {attribute.isMultivalued && (
        <Ellipse
          radiusX={ATTRIBUTE_WIDTH / 2 - 5}
          radiusY={ATTRIBUTE_HEIGHT / 2 - 5}
          fill="transparent"
          stroke={stroke}
          strokeWidth={1.5}
          dash={dash}
          listening={false}
        />
      )}
      <Text
        x={-ATTRIBUTE_WIDTH / 2 + 5}
        y={-ATTRIBUTE_HEIGHT / 2}
        width={ATTRIBUTE_WIDTH - 10}
        height={ATTRIBUTE_HEIGHT}
        text={attribute.label}
        fontSize={12}
        fontStyle={fontStyle}
        fontFamily="system-ui, -apple-system, sans-serif"
        fill={theme.shapeText}
        textDecoration={attribute.isPrimaryKey ? 'underline' : ''}
        align="center"
        verticalAlign="middle"
        listening={false}
      />
    </Group>
  );
};
