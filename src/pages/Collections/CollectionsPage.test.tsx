import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { CollectionsPage } from "./CollectionsPage";
import { findPokemonCollections } from "../../services/pokemon/pokemonCardService";

vi.mock(
  "../../services/pokemon/pokemonCardService",
  () => ({
    findPokemonCollections: vi.fn(),
  }),
);

const mockFindPokemonCollections =
  vi.mocked(findPokemonCollections);

const COLLECTIONS = [
  {
    id: "sv3pt5",
    name: "151",
    series: "Scarlet & Violet",
    printedTotal: 165,
    total: 207,
    ownedCards: 0,
    completionPercentage: 0,
  },
  {
    id: "sv1",
    name: "Scarlet & Violet",
    series: "Scarlet & Violet",
    printedTotal: 198,
    total: 258,
    ownedCards: 129,
    completionPercentage: 50,
  },
  {
    id: "base1",
    name: "Base Set",
    series: "Base",
    printedTotal: 102,
    total: 102,
    ownedCards: 102,
    completionPercentage: 100,
  },
  {
    id: "swsh7",
    name: "Evolving Skies",
    series: "Sword & Shield",
    printedTotal: 203,
    total: 237,
    ownedCards: 180,
    completionPercentage: 75.95,
  },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <CollectionsPage />
    </MemoryRouter>,
  );
}

function getCollectionCards() {
  return screen.getAllByRole("link", {
    name: /view collection/i,
  });
}

function getCollectionNames() {
  return getCollectionCards().map(
    (card) =>
      within(card).getByRole("heading", {
        level: 2,
      }).textContent,
  );
}

