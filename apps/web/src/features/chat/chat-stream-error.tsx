import { RotateCcw, TriangleAlert } from "lucide-react";

export type ChatStreamErrorProps = {
  readonly message: string;
  readonly retry: () => void;
};

export function ChatStreamError({ message, retry }: ChatStreamErrorProps) {
  return (
    <div className="alert alert-error items-start">
      <TriangleAlert aria-hidden="true" size={22} />
      <div className="flex flex-1 flex-col gap-1">
        <h2 className="font-bold">Streaming interrupted</h2>
        <p className="text-sm">{message}</p>
      </div>
      <button className="btn btn-sm" onClick={retry} type="button">
        <RotateCcw aria-hidden="true" size={16} />
        Retry
      </button>
    </div>
  );
}
