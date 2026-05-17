import { useEffect, useState, type ChangeEvent } from "react";
import { useAppServices } from "../../app/use-app-services";
import { useAuthSession } from "../auth";
import {
  createSettingsForm,
  createUserUpdate,
  SettingsFormSchema,
  type SettingsForm,
} from "./settings-form";
import { getAvatarFileError } from "./avatar-file";

export function useSettingsProfile() {
  const { api, session } = useAppServices();
  const { user } = useAuthSession(session);
  const [form, setForm] = useState<SettingsForm | null>(() =>
    user ? createSettingsForm(user) : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setForm(user ? createSettingsForm(user) : null);
  }, [user]);

  const reset = () => {
    setError(null);
    setSuccess(null);
    setForm(user ? createSettingsForm(user) : null);
  };

  const save = async () => {
    if (!form) return;
    setError(null);
    setSuccess(null);
    const result = SettingsFormSchema.safeParse(form);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Invalid profile data.");
      return;
    }

    setIsSaving(true);
    try {
      const update = await api.user.updateUser(createUserUpdate(result.data));
      session.updateUser(update);
      setSuccess("Profile updated.");
    } catch {
      setError("Unable to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const uploadAvatar = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = Array.from(event.target.files ?? [])[0];
    if (!file) return;
    setError(null);
    setSuccess(null);
    const fileError = getAvatarFileError(file);
    if (fileError) {
      setError(fileError);
      return;
    }

    const body = new FormData();
    body.append("file", file);
    try {
      const result = await api.user.uploadAvatar(body);
      setForm((current) =>
        current ? { ...current, avatar: result.databaseUrl } : current,
      );
    } catch {
      setError("Unable to upload avatar.");
    }
  };

  return {
    error,
    form,
    isSaving,
    logout: session.logout,
    reset,
    save,
    setForm,
    success,
    uploadAvatar,
    user,
  };
}
