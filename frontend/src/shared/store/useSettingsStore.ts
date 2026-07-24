import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  /** Mudo local do jogador — não impede o professor de ligar música globalmente */
  localMuted: boolean;
  volume: number;
  toggleLocalMute: () => void;
  setVolume: (v: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      localMuted: false,
      volume: 0.5,
      toggleLocalMute: () => set({ localMuted: !get().localMuted }),
      setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
    }),
    { name: 'MyKahoot-settings' },
  ),
);
