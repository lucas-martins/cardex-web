import { type FormEvent, useState } from "react";

import type { Card } from "../../types/card";
import "./EditCardQuantityForm.css";

interface EditCardQuantityFormProps {
  card: Card;
  saving: boolean;
  onCancel: () => void;
  onSubmit: (quantity: number) => void;
}

export function EditCardQuantityForm({
  card,
  saving,
  onCancel,
  onSubmit,
}: EditCardQuantityFormProps) {
  const [quantity, setQuantity] = useState(card.quantity);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(quantity);
  }

  return (
    <form
      className="edit-card-quantity-form"
      onSubmit={handleSubmit}
    >
      <p>
        Update the quantity of <strong>{card.name}</strong> in your
        collection.
      </p>

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

      <div className="edit-card-quantity-actions">
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