import { Entity, Attribute, Relationship, Diagram } from '../types/diagram';

export const ATTRIBUTE_WIDTH = 80;
export const ATTRIBUTE_HEIGHT = 40;
export const RELATIONSHIP_SIZE = 80;
export const ENTITY_WIDTH = 120;
export const ENTITY_HEIGHT = 60;

export interface Point {
  x: number;
  y: number;
}

// Find intersection of line with rectangle edge.
// If findClosestToEnd is true, returns intersection closest to (x2, y2), otherwise closest to (x1, y1).
export function lineRectIntersection(
  x1: number, y1: number,
  x2: number, y2: number,
  rectLeft: number, rectTop: number, rectRight: number, rectBottom: number,
  findClosestToEnd: boolean = false
): Point | null {
  const dx = x2 - x1;
  const dy = y2 - y1;

  if (Math.abs(dx) < 0.001) {
    if (x1 >= rectLeft && x1 <= rectRight) {
      return y1 < y2 ? { x: x1, y: rectBottom } : { x: x1, y: rectTop };
    }
    return null;
  }

  if (Math.abs(dy) < 0.001) {
    if (y1 >= rectTop && y1 <= rectBottom) {
      return x1 < x2 ? { x: rectRight, y: y1 } : { x: rectLeft, y: y1 };
    }
    return null;
  }

  const intersections: { x: number; y: number; t: number }[] = [];

  const tLeft = (rectLeft - x1) / dx;
  if (tLeft > 0 && tLeft <= 1) {
    const y = y1 + tLeft * dy;
    if (y >= rectTop && y <= rectBottom) {
      intersections.push({ x: rectLeft, y, t: tLeft });
    }
  }

  const tRight = (rectRight - x1) / dx;
  if (tRight > 0 && tRight <= 1) {
    const y = y1 + tRight * dy;
    if (y >= rectTop && y <= rectBottom) {
      intersections.push({ x: rectRight, y, t: tRight });
    }
  }

  const tTop = (rectTop - y1) / dy;
  if (tTop > 0 && tTop <= 1) {
    const x = x1 + tTop * dx;
    if (x >= rectLeft && x <= rectRight) {
      intersections.push({ x, y: rectTop, t: tTop });
    }
  }

  const tBottom = (rectBottom - y1) / dy;
  if (tBottom > 0 && tBottom <= 1) {
    const x = x1 + tBottom * dx;
    if (x >= rectLeft && x <= rectRight) {
      intersections.push({ x, y: rectBottom, t: tBottom });
    }
  }

  if (intersections.length === 0) return null;
  intersections.sort((a, b) => (findClosestToEnd ? b.t - a.t : a.t - b.t));
  return { x: intersections[0].x, y: intersections[0].y };
}

// Connection points from attribute edge to entity edge (along the center-to-center line).
export const getAttributeConnectionPoints = (
  attribute: Attribute,
  entity: Entity
): { from: Point; to: Point } => {
  const attrCenterX = attribute.x;
  const attrCenterY = attribute.y;

  const attrLeft = attrCenterX - ATTRIBUTE_WIDTH / 2;
  const attrRight = attrCenterX + ATTRIBUTE_WIDTH / 2;
  const attrTop = attrCenterY - ATTRIBUTE_HEIGHT / 2;
  const attrBottom = attrCenterY + ATTRIBUTE_HEIGHT / 2;

  const entityCenterX = entity.x + entity.width / 2;
  const entityCenterY = entity.y + entity.height / 2;

  const attrIntersection = lineRectIntersection(
    attrCenterX, attrCenterY,
    entityCenterX, entityCenterY,
    attrLeft, attrTop, attrRight, attrBottom,
    false
  );

  const entityIntersection = lineRectIntersection(
    attrCenterX, attrCenterY,
    entityCenterX, entityCenterY,
    entity.x, entity.y, entity.x + entity.width, entity.y + entity.height,
    true
  );

  return {
    from: attrIntersection || { x: attrCenterX, y: attrCenterY },
    to: entityIntersection || { x: entityCenterX, y: entityCenterY },
  };
};

const getDiamondCorners = (relationship: Relationship): Point[] => {
  const halfSize = RELATIONSHIP_SIZE / 2;
  return [
    { x: relationship.x, y: relationship.y - halfSize }, // top
    { x: relationship.x + halfSize, y: relationship.y }, // right
    { x: relationship.x, y: relationship.y + halfSize }, // bottom
    { x: relationship.x - halfSize, y: relationship.y }, // left
  ];
};

