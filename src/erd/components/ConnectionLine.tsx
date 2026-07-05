'use client';

import { Line } from 'react-konva';
import { Point } from '../lib/geometry';

interface ConnectionLineProps {
  from: Point;
  to: Point;
  stroke: string;
  highlighted?: boolean;
  highlightColor?: string;
}

export const ConnectionLine = ({ from, to, stroke, highlighted = false, highlightColor }: ConnectionLineProps) => {
  return (
    <Line
      points={[from.x, from.y, to.x, to.y]}
      stroke={highlighted && highlightColor ? highlightColor : stroke}
      strokeWidth={highlighted ? 2.5 : 1.5}
      dash={[5, 5]}
      listening={false}
    />
  );
};
