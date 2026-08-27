import { type FormEvent, useState } from "react";

import type { CardLanguage } from "../../types/card";
import type {
  CollectionGoalType,
  CreateCollectionGoalRequest,
  UserCollectionGoal,
} from "../../types/userCollectionGoal";

import "./CollectionGoalForm.css";

interface CollectionOption {
  id: string;
  name: string;
}

interface CollectionGoalFormProps {
  collections: CollectionOption[];
  initialGoal?: UserCollectionGoal | null;
  loading?: boolean;
  onSubmit: (request: CreateCollectionGoalRequest) => void | Promise<void>;
  onCancel?: () => void;
}

const LANGUAGE_OPTIONS: Array<{
  value: CardLanguage;
  label: string;
}> = [
  { value: "ENGLISH", label: "English" },
  { value: "PORTUGUESE", label: "Portuguese" },
  { value: "JAPANESE", label: "Japanese" },
  { value: "SPANISH", label: "Spanish" },
  { value: "FRENCH", label: "French" },
  { value: "GERMAN", label: "German" },
  { value: "ITALIAN", label: "Italian" },
  { value: "KOREAN", label: "Korean" },
  { value: "CHINESE", label: "Chinese" },
];

export function CollectionGoalForm({
  collections,
  initialGoal = null,
  loading = false,
  onSubmit,
  onCancel,
}: CollectionGoalFormProps) {
  const [title, setTitle] = useState(
    initialGoal?.title ?? "",
  );

  const [type, setType] = useState<CollectionGoalType>(
    initialGoal?.type ?? "TOTAL_CARDS",
  );

  const [targetValue, setTargetValue] = useState(
    initialGoal?.targetValue?.toString() ?? "",
  );

  const [collectionId, setCollectionId] = useState(
    initialGoal?.collectionId ?? "",
  );

  const [language, setLanguage] = useState<CardLanguage | "">(
    (initialGoal?.language as CardLanguage | null) ?? "",
  );

  const [error, setError] = useState<string | null>(null);

  function handleTypeChange(
    newType: CollectionGoalType,
  ) {
    setType(newType);
    setError(null);

    if (newType === "TOTAL_CARDS") {
      setCollectionId("");
      setLanguage("");
    }

    if (newType === "LANGUAGE_CARDS") {
      setCollectionId("");
    }

    if (newType === "COLLECTION_COMPLETION") {
      setTargetValue("");
      setLanguage("");
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const normalizedTitle = title.trim();

    if (!normalizedTitle) {
      setError("Enter a goal title.");
      return;
    }

    if (type === "COLLECTION_COMPLETION") {
      if (!collectionId) {
        setError("Select a collection.");
        return;
      }

      setError(null);

      await onSubmit({
        title: normalizedTitle,
        type,
        targetValue: null,
        collectionId,
        language: null,
      });

      return;
    }

    const parsedTargetValue = Number(targetValue);

    if (
      !Number.isInteger(parsedTargetValue) ||
      parsedTargetValue <= 0
    ) {
      setError(
        "Target value must be a positive whole number.",
      );
      return;
    }

    if (type === "LANGUAGE_CARDS" && !language) {
      setError("Select a language.");
      return;
    }

    setError(null);

    await onSubmit({
      title: normalizedTitle,
      type,
      targetValue: parsedTargetValue,
      collectionId: null,
      language:
        type === "LANGUAGE_CARDS"
          ? language
          : null,
    });
  }

  return (
    <form
      className="collection-goal-form"
      onSubmit={(event) => {
        void handleSubmit(event);
      }}
    >
      <label>
        Goal title
        <input
          type="text"
          value={title}
          maxLength={100}
          disabled={loading}
          placeholder="Example: Reach 500 cards"
          onChange={(event) =>
            setTitle(event.target.value)
          }
        />
      </label>

      <label>
        Goal type
        <select
          value={type}
          disabled={loading}
          onChange={(event) =>
            handleTypeChange(
              event.target.value as CollectionGoalType,
            )
          }
        >
          <option value="TOTAL_CARDS">
            Total cards
          </option>

          <option value="LANGUAGE_CARDS">
            Cards by language
          </option>

          <option value="COLLECTION_COMPLETION">
            Complete a collection
          </option>
        </select>
      </label>

      {type !== "COLLECTION_COMPLETION" && (
        <label>
          Target
          <input
            type="number"
            min="1"
            step="1"
            value={targetValue}
            disabled={loading}
            placeholder="Example: 100"
            onChange={(event) =>
              setTargetValue(event.target.value)
            }
          />
        </label>
      )}

      {type === "LANGUAGE_CARDS" && (
        <label>
          Language
          <select
            value={language}
            disabled={loading}
            onChange={(event) =>
              setLanguage(
                event.target.value as CardLanguage | "",
              )
            }
          >
            <option value="">
              Select a language
            </option>

            {LANGUAGE_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </label>
      )}

      {type === "COLLECTION_COMPLETION" && (
        <label>
          Collection
          <select
            value={collectionId}
            disabled={loading}
            onChange={(event) =>
              setCollectionId(event.target.value)
            }
          >
            <option value="">
              Select a collection
            </option>

            {collections.map((collection) => (
              <option
                key={collection.id}
                value={collection.id}
              >
                {collection.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {error && (
        <p
          className="collection-goal-form-error"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="collection-goal-form-actions">
        {onCancel && (
          <button
            type="button"
            className="collection-goal-cancel-button"
            disabled={loading}
            onClick={onCancel}
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          className="collection-goal-submit-button"
          disabled={loading}
        >
          {loading
            ? "Saving..."
            : initialGoal
              ? "Save changes"
              : "Create goal"}
        </button>
      </div>
    </form>
  );
}