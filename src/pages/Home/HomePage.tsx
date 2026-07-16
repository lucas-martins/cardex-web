import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getCollectionSummary } from "../../services/cards/cardService";
import type { CollectionSummary } from "../../types/collectionSummary";
import "./HomePage.css";

export function HomePage() {
  const [summary, setSummary] = useState<CollectionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSummary() {
      try {
        setLoading(true);
        setError(null);

        const response = await getCollectionSummary();

        setSummary(response);
      } catch {
        setError("Could not load the collection summary.");
      } finally {
        setLoading(false);
      }
    }

    void loadSummary();
  }, []);

  return (
    <section className="home-page">
      <div className="home-hero">
        <div>
          <span className="home-eyebrow">Pokémon TCG collection manager</span>

          <h1>Welcome to CardDex</h1>

          <p>
            Search for Pokémon cards, organize your collection and keep track
            of every copy you own.
          </p>

          <div className="home-actions">
            <Link className="home-primary-action" to="/search">
              Search cards
            </Link>

            <Link className="home-secondary-action" to="/collection">
              View collection
            </Link>
          </div>
        </div>
      </div>

      <div className="home-summary">
        <h2>Collection summary</h2>

        {loading && <p>Loading summary...</p>}

        {error && <p className="home-error">{error}</p>}

        {!loading && !error && summary && (
          <div className="home-summary-grid">
            <article className="home-summary-card">
              <span>Unique cards</span>
              <strong>{summary.uniqueCards}</strong>
              <p>Different cards in your collection</p>
            </article>

            <article className="home-summary-card">
              <span>Total copies</span>
              <strong>{summary.totalCards}</strong>
              <p>All copies combined</p>
            </article>
          </div>
        )}
      </div>
    </section>
  );
}