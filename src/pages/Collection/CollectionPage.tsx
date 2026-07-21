import { useEffect, useState, useRef } from "react";
import type { ChangeEvent } from "react";
import { Link } from "react-router-dom";
import {
  findCards,
  deleteCard,
  updateCard,
  updateFavorite,
  exportCollectionCsv,
  previewCollectionCsv,
  importCollectionCsv,
} from "../../services/cards/cardService";
import type { Card, CardCondition, CardLanguage } from "../../types/card";
import "./CollectionPage.css";
import toast from "react-hot-toast";
import { DeleteCardConfirmation } from "../../components/cards/DeleteCardConfirmation";
import { EditCardForm } from "../../components/cards/EditCardForm";
import { Modal } from "../../components/ui/Modal";
import {
  CardCollectionFilters,
  type CardCollectionFilterValues,
} from "../../components/cards/CardCollectionFilters";
import type {
  CardImportPreview,
  CardImportResult,
} from "../../types/cardImport";

const INITIAL_FILTERS: CardCollectionFilterValues = {
  name: "",
  language: "",
  condition: "",
  favorite: false,
  sort: "name,asc",
};

function formatLanguage(language: CardLanguage) {
  const labels: Record<CardLanguage, string> = {
    ENGLISH: "English",
    PORTUGUESE: "Portuguese",
    JAPANESE: "Japanese",
    SPANISH: "Spanish",
    FRENCH: "French",
    GERMAN: "German",
    ITALIAN: "Italian",
    KOREAN: "Korean",
    CHINESE: "Chinese",
  };

  return labels[language];
}

function formatCondition(condition: CardCondition) {
  const labels: Record<CardCondition, string> = {
    MINT: "Mint",
    NEAR_MINT: "Near Mint",
    EXCELLENT: "Excellent",
    GOOD: "Good",
    LIGHTLY_PLAYED: "Lightly Played",
    PLAYED: "Played",
    POOR: "Poor",
  };

  return labels[condition];
}

