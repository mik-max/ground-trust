import { useEffect, useRef, useState } from "react";
import { Check, Download, Link2, X } from "lucide-react";
import { text } from "../../styles/typography";

// What's being shared: one area, or a comparison of two or three.
export type ShareTarget =
  | { kind: "area"; id: string; name: string }
  | { kind: "compare"; ids: string[]; names: string[] };

type Format = "status" | "link";

// Shared links always point at the live site (a localhost link is no use to
// anyone else); the card images come from this site's /api/og.
const SITE = import.meta.env.DEV ? "https://ground-trust.vercel.app" : window.location.origin;

const choice = (names: string[]) =>
  `${names.length > 1 ? `${names.slice(0, -1).join(", ")} or ${names[names.length - 1]}` : names[0]}?`;

function details(target: ShareTarget, format: Format) {
  if (target.kind === "compare") {
    const url = `${SITE}/compare?areas=${target.ids.map(encodeURIComponent).join(",")}`;
    return {
      url,
      image: `/api/og?compare=${target.ids.map(encodeURIComponent).join(",")}`,
      fileName: `groundtrust-compare-${target.ids.join("-")}.png`,
      message: `${choice(target.names)} See how residents rate them on GroundTrust: ${url}`,
      aspect: "aspect-square",
    };
  }
  const url = `${SITE}/areas/${encodeURIComponent(target.id)}`;
  return {
    url,
    image: `/api/og?area=${encodeURIComponent(target.id)}${format === "status" ? "&format=story" : ""}`,
    fileName: `groundtrust-${target.id}${format === "status" ? "-status" : ""}.png`,
    message: `${target.name}: what residents say about power, water, security, flooding and access. ${url}`,
    aspect: format === "status" ? "aspect-[9/16]" : "aspect-[78/41]",
  };
}

