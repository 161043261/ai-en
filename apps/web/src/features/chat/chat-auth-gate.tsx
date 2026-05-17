import { LockKeyhole } from "lucide-react";

export type ChatAuthGateProps = {
  readonly openAuth: () => void;
};

export function ChatAuthGate({ openAuth }: ChatAuthGateProps) {
  return (
    <div className="alert alert-warning">
      <LockKeyhole aria-hidden="true" size={20} />
      <span>Sign in to load chat history and stream AI responses.</span>
      <button className="btn btn-sm" onClick={openAuth} type="button">
        Sign in
      </button>
    </div>
  );
}
