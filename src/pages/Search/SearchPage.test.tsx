import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SearchPage } from "./SearchPage";

const mockSearchPokemonCards = vi.hoisted(() => vi.fn());
const mockCreateWishlistCard = vi.hoisted(() => vi.fn());
const mockToastSuccess = vi.hoisted(() => vi.fn());
const mockToastError = vi.hoisted(() => vi.fn());

vi.mock("../../services/pokemon/pokemonCardService", () => ({
  searchPokemonCards: mockSearchPokemonCards,
}));

vi.mock("../../services/wishlist/wishlistService", () => ({
  createWishlistCard: mockCreateWishlistCard,
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: mockToastSuccess,
    error: mockToastError,
  },
}));

vi.mock("../../components/cards/AddCardForm", () => ({
  AddCardForm: ({
    onCancel,
    onSuccess,
  }: {
    externalId: string;
    onCancel: () => void;
    onSuccess: () => void;
  }) => (
    <div>
      <button
        type="button"
        onClick={onCancel}
      >
        Cancel add
      </button>

      <button
        type="button"
        onClick={onSuccess}
      >
        Confirm add
      </button>
    </div>
  ),
}));

const FIRST_PAGE = {
  content: [
    {
      externalId: "base1-4",
      name: "Charizard",
      cardNumber: "4",
      collectionId: "base1",
      collectionName: "Base Set",
      series: "Base",
      rarity: "Rare Holo",
      imageUrl: "https://example.com/charizard.png",
    },
  ],
  page: 1,
  size: 20,
  totalElements: 2,
  totalPages: 2,
  first: true,
  last: false,
};

const SECOND_PAGE = {
  content: [
    {
      externalId: "swsh4-25",
      name: "Charizard",
      cardNumber: "25",
      collectionId: "swsh4",
      collectionName: "Vivid Voltage",
      series: "Sword & Shield",
      rarity: "Rare",
      imageUrl: null,
    },
  ],
  page: 2,
  size: 20,
  totalElements: 2,
  totalPages: 2,
  first: false,
  last: true,
};

describe("SearchPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show error when card name is empty", () => {
    render(<SearchPage />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Search",
      }),
    );

    expect(
      screen.getByText("Enter a card name."),
    ).toBeInTheDocument();

    expect(mockSearchPokemonCards)
      .not.toHaveBeenCalled();
  });

  it("should search cards by name", async () => {
    mockSearchPokemonCards.mockResolvedValue(FIRST_PAGE);

    render(<SearchPage />);

    fireEvent.change(
      screen.getByLabelText("Card name"),
      {
        target: {
          value: "  Charizard  ",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Search",
      }),
    );

    await waitFor(() => {
      expect(mockSearchPokemonCards)
        .toHaveBeenCalledWith({
          name: "Charizard",
          page: 1,
          size: 20,
        });
    });

    expect(
      screen.getByText("Charizard"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Base Set"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Showing 1 of 2 cards"),
    ).toBeInTheDocument();
  });

  it("should show empty state when no cards are found", async () => {
    mockSearchPokemonCards.mockResolvedValue({
      content: [],
      page: 1,
      size: 20,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    });

    render(<SearchPage />);

    fireEvent.change(
      screen.getByLabelText("Card name"),
      {
        target: {
          value: "Missingno",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Search",
      }),
    );

    await waitFor(() => {
      expect(
        screen.getByText("No cards found."),
      ).toBeInTheDocument();
    });
  });

  it("should load more cards without replacing previous results", async () => {
    mockSearchPokemonCards
      .mockResolvedValueOnce(FIRST_PAGE)
      .mockResolvedValueOnce(SECOND_PAGE);

    render(<SearchPage />);

    fireEvent.change(
      screen.getByLabelText("Card name"),
      {
        target: {
          value: "Charizard",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Search",
      }),
    );

    await screen.findByText("Base Set");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Load more",
      }),
    );

    await waitFor(() => {
      expect(mockSearchPokemonCards)
        .toHaveBeenNthCalledWith(
          2,
          {
            name: "Charizard",
            page: 2,
            size: 20,
          },
        );
    });

    expect(
      screen.getByText("Base Set"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Vivid Voltage"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Showing 2 of 2 cards"),
    ).toBeInTheDocument();
  });

  it("should add card to wishlist", async () => {
    mockSearchPokemonCards.mockResolvedValue(FIRST_PAGE);
    mockCreateWishlistCard.mockResolvedValue({});

    render(<SearchPage />);

    fireEvent.change(
      screen.getByLabelText("Card name"),
      {
        target: {
          value: "Charizard",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Search",
      }),
    );

    await screen.findByText("Base Set");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Add to wishlist",
      }),
    );

    await waitFor(() => {
      expect(mockCreateWishlistCard)
        .toHaveBeenCalledWith({
          externalId: "base1-4",
        });
    });

    expect(mockToastSuccess)
      .toHaveBeenCalledWith(
        "Card added to wishlist.",
      );
  });

  it("should show error when adding card to wishlist fails", async () => {
    mockSearchPokemonCards.mockResolvedValue(FIRST_PAGE);
    mockCreateWishlistCard.mockRejectedValue(
      new Error("Failed"),
    );

    render(<SearchPage />);

    fireEvent.change(
      screen.getByLabelText("Card name"),
      {
        target: {
          value: "Charizard",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Search",
      }),
    );

    await screen.findByText("Base Set");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Add to wishlist",
      }),
    );

    await waitFor(() => {
      expect(mockToastError)
        .toHaveBeenCalledWith(
          "Could not add card to wishlist.",
        );
    });
  });

  it("should open add to collection modal and close it after success", async () => {
    mockSearchPokemonCards.mockResolvedValue(FIRST_PAGE);

    render(<SearchPage />);

    fireEvent.change(
      screen.getByLabelText("Card name"),
      {
        target: {
          value: "Charizard",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Search",
      }),
    );

    await screen.findByText("Base Set");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Add to collection",
      }),
    );

    expect(
      screen.getByRole("dialog", {
        name: "Add Charizard",
      }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Confirm add",
      }),
    );

    expect(mockToastSuccess)
      .toHaveBeenCalledWith(
        "Charizard was added to your collection.",
      );

    expect(
      screen.queryByRole("dialog", {
        name: "Add Charizard",
      }),
    ).not.toBeInTheDocument();
  });
});