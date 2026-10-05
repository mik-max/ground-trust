import { useEffect, useRef, useState } from "react";
import { Mic, Pause, Play, RotateCcw, Square, Trash2 } from "lucide-react";
import { MAX_RECORDING_SECONDS, type useAudioRecorder } from "../../hooks/useAudioRecorder";
import { Bars, LiveWaveform, formatSeconds, useWaveformPeaks } from "./Waveform";

type Recorder = ReturnType<typeof useAudioRecorder>;

const LANGUAGES = "English, Yorùbá, Igbo, Hausa or Pidgin";

// Three calm states in one fixed-height panel, so the form doesn't jump:
// ready to record → recording (live level, timer, stop/cancel) → recorded
// (a player with the take's waveform, re-record or delete).
export function VoiceInput({ recorder }: { recorder: Recorder }) {
  const { status } = recorder;

  return (
    <div className="flex min-h-[208px] flex-col justify-center rounded-md border border-line bg-paper-2/50 px-5 py-6">
      {status === "recording" ? (
        <Recording recorder={recorder} />
      ) : status === "recorded" && recorder.audioUrl ? (
        <Player recorder={recorder} />
      ) : (
        <Ready recorder={recorder} />
      )}
      {recorder.errorMessage && (
        <p className="mt-4 text-center text-caption text-band-poor" role="alert">
          {recorder.errorMessage}
        </p>
      )}
    </div>
  );
}

function Ready({ recorder }: { recorder: Recorder }) {
  const requesting = recorder.status === "requesting";
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <button
        type="button"
        onClick={recorder.start}
        disabled={requesting}
        aria-label="Start recording your review"
        className="group relative flex h-[72px] w-[72px] items-center justify-center rounded-full bg-night text-white transition-transform hover:scale-[1.03] active:scale-95 disabled:opacity-60"
      >
        <span className="absolute -inset-2 rounded-full border border-line bg-white/60 transition-colors group-hover:border-[#c9d0cb]" aria-hidden="true" />
        <span className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full bg-night">
          <Mic size={26} strokeWidth={1.8} />
        </span>
      </button>
      <div>
        <p className="text-body-lg font-medium text-ink">{requesting ? "Allow microphone access…" : "Tap to record"}</p>
        <p className="text-caption text-mute">
          Speak in {LANGUAGES}. Up to {MAX_RECORDING_SECONDS / 60} minutes.
        </p>
      </div>
    </div>
  );
}

function Recording({ recorder }: { recorder: Recorder }) {
  const left = MAX_RECORDING_SECONDS - recorder.elapsed;
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between text-body">
        <span className="inline-flex items-center gap-2 font-medium text-ink">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-band-poor/50" />
            <span className="relative h-2.5 w-2.5 rounded-full bg-band-poor" />
          </span>
          Recording
        </span>
        <span className="tabular-nums text-mute" aria-live="off">
          {formatSeconds(recorder.elapsed)}
          <span className="text-faint"> / {formatSeconds(MAX_RECORDING_SECONDS)}</span>
        </span>
      </div>

      <LiveWaveform stream={recorder.stream} />

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={recorder.cancel}
          className="rounded-full px-4 py-2 text-body text-mute transition-colors hover:bg-white hover:text-ink"
        >
          Cancel
        </button>
        {left <= 15 && <span className="text-caption text-mute">{left}s left</span>}
        <button
          type="button"
          onClick={recorder.stop}
          className="inline-flex items-center gap-2 rounded-full bg-night px-5 py-2.5 text-body font-medium text-white transition-colors hover:bg-[#26302c]"
        >
          <Square size={14} fill="currentColor" />
          Stop
        </button>
      </div>
    </div>
  );
}

function Player({ recorder }: { recorder: Recorder }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const { peaks, duration } = useWaveformPeaks(recorder.audioBlob);
  const total = duration ?? recorder.elapsed;

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTime = () => setTime(el.currentTime);
    const onEnd = () => {
      setPlaying(false);
      setTime(0);
    };
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("ended", onEnd);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("ended", onEnd);
    };
  }, []);

  function toggle() {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play();
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const el = audioRef.current;
    if (!el || !total) return;
    const rect = e.currentTarget.getBoundingClientRect();
    el.currentTime = ((e.clientX - rect.left) / rect.width) * total;
    setTime(el.currentTime);
  }

  return (
    <div className="flex flex-col gap-5">
      <audio ref={audioRef} src={recorder.audioUrl ?? undefined} preload="metadata" />
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause your recording" : "Play your recording"}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-night text-white transition-transform active:scale-95"
        >
          {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
        </button>
        <div className="min-w-0 flex-1 cursor-pointer" onClick={seek}>
          <Bars values={peaks ?? Array(48).fill(0.3)} progress={total ? time / total : 0} />
        </div>
        <span className="shrink-0 text-body tabular-nums text-mute">
          {formatSeconds(playing || time > 0 ? time : total)}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
        <span className="text-caption text-mute">Your voice note is ready. It's sent when you share.</span>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={recorder.reset}
            aria-label="Delete this recording"
            className="flex h-9 w-9 items-center justify-center rounded-full text-mute transition-colors hover:bg-white hover:text-band-poor"
          >
            <Trash2 size={16} />
          </button>
          <button
            type="button"
            onClick={() => {
              recorder.reset();
              void recorder.start();
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-1.5 text-body text-ink transition-colors hover:border-[#c9d0cb]"
          >
            <RotateCcw size={14} />
            Record again
          </button>
        </div>
      </div>
    </div>
  );
}
