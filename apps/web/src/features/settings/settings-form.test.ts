import { describe, expect, test } from "vitest";
import { createUserUpdate, type SettingsForm } from ".";

describe("settings form", () => {
  test("normalizes empty optional fields and time input", () => {
    const form: SettingsForm = {
      address: "",
      avatar: "",
      bio: "",
      email: "",
      isTimingTask: true,
      name: " Learner ",
      timingTaskTime: "09:30",
    };

    expect(createUserUpdate(form)).toEqual({
      address: null,
      avatar: null,
      bio: null,
      email: null,
      isTimingTask: true,
      name: "Learner",
      timingTaskTime: "09:30:00",
    });
  });
});
