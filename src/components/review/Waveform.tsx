import { useEffect, useState } from "react";

const BAR_COUNT = 48;

// Live input level while recording: an AnalyserNode on the mic stream,
// sampled each animation frame into a row of bars that scroll right to left.
export function LiveWaveform({ stream }: { stream: MediaStream | null }) {
  const [levels, setLevels] = useState<number[]>(() => Array(BAR_COUNT).fill(0));

  useEffect(() => {
    if (!stream) return;
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    ctx.createMediaStreamSource(stream).connect(analyser);
    const data = new Uint8Array(analyser.fftSize);
    let frame = 0;
    let last = 0;

    function tick(t: number) {
      frame = requestAnimationFrame(tick);
      if (t - last < 70) return; // ~14 bars a second
      last = t;
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (const v of data) sum += ((v - 128) / 128) ** 2;
      const rms = Math.min(1, Math.sqrt(sum / data.length) * 4);
      setLevels((prev) => [...prev.slice(1), rms]);
    }
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      void ctx.close();
    };
  }, [stream]);

  return <Bars values={levels} progress={1} active />;
}

// A recorded take's shape: decode the blob once and reduce it to peaks.
export function useWaveformPeaks(blob: Blob | null, count = BAR_COUNT) {
  const [peaks, setPeaks] = useState<number[] | null>(null);
  const [duration, setDuration] = useState<number | null>(null);

  useEffect(() => {
    setPeaks(null);
    setDuration(null);
    if (!blob) return;
    let current = true;
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    blob
      .arrayBuffer()
      .then((buf) => ctx.decodeAudioData(buf))
      .then((audio) => {
        if (!current) return;
        const channel = audio.getChannelData(0);
        const size = Math.max(1, Math.floor(channel.length / count));
        const out: number[] = [];
        for (let i = 0; i < count; i++) {
          let max = 0;
          for (let j = i * size; j < Math.min(channel.length, (i + 1) * size); j++) max = Math.max(max, Math.abs(channel[j]));
          out.push(max);
        }
        const top = Math.max(...out, 0.01);
        setPeaks(out.map((v) => v / top));
        setDuration(audio.duration);
      })
      .catch(() => {
        // Some browsers can't decode their own recording format; the player
        // falls back to a flat waveform and the audio element's duration.
        if (current) setPeaks(Array(count).fill(0.35));
      })
      .finally(() => void ctx.close());
    return () => {
      current = false;
    };
  }, [blob, count]);

  return { peaks, duration };
}

export function Bars({ values, progress, active = false }: { values: number[]; progress: number; active?: boolean }) {
  return (
    <div className="flex h-12 w-full items-center gap-[3px]" aria-hidden="true">
      {values.map((v, i) => {
        const played = (i + 0.5) / values.length <= progress;
        return (
          <span
            key={i}
            className={`flex-1 rounded-full transition-[height] duration-100 ${
              active ? "bg-ink" : played ? "bg-ink" : "bg-[#c9d0cb]"
            }`}
            style={{ height: `${Math.max(8, Math.round(v * 100))}%` }}
          />
        );
      })}
    </div>
  );
}

export function formatSeconds(total: number) {
  const s = Math.max(0, Math.round(total));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
