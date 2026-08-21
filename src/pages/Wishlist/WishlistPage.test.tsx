import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { WishlistPage } from "./WishlistPage";

const mockFindWishlistCards = vi.hoisted(() => vi.fn());
const mockDeleteWishlistCard = vi.hoisted(() => vi.fn());
const mockUpdateWishlistPriority = vi.hoisted(() => vi.fn());

const mockToastError = vi.hoisted(() => vi.fn());
const mockToastSuccess = vi.hoisted(() => vi.fn());

vi.mock("../../services/wishlist/wishlistService", () => ({
  findWishlistCards: mockFindWishlistCards,
  deleteWishlistCard: mockDeleteWishlistCard,
  updateWishlistPriority: mockUpdateWishlistPriority,
}));

vi.mock("react-hot-toast", () => ({
  default: {
    error: mockToastError,
    success: mockToastSuccess,
  },
}));

vi.mock("../../components/cards/AddCardForm", () => ({
  AddCardForm: ({
    onCancel,
    onSuccess,
  }: {
    externalId: string;
    onCancel: () => void;
    onSuccess: () => void | Promise<void>;
  }) => (
    <div>
      <button type="button" onClick={onCancel}>
        Cancel add
      </button>

      <button
        type="button"
        onClick={() => {
          void onSuccess();
        }}
      >
        Confirm add
      </button>
    </div>
  ),
}));

const CARDS = [
  {
    id: 1,
    externalId: "sm1-11",
    name: "Metapod",
    cardNumber: "11",
    collectionId: "sm1",
    collectionName: "Sun & Moon",
    series: "Sun & Moon",
    rarity: "Uncommon",
    imageUrl: "https://example.com/metapod.png",
    priority: "MEDIUM" as const,
    createdAt: "2026-08-08T10:00:00",
    updatedAt: "2026-08-08T10:00:00",
  },
  {
    id: 2,
    externalId: "xy1-42",
    name: "Pikachu",
    cardNumber: "42",
    collectionId: "xy1",
    collectionName: "XY",
    series: "XY",
    rarity: "Common",
    imageUrl: null,
    priority: "HIGH" as const,
    createdAt: "2026-08-09T10:00:00",
    updatedAt: "2026-08-09T10:00:00",
  },
  {
    id: 3,
    externalId: "base1-4",
    name: "Charizard",
    cardNumber: "4",
    collectionId: "base1",
    collectionName: "Base",
    series: "Base",
    rarity: "Rare Holo",
    imageUrl: "https://example.com/charizard.png",
    priority: "LOW" as const,
    createdAt: "2026-08-10T10:00:00",
    updatedAt: "2026-08-10T10:00:00",
  },
];

