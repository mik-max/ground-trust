import { useNavigate, useParams } from "react-router-dom";
import { ReviewComposer } from "../components/ReviewComposer";
import { submitReview } from "../services/area.service";
import { useGpsPresenceSample } from "../hooks/useGpsPresenceSample";
import { BackLink } from "../components/ui/BackLink";
import { text } from "../styles/typography";

// files/DESIGN_SYSTEM.md §6.5.
export function SubmitReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  useGpsPresenceSample(id ? [id] : []);

  if (!id) return null;

  return (
    <div className="flex flex-col gap-6">
      <BackLink to={`/areas/${id}`} label="Back to area" />
      <h1 className={text.displayMd}>Share your experience</h1>
      <ReviewComposer
        onSubmit={(input) => submitReview(id, input).then(() => {})}
        onSubmitted={() => navigate(`/areas/${id}`)}
      />
    </div>
  );
}
