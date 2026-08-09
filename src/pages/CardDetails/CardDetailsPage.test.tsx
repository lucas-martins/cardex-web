import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CardDetailsPage } from "./CardDetailsPage";

const mockFindCardById = vi.hoisted(() => vi.fn());
const mockUpdateFavorite = vi.hoisted(() => vi.fn());
const mockUpdateCard = vi.hoisted(() => vi.fn());
const mockDeleteCard = vi.hoisted(() => vi.fn());

const mockNavigate = vi.hoisted(() => vi.fn());

const mockToastSuccess = vi.hoisted(() => vi.fn());
const mockToastError = vi.hoisted(() => vi.fn());

vi.mock("../../services/cards/cardService", () => ({
  findCardById: mockFindCardById,
  updateFavorite: mockUpdateFavorite,
  updateCard: mockUpdateCard,
  deleteCard: mockDeleteCard,
}));

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );

  return {
    ...actual,
    useParams: () => ({
      id: "1",
    }),
    useNavigate: () => mockNavigate,
  };
});

vi.mock("react-hot-toast", () => ({
  default: {
    success: mockToastSuccess,
    error: mockToastError,
  },
}));

vi.mock("../../components/cards/EditCardForm", () => ({
  EditCardForm: ({
    onCancel,
    onSubmit,
  }: {
    onCancel: () => void;
    onSubmit: (values: {
      quantity: number;
      language: string;
      condition: string;
      notes?: string;
    }) => void;
  }) => (
    <div>
      <button type="button" onClick={onCancel}>
        Cancel edit
      </button>

      <button
        type="button"
        onClick={() =>
          onSubmit({
            quantity: 3,
            language: "ENGLISH",
            condition: "NEAR_MINT",
            notes: "Updated notes",
          })
        }
      >
        Confirm edit
      </button>
    </div>
  ),
}));

vi.mock("../../components/cards/DeleteCardConfirmation", () => ({
  DeleteCardConfirmation: ({
    onCancel,
    onConfirm,
  }: {
    onCancel: () => void;
    onConfirm: () => void;
  }) => (
    <div>
      <button type="button" onClick={onCancel}>
        Cancel remove
      </button>

      <button type="button" onClick={onConfirm}>
        Confirm remove
      </button>
    </div>
  ),
}));

const CARD = {
  id: 1,
  externalId: "sm1-12",
  name: "Decidueye-GX",
  cardNumber: "12",
  collectionId: "sm1",
  collectionName: "Sun & Moon",
  collectionTotal: 149,
  rarity: "Rare Holo GX",
  quantity: 2,
  language: "ENGLISH",
  condition: "NEAR_MINT",
  imageUrl: "https://example.com/decidueye.png",
  notes: "My card",
  favorite: false,
  createdAt: "2026-08-08T10:00:00",
  updatedAt: "2026-08-08T10:00:00",
};

describe("CardDetailsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockFindCardById.mockResolvedValue(CARD);
  });

  it("should load and render card details", async () => {
    render(
      <MemoryRouter>
        <CardDetailsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Decidueye-GX")).toBeInTheDocument();
    });

    expect(screen.getByText("Sun & Moon")).toBeInTheDocument();

    expect(
      screen.getByText((content) => content.includes("12")),
    ).toBeInTheDocument();

    expect(screen.getByText("Rare Holo GX")).toBeInTheDocument();

    expect(screen.getByText("My card")).toBeInTheDocument();
  });

  it("should update favorite", async () => {
    mockUpdateFavorite.mockResolvedValue({
      ...CARD,
      favorite: true,
    });

    render(
      <MemoryRouter>
        <CardDetailsPage />
      </MemoryRouter>,
    );

    await screen.findByText("Decidueye-GX");

    fireEvent.click(
      screen.getByRole("button", {
        name: /favorite/i,
      }),
    );

    await waitFor(() => {
      expect(mockUpdateFavorite).toHaveBeenCalledWith(1, {
        favorite: true,
      });
    });
  });

  it("should open edit modal", async () => {
    render(
      <MemoryRouter>
        <CardDetailsPage />
      </MemoryRouter>,
    );

    await screen.findByText("Decidueye-GX");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Edit card",
      }),
    );

    expect(
      screen.getByRole("button", {
        name: "Confirm edit",
      }),
    ).toBeInTheDocument();
  });

  it("should update card successfully", async () => {
    const updatedCard = {
      ...CARD,
      quantity: 3,
      notes: "Updated notes",
    };

    mockUpdateCard.mockResolvedValue(updatedCard);

    render(
      <MemoryRouter>
        <CardDetailsPage />
      </MemoryRouter>,
    );

    await screen.findByText("Decidueye-GX");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Edit card",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Confirm edit",
      }),
    );

    await waitFor(() => {
      expect(mockUpdateCard).toHaveBeenCalledWith(1, {
        quantity: 3,
        language: "ENGLISH",
        condition: "NEAR_MINT",
        notes: "Updated notes",
      });
    });

    expect(mockToastSuccess).toHaveBeenCalledWith("Decidueye-GX was updated.");
  });

  it("should open remove confirmation", async () => {
    render(
      <MemoryRouter>
        <CardDetailsPage />
      </MemoryRouter>,
    );

    await screen.findByText("Decidueye-GX");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Remove card",
      }),
    );

    expect(
      screen.getByRole("button", {
        name: "Confirm remove",
      }),
    ).toBeInTheDocument();
  });

  it("should remove card and navigate to collection", async () => {
    mockDeleteCard.mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <CardDetailsPage />
      </MemoryRouter>,
    );

    await screen.findByText("Decidueye-GX");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Remove card",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Confirm remove",
      }),
    );

    await waitFor(() => {
      expect(mockDeleteCard).toHaveBeenCalledWith(1);
    });

    expect(mockToastSuccess).toHaveBeenCalledWith(
      "Decidueye-GX was removed from your collection.",
    );

    expect(mockNavigate).toHaveBeenCalledWith("/collection", {
      replace: true,
    });
  });
});
