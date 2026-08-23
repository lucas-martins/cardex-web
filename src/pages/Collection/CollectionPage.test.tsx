import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CollectionPage } from "./CollectionPage";

const mockFindCards = vi.hoisted(() => vi.fn());
const mockDeleteCard = vi.hoisted(() => vi.fn());
const mockUpdateCard = vi.hoisted(() => vi.fn());
const mockUpdateFavorite = vi.hoisted(() => vi.fn());
const mockExportCollectionCsv = vi.hoisted(() => vi.fn());
const mockPreviewCollectionCsv = vi.hoisted(() => vi.fn());
const mockImportCollectionCsv = vi.hoisted(() => vi.fn());

const mockToastSuccess = vi.hoisted(() => vi.fn());
const mockToastError = vi.hoisted(() => vi.fn());

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock("../../services/cards/cardService", () => ({
  findCards: mockFindCards,
  deleteCard: mockDeleteCard,
  updateCard: mockUpdateCard,
  updateFavorite: mockUpdateFavorite,
  exportCollectionCsv: mockExportCollectionCsv,
  previewCollectionCsv: mockPreviewCollectionCsv,
  importCollectionCsv: mockImportCollectionCsv,
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: mockToastSuccess,
    error: mockToastError,
  },
}));

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const CARDS = [
  {
    id: 1,
    externalId: "sm1-1",
    name: "Caterpie",
    collectionId: "sm1",
    collectionName: "Sun & Moon",
    cardNumber: "1",
    rarity: "Common",
    quantity: 1,
    language: "ENGLISH",
    condition: "NEAR_MINT",
    imageUrl: "https://example.com/caterpie.png",
    notes: null,
    createdAt: "2026-08-23T10:00:00",
    updatedAt: "2026-08-23T10:00:00",
    favorite: false,
  },
  {
    id: 2,
    externalId: "base1-4",
    name: "Charizard",
    collectionId: "base1",
    collectionName: "Base Set",
    cardNumber: "4",
    rarity: "Rare Holo",
    quantity: 2,
    language: "ENGLISH",
    condition: "MINT",
    imageUrl: "https://example.com/charizard.png",
    notes: null,
    createdAt: "2026-08-23T10:00:00",
    updatedAt: "2026-08-23T10:00:00",
    favorite: true,
  },
];

const PAGE = {
  content: CARDS,
  totalElements: 2,
  totalPages: 1,
  number: 0,
  size: 20,
  first: true,
  last: true,
};

function renderPage() {
  return render(
    <MemoryRouter>
      <CollectionPage />
    </MemoryRouter>,
  );
}

