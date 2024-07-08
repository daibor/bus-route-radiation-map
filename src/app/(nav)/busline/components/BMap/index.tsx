'use client';

import { useEffect, useRef, useState } from 'react';
import { getRandomColor, loader } from '@/common/utils';
import SearchBar from './Search';
import './index.css';
import { useBusLineStore } from '../../store';
import { rejects } from 'assert';

enum EBuslineStrokeWeight {
    Normal = 5,
    Hover = 7,
    Selected = 10,
}

interface IProps {
    jsKey: string;
    jsSecureKey?: string;
    poi?: BMapGL.Point;
}

interface PolylineEventCallbackTarget extends BMapGL.Polyline {
    hashCode: string;
}
type PolylineEventCallback = (event: {
    type: string;
    target: PolylineEventCallbackTarget;
}) => void;

function Map(props: IProps) {
    const { jsKey } = props;

    const { center, queryConfig, stations, setCenter, setStations } =
        useBusLineStore((state) => ({
            center: state.center,
            queryConfig: state.queryConfig,
            stations: state.stations as BMapGL.LocalResultPoi[],
            setCenter: state.setCenter,
            setStations: state.setStations,
        }));
    const [isMapReady, setIsMapReady] = useState(false);

    const BMapRef = useRef<typeof BMapGL>();
    const mapRef = useRef<BMapGL.Map>();
    const selectedRef = useRef<PolylineEventCallbackTarget>();

    const onInteraction = () => {
        mapRef.current?.addEventListener('rightclick', handleClickMap);
    };

    useEffect(() => {
        if (!jsKey) return;
        loader('bmap', {
            key: jsKey,
            version: '1.0',
        })
            .then((_BMapGL) => {
                BMapRef.current = _BMapGL;
                mapRef.current = new BMapGL.Map('container');

                setIsMapReady(true);

                mapRef.current.centerAndZoom(
                    new BMapGL.Point(116.404, 39.915),
                    12,
                );
                mapRef.current.enableScrollWheelZoom();
                mapRef.current.enableContinuousZoom();
                mapRef.current.enableDoubleClickZoom();

                onInteraction();
            })
            .catch((err) => {
                console.error('BMapGL load failed', err);
            });

        return clearEventListener;
    }, [jsKey]);

    const handleRenderBusStation = (result: BMapGL.LocalResult[]) => {
        console.log('station search result', result);
        const poiList: BMapGL.LocalResultPoi[] = [];
        const deprecatedPoiList: BMapGL.LocalResultPoi[] = [];
        result.map((searchTypeResult) => {
            const count = searchTypeResult.getNumPois();
            for (let i = 0; i <= count - 1; i++) {
                // TODO: 查询做了分页
                const poi = searchTypeResult.getPoi(i);
                if (
                    poi &&
                    [
                        1, 3,
                        // BMapGL.PoiType.BMAP_POI_TYPE_BUSSTOP,
                        // BMapGL.PoiType.BMAP_POI_TYPE_SUBSTOP,
                    ].includes(poi.type)
                ) {
                    poiList.push(poi);
                } else {
                    deprecatedPoiList.push(poi);
                }
            }
        });

        setStations(poiList);

        let busList: string[] = [];
        const stationData = poiList;
        stationData.forEach((item, index) => {
            let formatLines = item.address.split('; ');
            busList = busList.concat(formatLines);

            const stationMarker = new BMapGL.Marker(item.point, {
                title: item.title,
                icon: new BMapGL.Icon(
                    '/icons/station-icon.png',
                    new BMapGL.Size(20, 20),
                ),
            });

            mapRef.current?.addOverlay(stationMarker);
        });

        handleSearchBusLine(Array.from(new Set(busList)));
    };

    const handleSearchBusLine = (busArr: string[]) => {
        if (!mapRef.current) {
            return;
        }
        let promiseList: Promise<{ info: string; lineInfo: BMapGL.BusLine }>[] =
                [],
            timeDelay = 0;

        busArr.forEach((item) => {
            timeDelay += 20;
            promiseList.push(
                new Promise((resolve, reject) => {
                    let iTimer = setTimeout(() => {
                        if (!mapRef.current) {
                            return;
                        }
                        const linesearch = new BMapGL.BusLineSearch(
                            mapRef.current,
                            {
                                onGetBusListComplete: function (result) {
                                    console.log('onGetBusListComplete', result);
                                    if (result) {
                                        const fstLine =
                                            result.getBusListItem(0); //获取第一个公交列表显示到map上
                                        linesearch.getBusLine(fstLine);
                                    } else {
                                        reject(item);
                                        clearTimeout(iTimer);
                                    }
                                },
                                onGetBusLineComplete: function (result) {
                                    if (result) {
                                        handleRenderBusline(result);

                                        resolve({ info: '', lineInfo: result });
                                    } else {
                                        reject(item);
                                        clearTimeout(iTimer);
                                    }
                                },
                            },
                        );
                        linesearch.getBusList(item);
                    }, timeDelay);
                }),
            );
        });

        Promise.all(promiseList);
    };

    const handleRenderBusline = (result: BMapGL.BusLine) => {
        console.log('onGetBusLineComplete', result);
        const polyline = result.getPolyline();
        polyline?.setStrokeColor?.(getRandomColor());
        polyline?.setStrokeWeight?.(EBuslineStrokeWeight.Normal);
        polyline?.addEventListener?.('click', handleClickLine);
        polyline?.addEventListener?.('mouseout', handleMouseoutLine);
        polyline?.addEventListener?.('mouseover', handleMouseoverLine);

        mapRef.current?.addOverlay(polyline);
    };

    useEffect(() => {
        if (center && mapRef.current) {
            const { radius = 500 } = queryConfig || {};
            console.log('center', center);
            mapRef.current.clearOverlays();
            const centerPoint = new BMapGL.Point(center.lng, center.lat);
            const search = new BMapGL.LocalSearch(mapRef.current, {
                onSearchComplete: handleRenderBusStation,
            });
            search.searchNearby(
                ['公交站', '地铁', '轻轨站'],
                centerPoint,
                radius,
            );
            const radiusCircle = new BMapGL.Circle(centerPoint, radius, {
                fillOpacity: 0.7,
                fillColor: '#c2dfff',
                strokeWeight: 2,
                strokeColor: '#c2dfff',
            });
            const centerMarker = new BMapGL.Marker(centerPoint, {
                title: '当前位置',
                icon: new BMapGL.Icon(
                    '/icons/center-icon.png',
                    new BMapGL.Size(24, 24),
                ),
            });
            mapRef.current.addOverlay(radiusCircle);
            mapRef.current.addOverlay(centerMarker);
        }
    }, [center]);

    const handleMouseoutLine: PolylineEventCallback = function (event) {
        if (
            selectedRef.current &&
            selectedRef.current.hashCode === event.target.hashCode
        ) {
            return;
        }
        event.target.setStrokeWeight(EBuslineStrokeWeight.Normal);
    };

    const handleMouseoverLine: PolylineEventCallback = function (event) {
        console.log(selectedRef.current);
        if (
            selectedRef.current &&
            selectedRef.current.hashCode === event.target.hashCode
        ) {
            return;
        }
        event.target.setStrokeWeight(EBuslineStrokeWeight.Hover);
    };

    const handleClickLine: PolylineEventCallback = function (event) {
        console.log('click line', event);
        if (selectedRef.current) {
            selectedRef.current.setStrokeWeight(EBuslineStrokeWeight.Normal);
        }
        if (
            selectedRef.current &&
            selectedRef.current.hashCode === event.target.hashCode
        ) {
            event.target.setStrokeWeight(EBuslineStrokeWeight.Normal);
            selectedRef.current = undefined;
        } else {
            event.target.setStrokeWeight(EBuslineStrokeWeight.Selected);
            event.target.setZIndex(1000);
            selectedRef.current = event.target;
        }
    };

    function handleClickMap(event: {
        type: string;
        target: any;
        point: BMapGL.Point;
        pixel: BMapGL.Pixel;
        lnglat: Omit<BMapGL.Point, 'equals'>;
        overlay: BMapGL.Overlay;
    }) {
        if (event.lnglat) {
            setCenter(event.lnglat);
        } else if (mapRef.current) {
            // ? lnglat 字段文档中没有提及，防止非公开属性调整影响
            let { lng, lat } = event.point;
            if (Math.abs(lng) > 180) {
                // 墨卡托坐标
                [lng, lat] = mapRef.current?.mercatorToLnglat(
                    event.point.lng,
                    event.point.lat,
                );
            }
            setCenter({
                lng,
                lat,
            });
        }
    }

    const clearEventListener = () => {
        if (mapRef.current) {
            mapRef.current.clearOverlays();
            mapRef.current.removeEventListener('click', handleClickMap);
        }
    };

    const handleSelectPoi: Parameters<typeof SearchBar>[0]['onSelectedPoi'] = (
        poi,
    ) => {
        setCenter(poi);
    };

    return (
        <div className="bmap w-full h-full">
            <div id="container"></div>
            <SearchBar
                isMapReady={isMapReady}
                onSelectedPoi={handleSelectPoi}
            />
        </div>
    );
}

export default Map;
