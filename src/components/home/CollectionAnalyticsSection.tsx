import type { CollectionAnalytics } from "../../types/collectionAnalytics";
import { formatMarketPrices } from "../../utils/formatMoney";
import { TopCollectionsChart } from "./TopCollectionsChart";
import { DistributionDonutChart } from "./DistributionDonutChart";
import { RaritiesChart } from "./RaritiesChart";

interface CollectionAnalyticsSectionProps {
  analytics: CollectionAnalytics;
}

function formatAnalyticsName(name: string) {
  return name
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function CollectionAnalyticsSection({
  analytics,
}: CollectionAnalyticsSectionProps) {

  return (
    <section className="home-analytics">
      <div className="home-section-header">
        <div>
          <h2>Collection analytics</h2>
          <p>See how your collection is distributed.</p>
        </div>
      </div>

      <div className="home-analytics-grid">
        <article className="home-analytics-card">
          <h3>Top collections</h3>

          <TopCollectionsChart collections={analytics.collections} />
        </article>

        <article className="home-analytics-card">
          <h3>Languages</h3>

          <DistributionDonutChart
            items={analytics.languages}
            formatName={formatAnalyticsName}
          />
        </article>

        <article className="home-analytics-card">
          <h3>Conditions</h3>

          <DistributionDonutChart
            items={analytics.conditions}
            formatName={formatAnalyticsName}
          />
        </article>

        <article className="home-analytics-card">
          <h3>Rarities</h3>

          <RaritiesChart rarities={analytics.rarities} />
        </article>

        <article className="home-analytics-card home-analytics-values">
          <h3>Most valuable collections</h3>

          {analytics.collectionValues && analytics.collectionValues.length > 0 ? (
            <ul className="home-value-list">
              {analytics.collectionValues.slice(0, 8).map((collection) => (
                <li key={collection.name}>
                  <span>{collection.name}</span>
                  <strong>
                    {formatMarketPrices(
                      collection.estimatedValueUsd,
                      collection.estimatedValueEur,
                      collection.estimatedValueBrl,
                    )}
                  </strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className="home-value-empty">
              Market prices will appear here as your catalog is updated.
            </p>
          )}
        </article>
      </div>
    </section>
  );
}