describe("CollectionPage bulk actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();

    mockFindCards.mockResolvedValue(PAGE);
  });

  it("should select a single card", async () => {
    renderPage();

    await screen.findByText("Caterpie");

    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "Select Caterpie",
      }),
    );

    expect(screen.getByText("1 card selected")).toBeInTheDocument();

    expect(
      screen.getByRole("checkbox", {
        name: "Select Caterpie",
      }),
    ).toBeChecked();

    expect(
      screen.getByRole("button", {
        name: "Favorite",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Unfavorite",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Delete",
      }),
    ).toBeInTheDocument();
  });

  it("should deselect a selected card", async () => {
    renderPage();

    await screen.findByText("Caterpie");

    const checkbox = screen.getByRole("checkbox", {
      name: "Select Caterpie",
    });

    fireEvent.click(checkbox);

    expect(screen.getByText("1 card selected")).toBeInTheDocument();

    fireEvent.click(checkbox);

    expect(screen.queryByText("1 card selected")).not.toBeInTheDocument();

    expect(checkbox).not.toBeChecked();
  });

  it("should select all cards on current page", async () => {
    renderPage();

    await screen.findByText("Caterpie");

    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "Select all on page",
      }),
    );

    expect(screen.getByText("2 cards selected")).toBeInTheDocument();

    expect(
      screen.getByRole("checkbox", {
        name: "Select Caterpie",
      }),
    ).toBeChecked();

    expect(
      screen.getByRole("checkbox", {
        name: "Select Charizard",
      }),
    ).toBeChecked();
  });

  it("should clear all selected cards when select all is unchecked", async () => {
    renderPage();

    await screen.findByText("Caterpie");

    const selectAll = screen.getByRole("checkbox", {
      name: "Select all on page",
    });

    fireEvent.click(selectAll);

    expect(screen.getByText("2 cards selected")).toBeInTheDocument();

    fireEvent.click(selectAll);

    expect(screen.queryByText("2 cards selected")).not.toBeInTheDocument();

    expect(
      screen.getByRole("checkbox", {
        name: "Select Caterpie",
      }),
    ).not.toBeChecked();

    expect(
      screen.getByRole("checkbox", {
        name: "Select Charizard",
      }),
    ).not.toBeChecked();
  });

  it("should favorite selected cards", async () => {
    mockUpdateFavorite
      .mockResolvedValueOnce({
        ...CARDS[0],
        favorite: true,
      })
      .mockResolvedValueOnce({
        ...CARDS[1],
        favorite: true,
      });

    mockFindCards.mockResolvedValueOnce(PAGE).mockResolvedValueOnce({
      ...PAGE,
      content: [
        {
          ...CARDS[0],
          favorite: true,
        },
        {
          ...CARDS[1],
          favorite: true,
        },
      ],
    });

    renderPage();

    await screen.findByText("Caterpie");

    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "Select all on page",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Favorite",
      }),
    );

    await waitFor(() => {
      expect(mockUpdateFavorite).toHaveBeenCalledTimes(2);
    });

    expect(mockUpdateFavorite).toHaveBeenCalledWith(1, {
      favorite: true,
    });

    expect(mockUpdateFavorite).toHaveBeenCalledWith(2, {
      favorite: true,
    });

    expect(mockToastSuccess).toHaveBeenCalledWith(
      "2 cards were added to favorites.",
    );
  });

  it("should unfavorite selected cards", async () => {
    mockUpdateFavorite
      .mockResolvedValueOnce({
        ...CARDS[0],
        favorite: false,
      })
      .mockResolvedValueOnce({
        ...CARDS[1],
        favorite: false,
      });

    mockFindCards.mockResolvedValueOnce(PAGE).mockResolvedValueOnce(PAGE);

    renderPage();

    await screen.findByText("Caterpie");

    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "Select all on page",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Unfavorite",
      }),
    );

    await waitFor(() => {
      expect(mockUpdateFavorite).toHaveBeenCalledTimes(2);
    });

    expect(mockUpdateFavorite).toHaveBeenCalledWith(1, {
      favorite: false,
    });

    expect(mockUpdateFavorite).toHaveBeenCalledWith(2, {
      favorite: false,
    });

    expect(mockToastSuccess).toHaveBeenCalledWith(
      "2 cards were removed from favorites.",
    );
  });

  it("should open bulk delete confirmation", async () => {
    renderPage();

    await screen.findByText("Caterpie");

    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "Select Caterpie",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Delete",
      }),
    );

    expect(
      screen.getByRole("dialog", {
        name: "Delete selected cards",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Are you sure you want to remove/i),
    ).toBeInTheDocument();
  });

  it("should cancel bulk delete", async () => {
    renderPage();

    await screen.findByText("Caterpie");

    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "Select Caterpie",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Delete",
      }),
    );

    const dialog = screen.getByRole("dialog", {
      name: "Delete selected cards",
    });

    fireEvent.click(
      within(dialog).getByRole("button", {
        name: "Cancel",
      }),
    );

    expect(
      screen.queryByRole("dialog", {
        name: "Delete selected cards",
      }),
    ).not.toBeInTheDocument();

    expect(mockDeleteCard).not.toHaveBeenCalled();
  });

  it("should delete selected cards", async () => {
    mockDeleteCard.mockResolvedValue(undefined);

    mockFindCards.mockResolvedValueOnce(PAGE).mockResolvedValueOnce({
      ...PAGE,
      content: [],
      totalElements: 0,
    });

    renderPage();

    await screen.findByText("Caterpie");

    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "Select all on page",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Delete",
      }),
    );

    const dialog = screen.getByRole("dialog", {
      name: "Delete selected cards",
    });

    fireEvent.click(
      within(dialog).getByRole("button", {
        name: "Delete",
      }),
    );

    await waitFor(() => {
      expect(mockDeleteCard).toHaveBeenCalledTimes(2);
    });

    expect(mockDeleteCard).toHaveBeenCalledWith(1);

    expect(mockDeleteCard).toHaveBeenCalledWith(2);

    expect(mockToastSuccess).toHaveBeenCalledWith(
      "2 cards were removed from your collection.",
    );
  });
});
