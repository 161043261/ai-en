import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Course } from "../../shared/api/course-schema";
import { CourseCard } from "./course-card";

const course: Course = {
  description: "Build travel and daily conversation vocabulary with AI guidance.",
  id: "course-1",
  name: "Starter Vocabulary",
  price: "19.9",
  teacher: "AI Coach",
  url: "/models/fu_xuan/textures/material_baseColor.png",
  value: "starter",
};

const meta = {
  title: "Features/Courses",
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const CatalogCard: Story = {
  render: () => (
    <div className="max-w-sm">
      <CourseCard
        course={course}
        mode="catalog"
        openPayment={() => undefined}
        serverBaseUrl=""
      />
    </div>
  ),
};
