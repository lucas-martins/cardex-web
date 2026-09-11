import { type FormEvent, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import { AddCardForm } from "../../components/cards/AddCardForm";
import { Modal } from "../../components/ui/Modal";
import {
  findPokemonCollections,
  searchPokemonCards,
} from "../../services/pokemon/pokemonCardService";
import {
  createWishlistCard,
  deleteWishlistCard,
  updateWishlistPriority,
} from "../../services/wishlist/wishlistService";
import type {
  PokemonCardSearchResult,
  PokemonCollection,
} from "../../types/pokemonCard";
import { formatMarketPrices } from "../../utils/formatMoney";

import "./SearchPage.css";

const PAGE_SIZE = 20;

const RARITY_OPTIONS = [
  "Common",
  "Uncommon",
  "Rare",
  "Rare Holo",
  "Rare Holo EX",
  "Rare Holo GX",
  "Rare Holo V",
  "Rare Holo VMAX",
  "Rare Ultra",
  "Rare Secret",
  "Illustration Rare",
  "Special Illustration Rare",
  "Hyper Rare",
  "Promo",
];

interface SearchFilters {
  name: string;
  setId: string;
  number: string;
  rarity: string;
}

const EMPTY_FILTERS: SearchFilters = {
  name: "",
  setId: "",
  number: "",
  rarity: "",
};

export function SearchPage() {
  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<SearchFilters>(EMPTY_FILTERS);
  const [collections, setCollections] = useState<PokemonCollection[]>([]);
  const [cards, setCards] = useState<PokemonCardSearchResult[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [lastPage, setLastPage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] =
    useState<PokemonCardSearchResult | null>(null);
  const [addingToWishlistId, setAddingToWishlistId] = useState<string | null>(
    null,
  );
  const [updatingWishlistId, setUpdatingWishlistId] = useState<number | null>(
    null,
  );
  const [removingWishlistId, setRemovingWishlistId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    async function loadCollections() {
      try {
        const response = await findPokemonCollections();
        setCollections(response);
      } catch {
        setCollections([]);
      }
    }

    void loadCollections();
  }, []);

  function hasAnyFilter(value: SearchFilters) {
    return Boolean(
      value.name.trim() ||
        value.setId.trim() ||
        value.number.trim() ||
        value.rarity.trim(),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasAnyFilter(filters)) {
      setError("Enter a name, set, number, or rarity to search.");
      setCards([]);
      setSearched(false);
      return;
    }

    setSelectedCard(null);

    const nextFilters: SearchFilters = {
      name: filters.name.trim(),
      setId: filters.setId.trim(),
      number: filters.number.trim(),
      rarity: filters.rarity.trim(),
    };

    try {
      setLoading(true);
      setError(null);

      const response = await searchPokemonCards({
        name: nextFilters.name,
        setId: nextFilters.setId,
        number: nextFilters.number,
        rarity: nextFilters.rarity,
        page: 1,
        size: PAGE_SIZE,
      });

      setFilters(nextFilters);
      setAppliedFilters(nextFilters);
      setCards(response.content);
      setCurrentPage(response.page);
      setTotalElements(response.totalElements);
      setLastPage(response.last);
      setSearched(true);
    } catch (requestError) {
      setCards([]);
      setTotalElements(0);
      setLastPage(true);
      setSearched(true);

      if (
        axios.isAxiosError(requestError) &&
        requestError.code === "ECONNABORTED"
      ) {
        setError("The search took too long. Please try again.");
      } else {
        setError("Could not search for cards.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadMore() {
    if (loadingMore || lastPage) {
      return;
    }

    try {
      setLoadingMore(true);
      setError(null);

      const response = await searchPokemonCards({
        name: appliedFilters.name,
        setId: appliedFilters.setId,
        number: appliedFilters.number,
        rarity: appliedFilters.rarity,
        page: currentPage + 1,
        size: PAGE_SIZE,
      });

      setCards((currentCards) => [...currentCards, ...response.content]);
      setCurrentPage(response.page);
      setLastPage(response.last);
      setTotalElements(response.totalElements);
    } catch (requestError) {
      if (
        axios.isAxiosError(requestError) &&
        requestError.code === "ECONNABORTED"
      ) {
        setError("Loading more cards took too long. Please try again.");
      } else {
        setError("Could not load more cards.");
      }
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleAddToWishlist(card: PokemonCardSearchResult) {
    if (addingToWishlistId !== null) {
      return;
    }

    try {
      setAddingToWishlistId(card.externalId);

      const wishlistCard = await createWishlistCard({
        externalId: card.externalId,
      });

      setCards((currentCards) =>
        currentCards.map((currentCard) =>
          currentCard.externalId === card.externalId
            ? {
                ...currentCard,
                inWishlist: true,
                wishlistId: wishlistCard.id,
                wishlistPriority: wishlistCard.priority,
              }
            : currentCard,
        ),
      );

      toast.success(`${card.name} was added to your wishlist.`);
    } catch {
      toast.error("Could not add card to wishlist.");
    } finally {
      setAddingToWishlistId(null);
    }
  }

  async function handleWishlistPriorityChange(
    card: PokemonCardSearchResult,
    priority: PokemonCardSearchResult["wishlistPriority"],
  ) {
    if (
      card.wishlistId === null ||
      priority === null ||
      updatingWishlistId !== null
    ) {
      return;
    }

    try {
      setUpdatingWishlistId(card.wishlistId);

      const updatedWishlistCard = await updateWishlistPriority(
        card.wishlistId,
        {
          priority,
        },
      );

      setCards((currentCards) =>
        currentCards.map((currentCard) =>
          currentCard.externalId === card.externalId
            ? {
                ...currentCard,
                wishlistPriority: updatedWishlistCard.priority,
              }
            : currentCard,
        ),
      );

      toast.success(`${card.name} wishlist priority was updated.`);
    } catch {
      toast.error("Could not update wishlist priority.");
    } finally {
      setUpdatingWishlistId(null);
    }
  }

  async function handleRemoveFromWishlist(card: PokemonCardSearchResult) {
    if (card.wishlistId === null || removingWishlistId !== null) {
      return;
    }

    try {
      setRemovingWishlistId(card.wishlistId);

      await deleteWishlistCard(card.wishlistId);

      setCards((currentCards) =>
        currentCards.map((currentCard) =>
          currentCard.externalId === card.externalId
            ? {
                ...currentCard,
                inWishlist: false,
                wishlistId: null,
                wishlistPriority: null,
              }
            : currentCard,
        ),
      );

      toast.success(`${card.name} was removed from your wishlist.`);
    } catch {
      toast.error("Could not remove card from wishlist.");
    } finally {
      setRemovingWishlistId(null);
    }
  }

  function handleAddedToCollection(card: PokemonCardSearchResult) {
    setCards((currentCards) =>
      currentCards.map((currentCard) =>
        currentCard.externalId === card.externalId
          ? {
              ...currentCard,
              owned: true,
              inWishlist: false,
              wishlistId: null,
              wishlistPriority: null,
            }
          : currentCard,
      ),
    );

    toast.success(`${card.name} was added to your collection.`);
    setSelectedCard(null);
  }

  return (
    <section>
      <div className="search-header">
        <h1>Search Cards</h1>
        <p>
          Find a Pokémon card by name, set, number, or rarity and add it to your
          collection.
        </p>
      </div>

      <form className="search-form" onSubmit={handleSubmit}>
        <div className="search-filters">
          <label>
            <span>Name</span>
            <input
              type="search"
              aria-label="Card name"
              value={filters.name}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder="Example: Charizard"
            />
          </label>

          <label>
            <span>Set</span>
            <select
              aria-label="Set"
              value={filters.setId}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  setId: event.target.value,
                }))
              }
            >
              <option value="">Any set</option>
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Number</span>
            <input
              type="text"
              aria-label="Card number"
              value={filters.number}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  number: event.target.value,
                }))
              }
              placeholder="Example: 4"
            />
          </label>

          <label>
            <span>Rarity</span>
            <select
              aria-label="Rarity"
              value={filters.rarity}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  rarity: event.target.value,
                }))
              }
            >
              <option value="">Any rarity</option>
              {RARITY_OPTIONS.map((rarity) => (
                <option key={rarity} value={rarity}>
                  {rarity}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="search-form-actions">
          <button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>

          <button
            type="button"
            className="search-clear-button"
            disabled={loading}
            onClick={() => setFilters(EMPTY_FILTERS)}
          >
            Clear filters
          </button>
        </div>
      </form>

      {error && <p className="search-message error">{error}</p>}

      {!loading && searched && !error && cards.length === 0 && (
        <div className="search-empty">
          <h2>No cards found</h2>
          <p>Try another name, set, number, or rarity combination.</p>
        </div>
      )}

      {!loading && searched && cards.length > 0 && (
        <p className="search-summary">
          Showing {cards.length} of {totalElements} cards
        </p>
      )}

      <div className="search-results">
        {cards.map((card) => (
          <article className="search-card" key={card.externalId}>
            {card.imageUrl ? (
              <img
                className="search-card-image"
                src={card.imageUrl}
                alt={card.name}
              />
            ) : (
              <div className="search-card-image-placeholder">No image</div>
            )}

            <div className="search-card-content">
              <h2>{card.name}</h2>
              <p>{card.collectionName}</p>
              <p>#{card.cardNumber}</p>
              <p>{card.rarity ?? "Rarity not available"}</p>
              <p className="search-card-price">
                {formatMarketPrices(
                  card.marketPriceUsd,
                  card.marketPriceEur,
                  card.marketPriceBrl,
                )}
              </p>

              <div className="search-card-actions">
                {card.owned ? (
                  <div className="search-card-owned">✓ In collection</div>
                ) : (
                  <button type="button" onClick={() => setSelectedCard(card)}>
                    Add to collection
                  </button>
                )}

                {card.inWishlist ? (
                  <div className="search-card-in-wishlist">
                    <span>✓ In wishlist</span>
                    <div className="search-card-wishlist-controls">
                      {card.wishlistPriority && (
                        <select
                          aria-label={`${card.name} wishlist priority`}
                          value={card.wishlistPriority}
                          disabled={
                            updatingWishlistId === card.wishlistId ||
                            removingWishlistId === card.wishlistId
                          }
                          onChange={(event) => {
                            void handleWishlistPriorityChange(
                              card,
                              event.target
                                .value as PokemonCardSearchResult["wishlistPriority"],
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
                        className="search-card-remove-wishlist"
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
                    className="search-card-wishlist-button"
                    disabled={addingToWishlistId === card.externalId}
                    onClick={() => {
                      void handleAddToWishlist(card);
                    }}
                  >
                    {addingToWishlistId === card.externalId
                      ? "Adding..."
                      : "Add to wishlist"}
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {!lastPage && cards.length > 0 && (
        <div className="search-load-more">
          <button
            type="button"
            disabled={loadingMore}
            onClick={() => {
              void handleLoadMore();
            }}
          >
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
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
    </section>
  );
}
