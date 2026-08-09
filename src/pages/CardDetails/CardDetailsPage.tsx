import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import type { Card, CardCondition, CardLanguage } from "../../types/card";
import {
  deleteCard,
  findCardById,
  updateCard,
  updateFavorite,
} from "../../services/cards/cardService";
import { EditCardForm } from "../../components/cards/EditCardForm";
import { DeleteCardConfirmation } from "../../components/cards/DeleteCardConfirmation";
import { Modal } from "../../components/ui/Modal";

import "./CardDetailsPage.css";

export function CardDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingFavorite, setUpdatingFavorite] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  async function handleUpdateCard(values: {
    quantity: number;
    language: CardLanguage;
    condition: CardCondition;
    notes?: string;
  }) {
    if (!card) {
      return;
    }

    try {
      setSaving(true);

      const updatedCard = await updateCard(card.id, values);

      setCard(updatedCard);
      setEditing(false);

      toast.success(`${updatedCard.name} was updated.`);
    } catch {
      toast.error("Could not update the card.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCard() {
    if (!card) {
      return;
    }

    try {
      setDeleting(true);

      await deleteCard(card.id);

      toast.success(`${card.name} was removed from your collection.`);

      navigate("/collection", {
        replace: true,
      });
    } catch {
      toast.error("Could not remove the card from your collection.");
    } finally {
      setDeleting(false);
    }
  }

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
              <div className="card-details-image-placeholder">No image</div>
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

              <p className="card-details-number">Card #{card.cardNumber}</p>
            </div>

            <button
              type="button"
              className="card-details-favorite"
              disabled={updatingFavorite}
              onClick={() => {
                void handleToggleFavorite();
              }}
              aria-label={
                card.favorite ? "Remove from favorites" : "Add to favorites"
              }
              title={
                card.favorite ? "Remove from favorites" : "Add to favorites"
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

          <div className="card-details-actions">
            <button
              type="button"
              className="card-details-edit-button"
              onClick={() => setEditing(true)}
            >
              Edit card
            </button>

            <button
              type="button"
              className="card-details-remove-button"
              onClick={() => setConfirmingDelete(true)}
            >
              Remove card
            </button>
          </div>
        </div>
      </section>

      {editing && (
        <Modal
          title="Edit card"
          onClose={() => {
            if (!saving) {
              setEditing(false);
            }
          }}
        >
          <EditCardForm
            card={card}
            saving={saving}
            onCancel={() => setEditing(false)}
            onSubmit={(values) => {
              void handleUpdateCard(values);
            }}
          />
        </Modal>
      )}

      {confirmingDelete && (
        <Modal
          title="Remove card"
          onClose={() => {
            if (!deleting) {
              setConfirmingDelete(false);
            }
          }}
        >
          <DeleteCardConfirmation
            cardName={card.name}
            deleting={deleting}
            onCancel={() => setConfirmingDelete(false)}
            onConfirm={() => {
              void handleDeleteCard();
            }}
          />
        </Modal>
      )}
    </main>
  );
}
