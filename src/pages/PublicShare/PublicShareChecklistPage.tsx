import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getPublicShareChecklist } from "../../services/share/shareService";
import type { CollectionChecklist } from "../../types/collectionChecklist";
import { formatMarketPrices } from "../../utils/formatMoney";

import "./PublicShareChecklistPage.css";

type ChecklistFilter = "ALL" | "OWNED" | "MISSING";

export function PublicShareChecklistPage() {
  const { token, collectionId } = useParams<{
    token: string;
    collectionId: string;
  }>();

  const [checklist, setChecklist] = useState<CollectionChecklist | null>(null);
  const [filter, setFilter] = useState<ChecklistFilter>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadChecklist() {
      if (!token || !collectionId) {
        if (active) {
          setError("Invalid shared collection.");
          setLoading(false);
        }

        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await getPublicShareChecklist(token, collectionId);

        if (!active) {
          return;
        }

        setChecklist(response);
      } catch {
        if (active) {
          setError("Could not load this shared collection.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadChecklist();

    return () => {
      active = false;
    };
  }, [token, collectionId]);

  const visibleCards = useMemo(() => {
    if (!checklist) {
      return [];
    }

    const normalizedSearch = searchTerm.trim().toLowerCase();

    return checklist.cards.filter((card) => {
      const matchesFilter =
        filter === "ALL" ||
        (filter === "OWNED" && card.owned) ||
        (filter === "MISSING" && !card.owned);

      if (!matchesFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return (
        card.name.toLowerCase().includes(normalizedSearch) ||
        card.cardNumber.toLowerCase().includes(normalizedSearch) ||
        (card.rarity?.toLowerCase().includes(normalizedSearch) ?? false)
      );
    });
  }, [checklist, filter, searchTerm]);

  if (loading) {
    return (
      <main className="public-share-checklist-page">
        <p className="public-share-checklist-message">
          Loading shared checklist...
        </p>
      </main>
    );
  }

  if (error || !checklist) {
    return (
      <main className="public-share-checklist-page">
        <section className="public-share-checklist-empty">
          <h1>Checklist unavailable</h1>
          <p>{error ?? "Could not load this shared collection."}</p>
          {token && <Link to={`/share/${token}`}>Back to shared collections</Link>}
        </section>
      </main>
    );
  }

  return (
    <main className="public-share-checklist-page">
      {token && (
        <Link className="public-share-checklist-back" to={`/share/${token}`}>
          ← Back to shared collections
        </Link>
      )}

      <header className="public-share-checklist-header">
        <div>
          <span>Shared checklist</span>
          <h1>{checklist.collectionName}</h1>
          <p>
            {checklist.ownedUniqueCards} of {checklist.totalCards} unique cards
            owned
          </p>
        </div>

        <strong>{checklist.completionPercentage.toFixed(0)}%</strong>
      </header>

      <div className="public-share-checklist-progress">
        <span
          style={{
            width: `${Math.min(checklist.completionPercentage, 100)}%`,
          }}
        />
      </div>

      <div className="public-share-checklist-toolbar">
        <div className="public-share-checklist-search">
          <label htmlFor="public-share-card-search">Search cards</label>

          <input
            id="public-share-card-search"
            type="search"
            value={searchTerm}
            placeholder="Search by name, number or rarity..."
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="public-share-checklist-filters">
          <button
            type="button"
            className={filter === "ALL" ? "active" : ""}
            onClick={() => setFilter("ALL")}
          >
            All
          </button>

          <button
            type="button"
            className={filter === "OWNED" ? "active" : ""}
            onClick={() => setFilter("OWNED")}
          >
            Owned
          </button>

          <button
            type="button"
            className={filter === "MISSING" ? "active" : ""}
            onClick={() => setFilter("MISSING")}
          >
            Missing
          </button>
        </div>
      </div>

      {visibleCards.length === 0 ? (
        <p className="public-share-checklist-empty-filter">
          No cards match the selected filters.
        </p>
      ) : (
        <section className="public-share-checklist-grid">
          {visibleCards.map((card) => (
            <article
              key={card.externalId}
              className={`public-share-checklist-card ${
                card.owned ? "owned" : "missing"
              }`}
            >
              <div className="public-share-checklist-image-wrapper">
                {card.imageUrl ? (
                  <img src={card.imageUrl} alt={card.name} />
                ) : (
                  <div className="public-share-checklist-placeholder">
                    No image
                  </div>
                )}

                <span
                  className={`public-share-checklist-status ${
                    card.owned ? "owned" : "missing"
                  }`}
                >
                  {card.owned ? "Owned" : "Missing"}
                </span>
              </div>

              <div className="public-share-checklist-card-content">
                <div>
                  <h2>{card.name}</h2>
                  <span>#{card.cardNumber}</span>
                </div>

                <p>{card.rarity ?? "Rarity unavailable"}</p>

                <p className="public-share-checklist-card-price">
                  {formatMarketPrices(
                    card.marketPriceUsd,
                    card.marketPriceEur,
                    card.marketPriceBrl,
                  )}
                </p>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
