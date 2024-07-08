'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import '@amap/amap-jsapi-types';
import { getRandomColor, loader } from '@/common/utils';
import SearchBar from './Search';
// import stationIcon from '../../assets/station-icon.png';
// import centerIcon from '../../assets/center-icon.png';
import './index.css';
import { useBusLineStore } from '../../store';

enum EBuslineStrokeWeight {
    Normal = 5,
    Hover = 7,
    Selected = 10,
}

interface IProps {
    jsKey: string;
    jsSecureKey?: string;
}

type PolylineEventCallback = (event: {
    type: string;
    target: AMap.Polyline;
    pixel: AMap.Pixel;
    lnglat: AMap.LngLat;
}) => void;

enum EBuslineStrokeStyle {
    base,
    hover,
    selected,
}

interface LineData {
    id: string;
    path: AMap.LngLat[];
    citycode: string;
    basic_price: string;
    total_price: string;
    // encode json
    time_desc: string;
    name: string;
    start_stop: string;
    end_stop: string;
    uicolor: string;
    via_stops: {
        location: AMap.LngLat;
        id: string;
        name: string;
        sequence: number;
    };
}

//0原始，1提示，2突出
function genPolylineOptions(typeCode: EBuslineStrokeStyle) {
    let options: ConstructorParameters<typeof AMap.Polyline>[0];
    switch (typeCode) {
        case EBuslineStrokeStyle.base: {
            options = {
                strokeOpacity: 0.6,
                strokeWeight: EBuslineStrokeWeight.Normal,
                zIndex: 50,
                bubble: false,
            };
            break;
        }
        case EBuslineStrokeStyle.hover: {
            options = {
                isOutline: true,
                outlineColor: 'white',
                strokeOpacity: 0.8,
                strokeWeight: EBuslineStrokeWeight.Hover,
                zIndex: 100,
                bubble: false,
            };
            break;
        }
        case EBuslineStrokeStyle.selected: {
            options = {
                isOutline: true,
                outlineColor: 'white',
                strokeOpacity: 1,
                strokeWeight: EBuslineStrokeWeight.Selected,
                zIndex: 100,
                bubble: false,
            };
            break;
        }
        default: {
            throw new Error('no typeCode in genPolylineOptions');
        }
    }
    return options;
}

