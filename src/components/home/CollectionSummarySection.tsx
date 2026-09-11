import type { CollectionSummary } from "../../types/collectionSummary";
import { formatMarketPrices } from "../../utils/formatMoney";

interface CollectionSummarySectionProps {
  summary: CollectionSummary;
}

export function CollectionSummarySection({
  summary,
}: CollectionSummarySectionProps) {
  const pricedCopies = summary.pricedCopies ?? 0;
  const unpricedCopies = summary.unpricedCopies ?? 0;
  const totalCopies = pricedCopies + unpricedCopies;

  return (
    <section className="home-summary">
      <h2>Collection summary</h2>

      <article className="home-collection-value">
        <div>
          <span>Estimated collection value</span>
          <strong>
            {formatMarketPrices(
              summary.estimatedValueUsd,
              summary.estimatedValueEur,
              summary.estimatedValueBrl,
            )}
          </strong>
          <p>
            {totalCopies === 0
              ? "Add cards to start estimating your collection value."
              : unpricedCopies > 0
                ? `Based on ${pricedCopies} of ${totalCopies} copies with known market prices. BRL is an exchange-rate estimate.`
                : `Based on ${pricedCopies} ${pricedCopies === 1 ? "copy" : "copies"} with known market prices. BRL is an exchange-rate estimate.`}
          </p>
        </div>
      </article>

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