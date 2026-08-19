import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { CardShowcaseSection } from "../../components/home/CardShowcaseSection";
import { CollectionAnalyticsSection } from "../../components/home/CollectionAnalyticsSection";
import { CollectionProgressSection } from "../../components/home/CollectionProgressSection";
import { CollectionGoalsSection } from "../../components/home/CollectionGoalsSection";
import { CollectionSummarySection } from "../../components/home/CollectionSummarySection";
import {
  findCards,
  getCollectionAnalytics,
  getCollectionGoals,
  getCollectionProgress,
  getCollectionSummary,
} from "../../services/cards/cardService";
import {
  findWishlistCards,
} from "../../services/wishlist/wishlistService";
import type { Card } from "../../types/card";
import type { CollectionAnalytics } from "../../types/collectionAnalytics";
import type { CollectionGoals } from "../../types/collectionGoals";
import type { CollectionProgress } from "../../types/collectionProgress";
import type { CollectionSummary } from "../../types/collectionSummary";
import type { WishlistCard } from "../../types/wishlistCard";

import "./HomePage.css";

export function HomePage() {
  const [summary, setSummary] =
    useState<CollectionSummary | null>(null);

  const [recentCards, setRecentCards] =
    useState<Card[]>([]);

  const [favoriteCards, setFavoriteCards] =
    useState<Card[]>([]);

  const [analytics, setAnalytics] =
    useState<CollectionAnalytics | null>(null);

  const [goals, setGoals] =
    useState<CollectionGoals | null>(null);

  const [collectionProgress, setCollectionProgress] =
    useState<CollectionProgress[]>([]);

  const [wishlistCards, setWishlistCards] =
    useState<WishlistCard[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

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
          wishlistResponse,
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
          findWishlistCards(),
        ]);

        setSummary(summaryResponse);
        setAnalytics(analyticsResponse);
        setFavoriteCards(
          favoriteCardsResponse.content,
        );
        setRecentCards(
          recentCardsResponse.content,
        );
        setGoals(goalsResponse);
        setCollectionProgress(
          collectionProgressResponse,
        );
        setWishlistCards(wishlistResponse);
      } catch {
        setError(
          "Could not load the home page information.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadHomeData();
  }, []);

  const highPriorityCount =
    wishlistCards.filter(
      (card) => card.priority === "HIGH",
    ).length;

  const mediumPriorityCount =
    wishlistCards.filter(
      (card) => card.priority === "MEDIUM",
    ).length;

  const lowPriorityCount =
    wishlistCards.filter(
      (card) => card.priority === "LOW",
    ).length;

  return (
    <section className="home-page">
      <div className="home-hero">
        <div>
          <span className="home-eyebrow">
            Pokémon TCG collection manager
          </span>

          <h1>Welcome to CardDex</h1>

          <p>
            Search for Pokémon cards, organize
            your collection and keep track of
            every copy you own.
          </p>

          <div className="home-actions">
            <Link
              className="home-primary-action"
              to="/search"
            >
              Search cards
            </Link>

            <Link
              className="home-secondary-action"
              to="/collection"
            >
              View collection
            </Link>
          </div>
        </div>
      </div>

      {loading && (
        <p>Loading home information...</p>
      )}

      {error && (
        <p className="home-error">
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          {summary && (
            <CollectionSummarySection
              summary={summary}
            />
          )}

          <section className="home-wishlist">
            <div className="home-section-header">
              <div>
                <h2>Wishlist priorities</h2>

                <p>
                  Keep track of the cards you
                  want the most.
                </p>
              </div>

              <Link to="/wishlist">
                View wishlist
              </Link>
            </div>

            {wishlistCards.length > 0 ? (
              <div className="home-wishlist-grid">
                <Link
                  className="home-wishlist-card high"
                  to="/wishlist"
                >
                  <span>High priority</span>

                  <strong>
                    {highPriorityCount}
                  </strong>

                  <p>
                    Cards you want the most.
                  </p>
                </Link>

                <Link
                  className="home-wishlist-card medium"
                  to="/wishlist"
                >
                  <span>Medium priority</span>

                  <strong>
                    {mediumPriorityCount}
                  </strong>

                  <p>
                    Cards you want to get soon.
                  </p>
                </Link>

                <Link
                  className="home-wishlist-card low"
                  to="/wishlist"
                >
                  <span>Low priority</span>

                  <strong>
                    {lowPriorityCount}
                  </strong>

                  <p>
                    Cards for later.
                  </p>
                </Link>
              </div>
            ) : (
              <div className="home-wishlist-empty">
                <p>
                  Your wishlist is empty.
                </p>

                <Link to="/search">
                  Search cards
                </Link>
              </div>
            )}
          </section>

          {goals && (
            <CollectionGoalsSection
              goals={goals}
            />
          )}

          {collectionProgress.length > 0 && (
            <CollectionProgressSection
              progress={collectionProgress}
            />
          )}

          {analytics && (
            <CollectionAnalyticsSection
              analytics={analytics}
            />
          )}

          {favoriteCards.length > 0 && (
            <CardShowcaseSection
              title="Favorite cards"
              description="Your favorite cards from the collection."
              cards={favoriteCards}
              showFavoriteIndicator
            />
          )}

          <CardShowcaseSection
            title="Recently added"
            description="The latest cards added to your collection."
            cards={recentCards}
            emptyTitle="Your collection is still empty"
            emptyDescription="Search for your first Pokémon card and add it to your collection."
            emptyActionLabel="Search cards"
            emptyActionTo="/search"
          />
        </>
      )}
    </section>
  );
}