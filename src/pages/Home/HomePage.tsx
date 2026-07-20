import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  findCards,
  getCollectionSummary,
  getCollectionAnalytics,
  getCollectionGoals,
  getCollectionProgress,
} from "../../services/cards/cardService";
import type { Card } from "../../types/card";
import type { CollectionSummary } from "../../types/collectionSummary";
import "./HomePage.css";
import type { CollectionAnalytics } from "../../types/collectionAnalytics";
import type { CollectionGoals } from "../../types/collectionGoals";
import type { CollectionProgress } from "../../types/collectionProgress";

export function HomePage() {
  const [summary, setSummary] = useState<CollectionSummary | null>(null);
  const [recentCards, setRecentCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteCards, setFavoriteCards] = useState<Card[]>([]);
  const [analytics, setAnalytics] = useState<CollectionAnalytics | null>(null);
  const [goals, setGoals] = useState<CollectionGoals | null>(null);
  const [collectionProgress, setCollectionProgress] = useState<
    CollectionProgress[]
  >([]);

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);
        setError(null);

        const [
          summaryResponse,
          analyticsResponse,
          goalsResponse,
          collectionProgressResponse,
          favoriteCardsResponse,
          recentCardsResponse,
        ] = await Promise.all([
          getCollectionSummary(),
          getCollectionAnalytics(),
          getCollectionGoals(),
          getCollectionProgress(),
          findCards({
            page: 0,
            size: 4,
            favorite: true,
            sort: "updatedAt,desc",
          }),
          findCards({
            page: 0,
            size: 4,
            sort: "createdAt,desc",
          }),
        ]);

        setSummary(summaryResponse);
        setAnalytics(analyticsResponse);
        setFavoriteCards(favoriteCardsResponse.content);
        setRecentCards(recentCardsResponse.content);
        setGoals(goalsResponse);
        setCollectionProgress(collectionProgressResponse);
      } catch {
        setError("Could not load the home page information.");
      } finally {
        setLoading(false);
      }
    }

    void loadHomeData();
  }, []);

  function formatAnalyticsName(name: string) {
    return name
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  function getMaxQuantity(items: CollectionAnalytics["collections"]) {
    return Math.max(...items.map((item) => item.quantity), 1);
  }

  return (
    <section className="home-page">
      <div className="home-hero">
        <div>
          <span className="home-eyebrow">Pokémon TCG collection manager</span>

          <h1>Welcome to CardDex</h1>

          <p>
            Search for Pokémon cards, organize your collection and keep track of
            every copy you own.
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

                <article className="home-summary-card">
                  <span>Languages</span>
                  <strong>{summary.differentLanguages}</strong>
                  <p>Different card languages owned</p>
                </article>

                <article className="home-summary-card">
                  <span>Collections</span>
                  <strong>{summary.differentCollections}</strong>
                  <p>Different sets represented</p>
                </article>
              </div>

              <article className="home-most-owned-card">
                <div>
                  <span>Most owned card</span>

                  {summary.mostOwnedCard ? (
                    <>
                      <strong>{summary.mostOwnedCard.name}</strong>
                      <p>
                        You currently own {summary.mostOwnedCard.quantity}{" "}
                        {summary.mostOwnedCard.quantity === 1
                          ? "copy"
                          : "copies"}
                        .
                      </p>
                    </>
                  ) : (
                    <>
                      <strong>No card yet</strong>
                      <p>
                        Add your first card to start tracking your collection.
                      </p>
                    </>
                  )}
                </div>

                {summary.mostOwnedCard && (
                  <span className="home-most-owned-quantity">
                    ×{summary.mostOwnedCard.quantity}
                  </span>
                )}
              </article>
            </div>
          )}

          {goals && (
            <section className="home-goals">
              <div className="home-section-header">
                <div>
                  <h2>Collection goals</h2>
                  <p>
                    {goals.completedGoals} of {goals.totalGoals} goals
                    completed.
                  </p>
                </div>
              </div>

              <div className="home-goals-grid">
                {goals.goals.map((goal) => (
                  <article
                    key={goal.code}
                    className={`home-goal-card ${
                      goal.completed ? "completed" : ""
                    }`}
                  >
                    <div className="home-goal-status">
                      {goal.completed ? "🏆" : "🎯"}
                    </div>

                    <div className="home-goal-content">
                      <h3>{goal.title}</h3>

                      <p>{goal.description}</p>

                      <strong>
                        {goal.currentValue} / {goal.targetValue}
                      </strong>

                      <div className="home-goal-progress">
                        <span
                          style={{
                            width: `${
                              (goal.currentValue / goal.targetValue) * 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {collectionProgress.length > 0 && (
            <section className="home-progress">
              <div className="home-section-header">
                <div>
                  <h2>Collection progress</h2>
                  <p>Track your completion by collection.</p>
                </div>
              </div>

              <div className="home-progress-grid">
                {collectionProgress.slice(0, 6).map((progress) => (
                  <Link
                    className="home-progress-card"
                    key={progress.collectionId}
                    to={`/collections/${progress.collectionId}`}
                  >
                    <div className="home-progress-card-header">
                      <div>
                        <h3>{progress.collectionName}</h3>
                        <span>{progress.collectionId}</span>
                      </div>

                      <strong>
                        {progress.completionPercentage.toFixed(2)}%
                      </strong>
                    </div>

                    <div className="home-progress-bar">
                      <span
                        style={{
                          width: `${Math.min(
                            progress.completionPercentage,
                            100,
                          )}%`,
                        }}
                      />
                    </div>

                    <p>
                      {progress.ownedCards} of {progress.totalCards} cards
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {analytics && (
            <section className="home-analytics">
              <div className="home-section-header">
                <div>
                  <h2>Collection analytics</h2>
                  <p>See how your collection is distributed.</p>
                </div>
              </div>

              <div className="home-analytics-grid">
                <article className="home-analytics-card">
                  <h3>Top collections</h3>

                  {analytics.collections.length === 0 ? (
                    <p className="home-analytics-empty">No data available.</p>
                  ) : (
                    <div className="home-analytics-list">
                      {analytics.collections.slice(0, 5).map((item) => {
                        const maxQuantity = getMaxQuantity(
                          analytics.collections,
                        );

                        return (
                          <div className="home-analytics-item" key={item.name}>
                            <div className="home-analytics-item-header">
                              <span>{item.name}</span>
                              <strong>{item.quantity}</strong>
                            </div>

                            <div className="home-analytics-bar">
                              <span
                                style={{
                                  width: `${
                                    (item.quantity / maxQuantity) * 100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </article>

                <article className="home-analytics-card">
                  <h3>Languages</h3>

                  {analytics.languages.length === 0 ? (
                    <p className="home-analytics-empty">No data available.</p>
                  ) : (
                    <div className="home-analytics-stat-list">
                      {analytics.languages.map((item) => (
                        <div key={item.name}>
                          <span>{formatAnalyticsName(item.name)}</span>
                          <strong>{item.quantity}</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </article>

                <article className="home-analytics-card">
                  <h3>Conditions</h3>

                  {analytics.conditions.length === 0 ? (
                    <p className="home-analytics-empty">No data available.</p>
                  ) : (
                    <div className="home-analytics-stat-list">
                      {analytics.conditions.map((item) => (
                        <div key={item.name}>
                          <span>{formatAnalyticsName(item.name)}</span>
                          <strong>{item.quantity}</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </article>

                <article className="home-analytics-card">
                  <h3>Rarities</h3>

                  {analytics.rarities.length === 0 ? (
                    <p className="home-analytics-empty">No data available.</p>
                  ) : (
                    <div className="home-analytics-stat-list">
                      {analytics.rarities.slice(0, 6).map((item) => (
                        <div key={item.name}>
                          <span>{item.name}</span>
                          <strong>{item.quantity}</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              </div>
            </section>
          )}

          {favoriteCards.length > 0 && (
            <div className="home-recent">
              <div className="home-section-header">
                <div>
                  <h2>Favorite cards</h2>
                  <p>Your favorite cards from the collection.</p>
                </div>

                <Link to="/collection">View collection</Link>
              </div>

              <div className="home-recent-grid">
                {favoriteCards.map((card) => (
                  <article className="home-recent-card" key={card.id}>
                    <div className="home-recent-image-wrapper">
                      <span
                        className="home-favorite-indicator"
                        aria-label="Favorite card"
                      >
                        ★
                      </span>

                      {card.imageUrl ? (
                        <img
                          src={card.imageUrl}
                          alt={card.name}
                          className="home-recent-image"
                        />
                      ) : (
                        <div className="home-recent-image-placeholder">
                          No image
                        </div>
                      )}

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
            </div>
          )}

          <div className="home-recent">
            <div className="home-section-header">
              <div>
                <h2>Recently added</h2>
                <p>The latest cards added to your collection.</p>
              </div>

              {recentCards.length > 0 && <Link to="/collection">View all</Link>}
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
                        src={card.imageUrl ?? undefined}
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
