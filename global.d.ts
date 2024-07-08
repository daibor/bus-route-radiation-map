export {};

declare global {
    interface Window {
        __loadedCb?: () => void;
        /**
         * start
         * bmap loader script insert
         */
        BMAP_PROTOCOL: string;
        BMapGL_loadScriptTime: number;
        /**
         * end
         * bmap loader script insert
         */
        /**
         * amap config
         * ref: https://lbs.amap.com/api/javascript-api-v2/guide/abc/load#s3
         */
        _AMapSecurityConfig: {
            key?: string;
            securityJsCode: string;
        };
    }
}
