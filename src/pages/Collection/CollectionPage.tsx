import { useEffect, useState } from "react";
import { findCards } from "../../services/cards/cardService";
import type { Card } from "../../types/card";
import "./CollectionPage.css";

export function CollectionPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCards() {
      try {
        setLoading(true);
        setError(null);

        const response = await findCards({
          page: 0,
          size: 20,
        });

        setCards(response.content);
      } catch {
        setError("Could not load your collection.");
      } finally {
        setLoading(false);
      }
    }

    void loadCards();
  }, []);

  if (loading) {
    return <p>Loading collection...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <section>
      <div className="collection-header">
        <div>
          <h1>My Collection</h1>
          <p>{cards.length} cards found</p>
        </div>
      </div>

      {cards.length === 0 ? (
        <p>Your collection is empty.</p>
      ) : (
        <div className="collection-grid">
          {cards.map((card) => (
            <article className="card-item" key={card.id}>
              {card.imageUrl ? (
                <img
                  className="card-image"
                  src={card.imageUrl}
                  alt={card.name}
                />
              ) : (
                <div className="card-image-placeholder">No image</div>
              )}

              <div className="card-content">
                <h2>{card.name}</h2>
                <p>{card.collectionName}</p>
                <p>#{card.cardNumber}</p>
                <p>Quantity: {card.quantity}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}