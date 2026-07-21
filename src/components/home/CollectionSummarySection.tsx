import type { CollectionSummary } from "../../types/collectionSummary";

interface CollectionSummarySectionProps {
  summary: CollectionSummary;
}

export function CollectionSummarySection({
  summary,
}: CollectionSummarySectionProps) {
  return (
    <section className="home-summary">
      <h2>Collection summary</h2>

      <div className="home-summary-grid">
        <article className="home-summary-card">
          <span>Unique cards</span>
          <strong>{summary.uniqueCards}</strong>
          <p>Different cards in your collection</p>
        </article>

        <article className="home-summary-card">
          <span>Total copies</span>
          <strong>{summary.totalCards}</strong>
          <p>All copies combined</p>
        </article>

        <article className="home-summary-card">
          <span>Languages</span>
          <strong>{summary.differentLanguages}</strong>
          <p>Different card languages owned</p>
        </article>

        <article className="home-summary-card">
          <span>Collections</span>
          <strong>{summary.differentCollections}</strong>
          <p>Different sets represented</p>
        </article>
      </div>

      <article className="home-most-owned-card">
        <div>
          <span>Most owned card</span>

          {summary.mostOwnedCard ? (
            <>
              <strong>{summary.mostOwnedCard.name}</strong>

              <p>
                You currently own {summary.mostOwnedCard.quantity}{" "}
                {summary.mostOwnedCard.quantity === 1 ? "copy" : "copies"}.
              </p>
            </>
          ) : (
            <>
              <strong>No card yet</strong>

              <p>Add your first card to start tracking your collection.</p>
            </>
          )}
        </div>

        {summary.mostOwnedCard && (
          <span className="home-most-owned-quantity">
            ×{summary.mostOwnedCard.quantity}
          </span>
        )}
      </article>
    </section>
  );
}