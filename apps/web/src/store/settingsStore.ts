import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ImageHostingType = 'local' | 'github';

export interface GithubConfig {
    token: string;
    repo: string;
    branch: string;
    useJsDelivr: boolean;
}

export interface LocalConfig {
    serverUrl: string;
}

export interface SettingsStore {
    imageHostingType: ImageHostingType;
    githubConfig: GithubConfig;
    localConfig: LocalConfig;
    setImageHostingType: (type: ImageHostingType) => void;
    setGithubConfig: (config: GithubConfig) => void;
    setLocalConfig: (config: LocalConfig) => void;
}

export const useSettingsStore = create<SettingsStore>()(
    persist(
        (set) => ({
            imageHostingType: 'local',
            githubConfig: {
                token: '',
                repo: '',
                branch: 'main',
                useJsDelivr: true,
            },
            localConfig: {
                serverUrl: 'http://localhost:4000',
            },
            setImageHostingType: (type) => set({ imageHostingType: type }),
            setGithubConfig: (config) => set({ githubConfig: config }),
            setLocalConfig: (config) => set({ localConfig: config }),
        }),
        {
            name: 'wemd-settings',
        }
    )
);
