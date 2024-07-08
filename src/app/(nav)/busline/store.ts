import { StateCreator, create } from 'zustand';

export interface StoreStates {
    /**
     * 选中的线路
     */
    selectionLine: string;
    /**
     * 查询中心点
     */
    center?: AMap.LngLat | Omit<BMapGL.Point, 'equals'>;

    stations?: (
        | {
              location: AMap.LngLat;
              id: string;
              name: string;
              address: string;
              type: string;
              citycode: string;
          }
        | BMapGL.LocalResultPoi
    )[];

    /**
     * 查询配置
     */
    queryConfig?: {
        radius: number;
    };
}

export interface StoreActions {
    setSelectionLine: (line: string) => void;
    setCenter: (poi: AMap.LngLat | Omit<BMapGL.Point, 'equals'>) => void;
    setQueryConfig: (config: StoreStates['queryConfig']) => void;
    setStations: (stations: StoreStates['stations']) => void;
}

const store: StateCreator<StoreStates & StoreActions> = (set, get) => {
    return {
        selectionLine: '',
        queryConfig: {
            radius: 500,
        },
        setSelectionLine: (line) => set({ selectionLine: line }),
        setCenter: (poi) => {
            set({ center: poi });
        },
        setQueryConfig: (config) => {
            set({ queryConfig: config });
        },
        setStations: (stations) => {
            set({ stations });
        },
    };
};

export const useBusLineStore = create<StoreStates & StoreActions>()(store);