describe("CollectionsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should load and render collections", async () => {
    mockFindPokemonCollections.mockResolvedValue(
      COLLECTIONS,
    );

    renderPage();

    expect(
      screen.getByText("Loading collections..."),
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("heading", {
        name: "Collections",
        level: 1,
      }),
    ).toBeInTheDocument();

    expect(
      mockFindPokemonCollections,
    ).toHaveBeenCalledTimes(1);

    expect(
      screen.getByText("4"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("sets available"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "151",
        level: 2,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Base Set",
        level: 2,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("4 collections"),
    ).toBeInTheDocument();
  });

  it("should render collection progress", async () => {
    mockFindPokemonCollections.mockResolvedValue(
      COLLECTIONS,
    );

    renderPage();

    await screen.findByRole("heading", {
      name: "Collections",
      level: 1,
    });

    const baseSetProgress =
      screen.getByRole("progressbar", {
        name: "Base Set progress",
      });

    expect(baseSetProgress).toHaveAttribute(
      "aria-valuenow",
      "100",
    );

    expect(
      screen.getByText("102 / 102 cards"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("100.00%"),
    ).toBeInTheDocument();
  });

  it("should render numbered and additional card totals", async () => {
    mockFindPokemonCollections.mockResolvedValue(
      COLLECTIONS,
    );

    renderPage();

    await screen.findByRole("heading", {
      name: "Collections",
      level: 1,
    });

    expect(
      screen.getByText(
        "165 numbered cards + 42 additional cards",
      ),
    ).toBeInTheDocument();
  });

  it("should search collections by name", async () => {
    mockFindPokemonCollections.mockResolvedValue(
      COLLECTIONS,
    );

    renderPage();

    await screen.findByRole("heading", {
      name: "Collections",
      level: 1,
    });

    fireEvent.change(
      screen.getByRole("searchbox", {
        name: "Search collections",
      }),
      {
        target: {
          value: "evolving",
        },
      },
    );

    expect(
      screen.getByRole("heading", {
        name: "Evolving Skies",
        level: 2,
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: "Base Set",
        level: 2,
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByText("1 collection"),
    ).toBeInTheDocument();
  });

  it("should search collections by series", async () => {
    mockFindPokemonCollections.mockResolvedValue(
      COLLECTIONS,
    );

    renderPage();

    await screen.findByRole("heading", {
      name: "Collections",
      level: 1,
    });

    fireEvent.change(
      screen.getByRole("searchbox", {
        name: "Search collections",
      }),
      {
        target: {
          value: "sword",
        },
      },
    );

    expect(
      screen.getByRole("heading", {
        name: "Evolving Skies",
        level: 2,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("1 collection"),
    ).toBeInTheDocument();
  });

  it("should filter collections by series", async () => {
    mockFindPokemonCollections.mockResolvedValue(
      COLLECTIONS,
    );

    renderPage();

    await screen.findByRole("heading", {
      name: "Collections",
      level: 1,
    });

    fireEvent.change(
      screen.getByRole("combobox", {
        name: "Series",
      }),
      {
        target: {
          value: "Scarlet & Violet",
        },
      },
    );

    expect(
      screen.getByRole("heading", {
        name: "151",
        level: 2,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Scarlet & Violet",
        level: 2,
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: "Base Set",
        level: 2,
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByText("2 collections"),
    ).toBeInTheDocument();
  });

  it("should show all collections by default", async () => {
    mockFindPokemonCollections.mockResolvedValue(
      COLLECTIONS,
    );

    renderPage();

    await screen.findByRole("heading", {
      name: "Collections",
      level: 1,
    });

    expect(
      screen.getByRole("button", {
        name: "All",
      }),
    ).toHaveClass("active");

    expect(
      screen.getByText("4 collections"),
    ).toBeInTheDocument();
  });

  it("should filter not started collections", async () => {
    mockFindPokemonCollections.mockResolvedValue(
      COLLECTIONS,
    );

    renderPage();

    await screen.findByRole("heading", {
      name: "Collections",
      level: 1,
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Not started",
      }),
    );

    expect(
      screen.getByRole("heading", {
        name: "151",
        level: 2,
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: "Scarlet & Violet",
        level: 2,
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: "Base Set",
        level: 2,
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByText("1 collection"),
    ).toBeInTheDocument();
  });

  it("should filter started collections", async () => {
    mockFindPokemonCollections.mockResolvedValue(
      COLLECTIONS,
    );

    renderPage();

    await screen.findByRole("heading", {
      name: "Collections",
      level: 1,
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Started",
      }),
    );

    expect(
      screen.getByRole("heading", {
        name: "Scarlet & Violet",
        level: 2,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Evolving Skies",
        level: 2,
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: "151",
        level: 2,
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: "Base Set",
        level: 2,
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByText("2 collections"),
    ).toBeInTheDocument();
  });

  it("should filter completed collections", async () => {
    mockFindPokemonCollections.mockResolvedValue(
      COLLECTIONS,
    );

    renderPage();

    await screen.findByRole("heading", {
      name: "Collections",
      level: 1,
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Completed",
      }),
    );

    expect(
      screen.getByRole("heading", {
        name: "Base Set",
        level: 2,
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: "151",
        level: 2,
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByText("1 collection"),
    ).toBeInTheDocument();
  });

  it("should sort collections by name ascending by default", async () => {
    mockFindPokemonCollections.mockResolvedValue(
      COLLECTIONS,
    );

    renderPage();

    await screen.findByRole("heading", {
      name: "Collections",
      level: 1,
    });

    expect(getCollectionNames()).toEqual([
      "151",
      "Base Set",
      "Evolving Skies",
      "Scarlet & Violet",
    ]);
  });

  it("should sort collections by name descending", async () => {
    mockFindPokemonCollections.mockResolvedValue(
      COLLECTIONS,
    );

    renderPage();

    await screen.findByRole("heading", {
      name: "Collections",
      level: 1,
    });

    fireEvent.change(
      screen.getByRole("combobox", {
        name: "Sort by",
      }),
      {
        target: {
          value: "NAME_DESC",
        },
      },
    );

    expect(getCollectionNames()).toEqual([
      "Scarlet & Violet",
      "Evolving Skies",
      "Base Set",
      "151",
    ]);
  });

  it("should sort collections by completion highest", async () => {
    mockFindPokemonCollections.mockResolvedValue(
      COLLECTIONS,
    );

    renderPage();

    await screen.findByRole("heading", {
      name: "Collections",
      level: 1,
    });

    fireEvent.change(
      screen.getByRole("combobox", {
        name: "Sort by",
      }),
      {
        target: {
          value: "COMPLETION_DESC",
        },
      },
    );

    expect(getCollectionNames()).toEqual([
      "Base Set",
      "Evolving Skies",
      "Scarlet & Violet",
      "151",
    ]);
  });

  it("should sort collections by completion lowest", async () => {
    mockFindPokemonCollections.mockResolvedValue(
      COLLECTIONS,
    );

    renderPage();

    await screen.findByRole("heading", {
      name: "Collections",
      level: 1,
    });

    fireEvent.change(
      screen.getByRole("combobox", {
        name: "Sort by",
      }),
      {
        target: {
          value: "COMPLETION_ASC",
        },
      },
    );

    expect(getCollectionNames()).toEqual([
      "151",
      "Scarlet & Violet",
      "Evolving Skies",
      "Base Set",
    ]);
  });

  it("should sort collections by owned cards highest", async () => {
    mockFindPokemonCollections.mockResolvedValue(
      COLLECTIONS,
    );

    renderPage();

    await screen.findByRole("heading", {
      name: "Collections",
      level: 1,
    });

    fireEvent.change(
      screen.getByRole("combobox", {
        name: "Sort by",
      }),
      {
        target: {
          value: "OWNED_DESC",
        },
      },
    );

    expect(getCollectionNames()).toEqual([
      "Evolving Skies",
      "Scarlet & Violet",
      "Base Set",
      "151",
    ]);
  });

  it("should combine search, series, progress and sorting", async () => {
    mockFindPokemonCollections.mockResolvedValue(
      COLLECTIONS,
    );

    renderPage();

    await screen.findByRole("heading", {
      name: "Collections",
      level: 1,
    });

    fireEvent.change(
      screen.getByRole("combobox", {
        name: "Series",
      }),
      {
        target: {
          value: "Scarlet & Violet",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Started",
      }),
    );

    fireEvent.change(
      screen.getByRole("searchbox", {
        name: "Search collections",
      }),
      {
        target: {
          value: "scarlet",
        },
      },
    );

    fireEvent.change(
      screen.getByRole("combobox", {
        name: "Sort by",
      }),
      {
        target: {
          value: "COMPLETION_DESC",
        },
      },
    );

    expect(
      screen.getByRole("heading", {
        name: "Scarlet & Violet",
        level: 2,
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: "151",
        level: 2,
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByText("1 collection"),
    ).toBeInTheDocument();
  });

  it("should show empty state when no collection matches filters", async () => {
    mockFindPokemonCollections.mockResolvedValue(
      COLLECTIONS,
    );

    renderPage();

    await screen.findByRole("heading", {
      name: "Collections",
      level: 1,
    });

    fireEvent.change(
      screen.getByRole("searchbox", {
        name: "Search collections",
      }),
      {
        target: {
          value: "collection that does not exist",
        },
      },
    );

    expect(
      screen.getByRole("heading", {
        name: "No collections found",
        level: 2,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Try changing your search or filters.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText("0 collections"),
    ).toBeInTheDocument();
  });

  it("should show error when collections cannot be loaded", async () => {
    mockFindPokemonCollections.mockRejectedValue(
      new Error("Request failed"),
    );

    renderPage();

    expect(
      await screen.findByText(
        "Could not load Pokémon TCG collections.",
      ),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.queryByText("Loading collections..."),
      ).not.toBeInTheDocument();
    });
  });
});