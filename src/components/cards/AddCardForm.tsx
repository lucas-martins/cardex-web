import { type FormEvent, useState } from "react";
import { createCard } from "../../services/cards/cardService";
import type { CardCondition, CardLanguage } from "../../types/card";
import "./AddCardForm.css";
import toast from "react-hot-toast";

interface AddCardFormProps {
  externalId: string;
  onCancel: () => void;
  onSuccess: () => void | Promise<void>;
}

export function AddCardForm({
  externalId,
  onCancel,
  onSuccess,
}: AddCardFormProps) {
  const [quantity, setQuantity] = useState(1);
  const [language, setLanguage] = useState<CardLanguage>("ENGLISH");
  const [condition, setCondition] = useState<CardCondition>("NEAR_MINT");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);

      await createCard({
        externalId,
        quantity,
        language,
        condition,
        notes: notes.trim() || undefined,
      });

      await onSuccess();
    } catch {
      toast.error("Could not add the card to your collection.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="add-card-form" onSubmit={handleSubmit}>
      <label>
        Quantity
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(event) => setQuantity(Number(event.target.value))}
          required
        />
      </label>

      <label>
        Language
        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value as CardLanguage)}
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
          rows={3}
        />
      </label>

      <div className="add-card-actions">
        <button type="button" onClick={onCancel} disabled={saving}>
          Cancel
        </button>

        <button type="submit" disabled={saving}>
          {saving ? "Adding..." : "Confirm"}
        </button>
      </div>
    </form>
  );
}
