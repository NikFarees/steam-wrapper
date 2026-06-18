import { vi, describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import RarityBadges from "@/components/dashboard/RarityBadges";

// framer-motion uses browser APIs (matchMedia, etc.) that are absent in jsdom;
// stub it to a simple passthrough so motion.div behaves like a plain div.
vi.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, prop) => {
        const { createElement } = require("react");
        // Return a forwardRef-compatible component that renders the underlying element
        const Component = (props: Record<string, unknown>, ref: unknown) => {
          const { variants, initial, whileHover, animate, exit, transition, ...rest } = props;
          void variants; void initial; void whileHover; void animate; void exit; void transition;
          return createElement(prop as string, { ...rest, ref });
        };
        Component.displayName = `motion.${String(prop)}`;
        const { forwardRef } = require("react");
        return forwardRef(Component);
      },
    }
  ),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

describe("RarityBadges", () => {
  it("does not throw and renders achievement name when iconUrl is empty", () => {
    const badge = {
      appid: 12345,
      gameName: "Test Game",
      achievementName: "Master Explorer",
      achievementApiName: "ACH_EXPLORE",
      globalPercentage: 3.5,
      description: "Explore everything",
      iconUrl: "",
    };

    expect(() => render(<RarityBadges badges={[badge]} />)).not.toThrow();
    expect(screen.getByText("Master Explorer")).toBeTruthy();
  });

  it("renders Image when iconUrl is non-empty", () => {
    const badge = {
      appid: 12345,
      gameName: "Test Game",
      achievementName: "Sharpshooter",
      achievementApiName: "ACH_SHOOT",
      globalPercentage: 2.1,
      description: "Hit every shot",
      iconUrl: "https://media.steampowered.com/steamcommunity/public/images/apps/12345/ach_shoot.jpg",
    };

    expect(() => render(<RarityBadges badges={[badge]} />)).not.toThrow();
    expect(screen.getByText("Sharpshooter")).toBeTruthy();
  });
});
