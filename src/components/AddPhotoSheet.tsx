import { useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { CheckCircle2, ImagePlus, X } from "lucide-react";
import { uploadAreaPhoto } from "../services/area.service";
import { Button } from "./ui/Button";
import { text } from "../styles/typography";

const ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif";
const MAX_BYTES = 10 * 1024 * 1024;

// A resident adds a photo of an area: guidance on what makes a good,
// respectful photo, a preview, consent, then it waits for an admin.
export function AddPhotoSheet({ areaId, areaName, onClose }: { areaId: string; areaName: string; onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [state, setState] = useState<"choosing" | "sending" | "sent">("choosing");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  function choose(next: File | undefined) {
    setError(null);
    if (!next) return;
    if (next.size > MAX_BYTES) {
      setError("That photo is over 10MB. Please choose a smaller one.");
      return;
    }
    setFile(next);
    setPreview(URL.createObjectURL(next));
  }

  async function send() {
    if (!file) return;
    setState("sending");
    setError(null);
    try {
      await uploadAreaPhoto(areaId, file);
      setState("sent");
    } catch (err) {
      setError(
        isAxiosError(err) && err.response?.data?.error ? err.response.data.error : "Couldn't upload the photo. Please try again."
      );
      setState("choosing");
    }
  }

  return (
    <div className="fixed inset-0 z-[1300] flex items-end justify-center sm:items-center" role="presentation">
      <div className="absolute inset-0 bg-night/45" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-photo-title"
        className="relative flex max-h-[92vh] w-full flex-col gap-5 overflow-y-auto rounded-t-[24px] bg-white px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] pt-3 shadow-raised sm:max-w-md sm:rounded-[24px] sm:p-6"
      >
        <div className="mx-auto h-1 w-9 rounded-full bg-line sm:hidden" aria-hidden="true" />
        <div className="flex items-center justify-between gap-3">
          <h2 id="add-photo-title" className={text.heading}>
            Add a photo of {areaName}
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

        {state === "sent" ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 size={36} className="text-brand" />
            <p className={text.heading}>Thanks, your photo is in</p>
            <p className="max-w-xs text-body text-mute">
              An admin checks every photo before it shows. If it's approved, it will appear on {areaName}'s page.
            </p>
            <Button type="button" onClick={onClose} className="mt-2">
              Done
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex flex-col gap-2 rounded-md bg-paper-2 px-4 py-3.5 text-body text-ink">
              <li>Show the area: a street, a road, a junction, buildings.</li>
              <li>No faces you could recognise, no car number plates.</li>
              <li>Nothing inside anyone's home or compound.</li>
            </ul>

            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              className="sr-only"
              id="area-photo-file"
              onChange={(e) => choose(e.target.files?.[0])}
            />
            {preview ? (
              <div className="flex flex-col gap-2">
                <img src={preview} alt="Your photo" className="aspect-[16/10] w-full rounded-md object-cover" />
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="w-fit text-caption text-mute underline underline-offset-4 hover:text-ink"
                >
                  Choose a different photo
                </button>
              </div>
            ) : (
              <label
                htmlFor="area-photo-file"
                className="flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed border-[#c9d0cb] px-4 py-8 text-center transition-colors hover:border-brand hover:bg-brand-soft/40"
              >
                <ImagePlus size={28} className="text-mute" />
                <span className="text-body font-medium text-ink">Choose a photo</span>
                <span className="text-caption text-mute">JPEG, PNG, WebP or HEIC, up to 10MB</span>
              </label>
            )}

            <label className="flex items-start gap-3 text-body text-ink">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-brand)]"
              />
              <span>
                I took this photo, and I agree to it being shown on GroundTrust and its share cards, credited to "a
                resident".
              </span>
            </label>

            {error && (
              <p className="text-caption text-band-poor" role="alert">
                {error}
              </p>
            )}

            <Button type="button" onClick={send} disabled={!file || !agreed || state === "sending"}>
              {state === "sending" ? "Uploading…" : "Send for approval"}
            </Button>
            <p className="-mt-2 text-center text-caption text-mute">
              Location details stored in the photo file are removed when it's uploaded.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
