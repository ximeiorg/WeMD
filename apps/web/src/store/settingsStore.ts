import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SettingsStore {
    // 预留给未来的其他设置
}

export const useSettingsStore = create<SettingsStore>()(
    persist(
        (set) => ({}),
        {
            name: 'wemd-settings',
        }
    )
);
