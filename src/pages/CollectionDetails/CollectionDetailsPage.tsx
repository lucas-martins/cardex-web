import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { getCollectionChecklist } from "../../services/cards/cardService";
import {
  createWishlistCard,
  updateWishlistPriority,
  deleteWishlistCard,
} from "../../services/wishlist/wishlistService";
import { AddCardForm } from "../../components/cards/AddCardForm";
import { Modal } from "../../components/ui/Modal";
import type {
  CardCollectionSection,
  CollectionChecklist,
  CollectionChecklistCard,
} from "../../types/collectionChecklist";
import type { WishlistPriority } from "../../types/wishlistCard";

import "./CollectionDetailsPage.css";

type ChecklistFilter = "ALL" | "OWNED" | "MISSING" | "WISHLIST";

type CardSectionFilter = "ALL" | CardCollectionSection;

type ChecklistSort = "CARD_NUMBER" | "NAME_ASC" | "NAME_DESC" | "RARITY";

export function CollectionDetailsPage() {
  const { collectionId } = useParams<{
    collectionId: string;
  }>();

  const [checklist, setChecklist] = useState<CollectionChecklist | null>(null);

  const [filter, setFilter] = useState<ChecklistFilter>("ALL");

  const [sectionFilter, setSectionFilter] = useState<CardSectionFilter>("ALL");

  const [searchTerm, setSearchTerm] = useState("");

  const [rarityFilter, setRarityFilter] = useState("ALL");

  const [sort, setSort] = useState<ChecklistSort>("CARD_NUMBER");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [selectedCard, setSelectedCard] =
    useState<CollectionChecklistCard | null>(null);

  const [addingWishlistId, setAddingWishlistId] = useState<string | null>(null);

  const [updatingWishlistPriorityId, setUpdatingWishlistPriorityId] = useState<
    number | null
  >(null);

  const [removingWishlistId, setRemovingWishlistId] = useState<number | null>(
    null,
  );

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

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  const availableRarities = Array.from(
    new Set(
      checklist?.cards
        .map((card) => card.rarity)
        .filter(
          (rarity): rarity is string =>
            rarity !== null && rarity !== undefined && rarity.trim() !== "",
        ) ?? [],
    ),
  ).sort((firstRarity, secondRarity) =>
    firstRarity.localeCompare(secondRarity),
  );

  const filteredCards =
    checklist?.cards.filter((card) => {
      const matchesStatusFilter =
        filter === "ALL" ||
        (filter === "OWNED" && card.owned) ||
        (filter === "MISSING" && !card.owned) ||
        (filter === "WISHLIST" && card.inWishlist);

      if (!matchesStatusFilter) {
        return false;
      }

      const matchesSectionFilter =
        sectionFilter === "ALL" || card.section === sectionFilter;

      if (!matchesSectionFilter) {
        return false;
      }

      const matchesRarityFilter =
        rarityFilter === "ALL" || card.rarity === rarityFilter;

      if (!matchesRarityFilter) {
        return false;
      }

      if (!normalizedSearchTerm) {
        return true;
      }

      const name = card.name.toLowerCase();

      const cardNumber = card.cardNumber?.toLowerCase() ?? "";

      const rarity = card.rarity?.toLowerCase() ?? "";

      return (
        name.includes(normalizedSearchTerm) ||
        cardNumber.includes(normalizedSearchTerm) ||
        rarity.includes(normalizedSearchTerm)
      );
    }) ?? [];

  const visibleCards = [...filteredCards].sort((firstCard, secondCard) => {
    if (sort === "NAME_ASC") {
      return firstCard.name.localeCompare(secondCard.name);
    }

    if (sort === "NAME_DESC") {
      return secondCard.name.localeCompare(firstCard.name);
    }

    if (sort === "RARITY") {
      const firstRarity = firstCard.rarity ?? "";

      const secondRarity = secondCard.rarity ?? "";

      const rarityComparison = firstRarity.localeCompare(secondRarity);

      if (rarityComparison !== 0) {
        return rarityComparison;
      }

      return compareCardNumbers(firstCard.cardNumber, secondCard.cardNumber);
    }

    return compareCardNumbers(firstCard.cardNumber, secondCard.cardNumber);
  });

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

  async function handleRemoveFromWishlist(card: CollectionChecklistCard) {
    if (card.wishlistId === null || removingWishlistId !== null) {
      return;
    }

    try {
      setRemovingWishlistId(card.wishlistId);

      await deleteWishlistCard(card.wishlistId);

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
                  inWishlist: false,
                  wishlistId: null,
                  wishlistPriority: null,
                }
              : currentCard,
          ),
        };
      });

      toast.success(`${card.name} was removed from your wishlist.`);
    } catch {
      toast.error("Could not remove card from wishlist.");
    } finally {
      setRemovingWishlistId(null);
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

  async function handleWishlistPriorityChange(
    card: CollectionChecklistCard,
    priority: WishlistPriority,
  ) {
    if (card.wishlistId === null || updatingWishlistPriorityId !== null) {
      return;
    }

    try {
      setUpdatingWishlistPriorityId(card.wishlistId);

      const updatedWishlistCard = await updateWishlistPriority(
        card.wishlistId,
        {
          priority,
        },
      );

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
                  wishlistPriority: updatedWishlistCard.priority,
                }
              : currentCard,
          ),
        };
      });

      toast.success(`${card.name} wishlist priority was updated.`);
    } catch {
      toast.error("Could not update wishlist priority.");
    } finally {
      setUpdatingWishlistPriorityId(null);
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

        <Link to="/collections">Back to collections</Link>
      </section>
    );
  }

  return (
    <section className="collection-details-page">
      <Link className="collection-details-back" to="/collections">
        ← Back to collections
      </Link>

      <header className="collection-details-header">
        <div className="collection-details-header-main">
          <div>
            <span>{checklist.collectionId}</span>

            <h1>{checklist.collectionName}</h1>

            <p>
              {checklist.ownedUniqueCards} / {checklist.totalCards} cards
              collected
            </p>
          </div>

          <strong>{checklist.completionPercentage.toFixed(2)}%</strong>
        </div>

        <div className="collection-details-section-progress">
          <div className="collection-details-section-stat">
            <span>Numbered</span>

            <strong>
              {checklist.ownedNumberedCards} / {checklist.numberedCards}
            </strong>

            <small>
              {getProgressPercentage(
                checklist.ownedNumberedCards,
                checklist.numberedCards,
              ).toFixed(2)}
              %
            </small>
          </div>

          <div className="collection-details-section-stat">
            <span>Additional</span>

            <strong>
              {checklist.ownedAdditionalCards} / {checklist.additionalCards}
            </strong>

            <small>
              {getProgressPercentage(
                checklist.ownedAdditionalCards,
                checklist.additionalCards,
              ).toFixed(2)}
              %
            </small>
          </div>
        </div>
      </header>

      <div className="collection-details-progress">
        <span
          style={{
            width: `${Math.min(checklist.completionPercentage, 100)}%`,
          }}
        />
      </div>

      <div className="collection-details-toolbar">
        <div className="collection-details-search">
          <label htmlFor="collection-card-search">Search cards</label>

          <input
            id="collection-card-search"
            type="search"
            value={searchTerm}
            placeholder="Search by name, number or rarity..."
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="collection-details-rarity">
          <label htmlFor="collection-card-rarity">Rarity</label>

          <select
            id="collection-card-rarity"
            value={rarityFilter}
            onChange={(event) => setRarityFilter(event.target.value)}
          >
            <option value="ALL">All rarities</option>

            {availableRarities.map((rarity) => (
              <option key={rarity} value={rarity}>
                {rarity}
              </option>
            ))}
          </select>
        </div>

        <div className="collection-details-sort">
          <label htmlFor="collection-card-sort">Sort by</label>

          <select
            id="collection-card-sort"
            value={sort}
            onChange={(event) => setSort(event.target.value as ChecklistSort)}
          >
            <option value="CARD_NUMBER">Card number</option>

            <option value="NAME_ASC">Name A-Z</option>

            <option value="NAME_DESC">Name Z-A</option>

            <option value="RARITY">Rarity</option>
          </select>
        </div>
      </div>

      <div className="collection-checklist-filter-groups">
        <div className="collection-checklist-filter-group">
          <span className="collection-checklist-filter-label">Status</span>

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
        </div>

        <div className="collection-checklist-filter-group">
          <span className="collection-checklist-filter-label">Set section</span>

          <div className="collection-checklist-filters">
            <button
              type="button"
              className={sectionFilter === "ALL" ? "active" : ""}
              onClick={() => setSectionFilter("ALL")}
            >
              All cards
            </button>

            <button
              type="button"
              className={sectionFilter === "NUMBERED" ? "active" : ""}
              onClick={() => setSectionFilter("NUMBERED")}
            >
              Numbered
            </button>

            <button
              type="button"
              className={sectionFilter === "ADDITIONAL" ? "active" : ""}
              onClick={() => setSectionFilter("ADDITIONAL")}
            >
              Additional
            </button>
          </div>
        </div>
      </div>

      {visibleCards.length === 0 && (
        <p className="collection-details-empty">
          No cards match the selected filters.
        </p>
      )}

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

                        <div className="collection-checklist-wishlist-controls">
                          {card.wishlistPriority && (
                            <select
                              aria-label={`${card.name} wishlist priority`}
                              value={card.wishlistPriority}
                              disabled={
                                updatingWishlistPriorityId ===
                                  card.wishlistId ||
                                removingWishlistId === card.wishlistId
                              }
                              onChange={(event) => {
                                void handleWishlistPriorityChange(
                                  card,
                                  event.target.value as WishlistPriority,
                                );
                              }}
                            >
                              <option value="HIGH">High</option>

                              <option value="MEDIUM">Medium</option>

                              <option value="LOW">Low</option>
                            </select>
                          )}

                          <button
                            type="button"
                            className="collection-checklist-remove-wishlist"
                            disabled={removingWishlistId === card.wishlistId}
                            onClick={() => {
                              void handleRemoveFromWishlist(card);
                            }}
                          >
                            {removingWishlistId === card.wishlistId
                              ? "Removing..."
                              : "Remove"}
                          </button>
                        </div>
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

function compareCardNumbers(
  firstCardNumber: string | null | undefined,
  secondCardNumber: string | null | undefined,
) {
  const first = firstCardNumber ?? "";

  const second = secondCardNumber ?? "";

  return first.localeCompare(second, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function getProgressPercentage(ownedCards: number, totalCards: number) {
  if (totalCards <= 0) {
    return 0;
  }

  return Math.min((ownedCards * 100) / totalCards, 100);
}
