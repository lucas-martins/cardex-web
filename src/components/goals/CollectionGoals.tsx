import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Modal } from "../ui/Modal";
import { CollectionGoalForm } from "./CollectionGoalForm";

import {
  createCollectionGoal,
  deleteCollectionGoal,
  findCollectionGoals,
  updateCollectionGoal,
} from "../../services/goals/collectionGoalService";

import type {
  CreateCollectionGoalRequest,
  UserCollectionGoal,
} from "../../types/userCollectionGoal";

import "./CollectionGoals.css";

interface CollectionOption {
  id: string;
  name: string;
}

interface CollectionGoalsProps {
  collections: CollectionOption[];
}

function formatGoalType(goal: UserCollectionGoal) {
  switch (goal.type) {
    case "TOTAL_CARDS":
      return "Total cards";

    case "LANGUAGE_CARDS":
      return "Cards by language";

    case "COLLECTION_COMPLETION":
      return "Collection completion";
  }
}

function formatLanguage(language: string | null) {
  if (!language) {
    return null;
  }

  return language
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

export function CollectionGoals({
  collections,
}: CollectionGoalsProps) {
  const [goals, setGoals] = useState<
    UserCollectionGoal[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState<
    number | null
  >(null);

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [editingGoal, setEditingGoal] =
    useState<UserCollectionGoal | null>(null);

  useEffect(() => {
    async function loadGoals() {
      try {
        setLoading(true);

        const response =
          await findCollectionGoals();

        setGoals(response);
      } catch {
        toast.error(
          "Could not load collection goals.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadGoals();
  }, []);

  async function handleCreate(
    request: CreateCollectionGoalRequest,
  ) {
    try {
      setSaving(true);

      const createdGoal =
        await createCollectionGoal(request);

      setGoals((currentGoals) => [
        createdGoal,
        ...currentGoals,
      ]);

      setShowCreateModal(false);

      toast.success(
        "Collection goal created.",
      );
    } catch {
      toast.error(
        "Could not create collection goal.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(
    request: CreateCollectionGoalRequest,
  ) {
    if (!editingGoal) {
      return;
    }

    try {
      setSaving(true);

      const updatedGoal =
        await updateCollectionGoal(
          editingGoal.id,
          request,
        );

      setGoals((currentGoals) =>
        currentGoals.map((goal) =>
          goal.id === updatedGoal.id
            ? updatedGoal
            : goal,
        ),
      );

      setEditingGoal(null);

      toast.success(
        "Collection goal updated.",
      );
    } catch {
      toast.error(
        "Could not update collection goal.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(
    goal: UserCollectionGoal,
  ) {
    const confirmed = window.confirm(
      `Delete "${goal.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(goal.id);

      await deleteCollectionGoal(goal.id);

      setGoals((currentGoals) =>
        currentGoals.filter(
          (currentGoal) =>
            currentGoal.id !== goal.id,
        ),
      );

      toast.success(
        "Collection goal deleted.",
      );
    } catch {
      toast.error(
        "Could not delete collection goal.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="collection-goals">
      <div className="collection-goals-header">
        <div>
          <h2>My Goals</h2>

          <p>
            Set personal goals and track your
            collection progress.
          </p>
        </div>

        <button
          type="button"
          className="collection-goals-new-button"
          onClick={() =>
            setShowCreateModal(true)
          }
        >
          New goal
        </button>
      </div>

      {loading && (
        <p className="collection-goals-message">
          Loading goals...
        </p>
      )}

      {!loading && goals.length === 0 && (
        <div className="collection-goals-empty">
          <strong>No goals yet</strong>

          <p>
            Create your first personal collection
            goal.
          </p>

          <button
            type="button"
            onClick={() =>
              setShowCreateModal(true)
            }
          >
            Create goal
          </button>
        </div>
      )}

      {!loading && goals.length > 0 && (
        <div className="collection-goals-grid">
          {goals.map((goal) => {
            const percentage = Math.min(
              100,
              Math.max(
                0,
                goal.completionPercentage,
              ),
            );

            return (
              <article
                key={goal.id}
                className={`collection-goal-card ${
                  goal.completed
                    ? "completed"
                    : ""
                }`}
              >
                <div className="collection-goal-card-header">
                  <div>
                    <span className="collection-goal-type">
                      {formatGoalType(goal)}
                    </span>

                    <h3>{goal.title}</h3>
                  </div>

                  {goal.completed && (
                    <span className="collection-goal-completed">
                      ✓ Completed
                    </span>
                  )}
                </div>

                {goal.type ===
                  "COLLECTION_COMPLETION" &&
                  goal.collectionName && (
                    <p className="collection-goal-detail">
                      {goal.collectionName}
                    </p>
                  )}

                {goal.type ===
                  "LANGUAGE_CARDS" &&
                  goal.language && (
                    <p className="collection-goal-detail">
                      {formatLanguage(
                        goal.language,
                      )}
                    </p>
                  )}

                <div className="collection-goal-progress-header">
                  <span>
                    {goal.currentValue} /{" "}
                    {goal.goalValue}
                  </span>

                  <strong>
                    {Math.round(percentage)}%
                  </strong>
                </div>

                <div
                  className="collection-goal-progress"
                  role="progressbar"
                  aria-label={`${goal.title} progress`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(
                    percentage,
                  )}
                >
                  <div
                    className="collection-goal-progress-value"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>

                <div className="collection-goal-actions">
                  <button
                    type="button"
                    onClick={() =>
                      setEditingGoal(goal)
                    }
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="collection-goal-delete-button"
                    disabled={
                      deletingId === goal.id
                    }
                    onClick={() => {
                      void handleDelete(goal);
                    }}
                  >
                    {deletingId === goal.id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <Modal
          title="Create goal"
          onClose={() =>
            setShowCreateModal(false)
          }
        >
          <CollectionGoalForm
            collections={collections}
            loading={saving}
            onSubmit={handleCreate}
            onCancel={() =>
              setShowCreateModal(false)
            }
          />
        </Modal>
      )}

      {editingGoal && (
        <Modal
          title="Edit goal"
          onClose={() =>
            setEditingGoal(null)
          }
        >
          <CollectionGoalForm
            collections={collections}
            initialGoal={editingGoal}
            loading={saving}
            onSubmit={handleUpdate}
            onCancel={() =>
              setEditingGoal(null)
            }
          />
        </Modal>
      )}
    </section>
  );
}