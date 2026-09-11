import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import toast from "react-hot-toast";

import type { WishlistCard, WishlistPriority } from "../../types/wishlistCard";
import { formatMarketPrices, formatUsd } from "../../utils/formatMoney";
import {
  deleteWishlistCard,
  findWishlistCards,
  updateWishlistCard,
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

  const [cardToEdit, setCardToEdit] = useState<WishlistCard | null>(null);

  const [editNotes, setEditNotes] = useState("");
  const [editStoreUrl, setEditStoreUrl] = useState("");
  const [editTargetPriceUsd, setEditTargetPriceUsd] = useState("");
  const [editPriority, setEditPriority] = useState<WishlistPriority>("MEDIUM");
  const [savingDetails, setSavingDetails] = useState(false);

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

  const hasUsdPrice = visibleCards.some(
    (card) => card.marketPriceUsd != null,
  );

  const hasEurPrice = visibleCards.some(
    (card) => card.marketPriceEur != null,
  );

  const hasBrlPrice = visibleCards.some(
    (card) => card.marketPriceBrl != null,
  );

  const wishlistValueLabel = formatMarketPrices(
    hasUsdPrice
      ? visibleCards.reduce(
          (total, card) => total + (Number(card.marketPriceUsd) || 0),
          0,
        )
      : null,
    hasEurPrice
      ? visibleCards.reduce(
          (total, card) => total + (Number(card.marketPriceEur) || 0),
          0,
        )
      : null,
    hasBrlPrice
      ? visibleCards.reduce(
          (total, card) => total + (Number(card.marketPriceBrl) || 0),
          0,
        )
      : null,
  );

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

  function handleAddedToCollection(card: WishlistCard) {
    setCards((currentCards) =>
      currentCards.filter((currentCard) => currentCard.id !== card.id),
    );

    setSelectedCard(null);

    toast.success(
      `${card.name} was added to your collection and removed from your wishlist.`,
    );
  }

  function openEditDetails(card: WishlistCard) {
    setCardToEdit(card);
    setEditNotes(card.notes ?? "");
    setEditStoreUrl(card.storeUrl ?? "");
    setEditTargetPriceUsd(
      card.targetPriceUsd != null ? String(card.targetPriceUsd) : "",
    );
    setEditPriority(card.priority);
  }

  async function handleSaveDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!cardToEdit || savingDetails) {
      return;
    }

    const normalizedStoreUrl = editStoreUrl.trim();
    const normalizedNotes = editNotes.trim();
    const normalizedTargetPrice = editTargetPriceUsd.trim();

    let targetPriceUsd: number | null = null;

    if (normalizedTargetPrice) {
      const parsedPrice = Number(normalizedTargetPrice);

      if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
        toast.error("Enter a valid target price.");
        return;
      }

      targetPriceUsd = parsedPrice;
    }

    try {
      setSavingDetails(true);

      const updatedCard = await updateWishlistCard(cardToEdit.id, {
        notes: normalizedNotes || null,
        storeUrl: normalizedStoreUrl || null,
        targetPriceUsd,
        priority: editPriority,
      });

      setCards((currentCards) =>
        currentCards.map((currentCard) =>
          currentCard.id === updatedCard.id ? updatedCard : currentCard,
        ),
      );

      setCardToEdit(null);

      toast.success(`${updatedCard.name} details were updated.`);
    } catch {
      toast.error("Could not update wishlist details.");
    } finally {
      setSavingDetails(false);
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
          <div className="wishlist-header-meta">
            <span className="wishlist-count">
              {hasActiveFilter
                ? `${visibleCards.length} of ${cards.length} cards`
                : `${cards.length} ${cards.length === 1 ? "card" : "cards"}`}
            </span>

            {cards.length > 0 && (
              <span className="wishlist-value">{wishlistValueLabel}</span>
            )}
          </div>
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

                    <p className="wishlist-card-price">
                      {formatMarketPrices(
                        card.marketPriceUsd,
                        card.marketPriceEur,
                        card.marketPriceBrl,
                      )}
                    </p>

                    {(card.notes ||
                      card.storeUrl ||
                      card.targetPriceUsd != null) && (
                      <div className="wishlist-card-details">
                        {card.notes && (
                          <p className="wishlist-card-notes">{card.notes}</p>
                        )}

                        {card.storeUrl && (
                          <a
                            className="wishlist-card-store"
                            href={card.storeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Open store link
                          </a>
                        )}

                        {card.targetPriceUsd != null && (
                          <span className="wishlist-card-target-price">
                            Target: {formatUsd(card.targetPriceUsd)}
                          </span>
                        )}
                      </div>
                    )}

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
                        className="wishlist-edit-button"
                        onClick={() => openEditDetails(card)}
                      >
                        Edit details
                      </button>

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

      {cardToEdit && (
        <Modal
          title={`Edit ${cardToEdit.name}`}
          onClose={() => {
            if (!savingDetails) {
              setCardToEdit(null);
            }
          }}
        >
          <form className="wishlist-edit-form" onSubmit={handleSaveDetails}>
            <label htmlFor="wishlist-notes">Notes</label>

            <textarea
              id="wishlist-notes"
              value={editNotes}
              onChange={(event) => setEditNotes(event.target.value)}
              rows={3}
              maxLength={1000}
              disabled={savingDetails}
            />

            <label htmlFor="wishlist-store-url">Store URL</label>

            <input
              id="wishlist-store-url"
              type="url"
              value={editStoreUrl}
              onChange={(event) => setEditStoreUrl(event.target.value)}
              placeholder="https://..."
              disabled={savingDetails}
            />

            <label htmlFor="wishlist-target-price">Target price (USD)</label>

            <input
              id="wishlist-target-price"
              type="number"
              min="0"
              step="0.01"
              value={editTargetPriceUsd}
              onChange={(event) => setEditTargetPriceUsd(event.target.value)}
              disabled={savingDetails}
            />

            <label htmlFor="wishlist-edit-priority">Priority</label>

            <select
              id="wishlist-edit-priority"
              value={editPriority}
              onChange={(event) =>
                setEditPriority(event.target.value as WishlistPriority)
              }
              disabled={savingDetails}
            >
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <div className="wishlist-edit-actions">
              <button
                type="button"
                className="secondary"
                disabled={savingDetails}
                onClick={() => setCardToEdit(null)}
              >
                Cancel
              </button>

              <button type="submit" disabled={savingDetails}>
                {savingDetails ? "Saving..." : "Save details"}
              </button>
            </div>
          </form>
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
