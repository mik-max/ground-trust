// Shared facts for the privacy and terms pages. Keep these in step with how
// the system actually works — they are statements to the people who use it.
export const LAST_UPDATED = "5 October 2026";

// Left empty until the project owner chooses a public contact address.
export const CONTACT_EMAIL = "";

export const CONTACT_TEXT = CONTACT_EMAIL
  ? `email ${CONTACT_EMAIL}`
  : "contact the GroundTrust project team through the Department of Computer Science, Miva Open University";
