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
import type { Card } from "../../types/card";
import type { CollectionAnalytics } from "../../types/collectionAnalytics";
import type { CollectionGoals } from "../../types/collectionGoals";
import type { CollectionProgress } from "../../types/collectionProgress";
import type { CollectionSummary } from "../../types/collectionSummary";

import "./HomePage.css";

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
          {summary && <CollectionSummarySection summary={summary} />}

          {goals && <CollectionGoalsSection goals={goals} />}

          {collectionProgress.length > 0 && (
            <CollectionProgressSection progress={collectionProgress} />
          )}

          {analytics && <CollectionAnalyticsSection analytics={analytics} />}

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
