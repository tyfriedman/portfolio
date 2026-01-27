'use client';

import { useState, useEffect } from 'react';
import { Entity, Attribute, Relationship } from '../types/diagram';

interface SidebarProps {
  selectedId: string | null;
  selectedType: 'entity' | 'attribute' | 'relationship' | null;
  diagram: {
    entities: Entity[];
    attributes: Attribute[];
    relationships: Relationship[];
  };
  onUpdate: (updates: any) => void;
  onUpdateCardinality?: (entityId: string, cardinality: '1' | '*' | '0..1' | '1..*') => void;
  onClose: () => void;
}

export const Sidebar = ({
  selectedId,
  selectedType,
  diagram,
  onUpdate,
  onUpdateCardinality,
  onClose,
}: SidebarProps) => {
  if (!selectedId || !selectedType) return null;

  let selectedItem: Entity | Attribute | Relationship | null = null;
  if (selectedType === 'entity') {
    selectedItem = diagram.entities.find((e) => e.id === selectedId) || null;
  } else if (selectedType === 'attribute') {
    selectedItem = diagram.attributes.find((a) => a.id === selectedId) || null;
  } else if (selectedType === 'relationship') {
    selectedItem = diagram.relationships.find((r) => r.id === selectedId) || null;
  }

  if (!selectedItem) return null;

  // Check if label is a default value
  const isDefaultLabel = selectedItem.label === 'Entity' || 
                         selectedItem.label === 'Attribute' || 
                         selectedItem.label === 'Relationship';

  // Local state for the input, synced with the diagram
  // If item is new or has default label, start with empty string, otherwise use the label
  const [labelValue, setLabelValue] = useState(
    (selectedItem.isNew || isDefaultLabel) ? '' : selectedItem.label
  );

  // Update local state when selectedItem changes
  // Reset to empty if it's new or has default label, otherwise use the actual label
  useEffect(() => {
    const currentIsDefault = selectedItem.label === 'Entity' || 
                             selectedItem.label === 'Attribute' || 
                             selectedItem.label === 'Relationship';
    if (selectedItem.isNew || currentIsDefault) {
      setLabelValue('');
    } else {
      setLabelValue(selectedItem.label);
    }
  }, [selectedItem.id, selectedItem.label, selectedItem.isNew]);

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLabelValue(newValue);
    onUpdate({ label: newValue });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent backspace/delete from triggering element deletion
    e.stopPropagation();
    
    // Update on Enter key
    if (e.key === 'Enter') {
      onUpdate({ label: labelValue });
      e.currentTarget.blur();
    }
  };

  const relationship = selectedType === 'relationship' ? (selectedItem as Relationship) : null;

  return (
    <div className="absolute right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-lg z-20 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 capitalize">
          Edit {selectedType}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-xl"
        >
          ×
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Label
          </label>
          <input
            type="text"
            value={labelValue}
            onChange={handleLabelChange}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>
        
        {relationship && relationship.connectedEntities.length > 0 && onUpdateCardinality && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cardinality
            </label>
            {relationship.connectedEntities.map((entityId) => {
              const entity = diagram.entities.find((e) => e.id === entityId);
              if (!entity) return null;
              
              const currentCardinality = relationship.cardinalities?.[entityId] || '1';
              
              return (
                <div key={entityId} className="mb-3">
                  <div className="text-xs text-gray-600 mb-1">{entity.label}</div>
                  <div className="flex gap-2">
                    {(['1', '*', '0..1', '1..*'] as const).map((card) => (
                      <button
                        key={card}
                        onClick={() => onUpdateCardinality(entityId, card)}
                        className={`px-3 py-1 text-sm rounded border ${
                          currentCardinality === card
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {card}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
