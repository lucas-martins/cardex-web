import { useEffect, useState } from "react";
import { findCards, deleteCard, updateCardQuantity } from "../../services/cards/cardService";
import type {
  Card,
  CardCondition,
  CardLanguage,
} from "../../types/card";
import "./CollectionPage.css";
import toast from "react-hot-toast";
import { DeleteCardConfirmation } from "../../components/cards/DeleteCardConfirmation";
import { EditCardQuantityForm } from "../../components/cards/EditCardQuantityForm";
import { Modal } from "../../components/ui/Modal";

function formatLanguage(language: CardLanguage) {
  const labels: Record<CardLanguage, string> = {
    ENGLISH: "English",
    PORTUGUESE: "Portuguese",
    JAPANESE: "Japanese",
    SPANISH: "Spanish",
    FRENCH: "French",
    GERMAN: "German",
    ITALIAN: "Italian",
    KOREAN: "Korean",
    CHINESE: "Chinese",
  };

  return labels[language];
}

function formatCondition(condition: CardCondition) {
  const labels: Record<CardCondition, string> = {
    MINT: "Mint",
    NEAR_MINT: "Near Mint",
    EXCELLENT: "Excellent",
    GOOD: "Good",
    LIGHTLY_PLAYED: "Lightly Played",
    PLAYED: "Played",
    POOR: "Poor",
  };

  return labels[condition];
}

export function CollectionPage() {
    const [cards, setCards] = useState<Card[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cardToDelete, setCardToDelete] = useState<Card | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [cardToEdit, setCardToEdit] = useState<Card | null>(null);
    const [savingQuantity, setSavingQuantity] = useState(false);

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
        setTotalElements(response.totalElements);
      } catch {
        setError("Could not load your collection.");
      } finally {
        setLoading(false);
      }
    }

    void loadCards();
  }, []);

  async function handleDeleteCard() {
    if (!cardToDelete) {
      return;
    }

    try {
      setDeleting(true);

      await deleteCard(cardToDelete.id);

      setCards((currentCards) =>
        currentCards.filter((card) => card.id !== cardToDelete.id),
      );

      setTotalElements((currentTotal) =>
        Math.max(currentTotal - 1, 0),
      );

      toast.success(
        `${cardToDelete.name} was removed from your collection.`,
      );

      setCardToDelete(null);
    } catch {
      toast.error("Could not remove the card from your collection.");
    } finally {
      setDeleting(false);
    }
  }

  async function handleUpdateQuantity(quantity: number) {
    if (!cardToEdit) {
        return;
    }

    try {
        setSavingQuantity(true);

        const updatedCard = await updateCardQuantity(
        cardToEdit.id,
        { quantity },
        );

        setCards((currentCards) =>
        currentCards.map((card) =>
            card.id === updatedCard.id ? updatedCard : card,
        ),
        );

        toast.success(
        `${updatedCard.name} quantity was updated.`,
        );

        setCardToEdit(null);
    } catch {
        toast.error("Could not update the card quantity.");
    } finally {
        setSavingQuantity(false);
    }
  }

  if (loading) {
    return <p>Loading collection...</p>;
  }

  if (error) {
    return <p className="collection-message error">{error}</p>;
  }

  return (
    <section>
      <div className="collection-header">
        <div>
          <h1>My Collection</h1>
          <p>
            {totalElements} {totalElements === 1 ? "card" : "cards"} found
          </p>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="collection-empty">
          <h2>Your collection is empty</h2>
          <p>Search for Pokémon cards and add your first one.</p>
        </div>
      ) : (
        <div className="collection-grid">
          {cards.map((card) => (
            <article className="collection-card" key={card.id}>
              <div className="collection-card-image-wrapper">
                {card.imageUrl ? (
                  <img
                    className="collection-card-image"
                    src={card.imageUrl}
                    alt={card.name}
                  />
                ) : (
                  <div className="collection-card-image-placeholder">
                    No image
                  </div>
                )}

                <span className="quantity-badge">
                  ×{card.quantity}
                </span>
              </div>

              <div className="collection-card-content">
                <div className="collection-card-title">
                  <div>
                    <h2>{card.name}</h2>
                    <p>{card.collectionName}</p>
                  </div>

                  <span className="card-number">
                    #{card.cardNumber}
                  </span>
                </div>

                <div className="collection-card-badges">
                  <span>{formatLanguage(card.language)}</span>
                  <span>{formatCondition(card.condition)}</span>

                  {card.rarity && <span>{card.rarity}</span>}
                </div>

                {card.notes && (
                  <p className="collection-card-notes">
                    {card.notes}
                  </p>
                )}

                <div className="collection-card-actions">
                    <button
                    type="button"
                    onClick={() => setCardToEdit(card)}
                    >
                    Edit
                    </button>

                    <button
                    type="button"
                    onClick={() => setCardToDelete(card)}
                    >
                    Remove
                    </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {cardToDelete && (
        <Modal
          title="Remove card"
          onClose={() => {
            if (!deleting) {
              setCardToDelete(null);
            }
          }}
        >
          <DeleteCardConfirmation
            cardName={cardToDelete.name}
            deleting={deleting}
            onCancel={() => setCardToDelete(null)}
            onConfirm={() => {
              void handleDeleteCard();
            }}
          />
        </Modal>
      )}

      {cardToEdit && (
        <Modal
            title="Edit card"
            onClose={() => {
            if (!savingQuantity) {
                setCardToEdit(null);
            }
            }}
        >
            <EditCardQuantityForm
            card={cardToEdit}
            saving={savingQuantity}
            onCancel={() => setCardToEdit(null)}
            onSubmit={(quantity) => {
                void handleUpdateQuantity(quantity);
            }}
            />
        </Modal>
      )}
    </section>
  );
}