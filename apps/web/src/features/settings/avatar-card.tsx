import { Camera } from "lucide-react";
import type { ChangeEvent } from "react";

export type AvatarCardProps = {
  readonly avatarUrl: string | null;
  readonly name: string;
  readonly uploadAvatar: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function AvatarCard({ avatarUrl, name, uploadAvatar }: AvatarCardProps) {
  const fallback = name.slice(0, 1).toUpperCase() || "A";

  return (
    <section className="card bg-base-100 shadow-xl">
      <div className="card-body gap-4">
        <h2 className="card-title">Avatar</h2>
        <div className="flex items-center gap-4">
          <div className="avatar placeholder">
            <div className="bg-primary text-primary-content size-24 rounded-full">
              {avatarUrl ? (
                <img alt={`${name} avatar`} src={avatarUrl} />
              ) : (
                <span className="text-3xl font-black">{fallback}</span>
              )}
            </div>
          </div>
          <label className="btn btn-primary">
            <Camera aria-hidden="true" size={18} />
            Select avatar
            <input
              accept="image/*"
              className="hidden"
              onChange={uploadAvatar}
              type="file"
            />
          </label>
        </div>
        <p className="text-base-content/55 text-xs">
          Supports png, jpg, and webp images up to the server upload limit.
        </p>
      </div>
    </section>
  );
}
