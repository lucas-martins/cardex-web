import { type FormEvent, useState } from "react";

import { TypeFilterSelect } from "../pokemon/TypeFilterSelect";
import type { CardCondition, CardLanguage } from "../../types/card";
import { CARD_CONDITION_OPTIONS } from "../../utils/formatCondition";
import "./CardCollectionFilters.css";

export type CardCollectionSort =
  | "name,asc"
  | "name,desc"
  | "createdAt,desc"
  | "createdAt,asc"
  | "quantity,desc"
  | "quantity,asc";

export interface CardCollectionFilterValues {
  name: string;
  number: string;
  collection: string;
  rarity: string;
  type: string;
  language: CardLanguage | "";
  condition: CardCondition | "";
  favorite: boolean;
  sort: CardCollectionSort;
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
  const [language, setLanguage] = useState<CardLanguage | "">(
    initialValues.language,
  );
  const [condition, setCondition] = useState<CardCondition | "">(
    initialValues.condition,
  );
  const [sort, setSort] = useState<CardCollectionSort>(initialValues.sort);
  const [favorite, setFavorite] = useState(initialValues.favorite);
  const [collection, setCollection] = useState(initialValues.collection);

  const [rarity, setRarity] = useState(initialValues.rarity);
  const [type, setType] = useState(initialValues.type);
  const [number, setNumber] = useState(initialValues.number);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch({
      name: name.trim(),
      number: number.trim(),
      collection: collection.trim(),
      rarity: rarity.trim(),
      type: type.trim(),
      language,
      condition,
      favorite,
      sort,
    });
  }

  function handleClear() {
    setName("");
    setNumber("");
    setCollection("");
    setRarity("");
    setType("");
    setLanguage("");
    setCondition("");
    setSort("name,asc");
    setFavorite(false);

    onClear();
  }

  return (
    <form className="collection-filters" onSubmit={handleSubmit}>
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
        Card number
        <input
          type="search"
          value={number}
          onChange={(event) => setNumber(event.target.value)}
          placeholder="Example: 12"
        />
      </label>

      <label>
        Collection
        <input
          type="search"
          value={collection}
          onChange={(event) => setCollection(event.target.value)}
          placeholder="Example: Sun & Moon"
        />
      </label>

      <label>
        Rarity
        <input
          type="search"
          value={rarity}
          onChange={(event) => setRarity(event.target.value)}
          placeholder="Example: Rare Holo"
        />
      </label>

      <label>
        Type
        <TypeFilterSelect
          value={type}
          emptyValue=""
          emptyLabel="All types"
          onChange={setType}
        />
      </label>

      <label>
        Language
        <select
          value={language}
          onChange={(event) =>
            setLanguage(event.target.value as CardLanguage | "")
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
            setCondition(event.target.value as CardCondition | "")
          }
        >
          <option value="">All conditions</option>
          {CARD_CONDITION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="favorite-filter">
        <input
          type="checkbox"
          checked={favorite}
          onChange={(event) => setFavorite(event.target.checked)}
        />
        Only favorites
      </label>

      <label>
        Sort by
        <select
          value={sort}
          onChange={(event) =>
            setSort(event.target.value as CardCollectionSort)
          }
        >
          <option value="name,asc">Name: A–Z</option>
          <option value="name,desc">Name: Z–A</option>
          <option value="createdAt,desc">Recently added</option>
          <option value="createdAt,asc">Oldest added</option>
          <option value="quantity,desc">Quantity: highest</option>
          <option value="quantity,asc">Quantity: lowest</option>
        </select>
      </label>

      <div className="collection-filter-actions">
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>

        <button type="button" onClick={handleClear} disabled={loading}>
          Clear
        </button>
      </div>
    </form>
  );
}
