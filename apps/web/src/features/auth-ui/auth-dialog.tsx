import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { WordMarquee } from "../word-marquee";
import type { AuthMode } from "./auth-mode";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";

export type AuthDialogProps = {
  readonly close: () => void;
  readonly isOpen: boolean;
};

export function AuthDialog({ close, isOpen }: AuthDialogProps) {
  const [mode, setMode] = useState<AuthMode>("login");

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [close, isOpen]);

  if (!isOpen) return null;

  return (
    <div aria-modal="true" className="modal modal-open" role="dialog">
      <div className="modal-box grid max-w-6xl gap-0 p-0 lg:grid-cols-[1.35fr_1fr]">
        <WordMarquee
          eyebrow={
            mode === "login" ? "Welcome word stream" : "Starter word stream"
          }
          title={
            mode === "login"
              ? "Warm up with words before your next session."
              : "Build your first practice loop with living vocabulary."
          }
        />
        <div className="relative flex min-h-96 flex-col justify-center p-8">
          <button
            aria-label="Close authentication dialog"
            className="btn btn-ghost btn-circle absolute top-4 right-4"
            onClick={close}
            type="button"
          >
            <X aria-hidden="true" size={20} />
          </button>
          {mode === "login" ? (
            <LoginForm close={close} setMode={setMode} />
          ) : (
            <RegisterForm close={close} setMode={setMode} />
          )}
        </div>
      </div>
      <button
        aria-label="Close authentication dialog backdrop"
        className="modal-backdrop"
        onClick={close}
        type="button"
      />
    </div>
  );
}
