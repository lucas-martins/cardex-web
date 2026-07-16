import "./DeleteCardConfirmation.css";

interface DeleteCardConfirmationProps {
  cardName: string;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteCardConfirmation({
  cardName,
  deleting,
  onCancel,
  onConfirm,
}: DeleteCardConfirmationProps) {
  return (
    <div>
      <p>
        Are you sure you want to remove <strong>{cardName}</strong> from your
        collection?
      </p>

      <div className="delete-card-actions">
        <button
          type="button"
          onClick={onCancel}
          disabled={deleting}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={deleting}
        >
          {deleting ? "Removing..." : "Remove"}
        </button>
      </div>
    </div>
  );
}