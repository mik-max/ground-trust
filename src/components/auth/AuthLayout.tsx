import type { ReactNode } from "react";
import { Logo } from "../Logo";
import { AuthVisualPanel } from "./AuthVisualPanel";

// A dedicated, chrome-less shell for Login/Register — no NavBar, full
// viewport height, split-screen (form left, live map right). Rendered
// outside App.tsx's standard <NavBar/><main> wrapper for exactly this
// reason: a real split-screen layout needs the full viewport, not the
// centered max-w-6xl column every other page uses.
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col gap-8 bg-paper p-6 lg:flex-row lg:p-10">
      <div className="flex w-full flex-col lg:w-[420px] lg:shrink-0">
        <Logo />
        <div className="flex flex-1 items-center py-8 lg:py-0">
          <div className="w-full">{children}</div>
        </div>
      </div>

      <div className="hidden min-h-[420px] flex-1 lg:block">
        <AuthVisualPanel />
      </div>
    </div>
  );
}
