import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  CardCollectionFilters,
  type CardCollectionFilterValues,
} from "./CardCollectionFilters";

const INITIAL_VALUES: CardCollectionFilterValues = {
  name: "",
  collection: "",
  rarity: "",
  language: "",
  condition: "",
  favorite: false,
  sort: "name,asc",
};

describe("CardCollectionFilters", () => {
  it("should render all filters", () => {
    render(
      <CardCollectionFilters
        initialValues={INITIAL_VALUES}
        loading={false}
        onSearch={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    expect(
      screen.getByText("Card name"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Collection"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Rarity"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Language"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Condition"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Only favorites"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Sort by"),
    ).toBeInTheDocument();
  });

  it("should submit all filter values", () => {
    const onSearch = vi.fn();

    render(
      <CardCollectionFilters
        initialValues={INITIAL_VALUES}
        loading={false}
        onSearch={onSearch}
        onClear={vi.fn()}
      />,
    );

    fireEvent.change(
      screen.getByPlaceholderText("Example: Charizard"),
      {
        target: {
          value: " Pikachu ",
        },
      },
    );

    fireEvent.change(
      screen.getByPlaceholderText("Example: Sun & Moon"),
      {
        target: {
          value: " Sun ",
        },
      },
    );

    fireEvent.change(
      screen.getByPlaceholderText("Example: Rare Holo"),
      {
        target: {
          value: " Holo ",
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Language"),
      {
        target: {
          value: "ENGLISH",
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Condition"),
      {
        target: {
          value: "NEAR_MINT",
        },
      },
    );

    fireEvent.click(
      screen.getByLabelText("Only favorites"),
    );

    fireEvent.change(
      screen.getByLabelText("Sort by"),
      {
        target: {
          value: "quantity,desc",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Search",
      }),
    );

    expect(onSearch)
      .toHaveBeenCalledWith({
        name: "Pikachu",
        collection: "Sun",
        rarity: "Holo",
        language: "ENGLISH",
        condition: "NEAR_MINT",
        favorite: true,
        sort: "quantity,desc",
      });
  });

  it("should clear all filters", () => {
    const onClear = vi.fn();

    const values: CardCollectionFilterValues = {
      name: "Pikachu",
      collection: "Sun & Moon",
      rarity: "Rare Holo",
      language: "ENGLISH",
      condition: "NEAR_MINT",
      favorite: true,
      sort: "quantity,desc",
    };

    render(
      <CardCollectionFilters
        initialValues={values}
        loading={false}
        onSearch={vi.fn()}
        onClear={onClear}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Clear",
      }),
    );

    expect(
      screen.getByPlaceholderText("Example: Charizard"),
    ).toHaveValue("");

    expect(
      screen.getByPlaceholderText("Example: Sun & Moon"),
    ).toHaveValue("");

    expect(
      screen.getByPlaceholderText("Example: Rare Holo"),
    ).toHaveValue("");

    expect(
      screen.getByLabelText("Language"),
    ).toHaveValue("");

    expect(
      screen.getByLabelText("Condition"),
    ).toHaveValue("");

    expect(
      screen.getByLabelText("Only favorites"),
    ).not.toBeChecked();

    expect(
      screen.getByLabelText("Sort by"),
    ).toHaveValue("name,asc");

    expect(onClear)
      .toHaveBeenCalledOnce();
  });
});