import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CollectionDetailsPage } from "./CollectionDetailsPage";

const mockGetCollectionChecklist = vi.hoisted(() => vi.fn());

const mockCreateWishlistCard = vi.hoisted(() => vi.fn());

const mockToastSuccess = vi.hoisted(() => vi.fn());

const mockToastError = vi.hoisted(() => vi.fn());

vi.mock("../../services/cards/cardService", () => ({
  getCollectionChecklist: mockGetCollectionChecklist,
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
      imageUrl: "https://example.com/caterpie.png",
      owned: false,
      cardId: null,
      inWishlist: false,
      wishlistId: null,
      wishlistPriority: null,
    },
    {
      externalId: "sm1-2",
      name: "Metapod",
      cardNumber: "2",
      rarity: "Uncommon",
      imageUrl: "https://example.com/metapod.png",
      owned: false,
      cardId: null,
      inWishlist: true,
      wishlistId: 50,
      wishlistPriority: "HIGH" as const,
    },
    {
      externalId: "sm1-12",
      name: "Decidueye-GX",
      cardNumber: "12",
      rarity: "Rare Holo GX",
      imageUrl: "https://example.com/decidueye.png",
      owned: true,
      cardId: 10,
      inWishlist: false,
      wishlistId: null,
      wishlistPriority: null,
    },
  ],
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/collections/sm1"]}>
      <Routes>
        <Route
          path="/collections/:collectionId"
          element={<CollectionDetailsPage />}
        />

        <Route path="/collection/:id" element={<div>Card details</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("CollectionDetailsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should load and render collection checklist", async () => {
    mockGetCollectionChecklist.mockResolvedValue(CHECKLIST);

    renderPage();

    expect(
      screen.getByText("Loading collection checklist..."),
    ).toBeInTheDocument();

    expect(await screen.findByText("Sun & Moon")).toBeInTheDocument();

    expect(screen.getByText("1 / 3 cards collected")).toBeInTheDocument();

    expect(screen.getByText("33.33%")).toBeInTheDocument();

    expect(screen.getByText("Caterpie")).toBeInTheDocument();

    expect(screen.getByText("Metapod")).toBeInTheDocument();

    expect(screen.getByText("Decidueye-GX")).toBeInTheDocument();

    expect(mockGetCollectionChecklist).toHaveBeenCalledWith("sm1");
  });

  it("should filter owned cards", async () => {
    mockGetCollectionChecklist.mockResolvedValue(CHECKLIST);

    renderPage();

    await screen.findByText("Sun & Moon");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Owned",
      }),
    );

    expect(screen.getByText("Decidueye-GX")).toBeInTheDocument();

    expect(screen.queryByText("Caterpie")).not.toBeInTheDocument();

    expect(screen.queryByText("Metapod")).not.toBeInTheDocument();
  });

  it("should filter missing cards", async () => {
    mockGetCollectionChecklist.mockResolvedValue(CHECKLIST);

    renderPage();

    await screen.findByText("Sun & Moon");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Missing",
      }),
    );

    expect(screen.getByText("Caterpie")).toBeInTheDocument();

    expect(screen.getByText("Metapod")).toBeInTheDocument();

    expect(screen.queryByText("Decidueye-GX")).not.toBeInTheDocument();
  });

  it("should show wishlist information for missing card already in wishlist", async () => {
    mockGetCollectionChecklist.mockResolvedValue(CHECKLIST);

    renderPage();

    await screen.findByText("Metapod");

    expect(screen.getByText("✓ In wishlist")).toBeInTheDocument();

    expect(screen.getByText("High")).toBeInTheDocument();
  });

  it("should show add to wishlist for missing card not in wishlist", async () => {
    mockGetCollectionChecklist.mockResolvedValue(CHECKLIST);

    renderPage();

    await screen.findByText("Caterpie");

    expect(
      screen.getByRole("button", {
        name: "Add to wishlist",
      }),
    ).toBeInTheDocument();
  });

  it("should navigate to owned card details", async () => {
    mockGetCollectionChecklist.mockResolvedValue(CHECKLIST);

    renderPage();

    await screen.findByText("Decidueye-GX");

    fireEvent.click(screen.getByText("Decidueye-GX"));

    expect(await screen.findByText("Card details")).toBeInTheDocument();
  });

  it("should add missing card to wishlist and update checklist state", async () => {
    mockGetCollectionChecklist.mockResolvedValue(CHECKLIST);

    mockCreateWishlistCard.mockResolvedValue({
      id: 60,
      externalId: "sm1-1",
      name: "Caterpie",
      cardNumber: "1",
      collectionId: "sm1",
      collectionName: "Sun & Moon",
      series: "Sun & Moon",
      rarity: "Common",
      imageUrl: "https://example.com/caterpie.png",
      priority: "MEDIUM",
      createdAt: "2026-08-19T10:00:00",
      updatedAt: "2026-08-19T10:00:00",
    });

    renderPage();

    await screen.findByText("Caterpie");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Add to wishlist",
      }),
    );

    await waitFor(() => {
      expect(mockCreateWishlistCard).toHaveBeenCalledWith({
        externalId: "sm1-1",
      });
    });

    await waitFor(() => {
      expect(screen.getAllByText("✓ In wishlist").length).toBe(2);
    });

    expect(screen.getByText("Medium")).toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: "Add to wishlist",
      }),
    ).not.toBeInTheDocument();

    expect(mockToastSuccess).toHaveBeenCalledWith(
      "Caterpie was added to your wishlist.",
    );
  });

  it("should keep card outside wishlist when adding fails", async () => {
    mockGetCollectionChecklist.mockResolvedValue(CHECKLIST);

    mockCreateWishlistCard.mockRejectedValue(new Error("Failed"));

    renderPage();

    await screen.findByText("Caterpie");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Add to wishlist",
      }),
    );

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Could not add card to wishlist.",
      );
    });

    expect(
      screen.getByRole("button", {
        name: "Add to wishlist",
      }),
    ).toBeInTheDocument();
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
      .mockResolvedValueOnce(refreshedChecklist);

    renderPage();

    await screen.findByText("Caterpie");

    const addButtons = screen.getAllByRole("button", {
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
      expect(mockGetCollectionChecklist).toHaveBeenCalledTimes(2);
    });

    expect(screen.getByText("2 / 3 cards collected")).toBeInTheDocument();

    expect(screen.getByText("66.67%")).toBeInTheDocument();

    expect(mockToastSuccess).toHaveBeenCalledWith(
      "Caterpie was added to your collection.",
    );
  });

  it("should show error when checklist loading fails", async () => {
    mockGetCollectionChecklist.mockRejectedValue(new Error("Failed"));

    renderPage();

    expect(
      await screen.findByText("Could not load the collection."),
    ).toBeInTheDocument();

    expect(screen.getByText("Back to collection")).toBeInTheDocument();
  });

  it("should filter wishlist cards", async () => {
    mockGetCollectionChecklist.mockResolvedValue(CHECKLIST);

    renderPage();

    await screen.findByText("Sun & Moon");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Wishlist",
      }),
    );

    expect(screen.getByText("Metapod")).toBeInTheDocument();

    expect(screen.queryByText("Caterpie")).not.toBeInTheDocument();

    expect(screen.queryByText("Decidueye-GX")).not.toBeInTheDocument();

    expect(screen.getByText("✓ In wishlist")).toBeInTheDocument();

    expect(screen.getByText("High")).toBeInTheDocument();
  });
});
