import type { Dispatch, SetStateAction } from "react";
import type { SettingsForm } from "./settings-form";

export type TaskCardProps = {
  readonly form: SettingsForm;
  readonly setForm: Dispatch<SetStateAction<SettingsForm | null>>;
};

export function TaskCard({ form, setForm }: TaskCardProps) {
  return (
    <section className="card bg-base-100 shadow-xl">
      <div className="card-body gap-4">
        <h2 className="card-title">Daily reminder</h2>
        <label className="rounded-box bg-base-200 flex items-center justify-between p-4">
          <span>
            <span className="block font-bold">Enable timing task</span>
            <span className="text-base-content/60 text-sm">
              Email is required to receive daily check-in reminders.
            </span>
          </span>
          <input
            checked={form.isTimingTask}
            className="toggle toggle-primary"
            onChange={(event) =>
              setForm((current) =>
                current
                  ? { ...current, isTimingTask: event.target.checked }
                  : current,
              )
            }
            type="checkbox"
          />
        </label>
        <label className="form-control">
          <span className="label-text">Reminder time</span>
          <input
            className="input input-bordered"
            onChange={(event) =>
              setForm((current) =>
                current
                  ? { ...current, timingTaskTime: event.target.value }
                  : current,
              )
            }
            type="time"
            value={form.timingTaskTime.slice(0, 5)}
          />
        </label>
      </div>
    </section>
  );
}
