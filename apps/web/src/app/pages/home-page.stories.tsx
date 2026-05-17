import type { Meta, StoryObj } from "@storybook/react-vite";
import { HomeFeatureGrid } from "./home-feature-grid";
import { HomeStatGrid } from "./home-stat-grid";

const meta = {
  title: "Features/Home",
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const LandingSections: Story = {
  render: () => (
    <div className="flex max-w-5xl flex-col gap-8">
      <section className="text-center">
        <div className="badge badge-primary badge-soft mb-4">Why AI EN</div>
        <h1 className="text-4xl font-black">A sharper way to practice</h1>
        <p className="text-base-content/65 mx-auto mt-4 max-w-2xl leading-8">
          Redesigned sections keep the legacy value proposition while GSAP home
          motion restores stat counters and scroll-triggered feature entry.
        </p>
      </section>
      <HomeStatGrid />
      <HomeFeatureGrid />
    </div>
  ),
};
