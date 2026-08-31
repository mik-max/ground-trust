import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { ReviewComposer } from "../components/ReviewComposer";
import { createArea } from "../services/area.service";
import { guessNameCityState } from "../utils/geocodeLabel";
import { BackLink } from "../components/ui/BackLink";
import { TextInput } from "../components/ui/TextInput";
import { Card } from "../components/ui/Card";
import { text } from "../styles/typography";

// Reached from LocationSearchInput's "not covered yet" state — a resident
// proposing a new area and writing their own review of it, in one motion,
// rather than two disconnected trips (propose, then come back once
// approved to write the review they originally wanted to write). The area
// and its first review are created together (see area.controller.ts's
// createArea) but both stay invisible everywhere else until an admin —
// the same admin role already used for the moderation queue and
// government-account provisioning, not a mysterious third party — approves
// the area.
export function ProposeArea() {
  const [searchParams] = useSearchParams();
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  const label = searchParams.get("label") ?? "";

  const [fields, setFields] = useState(() => guessNameCityState(label));
  const [submitted, setSubmitted] = useState(false);

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return <p className={`${text.body} text-mute`}>Missing location — go back and search again.</p>;
  }

  if (submitted) {
    return (
      <div className="flex flex-col gap-6">
        <BackLink to="/" label="All areas" />
        <Card className="flex max-w-md flex-col items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand">
            <CheckCircle2 size={24} />
          </div>
          <h1 className={text.heading}>Submitted for review</h1>
          <p className="text-body text-mute">
            {fields.name} and your review have been submitted together. An admin — the same team that
            reviews new comments — checks new areas before they go public, to keep out spam and
            duplicates. Once approved, both go live at once, and you can check the status any time under{" "}
            <span className="text-ink">My Contributions</span>.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <BackLink to="/" label="All areas" />
      <div>
        <h1 className={text.displayMd}>Share your experience here</h1>
        <p className={`${text.body} text-mute`}>
          {label || "This location"} isn't in GroundTrust yet — add it and write your review in one go.
        </p>
      </div>

      <Card className="flex max-w-md flex-col gap-3">
        <p className="text-caption text-mute">A few details about the area:</p>
        <TextInput
          value={fields.name}
          onChange={(e) => setFields({ ...fields, name: e.target.value })}
          placeholder="Area name"
        />
        <div className="flex gap-2">
          <TextInput
            value={fields.city}
            onChange={(e) => setFields({ ...fields, city: e.target.value })}
            placeholder="City"
            className="flex-1"
          />
          <TextInput
            value={fields.state}
            onChange={(e) => setFields({ ...fields, state: e.target.value })}
            placeholder="State"
            className="flex-1"
          />
        </div>
      </Card>

      <ReviewComposer
        submitLabel="Submit area + review"
        onSubmit={async (input) => {
          if (!fields.name.trim() || !fields.city.trim() || !fields.state.trim()) {
            throw new Error("Please fill in the area name, city, and state above.");
          }
          await createArea({
            name: fields.name.trim(),
            city: fields.city.trim(),
            state: fields.state.trim(),
            geoCentroidLat: lat,
            geoCentroidLng: lng,
            review: input,
          });
        }}
        onSubmitted={() => setSubmitted(true)}
      />
    </div>
  );
}
