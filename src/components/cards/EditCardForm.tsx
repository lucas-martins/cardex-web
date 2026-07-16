import { type FormEvent, useState } from "react";

import type {
  Card,
  CardCondition,
  CardLanguage,
} from "../../types/card";
import "./EditCardForm.css";

interface EditCardFormProps {
  card: Card;
  saving: boolean;
  onCancel: () => void;
  onSubmit: (values: {
    quantity: number;
    language: CardLanguage;
    condition: CardCondition;
    notes?: string;
  }) => void;
}

export function EditCardForm({
  card,
  saving,
  onCancel,
  onSubmit,
}: EditCardFormProps) {
  const [quantity, setQuantity] = useState(card.quantity);
  const [language, setLanguage] =
    useState<CardLanguage>(card.language);
  const [condition, setCondition] =
    useState<CardCondition>(card.condition);
  const [notes, setNotes] = useState(card.notes ?? "");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSubmit({
      quantity,
      language,
      condition,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <form className="edit-card-form" onSubmit={handleSubmit}>
      <label>
        Quantity
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(event) =>
            setQuantity(Number(event.target.value))
          }
          required
        />
      </label>

      <label>
        Language
        <select
          value={language}
          onChange={(event) =>
            setLanguage(event.target.value as CardLanguage)
          }
        >
          <option value="ENGLISH">English</option>
          <option value="PORTUGUESE">Portuguese</option>
          <option value="JAPANESE">Japanese</option>
          <option value="SPANISH">Spanish</option>
          <option value="FRENCH">French</option>
          <option value="GERMAN">German</option>
          <option value="ITALIAN">Italian</option>
          <option value="KOREAN">Korean</option>
          <option value="CHINESE">Chinese</option>
        </select>
      </label>

      <label>
        Condition
        <select
          value={condition}
          onChange={(event) =>
            setCondition(event.target.value as CardCondition)
          }
        >
          <option value="MINT">Mint</option>
          <option value="NEAR_MINT">Near Mint</option>
          <option value="EXCELLENT">Excellent</option>
          <option value="GOOD">Good</option>
          <option value="LIGHTLY_PLAYED">Lightly Played</option>
          <option value="PLAYED">Played</option>
          <option value="POOR">Poor</option>
        </select>
      </label>

      <label>
        Notes
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          maxLength={1000}
          rows={4}
        />
      </label>

      <div className="edit-card-actions">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </button>

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}