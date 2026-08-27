import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CollectionGoals } from "./CollectionGoals";

const mockFindCollectionGoals = vi.hoisted(() => vi.fn());

const mockCreateCollectionGoal = vi.hoisted(() => vi.fn());

const mockUpdateCollectionGoal = vi.hoisted(() => vi.fn());

const mockDeleteCollectionGoal = vi.hoisted(() => vi.fn());

const mockToastSuccess = vi.hoisted(() => vi.fn());

const mockToastError = vi.hoisted(() => vi.fn());

vi.mock("../../services/goals/collectionGoalService", () => ({
  findCollectionGoals: mockFindCollectionGoals,

  createCollectionGoal: mockCreateCollectionGoal,

  updateCollectionGoal: mockUpdateCollectionGoal,

  deleteCollectionGoal: mockDeleteCollectionGoal,
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: mockToastSuccess,
    error: mockToastError,
  },
}));

vi.mock("../ui/Modal", () => ({
  Modal: ({
    title,
    onClose,
    children,
  }: {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
  }) => (
    <div role="dialog" aria-label={title}>
      <h2>{title}</h2>

      {children}

      <button type="button" onClick={onClose}>
        Close modal
      </button>
    </div>
  ),
}));

vi.mock("./CollectionGoalForm", () => ({
  CollectionGoalForm: ({
    initialGoal,
    loading,
    onSubmit,
    onCancel,
  }: {
    initialGoal?: {
      id: number;
      title: string;
    } | null;
    loading?: boolean;
    onSubmit: (request: {
      title: string;
      type: "TOTAL_CARDS";
      targetValue: number;
      collectionId: null;
      language: null;
    }) => void | Promise<void>;
    onCancel?: () => void;
  }) => (
    <div>
      {initialGoal && <span>Editing {initialGoal.title}</span>}

      <button
        type="button"
        disabled={loading}
        onClick={() => {
          void onSubmit({
            title: initialGoal ? "Updated goal" : "New goal",
            type: "TOTAL_CARDS",
            targetValue: initialGoal ? 200 : 100,
            collectionId: null,
            language: null,
          });
        }}
      >
        {initialGoal ? "Submit edit" : "Submit create"}
      </button>

      {onCancel && (
        <button type="button" disabled={loading} onClick={onCancel}>
          Cancel form
        </button>
      )}
    </div>
  ),
}));

const COLLECTIONS = [
  {
    id: "base1",
    name: "Base",
  },
  {
    id: "sm1",
    name: "Sun & Moon",
  },
];

const TOTAL_CARDS_GOAL = {
  id: 1,
  title: "Reach 100 cards",
  type: "TOTAL_CARDS" as const,
  targetValue: 100,
  collectionId: null,
  collectionName: null,
  language: null,
  currentValue: 37,
  goalValue: 100,
  completionPercentage: 37,
  completed: false,
  createdAt: "2026-08-26T10:00:00",
  updatedAt: "2026-08-26T10:00:00",
};

const LANGUAGE_GOAL = {
  id: 2,
  title: "Japanese cards",
  type: "LANGUAGE_CARDS" as const,
  targetValue: 50,
  collectionId: null,
  collectionName: null,
  language: "JAPANESE",
  currentValue: 12,
  goalValue: 50,
  completionPercentage: 24,
  completed: false,
  createdAt: "2026-08-26T10:00:00",
  updatedAt: "2026-08-26T10:00:00",
};

const COLLECTION_GOAL = {
  id: 3,
  title: "Complete Base Set",
  type: "COLLECTION_COMPLETION" as const,
  targetValue: null,
  collectionId: "base1",
  collectionName: "Base",
  language: null,
  currentValue: 50,
  goalValue: 102,
  completionPercentage: 49.02,
  completed: false,
  createdAt: "2026-08-26T10:00:00",
  updatedAt: "2026-08-26T10:00:00",
};

const COMPLETED_GOAL = {
  ...TOTAL_CARDS_GOAL,
  id: 4,
  title: "Reach 10 cards",
  targetValue: 10,
  currentValue: 15,
  goalValue: 10,
  completionPercentage: 100,
  completed: true,
};

function renderComponent() {
  return render(<CollectionGoals collections={COLLECTIONS} />);
}

