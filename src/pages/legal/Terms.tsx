import { BackLink } from "../../components/ui/BackLink";
import { text } from "../../styles/typography";
import { CONTACT_TEXT, LAST_UPDATED } from "./legalContent";

export function Terms() {
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <BackLink to="/" label="All areas" />
      <div>
        <h1 className={text.displayMd}>Terms of use</h1>
        <p className={text.caption}>Last updated {LAST_UPDATED}</p>
      </div>

      <section className="flex flex-col gap-2 text-body text-ink">
        <h2 className={text.heading}>What GroundTrust is</h2>
        <p>
          GroundTrust shows what areas are like based on residents' own ratings of power, water, security, roads and flooding,
          and accessibility. Scores reflect residents' experience, weighted by how well each resident is verified and how
          recent their rating is. They are not official measurements, and the platform is a final-year project rather than a
          commercial service.
        </p>
      </section>

      <section className="flex flex-col gap-2 text-body text-ink">
        <h2 className={text.heading}>If you contribute</h2>
        <ul className="list-disc pl-5">
          <li>Only rate and describe areas from your own experience, honestly.</li>
          <li>Don't post false information, abuse, spam, or anything that identifies or accuses a specific person.</li>
          <li>Comments are screened automatically and may be held, reviewed or removed by an administrator.</li>
          <li>Reviews that are reported are checked by an administrator, who may keep or remove them.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-2 text-body text-ink">
        <h2 className={text.heading}>Not an emergency service</h2>
        <p>
          GroundTrust does not monitor reports in real time. In an emergency, call <b>112</b> or contact the police directly.
        </p>
      </section>

      <section className="flex flex-col gap-2 text-body text-ink">
        <h2 className={text.heading}>No guarantee</h2>
        <p>
          We work to keep scores fair and accurate, but we cannot guarantee that every rating or comment is correct. Use
          GroundTrust as one source of information alongside your own checks before making decisions.
        </p>
      </section>

      <section className="flex flex-col gap-2 text-body text-ink">
        <h2 className={text.heading}>Questions</h2>
        <p>For questions about these terms, {CONTACT_TEXT}.</p>
      </section>
    </div>
  );
}
