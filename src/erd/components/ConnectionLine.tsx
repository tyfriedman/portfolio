'use client';

import { Line } from 'react-konva';
import { Entity, Attribute, Relationship } from '../types/diagram';

interface ConnectionLineProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
}

export const ConnectionLine = ({ from, to }: ConnectionLineProps) => {
  return (
    <Line
      points={[from.x, from.y, to.x, to.y]}
      stroke="#94a3b8"
      strokeWidth={1.5}
      dash={[5, 5]}
      listening={false}
    />
  );
};

// Helper function to find intersection of line with rectangle edge
// If findClosestToEnd is true, returns intersection closest to (x2, y2), otherwise closest to (x1, y1)
function lineRectIntersection(
  x1: number, y1: number, // line start (center of one shape)
  x2: number, y2: number, // line end (center of other shape)
  rectLeft: number, rectTop: number, rectRight: number, rectBottom: number,
  findClosestToEnd: boolean = false
): { x: number; y: number } | null {
  // Direction vector
  const dx = x2 - x1;
  const dy = y2 - y1;
  
  // If line is vertical
  if (Math.abs(dx) < 0.001) {
    if (x1 >= rectLeft && x1 <= rectRight) {
      if (y1 < y2) {
        // Going down - exit at bottom edge
        return { x: x1, y: rectBottom };
      } else {
        // Going up - exit at top edge
        return { x: x1, y: rectTop };
      }
    }
    return null;
  }
  
  // If line is horizontal
  if (Math.abs(dy) < 0.001) {
    if (y1 >= rectTop && y1 <= rectBottom) {
      if (x1 < x2) {
        // Going right - exit at right edge
        return { x: rectRight, y: y1 };
      } else {
        // Going left - exit at left edge
        return { x: rectLeft, y: y1 };
      }
    }
    return null;
  }
  
  // Calculate intersections with each edge
  const intersections: { x: number; y: number; t: number }[] = [];
  
  // Left edge
  const tLeft = (rectLeft - x1) / dx;
  if (tLeft > 0 && tLeft <= 1) {
    const y = y1 + tLeft * dy;
    if (y >= rectTop && y <= rectBottom) {
      intersections.push({ x: rectLeft, y, t: tLeft });
    }
  }
  
  // Right edge
  const tRight = (rectRight - x1) / dx;
  if (tRight > 0 && tRight <= 1) {
    const y = y1 + tRight * dy;
    if (y >= rectTop && y <= rectBottom) {
      intersections.push({ x: rectRight, y, t: tRight });
    }
  }
  
  // Top edge
  const tTop = (rectTop - y1) / dy;
  if (tTop > 0 && tTop <= 1) {
    const x = x1 + tTop * dx;
    if (x >= rectLeft && x <= rectRight) {
      intersections.push({ x, y: rectTop, t: tTop });
    }
  }
  
  // Bottom edge
  const tBottom = (rectBottom - y1) / dy;
  if (tBottom > 0 && tBottom <= 1) {
    const x = x1 + tBottom * dx;
    if (x >= rectLeft && x <= rectRight) {
      intersections.push({ x, y: rectBottom, t: tBottom });
    }
  }
  
  // Return the intersection closest to start or end point
  if (intersections.length === 0) return null;
  if (findClosestToEnd) {
    // Sort by distance from end (largest t, since t=1 is at end)
    intersections.sort((a, b) => b.t - a.t);
  } else {
    // Sort by distance from start (smallest t)
    intersections.sort((a, b) => a.t - b.t);
  }
  return { x: intersections[0].x, y: intersections[0].y };
}

