import { TriangleAlert } from "lucide-react";

export function ErrorState() {
  return (
    <div className="alert alert-error">
      <TriangleAlert aria-hidden="true" size={20} />
      <span>Unable to load this area. Please try again later.</span>
    </div>
  );
}
