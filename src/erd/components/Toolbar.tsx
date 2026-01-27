'use client';

import { useRef } from 'react';

interface ToolbarProps {
  onAddEntity: () => void;
  onAddAttribute: () => void;
  onAddRelationship: () => void;
  onSave: () => void;
  onLoad: (diagram: any) => void;
  onClear: () => void;
}

export const Toolbar = ({
  onAddEntity,
  onAddAttribute,
  onAddRelationship,
  onSave,
  onLoad,
  onClear,
}: ToolbarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLoadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const diagram = JSON.parse(event.target?.result as string);
          onLoad(diagram);
        } catch (error) {
          alert('Failed to load diagram file');
        }
      };
      reader.readAsText(file);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm">
      <button
        onClick={onAddEntity}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
      >
        Add Entity
      </button>
      <button
        onClick={onAddAttribute}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
      >
        Add Attribute
      </button>
      <button
        onClick={onAddRelationship}
        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm font-medium"
      >
        Add Relationship
      </button>
      <div className="flex-1" />
      <button
        onClick={onSave}
        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
      >
        Save
      </button>
      <button
        onClick={handleLoadClick}
        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
      >
        Load
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={onClear}
        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
      >
        Clear
      </button>
    </div>
  );
};
