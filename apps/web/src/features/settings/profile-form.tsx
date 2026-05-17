import type { Dispatch, SetStateAction } from "react";
import type { SettingsForm } from "./settings-form";

export type ProfileFormProps = {
  readonly form: SettingsForm;
  readonly setForm: Dispatch<SetStateAction<SettingsForm | null>>;
};

export function ProfileForm({ form, setForm }: ProfileFormProps) {
  const update = <Key extends keyof SettingsForm>(
    key: Key,
    value: SettingsForm[Key],
  ) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  };

  return (
    <section className="card bg-base-100 shadow-xl">
      <div className="card-body gap-4">
        <h2 className="card-title">Profile</h2>
        <label className="form-control">
          <span className="label-text">Name</span>
          <input
            className="input input-bordered"
            onChange={(event) => update("name", event.target.value)}
            value={form.name}
          />
        </label>
        <label className="form-control">
          <span className="label-text">Email</span>
          <input
            className="input input-bordered"
            onChange={(event) => update("email", event.target.value)}
            type="email"
            value={form.email}
          />
        </label>
        <label className="form-control">
          <span className="label-text">Address</span>
          <input
            className="input input-bordered"
            onChange={(event) => update("address", event.target.value)}
            value={form.address}
          />
        </label>
        <label className="form-control">
          <span className="label-text">Bio</span>
          <textarea
            className="textarea textarea-bordered"
            maxLength={120}
            onChange={(event) => update("bio", event.target.value)}
            value={form.bio}
          />
        </label>
      </div>
    </section>
  );
}
