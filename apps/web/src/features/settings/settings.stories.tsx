import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ProfileForm } from "./profile-form";
import type { SettingsForm } from "./settings-form";
import { TaskCard } from "./task-card";

const initialForm: SettingsForm = {
  address: "Remote classroom",
  avatar: "",
  bio: "Practicing English every morning.",
  email: "learner@example.com",
  isTimingTask: true,
  name: "Learner",
  timingTaskTime: "09:00:00",
};

function SettingsStory() {
  const [form, setForm] = useState<SettingsForm | null>(initialForm);
  if (!form) return null;

  return (
    <div className="grid max-w-5xl gap-6 lg:grid-cols-2">
      <ProfileForm form={form} setForm={setForm} />
      <TaskCard form={form} setForm={setForm} />
    </div>
  );
}

const meta = {
  title: "Features/Settings",
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const ProfileAndReminder: Story = {
  render: () => <SettingsStory />,
};
