import { MapType } from '@/types/map';

export function loader(
    usingMap: 'amap',
    config: {
        version: '2.0';
        key: string;
        plugins: string[];
    },
): Promise<typeof AMap>;

export function loader(
    usingMap: 'bmap',
    config: {
        version: '1.0';
        key: string;
    },
): Promise<typeof BMapGL>;

export async function loader(
    usingMap: MapType,
    config: {
        version: string;
        key: string;
        plugins?: string[];
    },
): Promise<typeof AMap | typeof BMapGL> {
    if (typeof window === 'undefined') return Promise.reject();
    if (usingMap === 'amap') {
        const { version, key, plugins = [] } = config;
        return new Promise<typeof AMap>((resolve) => {
            window.__loadedCb = () => {
                delete window.__loadedCb;
                resolve(window.AMap);
            };
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = `https://webapi.amap.com/maps?v=${version}&key=${key}&plugin=${plugins.join(
                ',',
            )}&callback=__loadedCb`;
            script.async = true;
            document.body.appendChild(script);
        });
    } else if (usingMap === 'bmap') {
        const { key, version } = config;

        // ! NOT RECOMMENDED TO USE
        // ? bmap official loader script use document.write to insert script, and it's not allowed in asynchronously-loaded script.Using nextjs api handler to fetch the script content and insert it manually into the document.
        const resp = (await fetch(
            `/api/bmap/get-js?v=${version}&ak=${key}`,
        ).then((resp) => resp.json())) as { srcLink: string; hrefLink: string };

        if (!/^https:\/\/api.map.baidu.com/.test(resp.srcLink)) {
            return Promise.reject('Invalid BMapGL script');
        }

        window.BMAP_PROTOCOL = 'https';
        window.BMapGL_loadScriptTime = new Date().getTime();

        return new Promise<typeof BMapGL>((resolve) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = resp.hrefLink;
            document.head.appendChild(link);

            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = resp.srcLink;
            script.async = true;
            script.onload = () => {
                resolve(window.BMapGL);
            };
            document.body.appendChild(script);
        });
    }
    return Promise.reject('Invalid map type');
}
