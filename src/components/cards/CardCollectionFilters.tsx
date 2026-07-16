import { type FormEvent, useState } from "react";

import type {
  CardCondition,
  CardLanguage,
} from "../../types/card";
import "./CardCollectionFilters.css";

export interface CardCollectionFilterValues {
  name: string;
  language: CardLanguage | "";
  condition: CardCondition | "";
}

interface CardCollectionFiltersProps {
  initialValues: CardCollectionFilterValues;
  loading: boolean;
  onSearch: (filters: CardCollectionFilterValues) => void;
  onClear: () => void;
}

export function CardCollectionFilters({
  initialValues,
  loading,
  onSearch,
  onClear,
}: CardCollectionFiltersProps) {
  const [name, setName] = useState(initialValues.name);
  const [language, setLanguage] =
    useState<CardLanguage | "">(initialValues.language);
  const [condition, setCondition] =
    useState<CardCondition | "">(initialValues.condition);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSearch({
      name: name.trim(),
      language,
      condition,
    });
  }

  function handleClear() {
    setName("");
    setLanguage("");
    setCondition("");
    onClear();
  }

  return (
    <form
      className="collection-filters"
      onSubmit={handleSubmit}
    >
      <label>
        Card name
        <input
          type="search"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Example: Charizard"
        />
      </label>

      <label>
        Language
        <select
          value={language}
          onChange={(event) =>
            setLanguage(
              event.target.value as CardLanguage | "",
            )
          }
        >
          <option value="">All languages</option>
          <option value="ENGLISH">English</option>
          <option value="PORTUGUESE">Portuguese</option>
          <option value="JAPANESE">Japanese</option>
          <option value="SPANISH">Spanish</option>
          <option value="FRENCH">French</option>
          <option value="GERMAN">German</option>
          <option value="ITALIAN">Italian</option>
          <option value="KOREAN">Korean</option>
          <option value="CHINESE">Chinese</option>
        </select>
      </label>

      <label>
        Condition
        <select
          value={condition}
          onChange={(event) =>
            setCondition(
              event.target.value as CardCondition | "",
            )
          }
        >
          <option value="">All conditions</option>
          <option value="MINT">Mint</option>
          <option value="NEAR_MINT">Near Mint</option>
          <option value="EXCELLENT">Excellent</option>
          <option value="GOOD">Good</option>
          <option value="LIGHTLY_PLAYED">
            Lightly Played
          </option>
          <option value="PLAYED">Played</option>
          <option value="POOR">Poor</option>
        </select>
      </label>

      <div className="collection-filter-actions">
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>

        <button
          type="button"
          onClick={handleClear}
          disabled={loading}
        >
          Clear
        </button>
      </div>
    </form>
  );
}