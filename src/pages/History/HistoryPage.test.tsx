import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import { HistoryPage } from "./HistoryPage";

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

const FILTERED_PAGE = {
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

    expect(mockFindCardHistory).toHaveBeenCalledWith(
      0,
      20,
      undefined,
      undefined,
    );
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

    expect(await screen.findByText("No activity found")).toBeInTheDocument();

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

    expect(mockFindCardHistory).toHaveBeenNthCalledWith(
      2,
      1,
      20,
      undefined,
      undefined,
    );

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
      .mockResolvedValueOnce(FILTERED_PAGE);

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
      expect(mockFindCardHistory).toHaveBeenLastCalledWith(
        0,
        20,
        "UPDATED",
        undefined,
      );
    });

    expect(
      await screen.findByText("Quantity changed from 1 to 3."),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Card added to collection."),
    ).not.toBeInTheDocument();
  });

  it("should search history by card name", async () => {
    mockFindCardHistory
      .mockResolvedValueOnce(FIRST_PAGE)
      .mockResolvedValueOnce(FILTERED_PAGE);

    render(
      <MemoryRouter>
        <HistoryPage />
      </MemoryRouter>,
    );

    await screen.findByText("Card added to collection.");

    fireEvent.change(screen.getByLabelText("Card name"), {
      target: {
        value: "  Decidueye  ",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Search",
      }),
    );

    await waitFor(() => {
      expect(mockFindCardHistory).toHaveBeenLastCalledWith(
        0,
        20,
        undefined,
        "Decidueye",
      );
    });

    expect(
      await screen.findByText("Quantity changed from 1 to 3."),
    ).toBeInTheDocument();
  });

  it("should combine action and card name filters", async () => {
    mockFindCardHistory
      .mockResolvedValueOnce(FIRST_PAGE)
      .mockResolvedValueOnce(FILTERED_PAGE)
      .mockResolvedValueOnce(FILTERED_PAGE);

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
      expect(mockFindCardHistory).toHaveBeenLastCalledWith(
        0,
        20,
        "UPDATED",
        undefined,
      );
    });

    fireEvent.change(screen.getByLabelText("Card name"), {
      target: {
        value: "Decidueye",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Search",
      }),
    );

    await waitFor(() => {
      expect(mockFindCardHistory).toHaveBeenLastCalledWith(
        0,
        20,
        "UPDATED",
        "Decidueye",
      );
    });
  });

  it("should clear card name filter", async () => {
    mockFindCardHistory
      .mockResolvedValueOnce(FIRST_PAGE)
      .mockResolvedValueOnce(FILTERED_PAGE)
      .mockResolvedValueOnce(FIRST_PAGE);

    render(
      <MemoryRouter>
        <HistoryPage />
      </MemoryRouter>,
    );

    await screen.findByText("Card added to collection.");

    fireEvent.change(screen.getByLabelText("Card name"), {
      target: {
        value: "Decidueye",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Search",
      }),
    );

    await waitFor(() => {
      expect(mockFindCardHistory).toHaveBeenLastCalledWith(
        0,
        20,
        undefined,
        "Decidueye",
      );
    });

    expect(
      screen.getByRole("button", {
        name: "Clear",
      }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Clear",
      }),
    );

    await waitFor(() => {
      expect(mockFindCardHistory).toHaveBeenLastCalledWith(
        0,
        20,
        undefined,
        undefined,
      );
    });

    expect(screen.getByLabelText("Card name")).toHaveValue("");
  });

  it("should keep card name filter when loading more", async () => {
    const FILTERED_FIRST_PAGE = {
      ...FIRST_PAGE,
      totalElements: 3,
      totalPages: 2,
      last: false,
    };

    const FILTERED_SECOND_PAGE = {
      ...SECOND_PAGE,
      content: [
        {
          ...SECOND_PAGE.content[0],
          cardName: "Decidueye-GX",
        },
      ],
    };

    mockFindCardHistory
      .mockResolvedValueOnce(FIRST_PAGE)
      .mockResolvedValueOnce(FILTERED_FIRST_PAGE)
      .mockResolvedValueOnce(FILTERED_SECOND_PAGE);

    render(
      <MemoryRouter>
        <HistoryPage />
      </MemoryRouter>,
    );

    await screen.findByText("Card added to collection.");

    fireEvent.change(screen.getByLabelText("Card name"), {
      target: {
        value: "Decidueye",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Search",
      }),
    );

    await waitFor(() => {
      expect(mockFindCardHistory).toHaveBeenNthCalledWith(
        2,
        0,
        20,
        undefined,
        "Decidueye",
      );
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Load more",
      }),
    );

    await waitFor(() => {
      expect(mockFindCardHistory).toHaveBeenNthCalledWith(
        3,
        1,
        20,
        undefined,
        "Decidueye",
      );
    });
  });

  it("should show filtered empty state", async () => {
    mockFindCardHistory
      .mockResolvedValueOnce(FIRST_PAGE)
      .mockResolvedValueOnce({
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

    await screen.findByText("Card added to collection.");

    fireEvent.change(screen.getByLabelText("Card name"), {
      target: {
        value: "Mewtwo",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Search",
      }),
    );

    expect(await screen.findByText("No activity found")).toBeInTheDocument();

    expect(
      screen.getByText("No history events match the current filters."),
    ).toBeInTheDocument();

    expect(screen.getByText("0 events")).toBeInTheDocument();
  });
});
