import { useCallback, useEffect, useRef, useState } from "react";

export type RecorderStatus = "idle" | "requesting" | "recording" | "recorded" | "error";

const MIME_CANDIDATES = ["audio/webm", "audio/mp4", "audio/ogg"];

// Voice reviews are short by design; recording stops on its own at this length.
export const MAX_RECORDING_SECONDS = 180;

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type));
}

// Records a single voice-review take via the browser's MediaRecorder API.
// Upload is a separate concern (see services/upload.service.ts) — this hook
// only owns the record/stop/re-record lifecycle, the resulting Blob, and the
// live details the UI shows while recording (the stream for the level
// meter, and elapsed seconds).
export function useAudioRecorder() {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  // Set when the take is thrown away mid-recording, so onstop discards it.
  const discardRef = useRef(false);

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStream(null);
    stopTimer();
  }, [stopTimer]);

  useEffect(() => {
    return () => {
      releaseStream();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = useCallback(async () => {
    setErrorMessage(null);
    setStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      discardRef.current = false;

      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        releaseStream();
        if (discardRef.current) {
          setStatus("idle");
          return;
        }
        const blob = new Blob(chunksRef.current, { type: mimeType ?? "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setStatus("recorded");
      };

      recorderRef.current = recorder;
      recorder.start();
      setStream(stream);
      setElapsed(0);
      const startedAt = Date.now();
      timerRef.current = window.setInterval(() => {
        const seconds = Math.floor((Date.now() - startedAt) / 1000);
        setElapsed(seconds);
        if (seconds >= MAX_RECORDING_SECONDS && recorder.state === "recording") recorder.stop();
      }, 250);
      setStatus("recording");
    } catch {
      setErrorMessage("Microphone access was denied or unavailable — you can still use the Text tab.");
      setStatus("error");
      releaseStream();
    }
  }, [releaseStream]);

  const stop = useCallback(() => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }, []);

  // Stop and throw the take away (the "cancel" button while recording).
  const cancel = useCallback(() => {
    discardRef.current = true;
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }, []);

  const reset = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setErrorMessage(null);
    setElapsed(0);
    setStatus("idle");
  }, [audioUrl]);

  return { status, audioBlob, audioUrl, errorMessage, stream, elapsed, start, stop, cancel, reset };
}