// Connection point from relationship diamond corner to entity edge.
export const getRelationshipConnectionPoints = (
  relationship: Relationship,
  entity: Entity
): { diamondCorner: Point; entityPoint: Point } => {
  const corners = getDiamondCorners(relationship);
  const entityCenterX = entity.x + entity.width / 2;
  const entityCenterY = entity.y + entity.height / 2;

  let closestCorner = corners[0];
  let minDist = Infinity;
  for (const corner of corners) {
    const dist = Math.hypot(corner.x - entityCenterX, corner.y - entityCenterY);
    if (dist < minDist) {
      minDist = dist;
      closestCorner = corner;
    }
  }

  const entityLeft = entity.x;
  const entityRight = entity.x + entity.width;
  const entityTop = entity.y;
  const entityBottom = entity.y + entity.height;

  const entityIntersection = lineRectIntersection(
    closestCorner.x, closestCorner.y,
    entityCenterX, entityCenterY,
    entityLeft, entityTop, entityRight, entityBottom
  );

  const entityPoint = entityIntersection || (() => {
    const distToLeft = Math.abs(closestCorner.x - entityLeft);
    const distToRight = Math.abs(closestCorner.x - entityRight);
    const distToTop = Math.abs(closestCorner.y - entityTop);
    const distToBottom = Math.abs(closestCorner.y - entityBottom);
    const minEdgeDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);

    if (minEdgeDist === distToLeft) {
      return { x: entityLeft, y: Math.max(entityTop, Math.min(entityBottom, closestCorner.y)) };
    } else if (minEdgeDist === distToRight) {
      return { x: entityRight, y: Math.max(entityTop, Math.min(entityBottom, closestCorner.y)) };
    } else if (minEdgeDist === distToTop) {
      return { x: Math.max(entityLeft, Math.min(entityRight, closestCorner.x)), y: entityTop };
    }
    return { x: Math.max(entityLeft, Math.min(entityRight, closestCorner.x)), y: entityBottom };
  })();

  return { diamondCorner: closestCorner, entityPoint };
};

// Two connection points (adjacent diamond corners) for self-referencing relationships.
export const getSelfReferencingConnectionPoints = (
  relationship: Relationship,
  entity: Entity
): Array<{ diamondCorner: Point; entityPoint: Point }> => {
  const corners = getDiamondCorners(relationship);
  const entityCenterX = entity.x + entity.width / 2;
  const entityCenterY = entity.y + entity.height / 2;

  let closestCornerIndex = 0;
  let minDist = Infinity;
  for (let i = 0; i < corners.length; i++) {
    const dist = Math.hypot(corners[i].x - entityCenterX, corners[i].y - entityCenterY);
    if (dist < minDist) {
      minDist = dist;
      closestCornerIndex = i;
    }
  }

  // Adjacency around the diamond: each corner pairs with its two neighbors
  const adjacency: Record<number, number[]> = {
    0: [3, 1],
    1: [0, 2],
    2: [1, 3],
    3: [2, 0],
  };
  const adjacentCorners = adjacency[closestCornerIndex].map((i) => corners[i]);

  const entityLeft = entity.x;
  const entityRight = entity.x + entity.width;
  const entityTop = entity.y;
  const entityBottom = entity.y + entity.height;

  return adjacentCorners.map((corner) => {
    const entityPoint = lineRectIntersection(
      corner.x, corner.y,
      entityCenterX, entityCenterY,
      entityLeft, entityTop, entityRight, entityBottom
    ) || {
      x: Math.max(entityLeft, Math.min(entityRight, corner.x)),
      y: Math.max(entityTop, Math.min(entityBottom, corner.y)),
    };
    return { diamondCorner: { x: corner.x, y: corner.y }, entityPoint };
  });
};

// Bounding box of all diagram content, or null when the diagram is empty.
export const getDiagramBounds = (
  diagram: Diagram
): { x: number; y: number; width: number; height: number } | null => {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const entity of diagram.entities) {
    minX = Math.min(minX, entity.x);
    minY = Math.min(minY, entity.y);
    maxX = Math.max(maxX, entity.x + entity.width);
    maxY = Math.max(maxY, entity.y + entity.height);
  }
  for (const attribute of diagram.attributes) {
    minX = Math.min(minX, attribute.x - ATTRIBUTE_WIDTH / 2);
    minY = Math.min(minY, attribute.y - ATTRIBUTE_HEIGHT / 2);
    maxX = Math.max(maxX, attribute.x + ATTRIBUTE_WIDTH / 2);
    maxY = Math.max(maxY, attribute.y + ATTRIBUTE_HEIGHT / 2);
  }
  for (const relationship of diagram.relationships) {
    const half = RELATIONSHIP_SIZE / 2;
    minX = Math.min(minX, relationship.x - half);
    minY = Math.min(minY, relationship.y - half);
    maxX = Math.max(maxX, relationship.x + half);
    maxY = Math.max(maxY, relationship.y + half);
  }

  if (minX === Infinity) return null;
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
};
