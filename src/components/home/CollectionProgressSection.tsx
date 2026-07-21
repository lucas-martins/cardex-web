import { Link } from "react-router-dom";

import type { CollectionProgress } from "../../types/collectionProgress";

interface CollectionProgressSectionProps {
  progress: CollectionProgress[];
}

export function CollectionProgressSection({
  progress,
}: CollectionProgressSectionProps) {
  return (
    <section className="home-progress">
      <div className="home-section-header">
        <div>
          <h2>Collection progress</h2>
          <p>Track your completion by collection.</p>
        </div>
      </div>

      <div className="home-progress-grid">
        {progress.slice(0, 6).map((collection) => (
          <Link
            className="home-progress-card"
            key={collection.collectionId}
            to={`/collections/${collection.collectionId}`}
          >
            <div className="home-progress-card-header">
              <div>
                <h3>{collection.collectionName}</h3>
                <span>{collection.collectionId}</span>
              </div>

              <strong>
                {collection.completionPercentage.toFixed(2)}%
              </strong>
            </div>

            <div className="home-progress-bar">
              <span
                style={{
                  width: `${Math.min(
                    collection.completionPercentage,
                    100,
                  )}%`,
                }}
              />
            </div>

            <p>
              {collection.ownedCards} of {collection.totalCards} cards
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}