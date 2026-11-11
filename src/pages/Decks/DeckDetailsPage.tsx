import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import type { Deck, DeckCard, DeckSection } from "../../types/deck";
import type { PokemonCardSearchResult } from "../../types/pokemonCard";
import {
  addDeckCard,
  findDeckById,
  removeDeckCard,
  replaceDeckCards,
  updateDeck,
} from "../../services/decks/deckService";
import { searchPokemonCards } from "../../services/pokemon/pokemonCardService";

import "./DecksPage.css";

const SECTION_ORDER: DeckSection[] = ["POKEMON", "TRAINER", "ENERGY"];

const SECTION_LABEL: Record<DeckSection, string> = {
  POKEMON: "Pokémon",
  TRAINER: "Trainer",
  ENERGY: "Energy",
};

function guessSection(card: PokemonCardSearchResult): DeckSection {
  const rarity = card.rarity?.toLowerCase() ?? "";
  const name = card.name.toLowerCase();

  if (name.includes("energy") || rarity.includes("energy")) {
    return "ENERGY";
  }

  if (
    name.includes("ball") ||
    name.includes("professor") ||
    name.includes("boss") ||
    name.includes("research") ||
    rarity.includes("trainer")
  ) {
    return "TRAINER";
  }

  return "POKEMON";
}

export function DeckDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const deckId = Number(id);

  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [savingMeta, setSavingMeta] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<PokemonCardSearchResult[]>(
    [],
  );

  useEffect(() => {
    async function load() {
      if (!Number.isFinite(deckId)) {
        navigate("/decks");
        return;
      }

      try {
        setLoading(true);
        const response = await findDeckById(deckId);
        setDeck(response);
        setName(response.name);
        setNotes(response.notes ?? "");
      } catch {
        toast.error("Could not load deck.");
        navigate("/decks");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [deckId, navigate]);

  const cardsBySection = useMemo(() => {
    const groups: Record<DeckSection, DeckCard[]> = {
      POKEMON: [],
      TRAINER: [],
      ENERGY: [],
    };

    for (const card of deck?.cards ?? []) {
      groups[card.section].push(card);
    }

    return groups;
  }, [deck]);

  async function handleSaveMeta(event: FormEvent) {
    event.preventDefault();

    if (!deck) {
      return;
    }

    try {
      setSavingMeta(true);
      const updated = await updateDeck(deck.id, {
        name: name.trim(),
        notes: notes.trim() || null,
      });
      setDeck(updated);
      toast.success("Deck updated.");
    } catch {
      toast.error("Could not update deck.");
    } finally {
      setSavingMeta(false);
    }
  }

  async function handleSearch(event: FormEvent) {
    event.preventDefault();

    if (!searchTerm.trim()) {
      return;
    }

    try {
      setSearching(true);
      const page = await searchPokemonCards({
        name: searchTerm.trim(),
        page: 1,
        size: 12,
      });
      setSearchResults(page.content);
    } catch {
      toast.error("Could not search cards.");
    } finally {
      setSearching(false);
    }
  }

  async function handleAdd(card: PokemonCardSearchResult) {
    if (!deck) {
      return;
    }

    try {
      const updated = await addDeckCard(deck.id, {
        externalId: card.externalId,
        section: guessSection(card),
        quantity: 1,
      });
      setDeck(updated);
      toast.success(`Added ${card.name}`);
    } catch {
      toast.error("Could not add card.");
    }
  }

  async function persistQuantities(nextCards: DeckCard[]) {
    if (!deck) {
      return;
    }

    try {
      const updated = await replaceDeckCards(
        deck.id,
        nextCards.map((card) => ({
          externalId: card.externalId,
          section: card.section,
          quantity: card.quantity,
        })),
      );
      setDeck(updated);
    } catch {
      toast.error("Could not update quantities.");
      const fresh = await findDeckById(deck.id);
      setDeck(fresh);
    }
  }

  async function handleQuantity(card: DeckCard, delta: number) {
    if (!deck) {
      return;
    }

    const nextQuantity = card.quantity + delta;

    if (nextQuantity <= 0) {
      if (card.id == null) {
        return;
      }

      try {
        const updated = await removeDeckCard(deck.id, card.id);
        setDeck(updated);
      } catch {
        toast.error("Could not remove card.");
      }
      return;
    }

    const nextCards = deck.cards.map((item) =>
      item.externalId === card.externalId
        ? { ...item, quantity: nextQuantity }
        : item,
    );

    setDeck({ ...deck, cards: nextCards });
    await persistQuantities(nextCards);
  }

  if (loading) {
    return (
      <main className="decks-page">
        <div className="decks-loading">Loading deck...</div>
      </main>
    );
  }

  if (!deck) {
    return null;
  }

  return (
    <main className="decks-page">
      <header className="decks-header">
        <div>
          <h1>{deck.name}</h1>
          <p>
            {deck.totalCards} cards · {deck.uniqueCards} unique
          </p>
        </div>
        <Link className="decks-secondary-button" to="/decks">
          Back
        </Link>
      </header>

      <form className="deck-panel" onSubmit={(event) => void handleSaveMeta(event)}>
        <label>
          Name
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label>
          Notes
          <input
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </label>
        <button
          type="submit"
          className="decks-primary-button"
          disabled={savingMeta}
        >
          {savingMeta ? "Saving..." : "Save details"}
        </button>
      </form>

      <form className="deck-panel" onSubmit={(event) => void handleSearch(event)}>
        <label>
          Add card
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search cards to add"
          />
        </label>
        <button
          type="submit"
          className="decks-secondary-button"
          disabled={searching}
        >
          {searching ? "Searching..." : "Search"}
        </button>

        <div className="deck-search-results">
          {searchResults.map((card) => (
            <article key={card.externalId} className="deck-card-item">
              {card.imageUrl ? <img src={card.imageUrl} alt={card.name} /> : <div />}
              <div className="deck-card-body">
                <h3>{card.name}</h3>
                <p>
                  {card.collectionName} · #{card.cardNumber}
                </p>
                <button
                  type="button"
                  className="decks-secondary-button"
                  onClick={() => void handleAdd(card)}
                >
                  Add
                </button>
              </div>
            </article>
          ))}
        </div>
      </form>

      {SECTION_ORDER.map((section) => {
        const cards = cardsBySection[section];

        if (cards.length === 0) {
          return null;
        }

        const sectionTotal = cards.reduce(
          (sum, card) => sum + card.quantity,
          0,
        );

        return (
          <section key={section} className="deck-section-block">
            <h2>
              {SECTION_LABEL[section]} · {sectionTotal}
            </h2>
            <div className="deck-card-grid">
              {cards.map((card) => (
                <article key={card.externalId} className="deck-card-item">
                  {card.imageUrl ? (
                    <img src={card.imageUrl} alt={card.name} />
                  ) : (
                    <div />
                  )}
                  <div className="deck-card-body">
                    <h3>{card.name}</h3>
                    <p>
                      {card.collectionName} · #{card.cardNumber}
                    </p>
                    <p
                      className={
                        card.ownedQuantity >= card.quantity
                          ? "owned-ok"
                          : "owned-missing"
                      }
                    >
                      Owned {card.ownedQuantity}/{card.quantity}
                    </p>
                    <div className="deck-card-qty">
                      <button
                        type="button"
                        onClick={() => void handleQuantity(card, -1)}
                      >
                        -
                      </button>
                      <strong>{card.quantity}</strong>
                      <button
                        type="button"
                        onClick={() => void handleQuantity(card, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}
