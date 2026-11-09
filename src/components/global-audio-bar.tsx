"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  Music,
} from "lucide-react";
import { useAudioPlayerStore } from "@/lib/audio-player-store";

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export function GlobalAudioBar() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    muted,
    togglePlay,
    pause,
    setCurrentTime,
    setDuration,
    setVolume,
    toggleMute,
    closePlayer,
  } = useAudioPlayerStore();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentTrack?.src && audio.src !== currentTrack.src) {
      audio.src = currentTrack.src;
      audio.load();
      if (isPlaying) {
        audio.play().catch(() => {});
      }
    }
  }, [currentTrack, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = muted ? 0 : volume;
  }, [volume, muted]);

  if (!currentTrack) return null;

  return (
    <aside
      aria-label="Audio player"
      className="fixed bottom-14 lg:bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#ded9cf] px-4 py-2.5 sm:px-6 shadow-2xl transition-all animate-in slide-in-from-bottom-2 select-none"
    >
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) setDuration(audioRef.current.duration);
        }}
        onEnded={() => pause()}
      />

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Track Details & Cover */}
        <div className="flex items-center gap-3 min-w-0 max-w-[240px] sm:max-w-xs">
          {currentTrack.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="size-10 sm:size-11 rounded-lg object-cover border border-[#ded9cf] shrink-0"
            />
          ) : (
            <div className="grid size-10 sm:size-11 place-items-center rounded-lg bg-[#0f766e] text-white shrink-0">
              <Music size={18} />
            </div>
          )}

          <div className="min-w-0 truncate">
            {currentTrack.projectUrl ? (
              <Link
                href={currentTrack.projectUrl}
                className="font-bold text-xs sm:text-sm text-[#151515] hover:text-[#0f766e] transition truncate block"
              >
                {currentTrack.title}
              </Link>
            ) : (
              <p className="font-bold text-xs sm:text-sm text-[#151515] truncate">
                {currentTrack.title}
              </p>
            )}
            <p className="text-[11px] text-[#8c857b] truncate">{currentTrack.artist}</p>
          </div>
        </div>

        {/* Center Controls & Progress Bar */}
        <div className="flex-1 max-w-xl flex flex-col items-center gap-1">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              className="grid size-9 place-items-center rounded-full bg-[#151515] hover:bg-[#2e2b27] text-white shadow-sm transition cursor-pointer"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
            </button>
          </div>

          <div className="w-full flex items-center gap-2 text-[10px] sm:text-xs font-mono text-[#8c857b]">
            <span className="w-8 text-right">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => {
                const time = Number(e.target.value);
                if (audioRef.current) audioRef.current.currentTime = time;
                setCurrentTime(time);
              }}
              className="flex-1 h-1 bg-[#ded9cf] rounded-lg appearance-none cursor-pointer accent-[#0f766e]"
            />
            <span className="w-8">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right Controls: Volume & Close */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMute}
              className="text-[#6f6a61] hover:text-[#151515] transition cursor-pointer"
              title={muted ? "Unmute" : "Mute"}
            >
              {muted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-16 h-1 bg-[#ded9cf] rounded-lg appearance-none cursor-pointer accent-[#0f766e]"
            />
          </div>

          <button
            type="button"
            onClick={closePlayer}
            className="grid size-8 place-items-center rounded-full text-[#8c857b] hover:bg-[#f6f4ef] hover:text-[#151515] transition cursor-pointer"
            title="Dismiss player"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
