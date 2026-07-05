'use client';

import React, { useState, useEffect } from 'react';
import {
  Diagram,
  Entity,
  Attribute,
  Relationship,
  Cardinality,
  ElementType,
  DATA_TYPES,
  DataType,
} from '../types/diagram';

const CARDINALITIES: Cardinality[] = ['1', '*', '0..1', '1..*'];

interface SidebarProps {
  selectedId: string | null;
  selectedType: ElementType | null;
  diagram: Diagram;
  onUpdate: (updates: Partial<Entity & Attribute & Relationship>) => void;
  onUpdateCardinality: (entityId: string, cardinality: Cardinality, connectionIndex?: number) => void;
  onDisconnect: (entityId: string) => void;
  onDelete: () => void;
  onClose: () => void;
}

const sectionLabelClass =
  'mb-1.5 block text-[10px] font-semibold tracking-wider text-[var(--text-muted)] uppercase';

const Toggle = ({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <button
    onClick={() => onChange(!checked)}
    className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 transition-colors hover:bg-[var(--hover)]"
  >
    <span className="text-sm text-[var(--text)]">
      {label}
      {hint && <span className="ml-1.5 text-xs text-[var(--text-muted)]">{hint}</span>}
    </span>
    <span
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
        checked ? 'bg-[var(--accent)]' : 'bg-[var(--hover)] ring-1 ring-[var(--border)]'
      }`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-[18px]' : 'translate-x-0.5'
        }`}
      />
    </span>
  </button>
);

const CardinalityPicker = ({
  value,
  onChange,
}: {
  value: Cardinality;
  onChange: (c: Cardinality) => void;
}) => (
  <div className="flex gap-1">
    {CARDINALITIES.map((card) => (
      <button
        key={card}
        onClick={() => onChange(card)}
        className={`flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
          value === card
            ? 'bg-[var(--accent)] text-white'
            : 'bg-[var(--hover)] text-[var(--text-muted)] hover:text-[var(--text)]'
        }`}
      >
        {card}
      </button>
    ))}
  </div>
);

