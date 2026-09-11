import { type FormEvent, useState } from "react";

import type {
  Card,
  CardCondition,
  CardFinish,
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
    finish?: CardFinish;
    gradingCompany?: string | null;
    grade?: string | null;
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
  const [finish, setFinish] = useState<CardFinish>(card.finish ?? "NORMAL");
  const [gradingCompany, setGradingCompany] = useState(
    card.gradingCompany ?? "",
  );
  const [grade, setGrade] = useState(card.grade ?? "");
  const [notes, setNotes] = useState(card.notes ?? "");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSubmit({
      quantity,
      language,
      condition,
      finish,
      gradingCompany: gradingCompany.trim() || null,
      grade: grade.trim() || null,
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
        Finish
        <select
          value={finish}
          onChange={(event) => setFinish(event.target.value as CardFinish)}
        >
          <option value="NORMAL">Normal</option>
          <option value="HOLOFOIL">Holofoil</option>
          <option value="REVERSE_HOLO">Reverse Holo</option>
          <option value="FIRST_EDITION">First Edition</option>
          <option value="OTHER">Other</option>
        </select>
      </label>

      <label>
        Grading company
        <input
          type="text"
          value={gradingCompany}
          onChange={(event) => setGradingCompany(event.target.value)}
          placeholder="Optional, e.g. PSA"
          maxLength={50}
        />
      </label>

      <label>
        Grade
        <input
          type="text"
          value={grade}
          onChange={(event) => setGrade(event.target.value)}
          placeholder="Optional, e.g. 10"
          maxLength={20}
        />
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
