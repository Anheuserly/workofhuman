"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Music } from "lucide-react";

export function AudioTrackPlayer({
  src,
  title,
  subtitle,
}: {
  src: string;
  title: string;
  subtitle?: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => setPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current;
    if (!audio) return;
    const seekTime = Number(e.target.value);
    audio.currentTime = seekTime;
    setCurrentTime(seekTime);
  }

  function toggleMute() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !muted;
    setMuted(!muted);
  }

  function formatTime(seconds: number) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }

  // Generate simulated dynamic waveform bars based on title length
  const waveformBars = [
    24, 45, 68, 30, 80, 55, 90, 75, 40, 60, 85, 95, 70, 50, 65, 88, 42, 78, 62, 92, 50, 70, 85,
    40, 60, 95, 75, 55, 80, 48, 68, 90, 58, 72, 84, 45, 62, 78,
  ];

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="surface p-6 sm:p-8 rounded-2xl border border-[#ded9cf] bg-gradient-to-br from-[#1c1a17] via-[#24211d] to-[#151515] text-white shadow-md space-y-6">
      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="grid size-12 place-items-center rounded-xl bg-[#0f766e] text-white shadow-md">
            <Music size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white line-clamp-1">{title}</h3>
            <p className="text-xs text-white/60">{subtitle || "High-Fidelity Audio Release"}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleMute}
          className="text-white/60 hover:text-white transition cursor-pointer"
          title={muted ? "Unmute" : "Mute"}
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>

      {/* Waveform Visualization Bars */}
      <div className="flex items-end gap-1.5 h-16 px-1 select-none">
        {waveformBars.map((height, i) => {
          const barPercent = (i / waveformBars.length) * 100;
          const isPlayed = barPercent <= progressPercent;
          return (
            <div
              key={i}
              style={{ height: `${height}%` }}
              className={`flex-1 rounded-full transition-all duration-150 ${
                isPlayed
                  ? "bg-[#0f766e] shadow-[0_0_8px_rgba(15,118,110,0.5)]"
                  : "bg-white/20 hover:bg-white/40"
              }`}
            />
          );
        })}
      </div>

      {/* Controls & Scrubber */}
      <div className="space-y-2">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full accent-[#0f766e] cursor-pointer"
        />

        <div className="flex items-center justify-between text-[11px] font-mono text-white/60">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="flex justify-center pt-1">
        <button
          type="button"
          onClick={togglePlay}
          className="grid size-14 place-items-center rounded-full bg-white text-[#151515] hover:bg-[#0f766e] hover:text-white transition duration-200 cursor-pointer shadow-lg hover:scale-105"
        >
          {playing ? <Pause size={24} className="fill-current" /> : <Play size={24} className="ml-1 fill-current" />}
        </button>
      </div>
    </div>
  );
}
