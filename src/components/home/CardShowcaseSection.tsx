import { Link } from "react-router-dom";

import type { Card } from "../../types/card";

interface CardShowcaseSectionProps {
  title: string;
  description: string;
  cards: Card[];
  showFavoriteIndicator?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  emptyActionTo?: string;
}

export function CardShowcaseSection({
  title,
  description,
  cards,
  showFavoriteIndicator = false,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  emptyActionTo,
}: CardShowcaseSectionProps) {
  return (
    <section className="home-recent">
      <div className="home-section-header">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>

        {cards.length > 0 && (
          <Link to="/collection">
            {title === "Recently added" ? "View all" : "View collection"}
          </Link>
        )}
      </div>

      {cards.length === 0 ? (
        emptyTitle &&
        emptyDescription &&
        emptyActionLabel &&
        emptyActionTo && (
          <div className="home-empty-state">
            <h3>{emptyTitle}</h3>

            <p>{emptyDescription}</p>

            <Link to={emptyActionTo}>{emptyActionLabel}</Link>
          </div>
        )
      ) : (
        <div className="home-recent-grid">
          {cards.map((card) => (
            <article className="home-recent-card" key={card.id}>
              <div className="home-recent-image-wrapper">
                {showFavoriteIndicator && (
                  <span
                    className="home-favorite-indicator"
                    aria-label="Favorite card"
                  >
                    ★
                  </span>
                )}

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
      )}
    </section>
  );
}