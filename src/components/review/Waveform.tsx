import { useEffect, useRef, useState } from "react";

const BAR_COUNT = 48;

// Live voice visualiser while recording: the mic's frequency spectrum,
// drawn on a canvas every frame. Thin bars grow up and down from a midline
// and are mirrored around the centre, with the strongest speech frequencies
// (roughly 300 Hz to 1.5 kHz) in the middle and higher/lower ones towards
// the edges, so speaking produces one smooth central swell. Each bar eases
// towards its target (quick rise, soft fall) and a slow "breathing"
// baseline keeps it alive during pauses. Reduced-motion users get a calm
// static line.
const BAR_W = 3;
const BAR_GAP = 4;
const MAX_VIS_BARS = 121;

export function LiveWaveform({ stream }: { stream: MediaStream | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!stream || !canvas) return;
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;
    analyser.minDecibels = -85;
    analyser.maxDecibels = -25;
    ctx.createMediaStreamSource(stream).connect(analyser);

    const freq = new Uint8Array(analyser.frequencyBinCount);
    const binHz = ctx.sampleRate / analyser.fftSize;
    const heights = new Float32Array(MAX_VIS_BARS);
    const targets = new Float32Array(MAX_VIS_BARS);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const g = canvas.getContext("2d")!;
    const color = getComputedStyle(canvas).color;
    let frame = 0;
    let bandCache: { half: number; bands: (readonly [number, number])[] } | null = null;

    // For `half` bars from the centre outwards: log-spaced speech bands,
    // ordered so the loudest region of a voice sits at the centre.
    function bandsFor(half: number) {
      if (bandCache?.half === half) return bandCache.bands;
      const lo = 120, hi = 4500;
      const all = Array.from({ length: half }, (_, i) => {
        const a = lo * Math.pow(hi / lo, i / half);
        const b = lo * Math.pow(hi / lo, (i + 1) / half);
        return [Math.max(1, Math.floor(a / binHz)), Math.max(2, Math.ceil(b / binHz))] as const;
      });
      const peak = Math.round(half * 0.32); // ~500 Hz
      const order: number[] = [peak];
      for (let d = 1; order.length < half; d++) {
        if (peak + d < half) order.push(peak + d);
        if (peak - d >= 0 && order.length < half) order.push(peak - d);
      }
      bandCache = { half, bands: order.map((k) => all[k]) };
      return bandCache.bands;
    }

    function draw(t: number) {
      frame = requestAnimationFrame(draw);
      const dpr = window.devicePixelRatio || 1;
      const w = canvas!.clientWidth;
      const h = canvas!.clientHeight;
      if (canvas!.width !== Math.round(w * dpr) || canvas!.height !== Math.round(h * dpr)) {
        canvas!.width = Math.round(w * dpr);
        canvas!.height = Math.round(h * dpr);
      }
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, h);
      g.fillStyle = color;

      let count = Math.min(MAX_VIS_BARS, Math.floor((w + BAR_GAP) / (BAR_W + BAR_GAP)));
      if (count % 2 === 0) count -= 1; // a true centre bar
      const half = (count + 1) / 2;
      const bands = bandsFor(half);
      const offset = (w - (count * BAR_W + (count - 1) * BAR_GAP)) / 2;
      const mid = h / 2;

      analyser.getByteFrequencyData(freq);
      // Per-bar targets first, then blend each with its neighbours so the
      // outline flows as one shape instead of a picket fence.
      for (let i = 0; i < count; i++) {
        const fromCentre = Math.abs(i - (count - 1) / 2);
        const band = bands[Math.min(half - 1, fromCentre)];
        let sum = 0;
        for (let b = band[0]; b < band[1] && b < freq.length; b++) sum += freq[b];
        const level = sum / Math.max(1, band[1] - band[0]) / 255;
        // Gentle bell-shaped envelope so the edges stay low and calm.
        const envelope = Math.exp(-Math.pow(fromCentre / (half * 0.62), 2));
        const breathing = reduced ? 0 : 0.035 + 0.025 * Math.sin(t / 480 + i * 0.22);
        targets[i] = reduced ? 0.05 : Math.min(1, Math.pow(level, 1.15) * 1.7 * (0.25 + 0.75 * envelope) + breathing);
      }
      for (let i = 0; i < count; i++) {
        const a = targets[Math.max(0, i - 2)], b = targets[Math.max(0, i - 1)], c = targets[i];
        const d = targets[Math.min(count - 1, i + 1)], e = targets[Math.min(count - 1, i + 2)];
        const target = (a + 2 * b + 3 * c + 2 * d + e) / 9;
        heights[i] += (target - heights[i]) * (target > heights[i] ? 0.3 : 0.1); // quick rise, soft fall
        const bh = Math.max(BAR_W, heights[i] * h);
        g.globalAlpha = 0.3 + 0.7 * Math.min(1, heights[i] * 2.5);
        g.beginPath();
        g.roundRect(offset + i * (BAR_W + BAR_GAP), mid - bh / 2, BAR_W, bh, BAR_W / 2);
        g.fill();
      }
      g.globalAlpha = 1;
    }
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      void ctx.close();
    };
  }, [stream]);

  return <canvas ref={canvasRef} className="block h-20 w-full text-ink" aria-hidden="true" />;
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
