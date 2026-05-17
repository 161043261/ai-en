export type RefreshAccessToken = () => Promise<string>;

export type RefreshQueue = {
  readonly refresh: () => Promise<string>;
};

export function createRefreshQueue(
  refreshAccessToken: RefreshAccessToken,
): RefreshQueue {
  let activeRefresh: Promise<string> | null = null;

  return {
    refresh: () => {
      if (activeRefresh) {
        return activeRefresh;
      }

      activeRefresh = refreshAccessToken().finally(() => {
        activeRefresh = null;
      });

      return activeRefresh;
    },
  };
}
