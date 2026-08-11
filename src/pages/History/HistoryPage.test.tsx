import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { HistoryPage } from "./HistoryPage";
import { MemoryRouter } from "react-router-dom";

const mockFindCardHistory = vi.hoisted(() => vi.fn());
const mockToastError = vi.hoisted(() => vi.fn());

vi.mock("../../services/history/cardHistoryService", () => ({
  findCardHistory: mockFindCardHistory,
}));

vi.mock("react-hot-toast", () => ({
  default: {
    error: mockToastError,
  },
}));

const FIRST_PAGE = {
  content: [
    {
      id: 2,
      cardId: 1,
      externalId: "sm1-12",
      cardName: "Decidueye-GX",
      action: "UPDATED",
      description: "Quantity changed from 1 to 3.",
      createdAt: "2026-08-09T18:15:00",
      cardExists: true,
    },
    {
      id: 1,
      cardId: 1,
      externalId: "sm1-12",
      cardName: "Decidueye-GX",
      action: "ADDED",
      description: "Card added to collection.",
      createdAt: "2026-08-09T18:10:00",
      cardExists: true,
    },
  ],
  totalElements: 3,
  totalPages: 2,
  number: 0,
  size: 20,
  first: true,
  last: false,
};

const SECOND_PAGE = {
  content: [
    {
      id: 3,
      cardId: 2,
      externalId: "xy1-42",
      cardName: "Pikachu",
      action: "FAVORITED",
      description: "Card marked as favorite.",
      createdAt: "2026-08-09T18:05:00",
      cardExists: true,
    },
  ],
  totalElements: 3,
  totalPages: 2,
  number: 1,
  size: 20,
  first: false,
  last: true,
};

describe("HistoryPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show loading state", () => {
    mockFindCardHistory.mockReturnValue(new Promise(() => {}));

    render(
      <MemoryRouter>
        <HistoryPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Loading history...")).toBeInTheDocument();
  });

  it("should load and render history", async () => {
    mockFindCardHistory.mockResolvedValue(FIRST_PAGE);

    render(
      <MemoryRouter>
        <HistoryPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByText("Quantity changed from 1 to 3."),
      ).toBeInTheDocument();
    });

    expect(screen.getByText("Card added to collection.")).toBeInTheDocument();

    expect(screen.getByText("3 events")).toBeInTheDocument();

    expect(mockFindCardHistory).toHaveBeenCalledWith(0, 20, undefined);
  });

  it("should render empty state", async () => {
    mockFindCardHistory.mockResolvedValue({
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: 20,
      first: true,
      last: true,
    });

    render(
      <MemoryRouter>
        <HistoryPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("No activity yet")).toBeInTheDocument();

    expect(
      screen.getByText("Changes to your collection will appear here."),
    ).toBeInTheDocument();

    expect(screen.getByText("0 events")).toBeInTheDocument();
  });

  it("should show error when history loading fails", async () => {
    mockFindCardHistory.mockRejectedValue(new Error("Failed"));

    render(
      <MemoryRouter>
        <HistoryPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Could not load card history.",
      );
    });
  });

  it("should load more history", async () => {
    mockFindCardHistory
      .mockResolvedValueOnce(FIRST_PAGE)
      .mockResolvedValueOnce(SECOND_PAGE);

    render(
      <MemoryRouter>
        <HistoryPage />
      </MemoryRouter>,
    );

    await screen.findByText("Quantity changed from 1 to 3.");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Load more",
      }),
    );

    expect(
      await screen.findByText("Card marked as favorite."),
    ).toBeInTheDocument();

    expect(mockFindCardHistory).toHaveBeenNthCalledWith(2, 1, 20, undefined);

    expect(
      screen.queryByRole("button", {
        name: "Load more",
      }),
    ).not.toBeInTheDocument();
  });

  it("should show error when loading more fails", async () => {
    mockFindCardHistory
      .mockResolvedValueOnce(FIRST_PAGE)
      .mockRejectedValueOnce(new Error("Failed"));

    render(
      <MemoryRouter>
        <HistoryPage />
      </MemoryRouter>,
    );

    await screen.findByText("Quantity changed from 1 to 3.");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Load more",
      }),
    );

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Could not load more history.",
      );
    });

    expect(
      screen.getByRole("button", {
        name: "Load more",
      }),
    ).toBeInTheDocument();
  });

  it("should not link to card details when card no longer exists", async () => {
    mockFindCardHistory.mockResolvedValue({
      content: [
        {
          id: 1,
          cardId: 10,
          externalId: "sm1-12",
          cardName: "Decidueye-GX",
          action: "ADDED",
          description: "Card added to collection.",
          createdAt: "2026-08-09T18:10:00",
          cardExists: false,
        },
      ],
      totalElements: 1,
      totalPages: 1,
      number: 0,
      size: 20,
      first: true,
      last: true,
    });

    render(
      <MemoryRouter>
        <HistoryPage />
      </MemoryRouter>,
    );

    await screen.findByText("Decidueye-GX");

    expect(
      screen.queryByRole("link", {
        name: /Decidueye-GX/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("should filter history by action", async () => {
    mockFindCardHistory
      .mockResolvedValueOnce(FIRST_PAGE)
      .mockResolvedValueOnce({
        content: [
          {
            id: 2,
            cardId: 1,
            externalId: "sm1-12",
            cardName: "Decidueye-GX",
            action: "UPDATED",
            description: "Quantity changed from 1 to 3.",
            createdAt: "2026-08-09T18:15:00",
            cardExists: true,
          },
        ],
        totalElements: 1,
        totalPages: 1,
        number: 0,
        size: 20,
        first: true,
        last: true,
      });

    render(
      <MemoryRouter>
        <HistoryPage />
      </MemoryRouter>,
    );

    await screen.findByText("Card added to collection.");

    fireEvent.change(screen.getByLabelText("Event type"), {
      target: {
        value: "UPDATED",
      },
    });

    await waitFor(() => {
      expect(mockFindCardHistory).toHaveBeenLastCalledWith(0, 20, "UPDATED");
    });

    expect(
      await screen.findByText("Quantity changed from 1 to 3."),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Card added to collection."),
    ).not.toBeInTheDocument();
  });
});
