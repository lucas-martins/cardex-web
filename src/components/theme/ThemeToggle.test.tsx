import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { ThemeProvider } from "../../context/ThemeProvider";
import { ThemeToggle } from "./ThemeToggle";

describe("ThemeToggle", () => {
  it("renders with light mode label and toggles to dark mode on click", async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider defaultTheme="light">
        <ThemeToggle />
      </ThemeProvider>,
    );

    const button = screen.getByRole("button", {
      name: /Alternar para tema escuro/i,
    });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("data-resolved", "light");

    await user.click(button);

    const darkButton = screen.getByRole("button", {
      name: /Alternar para tema claro/i,
    });
    expect(darkButton).toBeInTheDocument();
    expect(darkButton).toHaveAttribute("data-resolved", "dark");
  });
});
