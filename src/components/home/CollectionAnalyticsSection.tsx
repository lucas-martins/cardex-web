import type { CollectionAnalytics } from "../../types/collectionAnalytics";
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
      </div>
    </section>
  );
}
