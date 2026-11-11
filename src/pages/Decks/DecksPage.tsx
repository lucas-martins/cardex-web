import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import type { DeckSummary } from "../../types/deck";
import { deleteDeck, findDecks } from "../../services/decks/deckService";

import "./DecksPage.css";

export function DecksPage() {
  const navigate = useNavigate();
  const [decks, setDecks] = useState<DeckSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setDecks(await findDecks());
      } catch {
        toast.error("Could not load decks.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  async function handleDelete(deck: DeckSummary) {
    if (!window.confirm(`Delete deck "${deck.name}"?`)) {
      return;
    }

    try {
      await deleteDeck(deck.id);
      setDecks((current) => current.filter((item) => item.id !== deck.id));
      toast.success("Deck deleted.");
    } catch {
      toast.error("Could not delete deck.");
    }
  }

  return (
    <main className="decks-page">
      <header className="decks-header">
        <div>
          <h1>Decks</h1>
          <p>Import a list or build a deck manually.</p>
        </div>

        <button
          type="button"
          className="decks-primary-button"
          onClick={() => navigate("/decks/new")}
        >
          New deck
        </button>
      </header>

      {loading ? (
        <div className="decks-loading">Loading decks...</div>
      ) : decks.length === 0 ? (
        <div className="decks-empty">
          No decks yet. Create one from a pasted list or card search.
        </div>
      ) : (
        <div className="decks-grid">
          {decks.map((deck) => (
            <article key={deck.id} className="deck-summary-card">
              <div>
                <h2>{deck.name}</h2>
                <p className="deck-summary-meta">
                  {deck.totalCards} cards · {deck.uniqueCards} unique
                </p>
                {deck.notes ? (
                  <p className="deck-summary-meta">{deck.notes}</p>
                ) : null}
              </div>

              <div className="deck-summary-actions">
                <Link
                  className="decks-secondary-button"
                  to={`/decks/${deck.id}`}
                >
                  Open
                </Link>
                <button
                  type="button"
                  className="decks-danger-button"
                  onClick={() => void handleDelete(deck)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