export const Sidebar = ({
  selectedId,
  selectedType,
  diagram,
  onUpdate,
  onUpdateCardinality,
  onDisconnect,
  onDelete,
  onClose,
}: SidebarProps) => {
  let selectedItem: Entity | Attribute | Relationship | null = null;
  if (selectedType === 'entity') {
    selectedItem = diagram.entities.find((e) => e.id === selectedId) || null;
  } else if (selectedType === 'attribute') {
    selectedItem = diagram.attributes.find((a) => a.id === selectedId) || null;
  } else if (selectedType === 'relationship') {
    selectedItem = diagram.relationships.find((r) => r.id === selectedId) || null;
  }

  const isDefaultLabel =
    selectedItem?.label === 'Entity' ||
    selectedItem?.label === 'Attribute' ||
    selectedItem?.label === 'Relationship';

  const [labelValue, setLabelValue] = useState(
    selectedItem && !(selectedItem.isNew || isDefaultLabel) ? selectedItem.label : ''
  );

  useEffect(() => {
    if (!selectedItem) return;
    const currentIsDefault =
      selectedItem.label === 'Entity' ||
      selectedItem.label === 'Attribute' ||
      selectedItem.label === 'Relationship';
    setLabelValue(selectedItem.isNew || currentIsDefault ? '' : selectedItem.label);
    // Only reset when the selection changes, not on every keystroke echo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem?.id]);

  if (!selectedItem || !selectedType) return null;

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLabelValue(newValue);
    onUpdate({ label: newValue || selectedType.charAt(0).toUpperCase() + selectedType.slice(1), isNew: false });
  };

  const entity = selectedType === 'entity' ? (selectedItem as Entity) : null;
  const attribute = selectedType === 'attribute' ? (selectedItem as Attribute) : null;
  const relationship = selectedType === 'relationship' ? (selectedItem as Relationship) : null;

  return (
    <div className="absolute top-20 right-4 bottom-6 z-30 flex w-72 flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xl backdrop-blur">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <h2 className="text-sm font-semibold text-[var(--text)] capitalize">{selectedType}</h2>
        <button
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--text)]"
          title="Close (Esc)"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        <div>
          <label className={sectionLabelClass}>Label</label>
          <input
            type="text"
            value={labelValue}
            placeholder={selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
            onChange={handleLabelChange}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter' || e.key === 'Escape') e.currentTarget.blur();
            }}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-solid)] px-3 py-2 text-sm text-[var(--text)] outline-none transition-shadow focus:ring-2 focus:ring-[var(--accent)]"
            autoFocus
          />
        </div>

        {entity && (
          <div>
            <label className={sectionLabelClass}>Options</label>
            <Toggle
              label="Weak entity"
              hint="double border"
              checked={!!entity.isWeak}
              onChange={(checked) => onUpdate({ isWeak: checked })}
            />
          </div>
        )}

        {attribute && (
          <>
            <div>
              <label className={sectionLabelClass}>Notation</label>
              <div className="space-y-0.5">
                <Toggle
                  label="Primary key"
                  hint="underlined"
                  checked={!!attribute.isPrimaryKey}
                  onChange={(checked) => onUpdate({ isPrimaryKey: checked })}
                />
                <Toggle
                  label="Multivalued"
                  hint="double ellipse"
                  checked={!!attribute.isMultivalued}
                  onChange={(checked) => onUpdate({ isMultivalued: checked })}
                />
                <Toggle
                  label="Derived"
                  hint="dashed outline"
                  checked={!!attribute.isDerived}
                  onChange={(checked) => onUpdate({ isDerived: checked })}
                />
              </div>
            </div>
            <div>
              <label className={sectionLabelClass}>Data type (for SQL export)</label>
              <select
                value={attribute.dataType || ''}
                onChange={(e) => onUpdate({ dataType: (e.target.value || undefined) as DataType | undefined })}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-solid)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:ring-2 focus:ring-[var(--accent)]"
              >
                <option value="">Default (VARCHAR(255))</option>
                {DATA_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {relationship && (
          <div>
            <label className={sectionLabelClass}>Connections</label>
            {relationship.connectedEntities.length === 0 && (
              <p className="rounded-lg bg-[var(--hover)] px-3 py-2 text-xs leading-relaxed text-[var(--text-muted)]">
                Click an entity on the canvas to connect it to this relationship.
              </p>
            )}
            {(() => {
              const processed = new Set<string>();
              const sections: React.ReactElement[] = [];

              relationship.connectedEntities.forEach((entityId) => {
                if (processed.has(entityId)) return;
                processed.add(entityId);
                const connectedEntity = diagram.entities.find((e) => e.id === entityId);
                if (!connectedEntity) return;

                const count = relationship.connectedEntities.filter((id) => id === entityId).length;
                const isSelfReference = count === 2;

                sections.push(
                  <div
                    key={entityId}
                    className="mb-2 rounded-lg border border-[var(--border)] bg-[var(--surface-solid)] p-2.5"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="truncate text-sm font-medium text-[var(--text)]">
                        {connectedEntity.label}
                        {isSelfReference && (
                          <span className="ml-1.5 text-xs font-normal text-[var(--text-muted)]">self</span>
                        )}
                      </span>
                      <button
                        onClick={() => onDisconnect(entityId)}
                        className="shrink-0 rounded-md px-1.5 py-0.5 text-xs text-[var(--text-muted)] transition-colors hover:bg-[var(--hover)] hover:text-red-500"
                        title="Disconnect from this entity"
                      >
                        Disconnect
                      </button>
                    </div>
                    {isSelfReference ? (
                      <div className="space-y-2">
                        {[0, 1].map((i) => (
                          <div key={i}>
                            <div className="mb-1 text-[10px] text-[var(--text-muted)]">Connection {i + 1}</div>
                            <CardinalityPicker
                              value={
                                relationship.cardinalities?.[`${entityId}_self_${i}`] ||
                                relationship.cardinalities?.[entityId] ||
                                '1'
                              }
                              onChange={(card) => onUpdateCardinality(entityId, card, i)}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <CardinalityPicker
                        value={relationship.cardinalities?.[entityId] || '1'}
                        onChange={(card) => onUpdateCardinality(entityId, card)}
                      />
                    )}
                  </div>
                );
              });

              return sections;
            })()}
            {relationship.connectedEntities.length === 1 && (
              <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
                Click another entity (or the same one again for a self-reference) to complete the relationship.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-[var(--border)] p-3">
        <button
          onClick={onDelete}
          className="w-full rounded-lg border border-red-500/30 px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10"
        >
          Delete {selectedType}
          <span className="ml-1.5 text-xs opacity-60">⌫</span>
        </button>
      </div>
    </div>
  );
};
