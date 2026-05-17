import { Settings } from "lucide-react";
import { useState } from "react";
import { AuthDialog } from "../auth-ui";
import { useAppServices } from "../../app/use-app-services";
import { createAvatarUrl } from "./avatar-url";
import { AccountCard } from "./account-card";
import { AvatarCard } from "./avatar-card";
import { ProfileForm } from "./profile-form";
import { TaskCard } from "./task-card";
import { useSettingsProfile } from "./use-settings-profile";

export function SettingsProfile() {
  const { config } = useAppServices();
  const state = useSettingsProfile();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  if (!state.user || !state.form) {
    return (
      <>
        <section className="hero rounded-box bg-base-200 min-h-96">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h1 className="text-4xl font-black">
                Sign in to manage settings
              </h1>
              <p className="text-base-content/65 py-4">
                Profile, avatar, and daily reminder controls require an account.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => setIsAuthOpen(true)}
                type="button"
              >
                Sign in
              </button>
            </div>
          </div>
        </section>
        <AuthDialog close={() => setIsAuthOpen(false)} isOpen={isAuthOpen} />
      </>
    );
  }

  const avatarUrl = createAvatarUrl(config.serverApiBaseUrl, state.form.avatar);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="badge badge-secondary badge-soft mb-3 gap-2">
            <Settings aria-hidden="true" size={16} />
            Account Settings
          </div>
          <h1 className="text-4xl font-black">Tune your learning profile</h1>
          <p className="text-base-content/65 mt-3 max-w-2xl">
            Keep your profile fresh and configure reminders for daily practice.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={state.reset} type="button">
            Reset
          </button>
          <button
            className="btn btn-primary"
            disabled={state.isSaving}
            onClick={() => void state.save()}
            type="button"
          >
            {state.isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </header>
      {state.error ? (
        <div className="alert alert-error">{state.error}</div>
      ) : null}
      {state.success ? (
        <div className="alert alert-success">{state.success}</div>
      ) : null}
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.4fr]">
        <div className="flex flex-col gap-6">
          <AvatarCard
            avatarUrl={avatarUrl}
            name={state.form.name}
            uploadAvatar={state.uploadAvatar}
          />
          <AccountCard logout={state.logout} user={state.user} />
        </div>
        <div className="flex flex-col gap-6">
          <ProfileForm form={state.form} setForm={state.setForm} />
          <TaskCard form={state.form} setForm={state.setForm} />
        </div>
      </div>
    </div>
  );
}
