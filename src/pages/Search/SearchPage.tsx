import { type FormEvent, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import { AddCardForm } from "../../components/cards/AddCardForm";
import { Modal } from "../../components/ui/Modal";
import { searchPokemonCards } from "../../services/pokemon/pokemonCardService";
import {
  createWishlistCard,
  deleteWishlistCard,
  updateWishlistPriority,
} from "../../services/wishlist/wishlistService";
import type { PokemonCardSearchResult } from "../../types/pokemonCard";

import "./SearchPage.css";

const PAGE_SIZE = 20;

export function SearchPage() {
  const [name, setName] = useState("");

  const [searchedName, setSearchedName] = useState("");

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedName = name.trim();

    if (!normalizedName) {
      setError("Enter a card name.");
      setCards([]);
      setSearched(false);
      return;
    }

    setSelectedCard(null);

    try {
      setLoading(true);
      setError(null);

      const response = await searchPokemonCards({
        name: normalizedName,
        page: 1,
        size: PAGE_SIZE,
      });

      setSearchedName(normalizedName);
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
        name: searchedName,
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

        <p>Find a Pokémon card and add it to your collection.</p>
      </div>

      <form className="search-form" onSubmit={handleSubmit}>
        <input
          type="search"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Example: Charizard"
          aria-label="Card name"
        />

        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <p className="search-message error">{error}</p>}

      {!loading && searched && !error && cards.length === 0 && (
        <p className="search-message">No cards found.</p>
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

      {cards.length > 0 && !lastPage && (
        <div className="load-more-container">
          <button
            className="load-more-button"
            type="button"
            onClick={handleLoadMore}
            disabled={loadingMore}
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
