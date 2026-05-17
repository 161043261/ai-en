import { z } from "zod";
import type { UserUpdate, WebUser } from "../../shared/api";

export const SettingsFormSchema = z.object({
  address: z.string(),
  avatar: z.string(),
  bio: z.string().max(120),
  email: z.union([z.email(), z.literal("")]),
  isTimingTask: z.boolean(),
  name: z.string().min(1, "Name is required."),
  timingTaskTime: z.string(),
});

export type SettingsForm = z.infer<typeof SettingsFormSchema>;

export function createSettingsForm(user: WebUser): SettingsForm {
  return {
    address: user.address ?? "",
    avatar: user.avatar ?? "",
    bio: user.bio ?? "",
    email: user.email ?? "",
    isTimingTask: user.isTimingTask,
    name: user.name,
    timingTaskTime: user.timingTaskTime,
  };
}

export function createUserUpdate(form: SettingsForm): UserUpdate {
  const timingTaskTime =
    form.timingTaskTime.length === 5
      ? `${form.timingTaskTime}:00`
      : form.timingTaskTime;

  return {
    address: form.address.trim() || null,
    avatar: form.avatar.trim() || null,
    bio: form.bio.trim() || null,
    email: form.email.trim() || null,
    isTimingTask: form.isTimingTask,
    name: form.name.trim(),
    timingTaskTime,
  };
}
