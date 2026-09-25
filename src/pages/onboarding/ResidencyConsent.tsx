import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Eyebrow } from "../../components/ui/Eyebrow";
import { text } from "../../styles/typography";

// GroundTruth_Design_Implementation_Guide.md §7.1 — shown immediately after
// Resident signup, before Home. Plain-language explanation of why location
// is sampled repeatedly and how long it's retained, matching the
// data-minimisation commitment in files/HANDOFF.md §2.1 (raw GPS is
// derive-and-discard, never stored long-term). Explicitly called out as an
// ethical commitment made visible, not optional polish — so it requires an
// affirmative acknowledgement, not just a passive "Continue".
//
// This screen only sets expectations; it doesn't request device location
// permission itself. The checks happen in useGpsPresenceSample, on the
// Submit Review and My Contributions pages.
export function ResidencyConsent() {
  const navigate = useNavigate();
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div>
        <Eyebrow>Before you start</Eyebrow>
        <h1 className={text.displayMd}>How we confirm you actually live here</h1>
      </div>

      <p className="text-body-lg text-ink">
        Reviews count for more when they come from people who live in an area. When you open the
        review or contributions pages, the app may check whether your device is inside the area.
        Checks made at night count towards verification, since being in an area at night suggests
        you live there. Your exact location is never stored.
      </p>

      <Card>
        <h2 className={text.heading}>What we keep — and what we don't</h2>
        <ul className="mt-2 flex flex-col gap-2 text-body text-mute">
          <li>
            <span className="text-ink">We don't keep a location history.</span> Each check is used
            once to update your verification status, then discarded.
          </li>
          <li>
            <span className="text-ink">What's stored is just your current tier</span> — e.g.
            "Location-confirmed" — and the date you reached it, visible any time on My
            Contributions.
          </li>
          <li>
            <span className="text-ink">Verification is progressive, not all-or-nothing.</span>{" "}
            Registered residents can already contribute reviews; location-confirmed and
            longer-verified residents simply carry more weight in an area's score.
          </li>
        </ul>
      </Card>

      <label className="flex items-start gap-3 text-body text-ink">
        <input
          type="checkbox"
          checked={acknowledged}
          onChange={(e) => setAcknowledged(e.target.checked)}
          className="mt-1 accent-brand"
        />
        I understand how my location is used to verify residency, and that it isn't stored as a
        history.
      </label>

      <Button type="button" disabled={!acknowledged} onClick={() => navigate("/share")} className="w-fit">
        Continue
      </Button>
    </div>
  );
}