function Map(props: IProps) {
    const { jsKey, jsSecureKey } = props;

    const { center, queryConfig, setCenter, setSelectionLine } =
        useBusLineStore((state) => ({
            center: state.center as AMap.LngLat,
            queryConfig: state.queryConfig,
            setCenter: state.setCenter,
            setSelectionLine: state.setSelectionLine,
        }));

    const [isMapReady, setIsMapReady] = useState(false);

    const AMapRef = useRef<typeof AMap>({} as typeof AMap);
    const mapRef = useRef<InstanceType<typeof AMap.Map>>(
        {} as InstanceType<typeof AMap.Map>,
    );
    const selectedRef = useRef<{
        polyline: AMap.Polyline;
        lineData: LineData[];
        lineId: string;
    } | null>(null);

    const onInteraction = useCallback(() => {
        mapRef.current?.on('rightclick', handleClickMap);
    }, []);

    useEffect(() => {
        if (jsSecureKey) {
            window._AMapSecurityConfig = {
                securityJsCode: jsSecureKey,
            };
        }
        if (!jsKey) return;
        loader('amap', {
            key: jsKey, // 申请好的Web端开发者Key，首次调用 load 时必填
            version: '2.0', // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
            plugins: [
                'AMap.PlaceSearch',
                'AMap.LineSearch',
                'AMap.AutoComplete',
            ], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
        })
            .then((_AMap: typeof AMap) => {
                AMapRef.current = _AMap;
                mapRef.current = new AMap.Map('container', {
                    // 设置地图容器id
                    viewMode: '2D', // 是否为3D地图模式
                    zoom: 11, // 初始化地图级别
                    center: [116.397428, 39.90923], // 初始化地图中心点位置
                });

                setIsMapReady(true);

                onInteraction();
            })
            .catch((e) => {
                console.log(e);
            });

        // initBuslineSearch();

        return clearEventListener;
    }, [jsSecureKey, jsKey, onInteraction]);

    const handleRenderBusStation = (
        status: 'complete',
        result: {
            info: 'ok';
            poiList: {
                pois: {
                    location: AMap.LngLat;
                    id: string;
                    name: string;
                    address: string;
                    type: string;
                    citycode: string;
                }[];
            };
        },
    ) => {
        console.log('station search result', result);
        let busList: string[] = [];
        const cityCode = result.poiList.pois[0].citycode;
        const stationData = result.poiList.pois;

        //遍历站台信息
        stationData.forEach((item, index) => {
            // 在地图上绘制车站
            let formatLines = item.address.split(';');
            busList = busList.concat(formatLines);

            let stationMarker = new AMap.Marker({
                map: mapRef.current,
                position: item.location, //基点位置
                zIndex: 10,
                icon: new AMapRef.current.Icon({
                    image: '/icons/station-icon.png',
                    imageSize: new AMapRef.current.Size(24, 24),
                    // imageOffset: new AMapRef.current.Pixel(0, 0),
                    size: new AMapRef.current.Size(24, 24),
                }),
                offset: new AMap.Pixel(-12, -24),
                title: item.name,
                extData: {
                    index,
                    location: item.location,
                    type: item.type,
                    name: item.name, //站名
                    lines: formatLines, //经停线路
                    // district: `${item.pname}-${item.cityname}-${item.adname}`,
                },
            });

            mapRef.current.add(stationMarker);

            // stationMarker.on('click', showStationInfo);
            // stationMarker.on('touchend', preventSetCenterOnMobile);
        });

        handleSearchBusLine(Array.from(new Set(busList)), cityCode);
        console.log('busList', Array.from(new Set(busList)));

        // busList = C.unique(busList); //公交线路去重
    };

    const handleSearchBusLine = (busArr: string[], cityCode: string) => {
        /*搜索公交线路并绘制*/
        const linesearch = new (AMap as any).LineSearch({
            pageIndex: 1,
            city: cityCode,
            pageSize: 100,
            extensions: 'all',
        });

        let promiseList: Promise<{ info: string; lineInfo: LineData[] }>[] = [],
            timeDelay = 0;

        busArr.forEach((item) => {
            timeDelay += 20;
            promiseList.push(
                new Promise((resolve, reject) => {
                    let iTimer = setTimeout(() => {
                        linesearch.search(
                            item,
                            (
                                status: string,
                                result: { info: string; lineInfo: LineData[] },
                            ) => {
                                if (
                                    status === 'complete' &&
                                    result.info === 'OK'
                                ) {
                                    const lineInfo = result.lineInfo,
                                        specificColor = lineInfo[0].uicolor
                                            ? {
                                                  strokeColor: `#${lineInfo[0].uicolor}`,
                                              }
                                            : undefined; //按照地铁本来颜色绘制

                                    if (lineInfo.length !== 0)
                                        handleRenderBusline(
                                            lineInfo[0].path,
                                            {
                                                lineData: lineInfo,
                                                index: 0,
                                                id: lineInfo[0].id,
                                            },
                                            0,
                                            specificColor,
                                        ); //默认画第一条线路
                                    // localStorage.setItem(
                                    //   "myStorage",
                                    //   JSON.stringify(lineInfo[0].path)
                                    // );

                                    resolve(result);
                                } else {
                                    reject(item);
                                }
                                clearTimeout(iTimer);
                            },
                        );
                    }, timeDelay);
                }),
            );
        });

        Promise.all(promiseList);
    };

    function handleRenderBusline(
        busPath: AMap.LngLat[],
        lineInfo: { lineData: LineData[]; index: number; id: string },
        styleCode: EBuslineStrokeStyle,
        preOptions: ConstructorParameters<typeof AMap.Polyline>[0] | undefined,
    ) {
        //绘制乘车的路线
        const busPolyline = new AMap.Polyline({
            //   map: mapRef.current,
            path: busPath,
            strokeColor: preOptions ? preOptions.strokeColor : getRandomColor(), //线颜色
            ...genPolylineOptions(styleCode),
            isOutline: true,
            outlineColor: '#dddddd',
            borderWeight: 0.5,
            lineJoin: 'round', //圆角连接
            lineCap: 'round', //圆角线帽
            cursor: 'pointer',
            showDir: true,
            extData: lineInfo, //线路详情
        });
        mapRef.current.add(busPolyline);

        //选中，明显展示
        busPolyline.on('click', handleClickLine);

        //鼠标滑过，提示划过
        busPolyline.on('mouseover', handleMouseoverLine);
        busPolyline.on('mouseout', handleMouseoutLine);

        return busPolyline;
    }

    useEffect(() => {
        if (center && mapRef.current) {
            const { radius = 500 } = queryConfig || {};
            console.log('center', center);
            mapRef.current.clearMap();
            const placeSearch = new (AMap as any).PlaceSearch({
                type: '150500|150600|150700', // 兴趣点类别
                pageSize: 50, // 单页显示结果条数
                pageIndex: 1, // 页码
                city: '北京', // 兴趣点城市
                // citylimit: true, //是否强制限制在设置的城市内搜索
                // map: AMapRef.current, // 展现结果的地图实例
                // panel: 'panel', // 结果列表将在此容器中进行展示。
                extensions: 'all',
            });
            placeSearch.searchNearBy(
                '',
                center,
                radius,
                handleRenderBusStation,
            );
            const radiusCircle = new AMapRef.current.Circle({
                center,
                radius,
                fillOpacity: 0.7,
                fillColor: '#c2dfff',
                strokeWeight: 2,
                strokeColor: '#c2dfff',
            });
            const centerMarker = new AMap.Marker({
                position: center,
                title: '当前位置',
                icon: new AMapRef.current.Icon({
                    image: '/icons/center-icon.png',
                    imageSize: new AMapRef.current.Size(24, 24),
                    size: new AMapRef.current.Size(24, 24),
                }),
                offset: new AMapRef.current.Pixel(-12, -24),
            });
            mapRef.current.add(radiusCircle);
            mapRef.current.add(centerMarker);
        }
    }, [center]);

    const handleMouseoutLine: PolylineEventCallback = function (event) {
        console.log(
            'handleMouseoutLine',
            event,
            event.target instanceof AMap.Polyline,
            event.target.getOptions(),
        );
        const extData: {
            id: string;
            lineData: LineData;
        } = event.target.getExtData();
        if (selectedRef.current?.lineId === extData.id) {
            return;
        }
        event.target.setOptions(genPolylineOptions(EBuslineStrokeStyle.base));
        event.target.show();
    };

    const handleMouseoverLine: PolylineEventCallback = function (event) {
        console.log(
            'handleMouseoverLine',
            event,
            event.target instanceof AMap.Polyline,
            event.target.getOptions(),
        );
        const extData: {
            id: string;
            lineData: LineData;
        } = event.target.getExtData();
        if (selectedRef.current?.lineId === extData.id) {
            return;
        }
        event.target.setOptions(genPolylineOptions(EBuslineStrokeStyle.hover));
        // if (
        //     selectedRef.current &&
        //     selectedRef.current.hashCode === event.target.hashCode
        // ) {
        //     return;
        // }
        // event.target.setStrokeWeight(EBuslineStrokeWeight.Hover);
    };

    const handleClickLine: PolylineEventCallback = function (event) {
        console.log(
            'handleClickLine',
            event,
            event.target instanceof AMap.Polyline,
        );
        const data = event.target.getExtData();
        if (selectedRef.current?.lineId === event.target.getExtData().id) {
            // 当前已选中
            return;
        } else if (data.lineData) {
            if (selectedRef.current) {
                selectedRef.current.polyline.setOptions(
                    genPolylineOptions(EBuslineStrokeStyle.base),
                );
            }
            const extData: {
                id: string;
                lineData: LineData[];
                index: number;
            } = event.target.getExtData();

            setSelectionLine(extData.lineData?.[extData.index]?.name);

            selectedRef.current = {
                polyline: event.target,
                lineData: extData.lineData,
                lineId: extData.id,
            };
            event.target.setOptions(
                genPolylineOptions(EBuslineStrokeStyle.selected),
            );
        }
    };

    function handleClickMap(event: {
        type: string;
        target: any;
        pixel: AMap.Pixel;
        lnglat: AMap.LngLat;
    }) {
        setCenter(event.lnglat);
    }

    const clearEventListener = () => {
        if (mapRef.current) {
            mapRef.current?.destroy?.();
        }
    };

    const handleSelectPoi: Parameters<typeof SearchBar>[0]['onSelectedPoi'] = (
        poi,
    ) => {
        setCenter(poi);
    };

    return (
        <div className="amap w-full h-full">
            <div id="container"></div>
            <SearchBar
                isMapReady={isMapReady}
                onSelectedPoi={handleSelectPoi}
            />
        </div>
    );
}

export default Map;
