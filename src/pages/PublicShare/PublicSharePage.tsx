import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getPublicShare } from "../../services/share/shareService";
import type { PublicShareResponse } from "../../types/share";

import "./PublicSharePage.css";

export function PublicSharePage() {
  const { token } = useParams<{ token: string }>();

  const [share, setShare] = useState<PublicShareResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadShare() {
      if (!token) {
        if (active) {
          setError("Invalid share link.");
          setLoading(false);
        }

        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await getPublicShare(token);

        if (!active) {
          return;
        }

        setShare(response);
      } catch {
        if (active) {
          setError("This shared collection could not be found.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadShare();

    return () => {
      active = false;
    };
  }, [token]);

  if (loading) {
    return (
      <main className="public-share-page">
        <p className="public-share-message">Loading shared collection...</p>
      </main>
    );
  }

  if (error || !share) {
    return (
      <main className="public-share-page">
        <section className="public-share-empty">
          <h1>Share unavailable</h1>
          <p>{error ?? "This shared collection could not be found."}</p>
          <Link to="/login">Go to Cardex</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="public-share-page">
      <header className="public-share-header">
        <div>
          <span className="public-share-eyebrow">Shared collection</span>
          <h1>{share.ownerName}</h1>
          <p>Browse collection progress for this public share.</p>
        </div>

        <div className="public-share-summary">
          <strong>{share.collections.length}</strong>
          <span>
            {share.collections.length === 1 ? "collection" : "collections"}
          </span>
        </div>
      </header>

      {share.collections.length === 0 ? (
        <section className="public-share-empty">
          <h2>No collections yet</h2>
          <p>This collector has not started any sets.</p>
        </section>
      ) : (
        <section className="public-share-grid">
          {share.collections.map((collection) => (
            <Link
              key={collection.id}
              className="public-share-card"
              to={`/share/${share.shareToken}/collections/${collection.id}`}
            >
              <div>
                <span className="public-share-series">{collection.series}</span>
                <h2>{collection.name}</h2>
              </div>

              <div className="public-share-card-meta">
                <strong>{collection.completionPercentage.toFixed(0)}%</strong>
                <span>
                  {collection.ownedCards} / {collection.total} cards
                </span>
              </div>

              <div className="public-share-progress">
                <span
                  style={{
                    width: `${Math.min(collection.completionPercentage, 100)}%`,
                  }}
                />
              </div>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
