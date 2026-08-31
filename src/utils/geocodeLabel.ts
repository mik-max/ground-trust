// Nominatim's display_name is a plain comma-separated string with no fixed
// shape ("Ikeja, Lagos State, Nigeria" vs a much longer street address) —
// this is only ever a starting guess for ProposeArea's form, which stays
// fully editable, so getting it slightly wrong for an unusual result is fine.
export function guessNameCityState(label: string): { name: string; city: string; state: string } {
  const parts = label.split(",").map((s) => s.trim());
  const name = parts[0] ?? "";
  const stateIndex = parts.findIndex((p) => /state/i.test(p));
  const state = stateIndex >= 0 ? parts[stateIndex].replace(/\s*state$/i, "") : "";

  // City is whatever's left after excluding the name, the state segment
  // itself, the country, and a postal code — for a short label like
  // "Surulere, Lagos State, Nigeria" there's nothing left, so it falls back
  // to the state (Lagos is commonly both the city/metro and the state name
  // for Nigerian addresses like this one).
  const cityCandidates = parts.filter(
    (p, i) => i !== 0 && i !== stateIndex && !/^nigeria$/i.test(p) && !/^\d+$/.test(p)
  );
  const city = cityCandidates[0] ?? state ?? name;
  return { name, city, state };
}
