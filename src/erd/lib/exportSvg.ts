import { Diagram } from '../types/diagram';
import { CanvasTheme } from '../theme';
import {
  ATTRIBUTE_WIDTH,
  ATTRIBUTE_HEIGHT,
  RELATIONSHIP_SIZE,
  getAttributeConnectionPoints,
  getRelationshipConnectionPoints,
  getSelfReferencingConnectionPoints,
  getDiagramBounds,
  Point,
} from './geometry';
import { downloadText, slugify } from './download';

const PADDING = 48;
const FONT = 'system-ui, -apple-system, sans-serif';

const escapeXml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const text = (
  x: number,
  y: number,
  content: string,
  fill: string,
  fontSize: number,
  opts: { underline?: boolean; italic?: boolean } = {}
) => {
  const decoration = opts.underline ? ' text-decoration="underline"' : '';
  const style = opts.italic ? ' font-style="italic"' : '';
  return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-family="${FONT}" font-size="${fontSize}"${decoration}${style} fill="${fill}">${escapeXml(content)}</text>`;
};

const line = (from: Point, to: Point, stroke: string, dashed = true) =>
  `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="${stroke}" stroke-width="1.5"${dashed ? ' stroke-dasharray="5 5"' : ''} />`;

const cardinalityLabel = (diamondCorner: Point, entityPoint: Point, value: string, fill: string) => {
  const dx = entityPoint.x - diamondCorner.x;
  const dy = entityPoint.y - diamondCorner.y;
  const distance = Math.hypot(dx, dy) || 1;
  const offset = 15;
  const labelX = entityPoint.x - (dx / distance) * offset;
  const labelY = entityPoint.y - (dy / distance) * offset;
  return text(labelX, labelY, value, fill, 14);
};

/** Build a standalone SVG document from the diagram model. */
export const buildSvg = (diagram: Diagram, theme: CanvasTheme): string | null => {
  const bounds = getDiagramBounds(diagram);
  if (!bounds) return null;

  const width = bounds.width + PADDING * 2;
  const height = bounds.height + PADDING * 2;
  const offsetX = -bounds.x + PADDING;
  const offsetY = -bounds.y + PADDING;

  const parts: string[] = [];

  // Connection lines behind shapes
  for (const attribute of diagram.attributes) {
    const entity = diagram.entities.find((e) => e.id === attribute.entityId);
    if (!entity) continue;
    const { from, to } = getAttributeConnectionPoints(attribute, entity);
    parts.push(line(from, to, theme.connection));
  }

  for (const relationship of diagram.relationships) {
    const processed = new Set<string>();
    for (const entityId of relationship.connectedEntities) {
      const entity = diagram.entities.find((e) => e.id === entityId);
      if (!entity || processed.has(entityId)) continue;
      processed.add(entityId);

      const count = relationship.connectedEntities.filter((id) => id === entityId).length;
      if (count === 2) {
        const connectionPoints = getSelfReferencingConnectionPoints(relationship, entity);
        connectionPoints.forEach(({ diamondCorner, entityPoint }, i) => {
          const cardinality =
            relationship.cardinalities?.[`${entityId}_self_${i}`] ||
            relationship.cardinalities?.[entityId] ||
            '1';
          parts.push(line(entityPoint, diamondCorner, theme.connection));
          parts.push(cardinalityLabel(diamondCorner, entityPoint, cardinality, theme.cardinalityText));
        });
      } else {
        const { diamondCorner, entityPoint } = getRelationshipConnectionPoints(relationship, entity);
        const cardinality = relationship.cardinalities?.[entityId] || '1';
        parts.push(line(entityPoint, diamondCorner, theme.connection));
        parts.push(cardinalityLabel(diamondCorner, entityPoint, cardinality, theme.cardinalityText));
      }
    }
  }

  // Entities
  for (const entity of diagram.entities) {
    parts.push(
      `<rect x="${entity.x}" y="${entity.y}" width="${entity.width}" height="${entity.height}" rx="4" fill="${theme.shapeFill}" stroke="${theme.shapeStroke}" stroke-width="1.5" />`
    );
    if (entity.isWeak) {
      parts.push(
        `<rect x="${entity.x + 5}" y="${entity.y + 5}" width="${entity.width - 10}" height="${entity.height - 10}" rx="3" fill="none" stroke="${theme.shapeStroke}" stroke-width="1.5" />`
      );
    }
    parts.push(
      text(entity.x + entity.width / 2, entity.y + entity.height / 2, entity.label, theme.shapeText, 14)
    );
  }

  // Attributes
  for (const attribute of diagram.attributes) {
    const rx = ATTRIBUTE_WIDTH / 2;
    const ry = ATTRIBUTE_HEIGHT / 2;
    const dash = attribute.isDerived ? ' stroke-dasharray="4 4"' : '';
    parts.push(
      `<ellipse cx="${attribute.x}" cy="${attribute.y}" rx="${rx}" ry="${ry}" fill="${theme.shapeFill}" stroke="${theme.shapeStroke}" stroke-width="1.5"${dash} />`
    );
    if (attribute.isMultivalued) {
      parts.push(
        `<ellipse cx="${attribute.x}" cy="${attribute.y}" rx="${rx - 5}" ry="${ry - 5}" fill="none" stroke="${theme.shapeStroke}" stroke-width="1.5"${dash} />`
      );
    }
    parts.push(
      text(attribute.x, attribute.y, attribute.label, theme.shapeText, 12, {
        underline: attribute.isPrimaryKey,
        italic: attribute.isDerived,
      })
    );
  }

  // Relationships
  for (const relationship of diagram.relationships) {
    const half = RELATIONSHIP_SIZE / 2;
    const points = [
      `${relationship.x},${relationship.y - half}`,
      `${relationship.x + half},${relationship.y}`,
      `${relationship.x},${relationship.y + half}`,
      `${relationship.x - half},${relationship.y}`,
    ].join(' ');
    parts.push(
      `<polygon points="${points}" fill="${theme.shapeFill}" stroke="${theme.shapeStroke}" stroke-width="1.5" />`
    );
    parts.push(text(relationship.x, relationship.y, relationship.label, theme.shapeText, 12));
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<rect width="${width}" height="${height}" fill="${theme.canvasBg}" />`,
    `<g transform="translate(${offsetX}, ${offsetY})">`,
    ...parts,
    '</g>',
    '</svg>',
  ].join('\n');
};

/** Export the diagram as a downloadable SVG file. Returns false when empty. */
export const exportSvg = (diagram: Diagram, theme: CanvasTheme): boolean => {
  const svg = buildSvg(diagram, theme);
  if (!svg) return false;
  downloadText(svg, `${slugify(diagram.name || 'erd-diagram')}.svg`, 'image/svg+xml');
  return true;
};
