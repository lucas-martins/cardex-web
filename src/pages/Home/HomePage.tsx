import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  findCards,
  getCollectionSummary,
} from "../../services/cards/cardService";
import type { Card } from "../../types/card";
import type { CollectionSummary } from "../../types/collectionSummary";
import "./HomePage.css";

export function HomePage() {
  const [summary, setSummary] = useState<CollectionSummary | null>(null);
  const [recentCards, setRecentCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);
        setError(null);

        const [summaryResponse, recentCardsResponse] = await Promise.all([
          getCollectionSummary(),
          findCards({
            page: 0,
            size: 4,
            sort: "createdAt,desc",
          }),
        ]);

        setSummary(summaryResponse);
        setRecentCards(recentCardsResponse.content);
      } catch {
        setError("Could not load the home page information.");
      } finally {
        setLoading(false);
      }
    }

    void loadHomeData();
  }, []);

  return (
    <section className="home-page">
      <div className="home-hero">
        <div>
          <span className="home-eyebrow">
            Pokémon TCG collection manager
          </span>

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

      {loading && <p>Loading home information...</p>}

      {error && <p className="home-error">{error}</p>}

      {!loading && !error && (
        <>
          {summary && (
            <div className="home-summary">
              <h2>Collection summary</h2>

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
            </div>
          )}

          <div className="home-recent">
            <div className="home-section-header">
              <div>
                <h2>Recently added</h2>
                <p>The latest cards added to your collection.</p>
              </div>

              {recentCards.length > 0 && (
                <Link to="/collection">View all</Link>
              )}
            </div>

            {recentCards.length === 0 ? (
              <div className="home-empty-state">
                <h3>Your collection is still empty</h3>

                <p>
                  Search for your first Pokémon card and add it to your
                  collection.
                </p>

                <Link to="/search">Search cards</Link>
              </div>
            ) : (
              <div className="home-recent-grid">
                {recentCards.map((card) => (
                  <article className="home-recent-card" key={card.id}>
                    <div className="home-recent-image-wrapper">
                      <img
                        src={card.imageUrl}
                        alt={card.name}
                        className="home-recent-image"
                      />

                      <span className="home-recent-quantity">
                        ×{card.quantity}
                      </span>
                    </div>

                    <div className="home-recent-card-content">
                      <h3>{card.name}</h3>

                      <p>{card.collectionName}</p>

                      <span>#{card.cardNumber}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}