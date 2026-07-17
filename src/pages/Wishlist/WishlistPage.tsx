import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import type { WishlistCard } from "../../types/wishlistCard";
import {
  deleteWishlistCard,
  findWishlistCards,
} from "../../services/wishlist/wishlistService";
import { AddCardForm } from "../../components/cards/AddCardForm";
import { Modal } from "../../components/ui/Modal";

import "./WishlistPage.css";

export function WishlistPage() {
  const [cards, setCards] = useState<WishlistCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedCard, setSelectedCard] = useState<WishlistCard | null>(null);

  useEffect(() => {
    async function loadWishlist() {
      try {
        setLoading(true);

        const response = await findWishlistCards();

        setCards(response);
      } catch {
        toast.error("Could not load wishlist.");
      } finally {
        setLoading(false);
      }
    }

    void loadWishlist();
  }, []);

  async function handleDelete(card: WishlistCard) {
    const confirmed = window.confirm(`Remove ${card.name} from your wishlist?`);

    if (!confirmed || deletingId !== null) {
      return;
    }

    try {
      setDeletingId(card.id);

      await deleteWishlistCard(card.id);

      setCards((currentCards) =>
        currentCards.filter((currentCard) => currentCard.id !== card.id),
      );

      toast.success("Card removed from wishlist.");
    } catch {
      toast.error("Could not remove card from wishlist.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleAddedToCollection(card: WishlistCard) {
    try {
      await deleteWishlistCard(card.id);

      setCards((currentCards) =>
        currentCards.filter((currentCard) => currentCard.id !== card.id),
      );

      setSelectedCard(null);

      toast.success(
        `${card.name} was added to your collection and removed from your wishlist.`,
      );
    } catch {
      setSelectedCard(null);

      toast.error(
        `${card.name} was added to your collection, but could not be removed from your wishlist.`,
      );
    }
  }

  return (
    <main className="wishlist-page">
      <div className="wishlist-header">
        <div>
          <h1>Wishlist</h1>
          <p>Cards you want to add to your collection.</p>
        </div>

        {!loading && (
          <span className="wishlist-count">
            {cards.length} {cards.length === 1 ? "card" : "cards"}
          </span>
        )}
      </div>

      {loading && <p className="wishlist-message">Loading wishlist...</p>}

      {!loading && cards.length === 0 && (
        <section className="wishlist-empty">
          <h2>Your wishlist is empty</h2>
          <p>Search for Pokémon cards and add the ones you want here.</p>
        </section>
      )}

      {!loading && cards.length > 0 && (
        <section className="wishlist-grid">
          {cards.map((card) => (
            <article className="wishlist-card" key={card.id}>
              <div className="wishlist-card-image-wrapper">
                {card.imageUrl ? (
                  <img
                    className="wishlist-card-image"
                    src={card.imageUrl}
                    alt={card.name}
                  />
                ) : (
                  <div className="wishlist-card-image-placeholder">
                    No image
                  </div>
                )}
              </div>

              <div className="wishlist-card-content">
                <h2>{card.name}</h2>

                <p>{card.collectionName || "Unknown collection"}</p>

                <span>
                  {card.cardNumber
                    ? `#${card.cardNumber}`
                    : "Number not informed"}
                </span>

                <span>{card.rarity || "Rarity not informed"}</span>

                <div className="wishlist-card-actions">
                  <button
                    type="button"
                    className="wishlist-add-button"
                    onClick={() => setSelectedCard(card)}
                  >
                    Add to collection
                  </button>

                  <button
                    type="button"
                    className="wishlist-remove-button"
                    disabled={deletingId === card.id}
                    onClick={() => {
                      void handleDelete(card);
                    }}
                  >
                    {deletingId === card.id
                      ? "Removing..."
                      : "Remove from wishlist"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {selectedCard && (
        <Modal
          title={`Add ${selectedCard.name}`}
          onClose={() => setSelectedCard(null)}
        >
          <AddCardForm
            externalId={selectedCard.externalId}
            onCancel={() => setSelectedCard(null)}
            onSuccess={() => handleAddedToCollection(selectedCard)}
          />
        </Modal>
      )}
    </main>
  );
}