// Calculate connection points from attribute to entity (midpoint to midpoint, stopping at edges)
export const getAttributeConnectionPoints = (
  attribute: Attribute,
  entity: Entity
): { from: { x: number; y: number }; to: { x: number; y: number } } => {
  const ATTRIBUTE_WIDTH = 80;
  const ATTRIBUTE_HEIGHT = 40;
  
  // Attribute center (midpoint)
  const attrCenterX = attribute.x;
  const attrCenterY = attribute.y;
  
  // Attribute edges
  const attrLeft = attrCenterX - ATTRIBUTE_WIDTH / 2;
  const attrRight = attrCenterX + ATTRIBUTE_WIDTH / 2;
  const attrTop = attrCenterY - ATTRIBUTE_HEIGHT / 2;
  const attrBottom = attrCenterY + ATTRIBUTE_HEIGHT / 2;
  
  // Entity center (midpoint)
  const entityCenterX = entity.x + entity.width / 2;
  const entityCenterY = entity.y + entity.height / 2;
  
  // Entity edges
  const entityLeft = entity.x;
  const entityRight = entity.x + entity.width;
  const entityTop = entity.y;
  const entityBottom = entity.y + entity.height;
  
  // Find where the line from attribute center to entity center intersects attribute edge
  // (closest to attribute center - the exit point)
  const attrIntersection = lineRectIntersection(
    attrCenterX, attrCenterY,
    entityCenterX, entityCenterY,
    attrLeft, attrTop, attrRight, attrBottom,
    false // closest to start (attribute center)
  );
  
  // Find where the line from attribute center to entity center intersects entity edge
  // (closest to entity center - the entry point)
  const entityIntersection = lineRectIntersection(
    attrCenterX, attrCenterY,
    entityCenterX, entityCenterY,
    entityLeft, entityTop, entityRight, entityBottom,
    true // closest to end (entity center)
  );
  
  // Fallback to nearest edge if intersection calculation fails
  const from = attrIntersection || { x: attrCenterX, y: attrCenterY };
  const to = entityIntersection || { x: entityCenterX, y: entityCenterY };
  
  return { from, to };
};

// Calculate connection point from relationship diamond to entity
// Returns both the diamond corner and the entity connection point
export const getRelationshipConnectionPoints = (
  relationship: Relationship,
  entity: Entity
): { diamondCorner: { x: number; y: number }; entityPoint: { x: number; y: number } } => {
  const relCenterX = relationship.x;
  const relCenterY = relationship.y;
  const size = 80; // relationship size
  const halfSize = size / 2;
  
  // Get diamond corner positions (proper diamond shape: top, right, bottom, left)
  const corners = [
    { x: relCenterX, y: relCenterY - halfSize }, // top
    { x: relCenterX + halfSize, y: relCenterY }, // right
    { x: relCenterX, y: relCenterY + halfSize }, // bottom
    { x: relCenterX - halfSize, y: relCenterY }, // left
  ];
  
  // Calculate entity center
  const entityCenterX = entity.x + entity.width / 2;
  const entityCenterY = entity.y + entity.height / 2;
  
  // Find the closest diamond corner to the entity center
  let closestCorner = corners[0];
  let minDist = Infinity;
  for (const corner of corners) {
    const dist = Math.sqrt(
      Math.pow(corner.x - entityCenterX, 2) + Math.pow(corner.y - entityCenterY, 2)
    );
    if (dist < minDist) {
      minDist = dist;
      closestCorner = corner;
    }
  }
  
  // Now find where the line from diamond corner to entity center intersects entity edge
  const entityLeft = entity.x;
  const entityRight = entity.x + entity.width;
  const entityTop = entity.y;
  const entityBottom = entity.y + entity.height;
  
  // Find intersection of line from diamond corner to entity center with entity edge
  const entityIntersection = lineRectIntersection(
    closestCorner.x, closestCorner.y,
    entityCenterX, entityCenterY,
    entityLeft, entityTop, entityRight, entityBottom
  );
  
  // Fallback to nearest edge if intersection calculation fails
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
    } else {
      return { x: Math.max(entityLeft, Math.min(entityRight, closestCorner.x)), y: entityBottom };
    }
  })();
  
  return { diamondCorner: closestCorner, entityPoint };
};

