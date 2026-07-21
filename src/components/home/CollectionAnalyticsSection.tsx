import type { CollectionAnalytics } from "../../types/collectionAnalytics";

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

function getMaxQuantity(items: CollectionAnalytics["collections"]) {
  return Math.max(...items.map((item) => item.quantity), 1);
}

export function CollectionAnalyticsSection({
  analytics,
}: CollectionAnalyticsSectionProps) {
  const maxCollectionQuantity = getMaxQuantity(analytics.collections);

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

          {analytics.collections.length === 0 ? (
            <p className="home-analytics-empty">No data available.</p>
          ) : (
            <div className="home-analytics-list">
              {analytics.collections.slice(0, 5).map((item) => (
                <div className="home-analytics-item" key={item.name}>
                  <div className="home-analytics-item-header">
                    <span>{item.name}</span>
                    <strong>{item.quantity}</strong>
                  </div>

                  <div className="home-analytics-bar">
                    <span
                      style={{
                        width: `${
                          (item.quantity / maxCollectionQuantity) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="home-analytics-card">
          <h3>Languages</h3>

          {analytics.languages.length === 0 ? (
            <p className="home-analytics-empty">No data available.</p>
          ) : (
            <div className="home-analytics-stat-list">
              {analytics.languages.map((item) => (
                <div key={item.name}>
                  <span>{formatAnalyticsName(item.name)}</span>
                  <strong>{item.quantity}</strong>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="home-analytics-card">
          <h3>Conditions</h3>

          {analytics.conditions.length === 0 ? (
            <p className="home-analytics-empty">No data available.</p>
          ) : (
            <div className="home-analytics-stat-list">
              {analytics.conditions.map((item) => (
                <div key={item.name}>
                  <span>{formatAnalyticsName(item.name)}</span>
                  <strong>{item.quantity}</strong>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="home-analytics-card">
          <h3>Rarities</h3>

          {analytics.rarities.length === 0 ? (
            <p className="home-analytics-empty">No data available.</p>
          ) : (
            <div className="home-analytics-stat-list">
              {analytics.rarities.slice(0, 6).map((item) => (
                <div key={item.name}>
                  <span>{item.name}</span>
                  <strong>{item.quantity}</strong>
                </div>
              ))}
            </div>
          )}
        </article>
      </div>
    </section>
  );
}