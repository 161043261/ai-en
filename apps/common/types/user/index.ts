export interface User {
  id: string; // 用户 ID
  name: string; // 用户名
  email?: string | null; // 邮箱
  phone: string; // 手机号
  address?: string | null; // 地址
  password: string; // 密码
  avatar?: string | null; // 头像
  bio?: string | null; // 签名
  isTimingTask: boolean; // 是否开启定时任务
  timingTaskTime?: string | null; // 定时任务时间，默认晚上 0 点开始，每隔 24 小时执行一次
  wordNumber: number; // 单词数量
  dayNumber: number; // 打卡天数
  createdAt: Date; // 创建时间
  updatedAt: Date; // 更新时间
  lastLoginAt?: Date | null; // 最后登录时间
}

export type UserLogin = Pick<User, "phone" | "password">;

export type UserRegister = Pick<User, "name" | "phone" | "email" | "password">;

export type ResultUser = Omit<User, "password">;

export type UserUpdate = Pick<
  User,
  | "name"
  | "email"
  | "phone"
  | "address"
  | "avatar"
  | "bio"
  | "isTimingTask"
  | "timingTaskTime"
  >;

export type AvatarResult = {
  previewUrl: string; // 预览 URL
  databaseUrl: string; // 数据库 URL
}

export type Token = {
  accessToken: string; // 访问令牌
  refreshToken: string; // 刷新令牌
};

export type WebResultUser = ResultUser & {
  token: Token;
};

export type TokenPayload = Pick<User, "name" | "email"> & { userId: User["id"] };

export type RefreshTokenPayload = TokenPayload & {
  tokenType: "refresh" | "access";
};
