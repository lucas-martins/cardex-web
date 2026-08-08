import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { WishlistPage } from "./WishlistPage";

const mockFindWishlistCards = vi.hoisted(() => vi.fn());
const mockDeleteWishlistCard = vi.hoisted(() => vi.fn());

const mockToastError = vi.hoisted(() => vi.fn());
const mockToastSuccess = vi.hoisted(() => vi.fn());

vi.mock("../../services/wishlist/wishlistService", () => ({
  findWishlistCards: mockFindWishlistCards,
  deleteWishlistCard: mockDeleteWishlistCard,
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
    createdAt: "2026-08-08T10:00:00",
    updatedAt: "2026-08-08T10:00:00",
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

    expect(screen.getByText("2 cards")).toBeInTheDocument();
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

  it("should remove a card from wishlist", async () => {
    mockFindWishlistCards.mockResolvedValue(CARDS);
    mockDeleteWishlistCard.mockResolvedValue(undefined);

    render(<WishlistPage />);

    await screen.findByText("Metapod");

    const removeButtons = screen.getAllByRole("button", {
      name: "Remove from wishlist",
    });

    fireEvent.click(removeButtons[0]);

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

    const removeButtons = screen.getAllByRole("button", {
      name: "Remove from wishlist",
    });

    fireEvent.click(removeButtons[0]);

    expect(
      screen.getByRole("button", {
        name: "Cancel",
      }),
    ).toBeInTheDocument();

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
    mockDeleteWishlistCard.mockResolvedValue(undefined);

    render(<WishlistPage />);

    await screen.findByText("Metapod");

    const addButtons = screen.getAllByRole("button", {
      name: "Add to collection",
    });

    fireEvent.click(addButtons[0]);

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

    await waitFor(() => {
      expect(mockDeleteWishlistCard).toHaveBeenCalledWith(1);
    });

    expect(screen.queryByText("Metapod")).not.toBeInTheDocument();

    expect(mockToastSuccess).toHaveBeenCalledWith(
      "Metapod was added to your collection and removed from your wishlist.",
    );
  });
});
