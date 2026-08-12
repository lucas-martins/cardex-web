import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  MemoryRouter,
  Route,
  Routes,
} from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CollectionDetailsPage } from "./CollectionDetailsPage";

const mockGetCollectionChecklist =
  vi.hoisted(() => vi.fn());

const mockCreateWishlistCard =
  vi.hoisted(() => vi.fn());

const mockToastSuccess =
  vi.hoisted(() => vi.fn());

const mockToastError =
  vi.hoisted(() => vi.fn());

vi.mock("../../services/cards/cardService", () => ({
  getCollectionChecklist:
    mockGetCollectionChecklist,
}));

vi.mock(
  "../../services/wishlist/wishlistService",
  () => ({
    createWishlistCard:
      mockCreateWishlistCard,
  }),
);

vi.mock("react-hot-toast", () => ({
  default: {
    success: mockToastSuccess,
    error: mockToastError,
  },
}));

vi.mock(
  "../../components/cards/AddCardForm",
  () => ({
    AddCardForm: ({
      onCancel,
      onSuccess,
    }: {
      externalId: string;
      onCancel: () => void;
      onSuccess: () => void | Promise<void>;
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
          onClick={() => {
            void onSuccess();
          }}
        >
          Confirm add
        </button>
      </div>
    ),
  }),
);

const CHECKLIST = {
  collectionId: "sm1",
  collectionName: "Sun & Moon",
  ownedUniqueCards: 1,
  totalCards: 3,
  completionPercentage: 33.33,
  cards: [
    {
      externalId: "sm1-1",
      name: "Caterpie",
      cardNumber: "1",
      rarity: "Common",
      imageUrl:
        "https://example.com/caterpie.png",
      owned: false,
      cardId: null,
    },
    {
      externalId: "sm1-2",
      name: "Metapod",
      cardNumber: "2",
      rarity: "Uncommon",
      imageUrl:
        "https://example.com/metapod.png",
      owned: false,
      cardId: null,
    },
    {
      externalId: "sm1-12",
      name: "Decidueye-GX",
      cardNumber: "12",
      rarity: "Rare Holo GX",
      imageUrl:
        "https://example.com/decidueye.png",
      owned: true,
      cardId: 10,
    },
  ],
};

function renderPage() {
  return render(
    <MemoryRouter
      initialEntries={["/collections/sm1"]}
    >
      <Routes>
        <Route
          path="/collections/:collectionId"
          element={<CollectionDetailsPage />}
        />

        <Route
          path="/collection/:id"
          element={<div>Card details</div>}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("CollectionDetailsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should load and render collection checklist", async () => {
    mockGetCollectionChecklist.mockResolvedValue(
      CHECKLIST,
    );

    renderPage();

    expect(
      screen.getByText("Loading collection checklist..."),
    ).toBeInTheDocument();

    expect(
      await screen.findByText("Sun & Moon"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "1 / 3 cards collected",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText("33.33%"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Caterpie"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Metapod"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Decidueye-GX"),
    ).toBeInTheDocument();

    expect(mockGetCollectionChecklist)
      .toHaveBeenCalledWith("sm1");
  });

  it("should filter owned cards", async () => {
    mockGetCollectionChecklist.mockResolvedValue(
      CHECKLIST,
    );

    renderPage();

    await screen.findByText("Sun & Moon");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Owned",
      }),
    );

    expect(
      screen.getByText("Decidueye-GX"),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Caterpie"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Metapod"),
    ).not.toBeInTheDocument();
  });

  it("should filter missing cards", async () => {
    mockGetCollectionChecklist.mockResolvedValue(
      CHECKLIST,
    );

    renderPage();

    await screen.findByText("Sun & Moon");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Missing",
      }),
    );

    expect(
      screen.getByText("Caterpie"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Metapod"),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Decidueye-GX"),
    ).not.toBeInTheDocument();
  });

  it("should navigate to owned card details", async () => {
    mockGetCollectionChecklist.mockResolvedValue(
      CHECKLIST,
    );

    renderPage();

    await screen.findByText("Decidueye-GX");

    fireEvent.click(
      screen.getByText("Decidueye-GX"),
    );

    expect(
      await screen.findByText(
        "Card details",
      ),
    ).toBeInTheDocument();
  });

  it("should add missing card to wishlist", async () => {
    mockGetCollectionChecklist.mockResolvedValue(
      CHECKLIST,
    );

    mockCreateWishlistCard.mockResolvedValue(
      undefined,
    );

    renderPage();

    await screen.findByText("Caterpie");

    const wishlistButtons =
      screen.getAllByRole("button", {
        name: "Add to wishlist",
      });

    fireEvent.click(wishlistButtons[0]);

    await waitFor(() => {
      expect(mockCreateWishlistCard)
        .toHaveBeenCalledWith({
          externalId: "sm1-1",
        });
    });

    expect(mockToastSuccess)
      .toHaveBeenCalledWith(
        "Caterpie was added to your wishlist.",
      );
  });

  it("should add missing card to collection and refresh checklist", async () => {
    const refreshedChecklist = {
      ...CHECKLIST,
      ownedUniqueCards: 2,
      completionPercentage: 66.67,
      cards: CHECKLIST.cards.map((card) =>
        card.externalId === "sm1-1"
          ? {
              ...card,
              owned: true,
              cardId: 20,
            }
          : card,
      ),
    };

    mockGetCollectionChecklist
      .mockResolvedValueOnce(CHECKLIST)
      .mockResolvedValueOnce(
        refreshedChecklist,
      );

    renderPage();

    await screen.findByText("Caterpie");

    const addButtons =
      screen.getAllByRole("button", {
        name: "Add to collection",
      });

    fireEvent.click(addButtons[0]);

    expect(
      screen.getByRole("dialog", {
        name: "Add Caterpie",
      }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Confirm add",
      }),
    );

    await waitFor(() => {
      expect(mockGetCollectionChecklist)
        .toHaveBeenCalledTimes(2);
    });

    expect(
      screen.getByText(
        "2 / 3 cards collected",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText("66.67%"),
    ).toBeInTheDocument();

    expect(mockToastSuccess)
      .toHaveBeenCalledWith(
        "Caterpie was added to your collection.",
      );
  });

  it("should show error when checklist loading fails", async () => {
    mockGetCollectionChecklist.mockRejectedValue(
      new Error("Failed"),
    );

    renderPage();

    expect(
      await screen.findByText(
        "Could not load the collection.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Back to collection"),
    ).toBeInTheDocument();
  });
});