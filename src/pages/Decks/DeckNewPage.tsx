import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import type { DeckCard, DeckSection, UnresolvedDeckCard } from "../../types/deck";
import type { PokemonCardSearchResult } from "../../types/pokemonCard";
import {
  createDeck,
  parseDeckList,
} from "../../services/decks/deckService";
import { searchPokemonCards } from "../../services/pokemon/pokemonCardService";

import "./DecksPage.css";

type BuilderMode = "import" | "manual";

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
    name.includes("switch") ||
    rarity.includes("trainer")
  ) {
    return "TRAINER";
  }

  return "POKEMON";
}

export function DeckNewPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<BuilderMode>("import");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [listText, setListText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resolvedCards, setResolvedCards] = useState<DeckCard[]>([]);
  const [unresolvedCards, setUnresolvedCards] = useState<UnresolvedDeckCard[]>(
    [],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<PokemonCardSearchResult[]>(
    [],
  );

  const totalCards = useMemo(
    () => resolvedCards.reduce((sum, card) => sum + card.quantity, 0),
    [resolvedCards],
  );

  async function handleParse(event: FormEvent) {
    event.preventDefault();

    if (!listText.trim()) {
      toast.error("Paste a deck list first.");
      return;
    }

    try {
      setParsing(true);
      const result = await parseDeckList(listText);
      setResolvedCards(result.resolvedCards);
      setUnresolvedCards(result.unresolvedCards);

      if (!name.trim()) {
        setName("Imported deck");
      }

      toast.success(
        `Parsed ${result.resolvedCount} cards` +
          (result.unresolvedCount
            ? `, ${result.unresolvedCount} unresolved`
            : ""),
      );
    } catch {
      toast.error("Could not parse deck list.");
    } finally {
      setParsing(false);
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

  function addManualCard(card: PokemonCardSearchResult) {
    setResolvedCards((current) => {
      const existing = current.find(
        (item) => item.externalId === card.externalId,
      );

      if (existing) {
        return current.map((item) =>
          item.externalId === card.externalId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [
        ...current,
        {
          id: null,
          externalId: card.externalId,
          name: card.name,
          cardNumber: card.cardNumber,
          collectionId: null,
          collectionName: card.collectionName,
          imageUrl: card.imageUrl,
          section: guessSection(card),
          quantity: 1,
          ownedQuantity: card.owned ? 1 : 0,
        },
      ];
    });
  }

  function updateQuantity(externalId: string, delta: number) {
    setResolvedCards((current) =>
      current
        .map((card) =>
          card.externalId === externalId
            ? { ...card, quantity: card.quantity + delta }
            : card,
        )
        .filter((card) => card.quantity > 0),
    );
  }

  function removeUnresolved(lineNumber: number) {
    setUnresolvedCards((current) =>
      current.filter((card) => card.lineNumber !== lineNumber),
    );
  }

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Give the deck a name.");
      return;
    }

    if (resolvedCards.length === 0) {
      toast.error("Add at least one resolved card.");
      return;
    }

    try {
      setSaving(true);
      const deck = await createDeck({
        name: name.trim(),
        notes: notes.trim() || undefined,
        cards: resolvedCards.map((card) => ({
          externalId: card.externalId,
          section: card.section,
          quantity: card.quantity,
        })),
      });

      toast.success("Deck created.");
      navigate(`/decks/${deck.id}`);
    } catch {
      toast.error("Could not save deck.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="decks-page">
      <header className="decks-header">
        <div>
          <h1>New deck</h1>
          <p>Import a PTCGO/Limitless list or build manually.</p>
        </div>
        <Link className="decks-secondary-button" to="/decks">
          Back
        </Link>
      </header>

      <div className="deck-builder-tabs">
        <button
          type="button"
          className={mode === "import" ? "active" : ""}
          onClick={() => setMode("import")}
        >
          Import list
        </button>
        <button
          type="button"
          className={mode === "manual" ? "active" : ""}
          onClick={() => setMode("manual")}
        >
          Manual
        </button>
      </div>

      <section className="deck-panel">
        <label>
          Deck name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="My deck"
          />
        </label>
        <label>
          Notes
          <input
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Optional notes"
          />
        </label>
      </section>

      {mode === "import" ? (
        <form className="deck-panel" onSubmit={(event) => void handleParse(event)}>
          <label>
            Deck list
            <textarea
              value={listText}
              onChange={(event) => setListText(event.target.value)}
              placeholder="Paste your deck list here..."
            />
          </label>
          <button
            type="submit"
            className="decks-primary-button"
            disabled={parsing}
          >
            {parsing ? "Parsing..." : "Parse list"}
          </button>
        </form>
      ) : (
        <form className="deck-panel" onSubmit={(event) => void handleSearch(event)}>
          <label>
            Search cards
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Charizard, Ultra Ball..."
            />
          </label>
          <button
            type="submit"
            className="decks-primary-button"
            disabled={searching}
          >
            {searching ? "Searching..." : "Search"}
          </button>

          <div className="deck-search-results">
            {searchResults.map((card) => (
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
                  <button
                    type="button"
                    className="decks-secondary-button"
                    onClick={() => addManualCard(card)}
                  >
                    Add
                  </button>
                </div>
              </article>
            ))}
          </div>
        </form>
      )}

      <section className="deck-panel">
        <div className="decks-header">
          <div>
            <h2 style={{ margin: 0 }}>Preview</h2>
            <p>
              {totalCards} cards · {resolvedCards.length} unique
              {unresolvedCards.length
                ? ` · ${unresolvedCards.length} unresolved`
                : ""}
            </p>
          </div>
          <button
            type="button"
            className="decks-primary-button"
            disabled={saving}
            onClick={() => void handleSave()}
          >
            {saving ? "Saving..." : "Save deck"}
          </button>
        </div>

        {resolvedCards.length === 0 && unresolvedCards.length === 0 ? (
          <div className="decks-empty">No cards in the preview yet.</div>
        ) : (
          <>
            <div className="deck-card-grid">
              {resolvedCards.map((card) => (
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
                        onClick={() => updateQuantity(card.externalId, -1)}
                      >
                        -
                      </button>
                      <strong>{card.quantity}</strong>
                      <button
                        type="button"
                        onClick={() => updateQuantity(card.externalId, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {unresolvedCards.length > 0 ? (
              <div className="deck-section-block">
                <h2>Unresolved</h2>
                <div className="deck-card-grid">
                  {unresolvedCards.map((card) => (
                    <article
                      key={`${card.lineNumber}-${card.rawLine}`}
                      className="deck-card-item unresolved"
                    >
                      <div className="deck-card-body">
                        <h3>{card.requestedName}</h3>
                        <p>
                          {card.setAbbreviation} {card.cardNumber} · x
                          {card.quantity}
                        </p>
                        <p>{card.rawLine}</p>
                        <button
                          type="button"
                          className="decks-danger-button"
                          onClick={() => removeUnresolved(card.lineNumber)}
                        >
                          Remove
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        )}
      </section>
    </main>
  );
}
