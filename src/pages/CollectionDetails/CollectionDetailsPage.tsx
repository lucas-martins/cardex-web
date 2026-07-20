import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getCollectionDetails } from "../../services/cards/cardService";
import type { CollectionDetails } from "../../types/collectionDetails";
import "./CollectionDetailsPage.css";

export function CollectionDetailsPage() {
  const { collectionId } = useParams<{ collectionId: string }>();

  const [collection, setCollection] =
    useState<CollectionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCollection() {
      if (!collectionId) {
        setError("Invalid collection.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await getCollectionDetails(collectionId);

        setCollection(response);
      } catch {
        setError("Could not load the collection.");
      } finally {
        setLoading(false);
      }
    }

    void loadCollection();
  }, [collectionId]);

  if (loading) {
    return <p>Loading collection...</p>;
  }

  if (error || !collection) {
    return (
      <section className="collection-details-page">
        <p className="collection-details-error">
          {error ?? "Collection not found."}
        </p>

        <Link to="/collection">Back to collection</Link>
      </section>
    );
  }

  return (
    <section className="collection-details-page">
      <Link
        className="collection-details-back"
        to="/collection"
      >
        ← Back to collection
      </Link>

      <header className="collection-details-header">
        <div>
          <span>{collection.collectionId}</span>
          <h1>{collection.collectionName}</h1>

          <p>
            {collection.ownedUniqueCards} of {collection.totalCards} cards
            owned
          </p>
        </div>

        <strong>
          {collection.completionPercentage.toFixed(2)}%
        </strong>
      </header>

      <div className="collection-details-progress">
        <span
          style={{
            width: `${Math.min(
              collection.completionPercentage,
              100,
            )}%`,
          }}
        />
      </div>

      <div className="collection-details-grid">
        {collection.cards.map((card) => (
          <Link
            className="collection-details-card"
            key={card.id}
            to={`/collection/${card.id}`}
          >
            <div className="collection-details-image-wrapper">
              {card.imageUrl ? (
                <img
                  src={card.imageUrl}
                  alt={card.name}
                />
              ) : (
                <div className="collection-details-placeholder">
                  No image
                </div>
              )}

              <span>×{card.quantity}</span>

              {card.favorite && (
                <strong
                  className="collection-details-favorite"
                  aria-label="Favorite card"
                >
                  ★
                </strong>
              )}
            </div>

            <div className="collection-details-card-content">
              <div>
                <h2>{card.name}</h2>
                <span>#{card.cardNumber}</span>
              </div>

              <p>{card.rarity ?? "Rarity unavailable"}</p>

              <div className="collection-details-badges">
                <span>
                  {card.language
                    .toLowerCase()
                    .replace("_", " ")}
                </span>

                <span>
                  {card.condition
                    .toLowerCase()
                    .replaceAll("_", " ")}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}