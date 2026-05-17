export type UserAvatarProps = {
  readonly avatarUrl: string | undefined;
  readonly name: string;
};

export function UserAvatar({ avatarUrl, name }: UserAvatarProps) {
  const fallback = name.slice(0, 1).toUpperCase();

  return (
    <div className="avatar avatar-placeholder">
      <div className="bg-primary text-primary-content w-10 rounded-full">
        {avatarUrl ? <img alt="" src={avatarUrl} /> : <span>{fallback}</span>}
      </div>
    </div>
  );
}
