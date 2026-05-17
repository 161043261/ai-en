export type DependencyName =
  | "postgres"
  | "redis"
  | "minio"
  | "ai"
  | "payment";

export interface DependencyStatus {
  readonly name: DependencyName;
  readonly ok: boolean;
  readonly message: string;
}

export interface ReadinessReport {
  readonly status: "ready" | "not_ready";
  readonly dependencies: readonly DependencyStatus[];
}

export type ReadinessCheck = () => Promise<DependencyStatus>;

export const createDependencyStatus = (
  name: DependencyName,
  ok: boolean,
  message: string,
): DependencyStatus => ({ name, ok, message });