// The Share sheet (files/design-concept share-card sketch): pick a format,
// see the card, then send it to WhatsApp, save the image, or copy the link.
// A bottom sheet on phones, a centred dialog on larger screens.
export function ShareSheet({ target, onClose }: { target: ShareTarget; onClose: () => void }) {
  const [format, setFormat] = useState<Format>(target.kind === "area" ? "status" : "link");
  const [imageState, setImageState] = useState<"loading" | "ready" | "failed">("loading");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const blobRef = useRef<{ url: string; blob: Blob } | null>(null);
  const firstButtonRef = useRef<HTMLButtonElement>(null);
  const info = details(target, format);
  const title = target.kind === "area" ? `Share ${target.name}` : "Share this comparison";

  // Esc closes, the page behind doesn't scroll, focus starts inside.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstButtonRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  useEffect(() => {
    setImageState("loading");
    setNotice(null);
  }, [info.image]);

  async function imageBlob() {
    if (blobRef.current?.url === info.image) return blobRef.current.blob;
    const res = await fetch(info.image);
    if (!res.ok) throw new Error("image");
    const blob = await res.blob();
    blobRef.current = { url: info.image, blob };
    return blob;
  }

  async function shareToWhatsApp() {
    setNotice(null);
    // Phones: hand the card image to the system share sheet, so it can go
    // straight to a WhatsApp chat or Status.
    if (target.kind === "compare" || format === "status") {
      try {
        setBusy(true);
        const file = new File([await imageBlob()], info.fileName, { type: "image/png" });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], text: info.message });
          return;
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return; // closed the share sheet
      } finally {
        setBusy(false);
      }
    }
    // Everywhere else: open WhatsApp with the link, which unfurls into the preview card.
    window.open(`https://wa.me/?text=${encodeURIComponent(info.message)}`, "_blank", "noopener");
  }

  async function saveImage() {
    setNotice(null);
    try {
      setBusy(true);
      const href = URL.createObjectURL(await imageBlob());
      const a = document.createElement("a");
      a.href = href;
      a.download = info.fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(href), 10_000);
    } catch {
      setNotice("Couldn't save the image. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(info.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setNotice(`Copy this link: ${info.url}`);
    }
  }

  return (
    <div className="fixed inset-0 z-[1300] flex items-end justify-center sm:items-center" role="presentation">
      <div className="absolute inset-0 bg-night/45" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-title"
        className="relative flex max-h-[92vh] w-full flex-col gap-5 overflow-y-auto rounded-t-[24px] bg-white px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] pt-3 shadow-raised sm:max-w-md sm:rounded-[24px] sm:p-6"
      >
        <div className="mx-auto h-1 w-9 rounded-full bg-line sm:hidden" aria-hidden="true" />
        <div className="flex items-center justify-between gap-3">
          <h2 id="share-title" className={text.heading}>
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-mute transition-colors hover:bg-paper-2 hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        {target.kind === "area" && (
          <div role="tablist" aria-label="Format" className="inline-flex w-fit rounded-full bg-paper-2 p-1">
            {(
              [
                ["status", "Status card"],
                ["link", "Link preview"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={format === key}
                onClick={() => setFormat(key)}
                className={`rounded-full px-4 py-1.5 text-body transition-all ${
                  format === key ? "bg-white font-medium text-ink shadow-[0_1px_3px_rgba(17,23,21,.12)]" : "text-mute hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-center rounded-md bg-paper-2 p-4">
          <div
            className={`relative overflow-hidden rounded-md border border-line bg-white ${info.aspect} ${
              format === "status" && target.kind === "area" ? "w-44" : "w-full"
            }`}
          >
            {imageState !== "ready" && (
              <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-caption text-mute">
                {imageState === "loading" ? (
                  <span className="h-full w-full animate-pulse rounded-sm bg-paper-2" />
                ) : (
                  "Preview unavailable right now. You can still share the link."
                )}
              </div>
            )}
            <img
              key={info.image}
              src={info.image}
              alt={`${title}: preview of the card`}
              onLoad={() => setImageState("ready")}
              onError={() => setImageState("failed")}
              className={`h-full w-full object-cover transition-opacity ${imageState === "ready" ? "opacity-100" : "opacity-0"}`}
            />
          </div>
        </div>

        <p className="-mt-1 text-center text-caption text-mute">
          {format === "status" && target.kind === "area"
            ? "Sized for WhatsApp Status and Stories."
            : "Shows the scores and the number of residents behind them."}
        </p>

        <div className="grid grid-cols-3 gap-2">
          <ActionButton
            refProp={firstButtonRef}
            onClick={shareToWhatsApp}
            disabled={busy}
            label="WhatsApp"
            icon={
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff" aria-hidden="true">
                <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3zm4.6 12.7c-.2.6-1.2 1.1-1.7 1.2-.4 0-1 .1-3.1-.8-2.6-1.1-4.2-3.7-4.3-3.9-.1-.2-1-1.4-1-2.6 0-1.2.6-1.8.9-2.1.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.4.6c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.8.9c.3.1.4.2.5.3.1.2.1.7-.1 1.3z" />
              </svg>
            }
            iconClass="bg-[#25d366]"
          />
          <ActionButton
            onClick={saveImage}
            disabled={busy || imageState === "failed"}
            label="Save image"
            icon={<Download size={18} />}
          />
          <ActionButton
            onClick={copyLink}
            label={copied ? "Copied" : "Copy link"}
            icon={copied ? <Check size={18} /> : <Link2 size={18} />}
          />
        </div>

        {notice && (
          <p className="break-all text-center text-caption text-mute" role="status">
            {notice}
          </p>
        )}
      </div>
    </div>
  );
}

function ActionButton({
  onClick,
  label,
  icon,
  iconClass = "bg-paper-2 text-ink",
  disabled,
  refProp,
}: {
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  iconClass?: string;
  disabled?: boolean;
  refProp?: React.Ref<HTMLButtonElement>;
}) {
  return (
    <button
      ref={refProp}
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center gap-2 rounded-md py-2 text-caption text-ink transition-colors hover:bg-paper-2 disabled:opacity-50"
    >
      <span className={`flex h-12 w-12 items-center justify-center rounded-full ${iconClass}`}>{icon}</span>
      {label}
    </button>
  );
}
