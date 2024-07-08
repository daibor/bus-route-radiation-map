'use client';

import BMap from './components/BMap';
import AMap from './components/AMap';
import { Button } from '@nextui-org/react';
import { useAppStore } from '@/store';
import MapSwitcher from './components/MapSwitcher';
import CSRWrapper from '@/common/components/CSRWrapper';
import LinePanel from './components/LinePanel';
import Icon from '@/common/components/Icon';

export default function Page() {
    const { amapKey, bmapKey, usingMap } = useAppStore((state) => ({
        amapKey: state.amapKey,
        bmapKey: state.bmapKey,
        usingMap: state.usingMap,
        setUsingMap: state.setUsingMap,
    }));

    return (
        <main className="w-full h-full relative flex-1">
            <div className="absolute z-50 right-6 top-4">
                <MapSwitcher isDisabled={!bmapKey && !amapKey.key} />
            </div>
            <div className="absolute z-50 left-6 h-full py-4">
                <LinePanel />
            </div>
            {usingMap === 'bmap' && bmapKey ? <BMap jsKey={bmapKey} /> : null}
            {usingMap === 'amap' && amapKey.key && amapKey.securityKey ? (
                <AMap jsKey={amapKey.key} jsSecureKey={amapKey.securityKey} />
            ) : null}
            <CSRWrapper>
                {!bmapKey && !amapKey.key ? (
                    <div className="w-full h-full flex justify-center items-center flex-col">
                        <span>
                            注册高德/百度地图开发者，点击页面右上角「配置地图密钥」按钮，填入应用 JS key & 安全密钥
                        </span>
                        <div className="flex flex-col mt-4">
                            <Button
                                startContent={
                                    <Icon
                                        icon="material-symbols:unknown-document-rounded"
                                        className="w-5 h-5"
                                    />
                                }
                                color="primary"
                                onClick={() => {
                                    window.open('/guide/get-key', '_blank');
                                }}
                            >
                                查看详细教程及说明
                            </Button>
                        </div>
                    </div>
                ) : null}
            </CSRWrapper>
        </main>
    );
}
