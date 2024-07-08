'use client';

import { LocalStorageKey } from '@/common/utils';
import { MapType } from '@/types/map';
import { StateCreator, create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppStoreStates {
    usingMap: MapType;
    amapKey: { key: string; securityKey: string };
    bmapKey: string;
}

export interface AppStoreActions {
    setUsingMap: (map: AppStoreStates['usingMap']) => void;
    setAmapKey: (data: AppStoreStates['amapKey']) => void;
    setBmapKey: (key: string) => void;
}

const appStore: StateCreator<AppStoreStates & AppStoreActions> = (set, get) => {
    return {
        usingMap: 'amap',
        amapKey: { key: '', securityKey: '' },
        bmapKey: '',
        selectionLine: '',
        setUsingMap: (map) => set({ usingMap: map }),
        setAmapKey: (data) => set({ amapKey: data }),
        setBmapKey: (key) => set({ bmapKey: key }),
    };
};

export const useAppStore = create<AppStoreStates & AppStoreActions>()(
    persist<
        AppStoreStates & AppStoreActions,
        [],
        [],
        Pick<AppStoreStates, 'amapKey' | 'bmapKey'>
    >(appStore, {
        name: LocalStorageKey.appStore,
    }),
);
