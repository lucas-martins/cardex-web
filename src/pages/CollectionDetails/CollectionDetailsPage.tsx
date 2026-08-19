import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { getCollectionChecklist } from "../../services/cards/cardService";
import { createWishlistCard } from "../../services/wishlist/wishlistService";
import { AddCardForm } from "../../components/cards/AddCardForm";
import { Modal } from "../../components/ui/Modal";
import type {
  CollectionChecklist,
  CollectionChecklistCard,
} from "../../types/collectionChecklist";

import "./CollectionDetailsPage.css";

type ChecklistFilter = "ALL" | "OWNED" | "MISSING" | "WISHLIST";
export function CollectionDetailsPage() {
  const { collectionId } = useParams<{
    collectionId: string;
  }>();

  const [checklist, setChecklist] = useState<CollectionChecklist | null>(null);

  const [filter, setFilter] = useState<ChecklistFilter>("ALL");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [selectedCard, setSelectedCard] =
    useState<CollectionChecklistCard | null>(null);

  const [addingWishlistId, setAddingWishlistId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadCollection() {
      if (!collectionId) {
        if (active) {
          setError("Invalid collection.");
          setLoading(false);
        }

        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await getCollectionChecklist(collectionId);

        if (!active) {
          return;
        }

        setChecklist(response);
      } catch {
        if (active) {
          setError("Could not load the collection.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadCollection();

    return () => {
      active = false;
    };
  }, [collectionId]);

  const visibleCards =
    checklist?.cards.filter((card) => {
      if (filter === "OWNED") {
        return card.owned;
      }

      if (filter === "MISSING") {
        return !card.owned;
      }

      if (filter === "WISHLIST") {
        return card.inWishlist;
      }

      return true;
    }) ?? [];

  async function handleAddToWishlist(card: CollectionChecklistCard) {
    if (addingWishlistId !== null) {
      return;
    }

    try {
      setAddingWishlistId(card.externalId);

      const wishlistCard = await createWishlistCard({
        externalId: card.externalId,
      });

      setChecklist((currentChecklist) => {
        if (!currentChecklist) {
          return currentChecklist;
        }

        return {
          ...currentChecklist,
          cards: currentChecklist.cards.map((currentCard) =>
            currentCard.externalId === card.externalId
              ? {
                  ...currentCard,
                  inWishlist: true,
                  wishlistId: wishlistCard.id,
                  wishlistPriority: wishlistCard.priority,
                }
              : currentCard,
          ),
        };
      });

      toast.success(`${card.name} was added to your wishlist.`);
    } catch {
      toast.error("Could not add card to wishlist.");
    } finally {
      setAddingWishlistId(null);
    }
  }

  async function handleAddedToCollection(card: CollectionChecklistCard) {
    if (!collectionId) {
      return;
    }

    try {
      const response = await getCollectionChecklist(collectionId);

      setChecklist(response);
      setSelectedCard(null);

      toast.success(`${card.name} was added to your collection.`);
    } catch {
      setSelectedCard(null);

      toast.error(
        `${card.name} was added, but the checklist could not be refreshed.`,
      );
    }
  }

  if (loading) {
    return <p>Loading collection checklist...</p>;
  }

  if (error || !checklist) {
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
      <Link className="collection-details-back" to="/collection">
        ← Back to collection
      </Link>

      <header className="collection-details-header">
        <div>
          <span>{checklist.collectionId}</span>

          <h1>{checklist.collectionName}</h1>

          <p>
            {checklist.ownedUniqueCards} / {checklist.totalCards} cards
            collected
          </p>
        </div>

        <strong>{checklist.completionPercentage.toFixed(2)}%</strong>
      </header>

      <div className="collection-details-progress">
        <span
          style={{
            width: `${Math.min(checklist.completionPercentage, 100)}%`,
          }}
        />
      </div>

      <div className="collection-checklist-filters">
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

        <button
          type="button"
          className={filter === "WISHLIST" ? "active" : ""}
          onClick={() => setFilter("WISHLIST")}
        >
          Wishlist
        </button>
      </div>

      <div className="collection-details-grid">
        {visibleCards.map((card) => {
          const content = (
            <>
              <div className="collection-details-image-wrapper">
                {card.imageUrl ? (
                  <img src={card.imageUrl} alt={card.name} />
                ) : (
                  <div className="collection-details-placeholder">No image</div>
                )}

                <span
                  className={`collection-checklist-status ${
                    card.owned ? "owned" : "missing"
                  }`}
                >
                  {card.owned ? "Owned" : "Missing"}
                </span>
              </div>

              <div className="collection-details-card-content">
                <div>
                  <h2>{card.name}</h2>

                  <span>#{card.cardNumber}</span>
                </div>

                <p>{card.rarity ?? "Rarity unavailable"}</p>

                {!card.owned && (
                  <div className="collection-checklist-actions">
                    <button
                      type="button"
                      className="collection-checklist-add-button"
                      onClick={() => {
                        setSelectedCard(card);
                      }}
                    >
                      Add to collection
                    </button>

                    {card.inWishlist ? (
                      <div className="collection-checklist-in-wishlist">
                        <span>✓ In wishlist</span>

                        {card.wishlistPriority && (
                          <strong>
                            {card.wishlistPriority.charAt(0)}
                            {card.wishlistPriority.slice(1).toLowerCase()}
                          </strong>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="collection-checklist-wishlist-button"
                        disabled={addingWishlistId === card.externalId}
                        onClick={() => {
                          void handleAddToWishlist(card);
                        }}
                      >
                        {addingWishlistId === card.externalId
                          ? "Adding..."
                          : "Add to wishlist"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          );

          if (card.owned && card.cardId !== null) {
            return (
              <Link
                className="collection-details-card"
                key={card.externalId}
                to={`/collection/${card.cardId}`}
              >
                {content}
              </Link>
            );
          }

          return (
            <article
              className="collection-details-card missing"
              key={card.externalId}
            >
              {content}
            </article>
          );
        })}
      </div>

      {selectedCard && (
        <Modal
          title={`Add ${selectedCard.name}`}
          onClose={() => setSelectedCard(null)}
        >
          <AddCardForm
            externalId={selectedCard.externalId}
            onCancel={() => setSelectedCard(null)}
            onSuccess={() => {
              void handleAddedToCollection(selectedCard);
            }}
          />
        </Modal>
      )}
    </section>
  );
}
