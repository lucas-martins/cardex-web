import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { findPokemonCollections } from "../../services/pokemon/pokemonCardService";
import type { PokemonCollection } from "../../types/pokemonCard";

import "./CollectionsPage.css";

export function CollectionsPage() {
  const [collections, setCollections] = useState<PokemonCollection[]>([]);

  const [search, setSearch] = useState("");

  const [selectedSeries, setSelectedSeries] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadCollections() {
      try {
        setLoading(true);
        setError(null);

        const response = await findPokemonCollections();

        if (!active) {
          return;
        }

        setCollections(response);
      } catch {
        if (active) {
          setError("Could not load Pokémon TCG collections.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadCollections();

    return () => {
      active = false;
    };
  }, []);

  const series = useMemo(
    () =>
      Array.from(
        new Set(
          collections.map((collection) => collection.series).filter(Boolean),
        ),
      ).sort((first, second) => first.localeCompare(second)),
    [collections],
  );

  const filteredCollections = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return collections.filter((collection) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        collection.name.toLowerCase().includes(normalizedSearch) ||
        collection.series.toLowerCase().includes(normalizedSearch);

      const matchesSeries =
        selectedSeries.length === 0 || collection.series === selectedSeries;

      return matchesSearch && matchesSeries;
    });
  }, [collections, search, selectedSeries]);

  if (loading) {
    return <p>Loading collections...</p>;
  }

  if (error) {
    return (
      <section className="collections-page">
        <p className="collections-error">{error}</p>
      </section>
    );
  }

  return (
    <section className="collections-page">
      <header className="collections-header">
        <div>
          <span className="collections-eyebrow">Pokémon TCG</span>

          <h1>Collections</h1>

          <p>Explore Pokémon TCG sets and track your collection progress.</p>
        </div>

        <div className="collections-summary">
          <strong>{collections.length}</strong>

          <span>sets available</span>
        </div>
      </header>

      <div className="collections-filters">
        <div className="collections-search">
          <label htmlFor="collection-search">Search collections</label>

          <input
            id="collection-search"
            type="search"
            placeholder="Search by collection or series..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="collections-series-filter">
          <label htmlFor="collection-series">Series</label>

          <select
            id="collection-series"
            value={selectedSeries}
            onChange={(event) => setSelectedSeries(event.target.value)}
          >
            <option value="">All series</option>

            {series.map((seriesName) => (
              <option key={seriesName} value={seriesName}>
                {seriesName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="collections-results-header">
        <span>
          {filteredCollections.length}{" "}
          {filteredCollections.length === 1 ? "collection" : "collections"}
        </span>
      </div>

      {filteredCollections.length === 0 ? (
        <div className="collections-empty">
          <h2>No collections found</h2>

          <p>Try changing your search or series filter.</p>
        </div>
      ) : (
        <div className="collections-grid">
          {filteredCollections.map((collection) => {
            const percentage = Math.min(
              100,
              Math.max(0, collection.completionPercentage),
            );

            return (
              <Link
                className="collections-card"
                key={collection.id}
                to={`/collections/${collection.id}`}
              >
                <div className="collections-card-header">
                  <div>
                    <span className="collections-card-series">
                      {collection.series}
                    </span>

                    <h2>{collection.name}</h2>
                  </div>

                  <span className="collections-card-id">{collection.id}</span>
                </div>

                <div className="collections-card-progress-header">
                  <span>
                    {collection.ownedCards} / {collection.total} cards
                  </span>

                  <strong>{percentage.toFixed(2)}%</strong>
                </div>

                <div
                  className="collections-progress"
                  role="progressbar"
                  aria-label={`${collection.name} progress`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(percentage)}
                >
                  <span
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>

                {collection.total !== collection.printedTotal && (
                  <p className="collections-card-total">
                    {collection.printedTotal} numbered cards +{" "}
                    {collection.total - collection.printedTotal} additional
                    cards
                  </p>
                )}

                <span className="collections-card-action">
                  View collection →
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
