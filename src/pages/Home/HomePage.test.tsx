import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { HomePage } from "./HomePage";

const mockGetCollectionSummary = vi.hoisted(() => vi.fn());

const mockGetCollectionAnalytics = vi.hoisted(() => vi.fn());

const mockGetCollectionGoals = vi.hoisted(() => vi.fn());

const mockGetCollectionProgress = vi.hoisted(() => vi.fn());

const mockFindCards = vi.hoisted(() => vi.fn());

const mockFindWishlistCards = vi.hoisted(() => vi.fn());

vi.mock("../../services/cards/cardService", () => ({
  getCollectionSummary: mockGetCollectionSummary,
  getCollectionAnalytics: mockGetCollectionAnalytics,
  getCollectionGoals: mockGetCollectionGoals,
  getCollectionProgress: mockGetCollectionProgress,
  findCards: mockFindCards,
}));

vi.mock("../../services/wishlist/wishlistService", () => ({
  findWishlistCards: mockFindWishlistCards,
}));

vi.mock("../../components/home/CollectionSummarySection", () => ({
  CollectionSummarySection: () => <div>Collection summary</div>,
}));

vi.mock("../../components/home/CollectionAnalyticsSection", () => ({
  CollectionAnalyticsSection: () => <div>Collection analytics</div>,
}));

vi.mock("../../components/home/CollectionGoalsSection", () => ({
  CollectionGoalsSection: () => <div>Collection goals</div>,
}));

vi.mock("../../components/home/CollectionProgressSection", () => ({
  CollectionProgressSection: () => <div>Collection progress</div>,
}));

vi.mock("../../components/home/CardShowcaseSection", () => ({
  CardShowcaseSection: ({ title }: { title: string }) => <div>{title}</div>,
}));

const SUMMARY = {
  uniqueCards: 10,
  totalCards: 12,
  differentLanguages: 2,
  differentCollections: 3,
  mostOwnedCard: null,
};

const ANALYTICS = {
  collections: [],
  languages: [],
  conditions: [],
  rarities: [],
};

const GOALS = {
  completedGoals: 1,
  totalGoals: 8,
  goals: [],
};

const PROGRESS = [
  {
    collectionId: "sm1",
    collectionName: "Sun & Moon",
    ownedCards: 4,
    totalCards: 173,
    completionPercentage: 2.31,
  },
];

const WISHLIST = [
  {
    id: 1,
    externalId: "sm1-1",
    name: "Caterpie",
    cardNumber: "1",
    collectionId: "sm1",
    collectionName: "Sun & Moon",
    series: "Sun & Moon",
    rarity: "Common",
    imageUrl: null,
    priority: "HIGH" as const,
    createdAt: "2026-08-19T10:00:00",
    updatedAt: "2026-08-19T10:00:00",
  },
  {
    id: 2,
    externalId: "sm1-2",
    name: "Metapod",
    cardNumber: "2",
    collectionId: "sm1",
    collectionName: "Sun & Moon",
    series: "Sun & Moon",
    rarity: "Uncommon",
    imageUrl: null,
    priority: "MEDIUM" as const,
    createdAt: "2026-08-19T10:00:00",
    updatedAt: "2026-08-19T10:00:00",
  },
  {
    id: 3,
    externalId: "sm1-3",
    name: "Butterfree",
    cardNumber: "3",
    collectionId: "sm1",
    collectionName: "Sun & Moon",
    series: "Sun & Moon",
    rarity: "Rare",
    imageUrl: null,
    priority: "LOW" as const,
    createdAt: "2026-08-19T10:00:00",
    updatedAt: "2026-08-19T10:00:00",
  },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );
}

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetCollectionSummary.mockResolvedValue(SUMMARY);

    mockGetCollectionAnalytics.mockResolvedValue(ANALYTICS);

    mockGetCollectionGoals.mockResolvedValue(GOALS);

    mockGetCollectionProgress.mockResolvedValue(PROGRESS);

    mockFindCards
      .mockResolvedValueOnce({
        content: [],
      })
      .mockResolvedValueOnce({
        content: [],
      });

    mockFindWishlistCards.mockResolvedValue(WISHLIST);
  });

  it("should load and render home information", async () => {
    renderPage();

    expect(screen.getByText("Loading home information...")).toBeInTheDocument();

    expect(await screen.findByText("Collection summary")).toBeInTheDocument();

    expect(screen.getByText("Collection analytics")).toBeInTheDocument();

    expect(screen.getByText("Collection goals")).toBeInTheDocument();

    expect(screen.getByText("Collection progress")).toBeInTheDocument();

    expect(mockFindWishlistCards).toHaveBeenCalledTimes(1);
  });

  it("should render wishlist priority summary", async () => {
    renderPage();

    await screen.findByText("Wishlist priorities");

    expect(screen.getByText("High priority")).toBeInTheDocument();

    expect(screen.getByText("Medium priority")).toBeInTheDocument();

    expect(screen.getByText("Low priority")).toBeInTheDocument();

    expect(screen.getAllByText("1")).toHaveLength(3);
  });

  it("should render wishlist empty state", async () => {
    mockFindWishlistCards.mockResolvedValue([]);

    renderPage();

    expect(
      await screen.findByText("Your wishlist is empty."),
    ).toBeInTheDocument();

    const searchCardsLinks = screen.getAllByRole("link", {
      name: "Search cards",
    });

    expect(searchCardsLinks).toHaveLength(2);

    expect(searchCardsLinks[1]).toHaveAttribute("href", "/search");
  });

  it("should link wishlist summary to wishlist page", async () => {
    renderPage();

    await screen.findByText("Wishlist priorities");

    expect(
      screen.getByRole("link", {
        name: "View wishlist",
      }),
    ).toHaveAttribute("href", "/wishlist");
  });

  it("should show error when home loading fails", async () => {
    mockGetCollectionSummary.mockRejectedValue(new Error("Failed"));

    renderPage();

    expect(
      await screen.findByText("Could not load the home page information."),
    ).toBeInTheDocument();
  });
});
