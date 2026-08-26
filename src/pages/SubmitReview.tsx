import { useNavigate, useParams } from "react-router-dom";
import { ReviewComposer } from "../components/ReviewComposer";

// files/DESIGN_SYSTEM.md §6.5.
export function SubmitReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) return null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-display-md font-display font-bold text-ink">Share your experience</h1>
      <ReviewComposer areaId={id} onSubmitted={() => navigate(`/areas/${id}`)} />
    </div>
  );
}
