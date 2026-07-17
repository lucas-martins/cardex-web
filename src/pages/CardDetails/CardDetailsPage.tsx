import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import type { Card } from "../../types/card";
import {
  findCardById,
  updateFavorite,
} from "../../services/cards/cardService";

import "./CardDetailsPage.css";

export function CardDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingFavorite, setUpdatingFavorite] = useState(false);

  useEffect(() => {
    async function loadCard() {
      const cardId = Number(id);

      if (!Number.isInteger(cardId) || cardId <= 0) {
        toast.error("Invalid card.");
        navigate("/collection", { replace: true });
        return;
      }

      try {
        setLoading(true);

        const response = await findCardById(cardId);

        setCard(response);
      } catch {
        toast.error("Could not load card.");
        navigate("/collection", { replace: true });
      } finally {
        setLoading(false);
      }
    }

    void loadCard();
  }, [id, navigate]);

  async function handleToggleFavorite() {
    if (!card || updatingFavorite) {
      return;
    }

    try {
      setUpdatingFavorite(true);

      const updatedCard = await updateFavorite(card.id, {
        favorite: !card.favorite,
      });

      setCard(updatedCard);

      toast.success(
        updatedCard.favorite
          ? "Added to favorites."
          : "Removed from favorites.",
      );
    } catch {
      toast.error("Could not update favorite.");
    } finally {
      setUpdatingFavorite(false);
    }
  }

  if (loading) {
    return (
      <main className="card-details-page">
        <p className="card-details-message">Loading card...</p>
      </main>
    );
  }

  if (!card) {
    return null;
  }

  return (
    <main className="card-details-page">
      <Link className="card-details-back" to="/collection">
        ← Back to collection
      </Link>

      <section className="card-details-container">
        <div className="card-details-image-column">
          <div className="card-details-image-wrapper">
            {card.imageUrl ? (
              <img
                className="card-details-image"
                src={card.imageUrl}
                alt={card.name}
              />
            ) : (
              <div className="card-details-image-placeholder">
                No image
              </div>
            )}
          </div>
        </div>

        <div className="card-details-content">
          <div className="card-details-heading">
            <div>
              <span className="card-details-collection">
                {card.collectionName}
              </span>

              <h1>{card.name}</h1>

              <p className="card-details-number">
                Card #{card.cardNumber}
              </p>
            </div>

            <button
              type="button"
              className="card-details-favorite"
              disabled={updatingFavorite}
              onClick={() => {
                void handleToggleFavorite();
              }}
              aria-label={
                card.favorite
                  ? "Remove from favorites"
                  : "Add to favorites"
              }
              title={
                card.favorite
                  ? "Remove from favorites"
                  : "Add to favorites"
              }
            >
              {card.favorite ? "★" : "☆"}
            </button>
          </div>

          <dl className="card-details-information">
            <div>
              <dt>Rarity</dt>
              <dd>{card.rarity || "Not informed"}</dd>
            </div>

            <div>
              <dt>Quantity</dt>
              <dd>{card.quantity}</dd>
            </div>

            <div>
              <dt>Language</dt>
              <dd>{card.language}</dd>
            </div>

            <div>
              <dt>Condition</dt>
              <dd>{card.condition}</dd>
            </div>
          </dl>

          <div className="card-details-notes">
            <h2>Notes</h2>

            <p>{card.notes?.trim() || "No notes added."}</p>
          </div>
        </div>
      </section>
    </main>
  );
}