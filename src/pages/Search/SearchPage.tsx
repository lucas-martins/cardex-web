import { type FormEvent, useState } from "react";
import { searchPokemonCards } from "../../services/pokemon/pokemonCardService";
import type { PokemonCardSearchResult } from "../../types/pokemonCard";
import { AddCardForm } from "../../components/cards/AddCardForm";
import { Modal } from "../../components/ui/Modal";
import "./SearchPage.css";
import axios from "axios";
import toast from "react-hot-toast";
import { createWishlistCard } from "../../services/wishlist/wishlistService";

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

  async function handleAddToWishlist(externalId: string) {
    if (addingToWishlistId) {
      return;
    }

    try {
      setAddingToWishlistId(externalId);

      await createWishlistCard({ externalId });

      toast.success("Card added to wishlist.");
    } catch {
      toast.error("Could not add card to wishlist.");
    } finally {
      setAddingToWishlistId(null);
    }
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

              <button type="button" onClick={() => setSelectedCard(card)}>
                Add to collection
              </button>

              <button
                type="button"
                className="search-card-wishlist-button"
                disabled={addingToWishlistId === card.externalId}
                onClick={() => {
                  void handleAddToWishlist(card.externalId);
                }}
              >
                {addingToWishlistId === card.externalId
                  ? "Adding..."
                  : "Add to wishlist"}
              </button>
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
            onSuccess={() => {
              toast.success(
                `${selectedCard.name} was added to your collection.`,
              );

              setSelectedCard(null);
            }}
          />
        </Modal>
      )}
    </section>
  );
}
