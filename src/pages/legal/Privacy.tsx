import { BackLink } from "../../components/ui/BackLink";
import { text } from "../../styles/typography";
import { CONTACT_TEXT, LAST_UPDATED } from "./legalContent";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className={text.heading}>{title}</h2>
      <div className="flex flex-col gap-2 text-body text-ink">{children}</div>
    </section>
  );
}

export function Privacy() {
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <BackLink to="/" label="All areas" />
      <div>
        <h1 className={text.displayMd}>Privacy policy</h1>
        <p className={text.caption}>Last updated {LAST_UPDATED}</p>
      </div>

      <p className="text-body text-ink">
        GroundTrust lets residents rate and describe the areas they live in, so that people moving to an area can see what it
        is really like and government authorities can see where problems persist. It is a final-year project at Miva Open
        University. This page explains, in plain language, what we collect and how we use it.
      </p>

      <Section title="What we collect">
        <ul className="list-disc pl-5">
          <li>
            <b>Your account:</b> your name, your email address, and either a securely hashed password or your Google sign-in.
          </li>
          <li>
            <b>Your reviews:</b> the 1–5 ratings you give, and any comment you type or record by voice.
          </li>
          <li>
            <b>Residency checks:</b> while the review or My Contributions page is open, your device's location is checked
            against the area's approximate boundary. We keep only the fact that a check took place and whether it was at night
            — never your coordinates or a location history.
          </li>
          <li>
            <b>Reports you send</b> about other reviews, and their reason.
          </li>
        </ul>
        <p>
          Browsing area profiles does not require an account, and visitors are not asked for any personal information. Place
          names typed into search are sent to OpenStreetMap to find matching locations, and our hosting providers keep
          standard server logs, such as IP addresses, to run and protect the service.
        </p>
      </Section>

      <Section title="How we use it">
        <ul className="list-disc pl-5">
          <li>To show area profiles built from many residents' ratings.</li>
          <li>To work out your verification level, which decides how much weight your ratings carry.</li>
          <li>To transcribe voice comments, translate comments into English, and identify what each comment is about.</li>
          <li>To screen comments for abuse, and to let administrators review content that is held or reported.</li>
          <li>To raise an area to government authorities when residents' ratings show a problem that persists.</li>
        </ul>
      </Section>

      <Section title="Who can see what">
        <ul className="list-disc pl-5">
          <li>
            <b>Anyone</b> can read reviews' text and ratings and the reviewer's verification level. Your name and account are
            never shown with your reviews.
          </li>
          <li>
            <b>Government authorities and administrators</b> can listen to original voice recordings, through links that
            expire after an hour. Everyone else sees the transcribed text only.
          </li>
          <li>
            <b>Administrators</b> can see who submitted a review or proposed an area, in order to moderate content.
          </li>
        </ul>
      </Section>

      <Section title="Services that process data for us">
        <p>To run the platform we use these services, some of which store or process data outside Nigeria:</p>
        <ul className="list-disc pl-5">
          <li>Neon (database) and Render (application server), in Germany; Vercel (website).</li>
          <li>Cloudinary, which stores voice recordings privately.</li>
          <li>Groq (speech-to-text), Anthropic (translation and topic classification) and OpenAI (content screening), which
            receive the comment text or recording — not your name or email.</li>
          <li>OpenStreetMap, which receives the place names you search for; Google, if you choose to sign in with Google.</li>
        </ul>
      </Section>

      <Section title="How long we keep it, and your choices">
        <p>
          We keep your account and reviews while your account exists. You can ask to see the data we hold about you, to
          correct it, or to delete your account and reviews. To do so, {CONTACT_TEXT}.
        </p>
      </Section>

      <Section title="Changes">
        <p>If this policy changes, we will update this page and the date at the top.</p>
      </Section>
    </div>
  );
}