describe("CollectionGoals", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  it("should show loading state", () => {
    mockFindCollectionGoals.mockReturnValue(new Promise(() => {}));

    renderComponent();

    expect(screen.getByText("Loading goals...")).toBeInTheDocument();
  });

  it("should load and render goals", async () => {
    mockFindCollectionGoals.mockResolvedValue([
      TOTAL_CARDS_GOAL,
      LANGUAGE_GOAL,
      COLLECTION_GOAL,
    ]);

    renderComponent();

    expect(await screen.findByText("Reach 100 cards")).toBeInTheDocument();

    expect(screen.getByText("Japanese cards")).toBeInTheDocument();

    expect(screen.getByText("Complete Base Set")).toBeInTheDocument();

    expect(screen.getByText("Japanese")).toBeInTheDocument();

    expect(screen.getByText("Base")).toBeInTheDocument();

    expect(mockFindCollectionGoals).toHaveBeenCalledTimes(1);
  });

  it("should render progress information", async () => {
    mockFindCollectionGoals.mockResolvedValue([TOTAL_CARDS_GOAL]);

    renderComponent();

    await screen.findByText("Reach 100 cards");

    expect(screen.getByText("37 / 100")).toBeInTheDocument();

    expect(screen.getByText("37%")).toBeInTheDocument();

    expect(
      screen.getByRole("progressbar", {
        name: "Reach 100 cards progress",
      }),
    ).toHaveAttribute("aria-valuenow", "37");
  });

  it("should show completed goal", async () => {
    mockFindCollectionGoals.mockResolvedValue([COMPLETED_GOAL]);

    renderComponent();

    await screen.findByText("Reach 10 cards");

    expect(screen.getByText("✓ Completed")).toBeInTheDocument();

    expect(
      screen.getByRole("progressbar", {
        name: "Reach 10 cards progress",
      }),
    ).toHaveAttribute("aria-valuenow", "100");
  });

  it("should limit displayed progress to one hundred percent", async () => {
    mockFindCollectionGoals.mockResolvedValue([
      {
        ...COMPLETED_GOAL,
        completionPercentage: 145,
      },
    ]);

    renderComponent();

    await screen.findByText("Reach 10 cards");

    expect(screen.getByText("100%")).toBeInTheDocument();

    expect(
      screen.getByRole("progressbar", {
        name: "Reach 10 cards progress",
      }),
    ).toHaveAttribute("aria-valuenow", "100");
  });

  it("should show empty state", async () => {
    mockFindCollectionGoals.mockResolvedValue([]);

    renderComponent();

    expect(await screen.findByText("No goals yet")).toBeInTheDocument();

    expect(
      screen.getByText("Create your first personal collection goal."),
    ).toBeInTheDocument();
  });

  it("should show error when goals loading fails", async () => {
    mockFindCollectionGoals.mockRejectedValue(new Error("Failed"));

    renderComponent();

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Could not load collection goals.",
      );
    });
  });

  it("should open create goal modal", async () => {
    mockFindCollectionGoals.mockResolvedValue([]);

    renderComponent();

    await screen.findByText("No goals yet");

    fireEvent.click(
      screen.getByRole("button", {
        name: "New goal",
      }),
    );

    expect(
      screen.getByRole("dialog", {
        name: "Create goal",
      }),
    ).toBeInTheDocument();
  });

  it("should create goal and add it to the list", async () => {
    mockFindCollectionGoals.mockResolvedValue([]);

    const createdGoal = {
      ...TOTAL_CARDS_GOAL,
      id: 10,
      title: "New goal",
    };

    mockCreateCollectionGoal.mockResolvedValue(createdGoal);

    renderComponent();

    await screen.findByText("No goals yet");

    fireEvent.click(
      screen.getByRole("button", {
        name: "New goal",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Submit create",
      }),
    );

    await waitFor(() => {
      expect(mockCreateCollectionGoal).toHaveBeenCalledWith({
        title: "New goal",
        type: "TOTAL_CARDS",
        targetValue: 100,
        collectionId: null,
        language: null,
      });
    });

    expect(
      await screen.findByRole("heading", {
        name: "New goal",
        level: 3,
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("dialog", {
        name: "Create goal",
      }),
    ).not.toBeInTheDocument();

    expect(mockToastSuccess).toHaveBeenCalledWith("Collection goal created.");
  });

  it("should show error when goal creation fails", async () => {
    mockFindCollectionGoals.mockResolvedValue([]);

    mockCreateCollectionGoal.mockRejectedValue(new Error("Failed"));

    renderComponent();

    await screen.findByText("No goals yet");

    fireEvent.click(
      screen.getByRole("button", {
        name: "New goal",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Submit create",
      }),
    );

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Could not create collection goal.",
      );
    });

    expect(
      screen.getByRole("dialog", {
        name: "Create goal",
      }),
    ).toBeInTheDocument();
  });

  it("should open edit modal with selected goal", async () => {
    mockFindCollectionGoals.mockResolvedValue([TOTAL_CARDS_GOAL]);

    renderComponent();

    await screen.findByText("Reach 100 cards");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Edit",
      }),
    );

    expect(
      screen.getByRole("dialog", {
        name: "Edit goal",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Editing Reach 100 cards")).toBeInTheDocument();
  });

  it("should update goal in the list", async () => {
    mockFindCollectionGoals.mockResolvedValue([TOTAL_CARDS_GOAL]);

    const updatedGoal = {
      ...TOTAL_CARDS_GOAL,
      title: "Updated goal",
      targetValue: 200,
      goalValue: 200,
      currentValue: 37,
      completionPercentage: 18.5,
    };

    mockUpdateCollectionGoal.mockResolvedValue(updatedGoal);

    renderComponent();

    await screen.findByText("Reach 100 cards");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Edit",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Submit edit",
      }),
    );

    await waitFor(() => {
      expect(mockUpdateCollectionGoal).toHaveBeenCalledWith(1, {
        title: "Updated goal",
        type: "TOTAL_CARDS",
        targetValue: 200,
        collectionId: null,
        language: null,
      });
    });

    expect(await screen.findByText("Updated goal")).toBeInTheDocument();

    expect(screen.queryByText("Reach 100 cards")).not.toBeInTheDocument();

    expect(
      screen.queryByRole("dialog", {
        name: "Edit goal",
      }),
    ).not.toBeInTheDocument();

    expect(mockToastSuccess).toHaveBeenCalledWith("Collection goal updated.");
  });

  it("should show error when goal update fails", async () => {
    mockFindCollectionGoals.mockResolvedValue([TOTAL_CARDS_GOAL]);

    mockUpdateCollectionGoal.mockRejectedValue(new Error("Failed"));

    renderComponent();

    await screen.findByText("Reach 100 cards");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Edit",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Submit edit",
      }),
    );

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Could not update collection goal.",
      );
    });

    expect(
      screen.getByRole("dialog", {
        name: "Edit goal",
      }),
    ).toBeInTheDocument();
  });

  it("should delete goal when confirmation is accepted", async () => {
    mockFindCollectionGoals.mockResolvedValue([TOTAL_CARDS_GOAL]);

    mockDeleteCollectionGoal.mockResolvedValue(undefined);

    renderComponent();

    await screen.findByText("Reach 100 cards");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Delete",
      }),
    );

    expect(window.confirm).toHaveBeenCalledWith('Delete "Reach 100 cards"?');

    await waitFor(() => {
      expect(mockDeleteCollectionGoal).toHaveBeenCalledWith(1);
    });

    expect(screen.queryByText("Reach 100 cards")).not.toBeInTheDocument();

    expect(mockToastSuccess).toHaveBeenCalledWith("Collection goal deleted.");
  });

  it("should not delete goal when confirmation is cancelled", async () => {
    vi.mocked(window.confirm).mockReturnValue(false);

    mockFindCollectionGoals.mockResolvedValue([TOTAL_CARDS_GOAL]);

    renderComponent();

    await screen.findByText("Reach 100 cards");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Delete",
      }),
    );

    expect(mockDeleteCollectionGoal).not.toHaveBeenCalled();

    expect(screen.getByText("Reach 100 cards")).toBeInTheDocument();
  });

  it("should keep goal when deletion fails", async () => {
    mockFindCollectionGoals.mockResolvedValue([TOTAL_CARDS_GOAL]);

    mockDeleteCollectionGoal.mockRejectedValue(new Error("Failed"));

    renderComponent();

    await screen.findByText("Reach 100 cards");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Delete",
      }),
    );

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Could not delete collection goal.",
      );
    });

    expect(screen.getByText("Reach 100 cards")).toBeInTheDocument();
  });

  it("should close create modal", async () => {
    mockFindCollectionGoals.mockResolvedValue([]);

    renderComponent();

    await screen.findByText("No goals yet");

    fireEvent.click(
      screen.getByRole("button", {
        name: "New goal",
      }),
    );

    expect(
      screen.getByRole("dialog", {
        name: "Create goal",
      }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Cancel form",
      }),
    );

    expect(
      screen.queryByRole("dialog", {
        name: "Create goal",
      }),
    ).not.toBeInTheDocument();
  });

  it("should close edit modal", async () => {
    mockFindCollectionGoals.mockResolvedValue([TOTAL_CARDS_GOAL]);

    renderComponent();

    await screen.findByText("Reach 100 cards");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Edit",
      }),
    );

    expect(
      screen.getByRole("dialog", {
        name: "Edit goal",
      }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Cancel form",
      }),
    );

    expect(
      screen.queryByRole("dialog", {
        name: "Edit goal",
      }),
    ).not.toBeInTheDocument();
  });
});
