import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CollectionGoalForm } from "./CollectionGoalForm";

const COLLECTIONS = [
  {
    id: "base1",
    name: "Base Set",
  },
  {
    id: "sm1",
    name: "Sun & Moon",
  },
];

describe("CollectionGoalForm", () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render total cards fields by default", () => {
    render(
      <CollectionGoalForm collections={COLLECTIONS} onSubmit={mockOnSubmit} />,
    );

    expect(screen.getByLabelText("Goal title")).toBeInTheDocument();

    expect(screen.getByLabelText("Goal type")).toHaveValue("TOTAL_CARDS");

    expect(screen.getByLabelText("Target")).toBeInTheDocument();

    expect(screen.queryByLabelText("Language")).not.toBeInTheDocument();

    expect(screen.queryByLabelText("Collection")).not.toBeInTheDocument();
  });

  it("should submit total cards goal", async () => {
    mockOnSubmit.mockResolvedValue(undefined);

    render(
      <CollectionGoalForm collections={COLLECTIONS} onSubmit={mockOnSubmit} />,
    );

    fireEvent.change(screen.getByLabelText("Goal title"), {
      target: {
        value: "  Reach 100 cards  ",
      },
    });

    fireEvent.change(screen.getByLabelText("Target"), {
      target: {
        value: "100",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Create goal",
      }),
    );

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: "Reach 100 cards",
        type: "TOTAL_CARDS",
        targetValue: 100,
        collectionId: null,
        language: null,
      });
    });
  });

  it("should show language field for language cards goal", () => {
    render(
      <CollectionGoalForm collections={COLLECTIONS} onSubmit={mockOnSubmit} />,
    );

    fireEvent.change(screen.getByLabelText("Goal type"), {
      target: {
        value: "LANGUAGE_CARDS",
      },
    });

    expect(screen.getByLabelText("Target")).toBeInTheDocument();

    expect(screen.getByLabelText("Language")).toBeInTheDocument();

    expect(screen.queryByLabelText("Collection")).not.toBeInTheDocument();
  });

  it("should submit language cards goal", async () => {
    mockOnSubmit.mockResolvedValue(undefined);

    render(
      <CollectionGoalForm collections={COLLECTIONS} onSubmit={mockOnSubmit} />,
    );

    fireEvent.change(screen.getByLabelText("Goal title"), {
      target: {
        value: "Japanese collection",
      },
    });

    fireEvent.change(screen.getByLabelText("Goal type"), {
      target: {
        value: "LANGUAGE_CARDS",
      },
    });

    fireEvent.change(screen.getByLabelText("Target"), {
      target: {
        value: "50",
      },
    });

    fireEvent.change(screen.getByLabelText("Language"), {
      target: {
        value: "JAPANESE",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Create goal",
      }),
    );

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: "Japanese collection",
        type: "LANGUAGE_CARDS",
        targetValue: 50,
        collectionId: null,
        language: "JAPANESE",
      });
    });
  });

  it("should show collection field for collection completion goal", () => {
    render(
      <CollectionGoalForm collections={COLLECTIONS} onSubmit={mockOnSubmit} />,
    );

    fireEvent.change(screen.getByLabelText("Goal type"), {
      target: {
        value: "COLLECTION_COMPLETION",
      },
    });

    expect(screen.getByLabelText("Collection")).toBeInTheDocument();

    expect(screen.queryByLabelText("Target")).not.toBeInTheDocument();

    expect(screen.queryByLabelText("Language")).not.toBeInTheDocument();
  });

  it("should submit collection completion goal", async () => {
    mockOnSubmit.mockResolvedValue(undefined);

    render(
      <CollectionGoalForm collections={COLLECTIONS} onSubmit={mockOnSubmit} />,
    );

    fireEvent.change(screen.getByLabelText("Goal title"), {
      target: {
        value: "Complete Base Set",
      },
    });

    fireEvent.change(screen.getByLabelText("Goal type"), {
      target: {
        value: "COLLECTION_COMPLETION",
      },
    });

    fireEvent.change(screen.getByLabelText("Collection"), {
      target: {
        value: "base1",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Create goal",
      }),
    );

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: "Complete Base Set",
        type: "COLLECTION_COMPLETION",
        targetValue: null,
        collectionId: "base1",
        language: null,
      });
    });
  });

  it("should require goal title", async () => {
    render(
      <CollectionGoalForm collections={COLLECTIONS} onSubmit={mockOnSubmit} />,
    );

    fireEvent.change(screen.getByLabelText("Target"), {
      target: {
        value: "100",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Create goal",
      }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Enter a goal title.",
    );

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should require positive whole target value", async () => {
    render(
      <CollectionGoalForm collections={COLLECTIONS} onSubmit={mockOnSubmit} />,
    );

    fireEvent.change(screen.getByLabelText("Goal title"), {
      target: {
        value: "My goal",
      },
    });

    fireEvent.change(screen.getByLabelText("Target"), {
      target: {
        value: "0",
      },
    });

    const form = screen
      .getByRole("button", {
        name: "Create goal",
      })
      .closest("form");

    expect(form).not.toBeNull();

    fireEvent.submit(form!);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Target value must be a positive whole number.",
    );

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should reject decimal target value", async () => {
    render(
      <CollectionGoalForm collections={COLLECTIONS} onSubmit={mockOnSubmit} />,
    );

    fireEvent.change(screen.getByLabelText("Goal title"), {
      target: {
        value: "My goal",
      },
    });

    fireEvent.change(screen.getByLabelText("Target"), {
      target: {
        value: "10.5",
      },
    });

    const form = screen
      .getByRole("button", {
        name: "Create goal",
      })
      .closest("form");

    expect(form).not.toBeNull();

    fireEvent.submit(form!);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Target value must be a positive whole number.",
    );

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should require language for language cards goal", async () => {
    render(
      <CollectionGoalForm collections={COLLECTIONS} onSubmit={mockOnSubmit} />,
    );

    fireEvent.change(screen.getByLabelText("Goal title"), {
      target: {
        value: "Japanese cards",
      },
    });

    fireEvent.change(screen.getByLabelText("Goal type"), {
      target: {
        value: "LANGUAGE_CARDS",
      },
    });

    fireEvent.change(screen.getByLabelText("Target"), {
      target: {
        value: "50",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Create goal",
      }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Select a language.",
    );

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should require collection for collection completion goal", async () => {
    render(
      <CollectionGoalForm collections={COLLECTIONS} onSubmit={mockOnSubmit} />,
    );

    fireEvent.change(screen.getByLabelText("Goal title"), {
      target: {
        value: "Complete a set",
      },
    });

    fireEvent.change(screen.getByLabelText("Goal type"), {
      target: {
        value: "COLLECTION_COMPLETION",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Create goal",
      }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Select a collection.",
    );

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should populate fields when editing a goal", () => {
    render(
      <CollectionGoalForm
        collections={COLLECTIONS}
        initialGoal={{
          id: 10,
          title: "Japanese cards",
          type: "LANGUAGE_CARDS",
          targetValue: 100,
          collectionId: null,
          collectionName: null,
          language: "JAPANESE",
          currentValue: 25,
          goalValue: 100,
          completionPercentage: 25,
          completed: false,
          createdAt: "2026-08-26T10:00:00",
          updatedAt: "2026-08-26T10:00:00",
        }}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByLabelText("Goal title")).toHaveValue("Japanese cards");

    expect(screen.getByLabelText("Goal type")).toHaveValue("LANGUAGE_CARDS");

    expect(screen.getByLabelText("Target")).toHaveValue(100);

    expect(screen.getByLabelText("Language")).toHaveValue("JAPANESE");

    expect(
      screen.getByRole("button", {
        name: "Save changes",
      }),
    ).toBeInTheDocument();
  });

  it("should call onCancel", () => {
    render(
      <CollectionGoalForm
        collections={COLLECTIONS}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Cancel",
      }),
    );

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it("should disable fields and actions while saving", () => {
    render(
      <CollectionGoalForm
        collections={COLLECTIONS}
        loading
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
    );

    expect(screen.getByLabelText("Goal title")).toBeDisabled();

    expect(screen.getByLabelText("Goal type")).toBeDisabled();

    expect(screen.getByLabelText("Target")).toBeDisabled();

    expect(
      screen.getByRole("button", {
        name: "Saving...",
      }),
    ).toBeDisabled();

    expect(
      screen.getByRole("button", {
        name: "Cancel",
      }),
    ).toBeDisabled();
  });
});