export function CollectionPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardToDelete, setCardToDelete] = useState<Card | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [cardToEdit, setCardToEdit] = useState<Card | null>(null);
  const [savingQuantity, setSavingQuantity] = useState(false);
  const [filters, setFilters] =
    useState<CardCollectionFilterValues>(INITIAL_FILTERS);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [firstPage, setFirstPage] = useState(true);
  const [lastPage, setLastPage] = useState(true);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<CardImportPreview | null>(
    null,
  );
  const [importResult, setImportResult] = useState<CardImportResult | null>(
    null,
  );
  const [previewingImport, setPreviewingImport] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const importInputRef = useRef<HTMLInputElement | null>(null);

  async function loadCards(
    currentFilters: CardCollectionFilterValues,
    page = 0,
  ) {
    try {
      setLoading(true);
      setError(null);

      const response = await findCards({
        page,
        size: 20,
        name: currentFilters.name || undefined,
        language: currentFilters.language || undefined,
        condition: currentFilters.condition || undefined,
        favorite: currentFilters.favorite ? true : undefined,
        sort: currentFilters.sort,
      });

      setCards(response.content);
      setTotalElements(response.totalElements);
      setCurrentPage(response.number);
      setTotalPages(response.totalPages);
      setFirstPage(response.first);
      setLastPage(response.last);
    } catch {
      setError("Could not load your collection.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCards(INITIAL_FILTERS, 0);
  }, []);

  async function handleDeleteCard() {
    if (!cardToDelete) {
      return;
    }

    try {
      setDeleting(true);

      await deleteCard(cardToDelete.id);

      setCards((currentCards) =>
        currentCards.filter((card) => card.id !== cardToDelete.id),
      );

      setTotalElements((currentTotal) => Math.max(currentTotal - 1, 0));

      toast.success(`${cardToDelete.name} was removed from your collection.`);

      setCardToDelete(null);
    } catch {
      toast.error("Could not remove the card from your collection.");
    } finally {
      setDeleting(false);
    }
  }

  async function handleUpdateCard(values: {
    quantity: number;
    language: CardLanguage;
    condition: CardCondition;
    notes?: string;
  }) {
    if (!cardToEdit) {
      return;
    }

    try {
      setSavingQuantity(true);

      const updatedCard = await updateCard(cardToEdit.id, values);

      setCards((currentCards) =>
        currentCards.map((card) =>
          card.id === updatedCard.id ? updatedCard : card,
        ),
      );

      toast.success(`${updatedCard.name} was updated.`);

      setCardToEdit(null);
    } catch {
      toast.error("Could not update the card.");
    } finally {
      setSavingQuantity(false);
    }
  }

  async function handleToggleFavorite(card: Card) {
    try {
      const updatedCard = await updateFavorite(card.id, {
        favorite: !card.favorite,
      });

      setCards((currentCards) =>
        currentCards.map((currentCard) =>
          currentCard.id === updatedCard.id ? updatedCard : currentCard,
        ),
      );

      toast.success(
        updatedCard.favorite
          ? "Added to favorites."
          : "Removed from favorites.",
      );
    } catch {
      toast.error("Could not update favorite.");
    }
  }

  async function handleExportCollection() {
    try {
      setExporting(true);

      const file = await exportCollectionCsv();
      const downloadUrl = URL.createObjectURL(file);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = "cardex-collection.csv";

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(downloadUrl);

      toast.success("Collection exported successfully.");
    } catch {
      toast.error("Could not export the collection.");
    } finally {
      setExporting(false);
    }
  }

  async function handleImportFileSelected(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      setPreviewingImport(true);
      setImportFile(file);
      setImportResult(null);

      const preview = await previewCollectionCsv(file);

      setImportPreview(preview);
    } catch {
      setImportFile(null);
      setImportPreview(null);

      toast.error("Could not validate the CSV file.");
    } finally {
      setPreviewingImport(false);
    }
  }

  async function handleConfirmImport() {
    if (!importFile || !importPreview || importPreview.validRows === 0) {
      return;
    }

    try {
      setImporting(true);

      const result = await importCollectionCsv(importFile);

      setImportResult(result);

      if (result.importedRows > 0) {
        toast.success(
          `${result.importedRows} ${
            result.importedRows === 1 ? "card was" : "cards were"
          } imported.`,
        );

        await loadCards(filters, 0);
      } else {
        toast.error("No cards were imported.");
      }
    } catch {
      toast.error("Could not import the collection.");
    } finally {
      setImporting(false);
    }
  }

  function closeImportModal() {
    if (previewingImport || importing) {
      return;
    }

    setImportFile(null);
    setImportPreview(null);
    setImportResult(null);
  }

  if (error) {
    return <p className="collection-message error">{error}</p>;
  }

  return (
    <section>
      <div className="collection-header">
        <div>
          <h1>My Collection</h1>

          <p>
            {totalElements} {totalElements === 1 ? "card" : "cards"} found
          </p>
        </div>

        <div className="collection-header-actions">
          <button
            type="button"
            className="collection-import-button"
            disabled={previewingImport || importing}
            onClick={() => importInputRef.current?.click()}
          >
            {previewingImport ? "Validating..." : "Import collection"}
          </button>

          <button
            type="button"
            className="collection-export-button"
            disabled={exporting}
            onClick={() => {
              void handleExportCollection();
            }}
          >
            {exporting ? "Exporting..." : "Export collection"}
          </button>

          <input
            ref={importInputRef}
            className="collection-import-input"
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => {
              void handleImportFileSelected(event);
            }}
          />
        </div>
      </div>

      <CardCollectionFilters
        initialValues={filters}
        loading={loading}
        onSearch={(newFilters) => {
          setFilters(newFilters);
          void loadCards(newFilters, 0);
        }}
        onClear={() => {
          setFilters(INITIAL_FILTERS);
          void loadCards(INITIAL_FILTERS, 0);
        }}
      />

      {loading && <p className="collection-loading">Loading collection...</p>}

      {cards.length === 0 ? (
        <div className="collection-empty">
          <h2>Your collection is empty</h2>
          <p>Search for Pokémon cards and add your first one.</p>
        </div>
      ) : (
        <div className="collection-grid">
          {cards.map((card) => (
            <Link
              key={card.id}
              className="collection-card-details-link"
              to={`/collection/${card.id}`}
            >
              <article className="collection-card">
                <div className="collection-card-image-wrapper">
                  <button
                    type="button"
                    className="favorite-button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();

                      void handleToggleFavorite(card);
                    }}
                    title={
                      card.favorite
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                  >
                    {card.favorite ? "★" : "☆"}
                  </button>
                  {card.imageUrl ? (
                    <img
                      className="collection-card-image"
                      src={card.imageUrl}
                      alt={card.name}
                    />
                  ) : (
                    <div className="collection-card-image-placeholder">
                      No image
                    </div>
                  )}

                  <span className="quantity-badge">×{card.quantity}</span>
                </div>

                <div className="collection-card-content">
                  <div className="collection-card-title">
                    <div>
                      <h2>{card.name}</h2>
                      <p>{card.collectionName}</p>
                    </div>

                    <span className="card-number">#{card.cardNumber}</span>
                  </div>

                  <div className="collection-card-badges">
                    <span>{formatLanguage(card.language)}</span>
                    <span>{formatCondition(card.condition)}</span>

                    {card.rarity && <span>{card.rarity}</span>}
                  </div>

                  {card.notes && (
                    <p className="collection-card-notes">{card.notes}</p>
                  )}

                  <div className="collection-card-actions">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();

                        setCardToEdit(card);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();

                        setCardToDelete(card);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="collection-pagination">
          <button
            type="button"
            disabled={firstPage || loading}
            onClick={() => {
              void loadCards(filters, currentPage - 1);
            }}
          >
            Previous
          </button>

          <span>
            Page {currentPage + 1} of {totalPages}
          </span>

          <button
            type="button"
            disabled={lastPage || loading}
            onClick={() => {
              void loadCards(filters, currentPage + 1);
            }}
          >
            Next
          </button>
        </div>
      )}

      {cardToDelete && (
        <Modal
          title="Remove card"
          onClose={() => {
            if (!deleting) {
              setCardToDelete(null);
            }
          }}
        >
          <DeleteCardConfirmation
            cardName={cardToDelete.name}
            deleting={deleting}
            onCancel={() => setCardToDelete(null)}
            onConfirm={() => {
              void handleDeleteCard();
            }}
          />
        </Modal>
      )}

      {cardToEdit && (
        <Modal
          title="Edit card"
          onClose={() => {
            if (!savingQuantity) {
              setCardToEdit(null);
            }
          }}
        >
          <EditCardForm
            card={cardToEdit}
            saving={savingQuantity}
            onCancel={() => setCardToEdit(null)}
            onSubmit={(values) => {
              void handleUpdateCard(values);
            }}
          />
        </Modal>
      )}

      {importPreview && (
        <Modal title="Import collection" onClose={closeImportModal}>
          <div className="collection-import-preview">
            <p className="collection-import-filename">
              File: <strong>{importFile?.name}</strong>
            </p>

            <div className="collection-import-summary">
              <div>
                <span>Total rows</span>
                <strong>{importPreview.totalRows}</strong>
              </div>

              <div className="valid">
                <span>Valid</span>
                <strong>{importPreview.validRows}</strong>
              </div>

              <div className="invalid">
                <span>Invalid</span>
                <strong>{importPreview.invalidRows}</strong>
              </div>
            </div>

            <div className="collection-import-items">
              {importPreview.items.map((item) => (
                <article
                  key={`${item.line}-${item.externalId}`}
                  className={`collection-import-item ${
                    item.valid ? "valid" : "invalid"
                  }`}
                >
                  <div>
                    <strong>{item.name || "Unnamed card"}</strong>

                    <span>
                      Line {item.line} ·{" "}
                      {item.collectionName || "No collection"} · #
                      {item.cardNumber || "-"}
                    </span>
                  </div>

                  <div className="collection-import-item-status">
                    {item.valid ? (
                      <span className="valid">Ready to import</span>
                    ) : (
                      <span className="invalid">
                        {item.error ?? "Invalid row"}
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>

            {importResult && (
              <div className="collection-import-result">
                <strong>Import completed</strong>

                <p>
                  {importResult.importedRows} imported and{" "}
                  {importResult.skippedRows} skipped.
                </p>
              </div>
            )}

            <div className="collection-import-actions">
              <button
                type="button"
                className="secondary"
                disabled={importing}
                onClick={closeImportModal}
              >
                {importResult ? "Close" : "Cancel"}
              </button>

              {!importResult && importPreview.validRows > 0 && (
                <button
                  type="button"
                  className="primary"
                  disabled={importing}
                  onClick={() => {
                    void handleConfirmImport();
                  }}
                >
                  {importing
                    ? "Importing..."
                    : `Import ${importPreview.validRows} ${
                        importPreview.validRows === 1 ? "card" : "cards"
                      }`}
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
