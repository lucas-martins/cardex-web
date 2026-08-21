import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import type { WishlistCard, WishlistPriority } from "../../types/wishlistCard";
import {
  deleteWishlistCard,
  findWishlistCards,
  updateWishlistPriority,
} from "../../services/wishlist/wishlistService";
import { AddCardForm } from "../../components/cards/AddCardForm";
import { Modal } from "../../components/ui/Modal";

import "./WishlistPage.css";

type PriorityFilter = "ALL" | WishlistPriority;

type WishlistSort = "PRIORITY_DESC" | "PRIORITY_ASC" | "RECENT";

const PRIORITY_ORDER: Record<WishlistPriority, number> = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

export function WishlistPage() {
  const [cards, setCards] = useState<WishlistCard[]>([]);

  const [loading, setLoading] = useState(true);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [selectedCard, setSelectedCard] = useState<WishlistCard | null>(null);

  const [cardToRemove, setCardToRemove] = useState<WishlistCard | null>(null);

  const [updatingPriorityId, setUpdatingPriorityId] = useState<number | null>(
    null,
  );

  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("ALL");

  const [sort, setSort] = useState<WishlistSort>("PRIORITY_DESC");

  const [searchTerm, setSearchTerm] = useState("");

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

  const visibleCards = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return cards
      .filter((card) => {
        const matchesPriority =
          priorityFilter === "ALL" || card.priority === priorityFilter;

        if (!matchesPriority) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        const nameMatches = card.name.toLowerCase().includes(normalizedSearch);

        const collectionMatches =
          card.collectionName?.toLowerCase().includes(normalizedSearch) ??
          false;

        const numberMatches =
          card.cardNumber?.toLowerCase().includes(normalizedSearch) ?? false;

        return nameMatches || collectionMatches || numberMatches;
      })
      .sort((first, second) => {
        if (sort === "PRIORITY_DESC") {
          const priorityComparison =
            PRIORITY_ORDER[second.priority] - PRIORITY_ORDER[first.priority];

          if (priorityComparison !== 0) {
            return priorityComparison;
          }
        }

        if (sort === "PRIORITY_ASC") {
          const priorityComparison =
            PRIORITY_ORDER[first.priority] - PRIORITY_ORDER[second.priority];

          if (priorityComparison !== 0) {
            return priorityComparison;
          }
        }

        return (
          new Date(second.createdAt).getTime() -
          new Date(first.createdAt).getTime()
        );
      });
  }, [cards, priorityFilter, searchTerm, sort]);

  const hasActiveFilter =
    priorityFilter !== "ALL" || searchTerm.trim().length > 0;

  async function handleDelete() {
    if (!cardToRemove || deletingId !== null) {
      return;
    }

    try {
      setDeletingId(cardToRemove.id);

      await deleteWishlistCard(cardToRemove.id);

      setCards((currentCards) =>
        currentCards.filter(
          (currentCard) => currentCard.id !== cardToRemove.id,
        ),
      );

      toast.success("Card removed from wishlist.");

      setCardToRemove(null);
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

  async function handlePriorityChange(
    card: WishlistCard,
    priority: WishlistPriority,
  ) {
    if (updatingPriorityId !== null) {
      return;
    }

    try {
      setUpdatingPriorityId(card.id);

      const updatedCard = await updateWishlistPriority(card.id, {
        priority,
      });

      setCards((currentCards) =>
        currentCards.map((currentCard) =>
          currentCard.id === updatedCard.id ? updatedCard : currentCard,
        ),
      );

      toast.success(`${card.name} priority was updated.`);
    } catch {
      toast.error("Could not update wishlist priority.");
    } finally {
      setUpdatingPriorityId(null);
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
            {hasActiveFilter
              ? `${visibleCards.length} of ${cards.length} cards`
              : `${cards.length} ${cards.length === 1 ? "card" : "cards"}`}
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
        <>
          <section className="wishlist-toolbar">
            <div className="wishlist-search">
              <label htmlFor="wishlist-search">Search</label>

              <input
                id="wishlist-search"
                type="search"
                value={searchTerm}
                placeholder="Card, collection or number..."
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <div className="wishlist-filter-group">
              <span>Priority</span>

              <div className="wishlist-filter-buttons">
                <button
                  type="button"
                  className={priorityFilter === "ALL" ? "active" : ""}
                  onClick={() => setPriorityFilter("ALL")}
                >
                  All
                </button>

                <button
                  type="button"
                  className={priorityFilter === "HIGH" ? "active" : ""}
                  onClick={() => setPriorityFilter("HIGH")}
                >
                  High
                </button>

                <button
                  type="button"
                  className={priorityFilter === "MEDIUM" ? "active" : ""}
                  onClick={() => setPriorityFilter("MEDIUM")}
                >
                  Medium
                </button>

                <button
                  type="button"
                  className={priorityFilter === "LOW" ? "active" : ""}
                  onClick={() => setPriorityFilter("LOW")}
                >
                  Low
                </button>
              </div>
            </div>

            <label className="wishlist-sort">
              <span>Sort by</span>

              <select
                value={sort}
                onChange={(event) =>
                  setSort(event.target.value as WishlistSort)
                }
              >
                <option value="PRIORITY_DESC">Priority: High to Low</option>

                <option value="PRIORITY_ASC">Priority: Low to High</option>

                <option value="RECENT">Recently added</option>
              </select>
            </label>
          </section>

          {visibleCards.length === 0 ? (
            <section className="wishlist-filter-empty">
              <h2>No cards found</h2>

              <p>No wishlist cards match your current filters.</p>

              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setPriorityFilter("ALL");
                }}
              >
                Clear filters
              </button>
            </section>
          ) : (
            <section className="wishlist-grid">
              {visibleCards.map((card) => (
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

                    <label className="wishlist-priority">
                      <span>Priority</span>

                      <select
                        value={card.priority}
                        disabled={updatingPriorityId === card.id}
                        onChange={(event) => {
                          void handlePriorityChange(
                            card,
                            event.target.value as WishlistPriority,
                          );
                        }}
                      >
                        <option value="HIGH">High</option>

                        <option value="MEDIUM">Medium</option>

                        <option value="LOW">Low</option>
                      </select>
                    </label>

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
                        onClick={() => setCardToRemove(card)}
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
        </>
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

      {cardToRemove && (
        <Modal
          title="Remove from wishlist"
          onClose={() => {
            if (deletingId === null) {
              setCardToRemove(null);
            }
          }}
        >
          <div className="wishlist-remove-confirmation">
            <p>
              Are you sure you want to remove{" "}
              <strong>{cardToRemove.name}</strong> from your wishlist?
            </p>

            <div className="wishlist-remove-actions">
              <button
                type="button"
                className="secondary"
                disabled={deletingId !== null}
                onClick={() => setCardToRemove(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="danger"
                disabled={deletingId !== null}
                onClick={() => {
                  void handleDelete();
                }}
              >
                {deletingId !== null ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </main>
  );
}
