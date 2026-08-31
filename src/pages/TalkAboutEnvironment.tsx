import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { LocationSearchInput } from "../components/LocationSearchInput";
import { BackLink } from "../components/ui/BackLink";
import { Eyebrow } from "../components/ui/Eyebrow";
import { text } from "../styles/typography";

// The single, prominent entry point for "I want to say what my
// environment is actually like" — a resident shouldn't have to already
// know whether their street exists in GroundTrust before they can start.
// Search covers both cases at once: pick a place we already have and it
// goes straight into reviewing it (adding to what's already there, not
// replacing it — scores are an aggregate of everyone's reviews); pick
// somewhere we don't have yet and LocationSearchInput's "not covered"
// state routes into ProposeArea, which creates the area and captures this
// same review together in one submission.
export function TalkAboutEnvironment() {
  const [query, setQuery] = useState("");

  return (
    <div className="flex flex-col gap-6">
      <BackLink to="/" label="All areas" />

      <div>
        <Eyebrow>Resident voice</Eyebrow>
        <h1 className={text.displayMd}>Talk about your environment</h1>
        <p className={`${text.bodyLg} text-mute`}>
          Search where you live. If it's already here, your review adds to what other residents have
          said. If it isn't, we'll help you add it.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-lg bg-paper-2 p-4">
        <MessageCircle size={20} className="mt-0.5 shrink-0 text-brand" />
        <p className="text-body text-ink">
          Newcomers use these reviews to know what to expect, and government accounts use them to spot
          areas that need attention — your experience is what makes this real.
        </p>
      </div>

      <LocationSearchInput
        value={query}
        onChange={setQuery}
        mode="review"
        placeholder="Search your street, estate, or neighbourhood..."
      />
    </div>
  );
}
