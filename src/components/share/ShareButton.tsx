import { useState } from "react";
import { Share2 } from "lucide-react";
import { buttonClassName } from "../ui/Button";
import { ShareSheet, type ShareTarget } from "./ShareSheet";

export function ShareButton({ target, className = "" }: { target: ShareTarget; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={buttonClassName({ variant: "outline" }, `inline-flex items-center justify-center gap-2 ${className}`)}
      >
        <Share2 size={16} />
        Share
      </button>
      {open && <ShareSheet target={target} onClose={() => setOpen(false)} />}
    </>
  );
}
