import { useEffect } from "react";
import { useAuthSession } from "../features/auth";
import { useAppServices } from "./use-app-services";

export function SocketLifecycleBridge() {
  const { session, socketLifecycle } = useAppServices();
  const { user } = useAuthSession(session);

  useEffect(() => {
    socketLifecycle.connect(user?.id);

    return () => {
      socketLifecycle.disconnect();
    };
  }, [socketLifecycle, user?.id]);

  return null;
}
