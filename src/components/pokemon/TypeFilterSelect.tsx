import { useEffect, useId, useRef, useState } from "react";

import {
  POKEMON_TYPES,
  type PokemonType,
} from "../../constants/pokemonTypes";
import { EnergyTypeIcon } from "./EnergyTypeIcon";

import "./TypeFilterSelect.css";

interface TypeFilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  emptyValue?: string;
  emptyLabel?: string;
  id?: string;
  "aria-label"?: string;
  disabled?: boolean;
}

export function TypeFilterSelect({
  value,
  onChange,
  emptyValue = "",
  emptyLabel = "Any type",
  id,
  "aria-label": ariaLabel = "Type",
  disabled = false,
}: TypeFilterSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listId = useId();

  const selectedType = POKEMON_TYPES.find((type) => type === value) ?? null;
  const selectedLabel = selectedType ?? emptyLabel;

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function selectValue(nextValue: string) {
    onChange(nextValue);
    setOpen(false);
  }

  return (
    <div
      className={`type-filter-select${open ? " open" : ""}${
        disabled ? " disabled" : ""
      }`}
      ref={rootRef}
    >
      <button
        id={id}
        type="button"
        className="type-filter-trigger"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="type-filter-trigger-content">
          {selectedType ? (
            <EnergyTypeIcon type={selectedType} size={18} />
          ) : (
            <span className="type-filter-empty-icon" aria-hidden="true" />
          )}
          <span>{selectedLabel}</span>
        </span>
        <span className="type-filter-caret" aria-hidden="true" />
      </button>

      {open && (
        <ul
          id={listId}
          className="type-filter-menu"
          role="listbox"
          aria-label={ariaLabel}
        >
          <li role="presentation">
            <button
              type="button"
              role="option"
              className="type-filter-option"
              aria-selected={value === emptyValue}
              onClick={() => selectValue(emptyValue)}
            >
              <span className="type-filter-empty-icon" aria-hidden="true" />
              <span>{emptyLabel}</span>
            </button>
          </li>

          {POKEMON_TYPES.map((type: PokemonType) => (
            <li key={type} role="presentation">
              <button
                type="button"
                role="option"
                className="type-filter-option"
                aria-selected={value === type}
                onClick={() => selectValue(type)}
              >
                <EnergyTypeIcon type={type} size={18} />
                <span>{type}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