describe("WishlistPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should load and render wishlist cards", async () => {
    mockFindWishlistCards.mockResolvedValue(CARDS);

    render(<WishlistPage />);

    expect(screen.getByText("Loading wishlist...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Metapod")).toBeInTheDocument();
    });

    expect(screen.getByText("Pikachu")).toBeInTheDocument();

    expect(screen.getByText("Charizard")).toBeInTheDocument();

    expect(screen.getByText("3 cards")).toBeInTheDocument();
  });

  it("should render empty state when wishlist is empty", async () => {
    mockFindWishlistCards.mockResolvedValue([]);

    render(<WishlistPage />);

    await waitFor(() => {
      expect(screen.getByText("Your wishlist is empty")).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        "Search for Pokémon cards and add the ones you want here.",
      ),
    ).toBeInTheDocument();
  });

  it("should show error when wishlist loading fails", async () => {
    mockFindWishlistCards.mockRejectedValue(new Error("Failed"));

    render(<WishlistPage />);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("Could not load wishlist.");
    });
  });

  it("should filter cards by high priority", async () => {
    mockFindWishlistCards.mockResolvedValue(CARDS);

    render(<WishlistPage />);

    await screen.findByText("Metapod");

    fireEvent.click(
      screen.getByRole("button", {
        name: "High",
      }),
    );

    expect(screen.getByText("Pikachu")).toBeInTheDocument();

    expect(screen.queryByText("Metapod")).not.toBeInTheDocument();

    expect(screen.queryByText("Charizard")).not.toBeInTheDocument();
  });

  it("should filter cards by medium priority", async () => {
    mockFindWishlistCards.mockResolvedValue(CARDS);

    render(<WishlistPage />);

    await screen.findByText("Metapod");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Medium",
      }),
    );

    expect(screen.getByText("Metapod")).toBeInTheDocument();

    expect(screen.queryByText("Pikachu")).not.toBeInTheDocument();

    expect(screen.queryByText("Charizard")).not.toBeInTheDocument();
  });

  it("should filter cards by low priority", async () => {
    mockFindWishlistCards.mockResolvedValue(CARDS);

    render(<WishlistPage />);

    await screen.findByText("Metapod");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Low",
      }),
    );

    expect(screen.getByText("Charizard")).toBeInTheDocument();

    expect(screen.queryByText("Pikachu")).not.toBeInTheDocument();

    expect(screen.queryByText("Metapod")).not.toBeInTheDocument();
  });

  it("should restore all cards when all priority filter is selected", async () => {
    mockFindWishlistCards.mockResolvedValue(CARDS);

    render(<WishlistPage />);

    await screen.findByText("Metapod");

    fireEvent.click(
      screen.getByRole("button", {
        name: "High",
      }),
    );

    expect(screen.queryByText("Metapod")).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "All",
      }),
    );

    expect(screen.getByText("Metapod")).toBeInTheDocument();

    expect(screen.getByText("Pikachu")).toBeInTheDocument();

    expect(screen.getByText("Charizard")).toBeInTheDocument();
  });

  it("should sort cards from high to low priority by default", async () => {
    mockFindWishlistCards.mockResolvedValue(CARDS);

    render(<WishlistPage />);

    await screen.findByText("Metapod");

    const cardTitles = screen
      .getAllByRole("heading", {
        level: 2,
      })
      .map((heading) => heading.textContent);

    expect(cardTitles).toEqual(["Pikachu", "Metapod", "Charizard"]);
  });

  it("should sort cards from low to high priority", async () => {
    mockFindWishlistCards.mockResolvedValue(CARDS);

    render(<WishlistPage />);

    await screen.findByText("Metapod");

    fireEvent.change(
      screen.getByRole("combobox", {
        name: "Sort by",
      }),
      {
        target: {
          value: "PRIORITY_ASC",
        },
      },
    );

    const cardTitles = screen
      .getAllByRole("heading", {
        level: 2,
      })
      .map((heading) => heading.textContent);

    expect(cardTitles).toEqual(["Charizard", "Metapod", "Pikachu"]);
  });

  it("should sort cards by recently added", async () => {
    mockFindWishlistCards.mockResolvedValue(CARDS);

    render(<WishlistPage />);

    await screen.findByText("Metapod");

    fireEvent.change(
      screen.getByRole("combobox", {
        name: "Sort by",
      }),
      {
        target: {
          value: "RECENT",
        },
      },
    );

    const cardTitles = screen
      .getAllByRole("heading", {
        level: 2,
      })
      .map((heading) => heading.textContent);

    expect(cardTitles).toEqual(["Charizard", "Pikachu", "Metapod"]);
  });

  it("should update wishlist card priority", async () => {
    mockFindWishlistCards.mockResolvedValue(CARDS);

    mockUpdateWishlistPriority.mockResolvedValue({
      ...CARDS[0],
      priority: "HIGH",
      updatedAt: "2026-08-11T10:00:00",
    });

    render(<WishlistPage />);

    await screen.findByText("Metapod");

    const metapodCard = screen.getByText("Metapod").closest("article");

    expect(metapodCard).not.toBeNull();

    const prioritySelect = within(metapodCard!).getByRole("combobox", {
      name: "Priority",
    });

    fireEvent.change(prioritySelect, {
      target: {
        value: "HIGH",
      },
    });

    await waitFor(() => {
      expect(mockUpdateWishlistPriority).toHaveBeenCalledWith(1, {
        priority: "HIGH",
      });
    });

    expect(mockToastSuccess).toHaveBeenCalledWith(
      "Metapod priority was updated.",
    );
  });

  it("should show error when priority update fails", async () => {
    mockFindWishlistCards.mockResolvedValue(CARDS);

    mockUpdateWishlistPriority.mockRejectedValue(new Error("Failed"));

    render(<WishlistPage />);

    await screen.findByText("Metapod");

    const metapodCard = screen.getByText("Metapod").closest("article");

    expect(metapodCard).not.toBeNull();

    const prioritySelect = within(metapodCard!).getByRole("combobox", {
      name: "Priority",
    });

    fireEvent.change(prioritySelect, {
      target: {
        value: "HIGH",
      },
    });

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Could not update wishlist priority.",
      );
    });
  });

  it("should remove a card from wishlist", async () => {
    mockFindWishlistCards.mockResolvedValue(CARDS);

    render(<WishlistPage />);

    await screen.findByText("Metapod");

    const metapodCard = screen.getByText("Metapod").closest("article");

    expect(metapodCard).not.toBeNull();

    fireEvent.click(
      within(metapodCard!).getByRole("button", {
        name: "Remove from wishlist",
      }),
    );

    expect(
      screen.getByRole("dialog", {
        name: "Remove from wishlist",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Are you sure you want to remove/),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Remove",
      }),
    );

    await waitFor(() => {
      expect(mockDeleteWishlistCard).toHaveBeenCalledWith(1);
    });

    expect(screen.queryByText("Metapod")).not.toBeInTheDocument();

    expect(mockToastSuccess).toHaveBeenCalledWith(
      "Card removed from wishlist.",
    );
  });

  it("should not remove card when confirmation is cancelled", async () => {
    mockFindWishlistCards.mockResolvedValue(CARDS);

    render(<WishlistPage />);

    await screen.findByText("Metapod");

    const metapodCard = screen.getByText("Metapod").closest("article");

    expect(metapodCard).not.toBeNull();

    fireEvent.click(
      within(metapodCard!).getByRole("button", {
        name: "Remove from wishlist",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Cancel",
      }),
    );

    expect(mockDeleteWishlistCard).not.toHaveBeenCalled();

    expect(screen.getByText("Metapod")).toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: "Cancel",
      }),
    ).not.toBeInTheDocument();
  });

  it("should remove card from wishlist after adding it to collection", async () => {
    mockFindWishlistCards.mockResolvedValue(CARDS);

    render(<WishlistPage />);

    await screen.findByText("Metapod");

    const metapodCard = screen.getByText("Metapod").closest("article");

    expect(metapodCard).not.toBeNull();

    fireEvent.click(
      within(metapodCard!).getByRole("button", {
        name: "Add to collection",
      }),
    );

    expect(
      screen.getByRole("button", {
        name: "Confirm add",
      }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Confirm add",
      }),
    );

    expect(mockDeleteWishlistCard).not.toHaveBeenCalled();

    expect(screen.queryByText("Metapod")).not.toBeInTheDocument();

    expect(mockToastSuccess).toHaveBeenCalledWith(
      "Metapod was added to your collection and removed from your wishlist.",
    );
  });

  it("should search wishlist cards by name", async () => {
    mockFindWishlistCards.mockResolvedValue(CARDS);

    render(<WishlistPage />);

    await screen.findByText("Metapod");

    fireEvent.change(
      screen.getByRole("searchbox", {
        name: "Search",
      }),
      {
        target: {
          value: "metapod",
        },
      },
    );

    expect(screen.getByText("Metapod")).toBeInTheDocument();

    expect(screen.queryByText("Pikachu")).not.toBeInTheDocument();

    expect(screen.queryByText("Charizard")).not.toBeInTheDocument();

    expect(screen.getByText("1 of 3 cards")).toBeInTheDocument();
  });

  it("should search wishlist cards by collection name", async () => {
    mockFindWishlistCards.mockResolvedValue(CARDS);

    render(<WishlistPage />);

    await screen.findByText("Metapod");

    fireEvent.change(
      screen.getByRole("searchbox", {
        name: "Search",
      }),
      {
        target: {
          value: "sun & moon",
        },
      },
    );

    expect(screen.getByText("Metapod")).toBeInTheDocument();

    expect(screen.queryByText("Pikachu")).not.toBeInTheDocument();

    expect(screen.queryByText("Charizard")).not.toBeInTheDocument();
  });

  it("should search wishlist cards by card number", async () => {
    mockFindWishlistCards.mockResolvedValue(CARDS);

    render(<WishlistPage />);

    await screen.findByText("Metapod");

    fireEvent.change(
      screen.getByRole("searchbox", {
        name: "Search",
      }),
      {
        target: {
          value: "42",
        },
      },
    );

    expect(screen.getByText("Pikachu")).toBeInTheDocument();

    expect(screen.queryByText("Metapod")).not.toBeInTheDocument();

    expect(screen.queryByText("Charizard")).not.toBeInTheDocument();
  });

  it("should show empty filtered state when no cards match search", async () => {
    mockFindWishlistCards.mockResolvedValue(CARDS);

    render(<WishlistPage />);

    await screen.findByText("Metapod");

    fireEvent.change(
      screen.getByRole("searchbox", {
        name: "Search",
      }),
      {
        target: {
          value: "Mewtwo",
        },
      },
    );

    expect(screen.getByText("No cards found")).toBeInTheDocument();

    expect(
      screen.getByText("No wishlist cards match your current filters."),
    ).toBeInTheDocument();

    expect(screen.getByText("0 of 3 cards")).toBeInTheDocument();
  });

  it("should clear wishlist filters", async () => {
    mockFindWishlistCards.mockResolvedValue(CARDS);

    render(<WishlistPage />);

    await screen.findByText("Metapod");

    fireEvent.change(
      screen.getByRole("searchbox", {
        name: "Search",
      }),
      {
        target: {
          value: "Mewtwo",
        },
      },
    );

    expect(screen.getByText("No cards found")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Clear filters",
      }),
    );

    expect(screen.getByText("Metapod")).toBeInTheDocument();

    expect(screen.getByText("Pikachu")).toBeInTheDocument();

    expect(screen.getByText("Charizard")).toBeInTheDocument();

    expect(screen.getByText("3 cards")).toBeInTheDocument();
  });

  it("should combine search and priority filter", async () => {
    mockFindWishlistCards.mockResolvedValue(CARDS);

    render(<WishlistPage />);

    await screen.findByText("Metapod");

    fireEvent.change(
      screen.getByRole("searchbox", {
        name: "Search",
      }),
      {
        target: {
          value: "pi",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "High",
      }),
    );

    expect(screen.getByText("Pikachu")).toBeInTheDocument();

    expect(screen.queryByText("Metapod")).not.toBeInTheDocument();

    expect(screen.queryByText("Charizard")).not.toBeInTheDocument();

    expect(screen.getByText("1 of 3 cards")).toBeInTheDocument();
  });

  it("should remove card from visible results when its priority no longer matches filter", async () => {
    mockFindWishlistCards.mockResolvedValue(CARDS);

    mockUpdateWishlistPriority.mockResolvedValue({
      ...CARDS[1],
      priority: "MEDIUM",
      updatedAt: "2026-08-11T10:00:00",
    });

    render(<WishlistPage />);

    await screen.findByText("Pikachu");

    fireEvent.click(
      screen.getByRole("button", {
        name: "High",
      }),
    );

    expect(screen.getByText("Pikachu")).toBeInTheDocument();

    const pikachuCard = screen.getByText("Pikachu").closest("article");

    expect(pikachuCard).not.toBeNull();

    const prioritySelect = within(pikachuCard!).getByRole("combobox", {
      name: "Priority",
    });

    fireEvent.change(prioritySelect, {
      target: {
        value: "MEDIUM",
      },
    });

    await waitFor(() => {
      expect(mockUpdateWishlistPriority).toHaveBeenCalledWith(2, {
        priority: "MEDIUM",
      });
    });

    await waitFor(() => {
      expect(screen.queryByText("Pikachu")).not.toBeInTheDocument();
    });

    expect(screen.getByText("No cards found")).toBeInTheDocument();

    expect(screen.getByText("0 of 3 cards")).toBeInTheDocument();
  });
});
