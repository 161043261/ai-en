export interface User {
  id: string;
  name: string;
  email?: string | null;
  phone: string;
  address?: string | null;
  password: string;
  avatar?: string | null;
  bio?: string | null;
  isTimingTask: boolean;
  timingTaskTime: string;
  wordNumber: number;
  dayNumber: number;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date | null;
}

export type UserLogin = Pick<User, "phone" | "password">;
export type UserRegister = Pick<User, "name" | "phone" | "email" | "password">;
export type ResultUser = Omit<User, "password">;
export type UserUpdate = Pick<
  User,
  | "name"
  | "email"
  | "address"
  | "avatar"
  | "bio"
  | "isTimingTask"
  | "timingTaskTime"
>;

export type AvatarResult = {
  previewUrl: string;
  databaseUrl: string;
};

export type Token = {
  accessToken: string;
  refreshToken: string;
};

export type WebResultUser = ResultUser & {
  token: Token;
};

export type TokenPayload = Pick<User, "name" | "email"> & {
  userId: User["id"];
};

export type RefreshTokenPayload = TokenPayload & {
  tokenType: "refresh" | "access";
};
