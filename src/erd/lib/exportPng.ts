import type Konva from 'konva';
import { Diagram } from '../types/diagram';
import { getDiagramBounds } from './geometry';
import { downloadDataUrl, slugify } from './download';

const PADDING = 48;

/**
 * Export the Konva stage as a 2x PNG cropped to the diagram's content bounds.
 * Temporarily resets the stage transform so the crop maps to model coordinates.
 * Returns false when the diagram is empty.
 */
export const exportPng = (
  stage: Konva.Stage,
  diagram: Diagram,
  backgroundColor: string
): boolean => {
  const bounds = getDiagramBounds(diagram);
  if (!bounds) return false;

  const prevScale = { x: stage.scaleX(), y: stage.scaleY() };
  const prevPos = { x: stage.x(), y: stage.y() };
  const prevSize = { width: stage.width(), height: stage.height() };
  const gridLayer = stage.findOne('.grid-layer');

  const exportWidth = bounds.width + PADDING * 2;
  const exportHeight = bounds.height + PADDING * 2;

  try {
    gridLayer?.hide();
    stage.scale({ x: 1, y: 1 });
    stage.position({ x: -bounds.x + PADDING, y: -bounds.y + PADDING });
    stage.size({ width: exportWidth, height: exportHeight });
    stage.draw();

    // Konva can't fill the stage background, so composite onto a canvas
    const stageCanvas = stage.toCanvas({ pixelRatio: 2 });
    const output = document.createElement('canvas');
    output.width = stageCanvas.width;
    output.height = stageCanvas.height;
    const ctx = output.getContext('2d');
    if (!ctx) return false;
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, output.width, output.height);
    ctx.drawImage(stageCanvas, 0, 0);

    downloadDataUrl(output.toDataURL('image/png'), `${slugify(diagram.name || 'erd-diagram')}.png`);
    return true;
  } finally {
    gridLayer?.show();
    stage.scale(prevScale);
    stage.position(prevPos);
    stage.size(prevSize);
    stage.draw();
  }
};
