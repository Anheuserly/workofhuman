import { create } from "zustand";

export interface ActiveTrack {
  src: string;
  title: string;
  artist: string;
  coverUrl?: string;
  projectUrl?: string;
}

interface AudioPlayerState {
  currentTrack: ActiveTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;

  // Actions
  playTrack: (track: ActiveTrack) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  closePlayer: () => void;
}

export const useAudioPlayerStore = create<AudioPlayerState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  muted: false,

  playTrack: (track) => {
    const current = get().currentTrack;
    if (current?.src === track.src) {
      set({ isPlaying: true });
    } else {
      set({
        currentTrack: track,
        isPlaying: true,
        currentTime: 0,
        duration: 0,
      });
    }
  },

  togglePlay: () => {
    set((state) => ({ isPlaying: !state.isPlaying }));
  },

  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),

  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume, muted: volume === 0 }),
  toggleMute: () => set((state) => ({ muted: !state.muted })),
  closePlayer: () => set({ currentTrack: null, isPlaying: false, currentTime: 0 }),
}));