// Calculate connection points for self-referencing relationships
// Returns two connection points from the two corners adjacent to the closest corner
export const getSelfReferencingConnectionPoints = (
  relationship: Relationship,
  entity: Entity
): Array<{ diamondCorner: { x: number; y: number }; entityPoint: { x: number; y: number } }> => {
  const relCenterX = relationship.x;
  const relCenterY = relationship.y;
  const size = 80; // relationship size
  const halfSize = size / 2;
  
  // Get diamond corner positions (proper diamond shape: top, right, bottom, left)
  const corners = [
    { x: relCenterX, y: relCenterY - halfSize, index: 0 }, // top
    { x: relCenterX + halfSize, y: relCenterY, index: 1 }, // right
    { x: relCenterX, y: relCenterY + halfSize, index: 2 }, // bottom
    { x: relCenterX - halfSize, y: relCenterY, index: 3 }, // left
  ];
  
  // Calculate entity center
  const entityCenterX = entity.x + entity.width / 2;
  const entityCenterY = entity.y + entity.height / 2;
  
  // Find the closest diamond corner to the entity center
  let closestCornerIndex = 0;
  let minDist = Infinity;
  for (let i = 0; i < corners.length; i++) {
    const corner = corners[i];
    const dist = Math.sqrt(
      Math.pow(corner.x - entityCenterX, 2) + Math.pow(corner.y - entityCenterY, 2)
    );
    if (dist < minDist) {
      minDist = dist;
      closestCornerIndex = i;
    }
  }
  
  // Get the two adjacent corners
  // Adjacency: Top(0): Left(3) and Right(1), Right(1): Top(0) and Bottom(2),
  //            Bottom(2): Right(1) and Left(3), Left(3): Bottom(2) and Top(0)
  let adjacentIndices: number[];
  switch (closestCornerIndex) {
    case 0: // Top
      adjacentIndices = [3, 1]; // Left and Right
      break;
    case 1: // Right
      adjacentIndices = [0, 2]; // Top and Bottom
      break;
    case 2: // Bottom
      adjacentIndices = [1, 3]; // Right and Left
      break;
    case 3: // Left
      adjacentIndices = [2, 0]; // Bottom and Top
      break;
    default:
      adjacentIndices = [0, 1];
  }
  
  const adjacentCorners = [
    corners[adjacentIndices[0]],
    corners[adjacentIndices[1]]
  ];
  
  // Calculate entity edges
  const entityLeft = entity.x;
  const entityRight = entity.x + entity.width;
  const entityTop = entity.y;
  const entityBottom = entity.y + entity.height;
  
  // For each adjacent corner, calculate connection point to entity
  // We'll connect to different edges of the entity for better visual separation
  const connectionPoints = adjacentCorners.map((corner, idx) => {
    // For the first connection, try to connect to one side
    // For the second connection, try to connect to an adjacent side
    // This creates visual separation for self-referencing relationships
    
    // Calculate which edge of the entity is closest to this corner
    const distToLeft = Math.abs(corner.x - entityLeft);
    const distToRight = Math.abs(corner.x - entityRight);
    const distToTop = Math.abs(corner.y - entityTop);
    const distToBottom = Math.abs(corner.y - entityBottom);
    
    // For self-references, prefer connecting to different edges
    // First connection: prefer left or top
    // Second connection: prefer right or bottom
    let targetEdge: 'left' | 'right' | 'top' | 'bottom';
    if (idx === 0) {
      // First connection - prefer left or top
      if (distToLeft < distToTop) {
        targetEdge = 'left';
      } else {
        targetEdge = 'top';
      }
    } else {
      // Second connection - prefer right or bottom
      if (distToRight < distToBottom) {
        targetEdge = 'right';
      } else {
        targetEdge = 'bottom';
      }
    }
    
    // Calculate intersection point on the target edge
    let entityPoint: { x: number; y: number };
    switch (targetEdge) {
      case 'left':
        entityPoint = lineRectIntersection(
          corner.x, corner.y,
          entityCenterX, entityCenterY,
          entityLeft, entityTop, entityRight, entityBottom
        ) || { x: entityLeft, y: Math.max(entityTop, Math.min(entityBottom, corner.y)) };
        break;
      case 'right':
        entityPoint = lineRectIntersection(
          corner.x, corner.y,
          entityCenterX, entityCenterY,
          entityLeft, entityTop, entityRight, entityBottom
        ) || { x: entityRight, y: Math.max(entityTop, Math.min(entityBottom, corner.y)) };
        break;
      case 'top':
        entityPoint = lineRectIntersection(
          corner.x, corner.y,
          entityCenterX, entityCenterY,
          entityLeft, entityTop, entityRight, entityBottom
        ) || { x: Math.max(entityLeft, Math.min(entityRight, corner.x)), y: entityTop };
        break;
      case 'bottom':
        entityPoint = lineRectIntersection(
          corner.x, corner.y,
          entityCenterX, entityCenterY,
          entityLeft, entityTop, entityRight, entityBottom
        ) || { x: Math.max(entityLeft, Math.min(entityRight, corner.x)), y: entityBottom };
        break;
    }
    
    return {
      diamondCorner: { x: corner.x, y: corner.y },
      entityPoint
    };
  });
  
  return connectionPoints;
};
