import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import type { CardHistory, CardHistoryAction } from "../../types/cardHistory";
import { findCardHistory } from "../../services/history/cardHistoryService";

import "./HistoryPage.css";

const PAGE_SIZE = 20;

const actionLabels: Record<CardHistoryAction, string> = {
  ADDED: "Added",
  UPDATED: "Updated",
  FAVORITED: "Favorited",
  UNFAVORITED: "Removed from favorites",
  REMOVED: "Removed",
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function HistoryPage() {
  const [history, setHistory] = useState<CardHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [lastPage, setLastPage] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [action, setAction] = useState<CardHistoryAction | "">("");

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);

        const response = await findCardHistory(
          0,
          PAGE_SIZE,
          action || undefined,
        );

        setHistory(response.content);
        setCurrentPage(response.number);
        setLastPage(response.last);
        setTotalElements(response.totalElements);
      } catch {
        toast.error("Could not load card history.");
      } finally {
        setLoading(false);
      }
    }

    void loadHistory();
  }, [action]);

  async function handleLoadMore() {
    if (loadingMore || lastPage) {
      return;
    }

    try {
      setLoadingMore(true);

      const response = await findCardHistory(
        currentPage + 1,
        PAGE_SIZE,
        action || undefined,
      );

      setHistory((current) => [...current, ...response.content]);

      setCurrentPage(response.number);
      setLastPage(response.last);
    } catch {
      toast.error("Could not load more history.");
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <main className="history-page">
      <div className="history-header">
        <div>
          <h1>History</h1>

          <p>Recent activity in your collection.</p>
        </div>

        {!loading && (
          <span className="history-count">
            {totalElements} {totalElements === 1 ? "event" : "events"}
          </span>
        )}
      </div>

      <div className="history-filters">
        <label htmlFor="historyAction">Event type</label>

        <select
          id="historyAction"
          value={action}
          onChange={(event) =>
            setAction(event.target.value as CardHistoryAction | "")
          }
        >
          <option value="">All events</option>
          <option value="ADDED">Added</option>
          <option value="UPDATED">Updated</option>
          <option value="FAVORITED">Favorited</option>
          <option value="UNFAVORITED">Removed from favorites</option>
          <option value="REMOVED">Removed</option>
        </select>
      </div>

      {loading && <p className="history-message">Loading history...</p>}

      {!loading && history.length === 0 && (
        <section className="history-empty">
          <h2>No activity yet</h2>

          <p>Changes to your collection will appear here.</p>
        </section>
      )}

      {!loading && history.length > 0 && (
        <>
          <section className="history-timeline">
            {history.map((item) => {
              const canOpenCard = item.cardId !== null && item.cardExists;

              const content = (
                <article
                  key={item.id}
                  className={`history-item ${canOpenCard ? "clickable" : ""}`}
                >
                  <div
                    className={`history-marker history-marker-${item.action.toLowerCase()}`}
                  />

                  <div className="history-item-content">
                    <div className="history-item-header">
                      <strong>{item.cardName}</strong>

                      <span>{formatDateTime(item.createdAt)}</span>
                    </div>

                    <span className="history-action">
                      {actionLabels[item.action]}
                    </span>

                    <p>{item.description}</p>
                  </div>
                </article>
              );

              if (!canOpenCard) {
                return content;
              }

              return (
                <Link
                  key={item.id}
                  className="history-item-link"
                  to={`/collection/${item.cardId}`}
                >
                  {content}
                </Link>
              );
            })}
          </section>

          {!lastPage && (
            <div className="history-load-more">
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
        </>
      )}
    </main>
  );
}
