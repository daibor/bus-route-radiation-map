import React, { useEffect, useRef } from 'react';
import { Input } from '@nextui-org/react';
import { Icon } from '@iconify/react/dist/iconify.js';
import classNames from 'classnames';

import styles from './index.module.scss';

interface IProps {
    isMapReady: boolean;
    onSelectedPoi: (poi: AMap.LngLat) => void;
}

interface AutoCompleteType {
    on: (
        type: 'select' | 'choose',
        callback: (event: {
            poi: {
                id: string;
                name: string;
                adcode: string;
                district: string;
                location: AMap.LngLat;
                typecode: string;
            };
        }) => void,
    ) => void;
}

const inputElID = 'amap-search-input';

function SearchBar(props: IProps) {
    const { isMapReady, onSelectedPoi } = props;
    const autoCompleteRef = useRef<AutoCompleteType>();

    const sugListRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isMapReady) return;
        autoCompleteRef.current = new (AMap as any).AutoComplete({
            input: inputElID,
            output: sugListRef.current,
        });

        onInteraction();
    }, [isMapReady]);

    const onInteraction = () => {
        autoCompleteRef.current?.on?.('select', (selection) => {
            console.log('select', selection);
            if (selection.poi.location) {
                onSelectedPoi(selection.poi.location);
            }
        });
    };

    return (
        <div className="z-50 absolute left-0 right-0 mx-auto top-4 w-[300px]">
            <Input
                className=""
                color="primary"
                startContent={<Icon icon="material-symbols:search-rounded" />}
                id={inputElID}
                placeholder="在此输入地址或右键点击地图"
                size="lg"
            />
            <div
                className={classNames(
                    'w-full bg-white rounded-b-md',
                    styles.sugList,
                )}
                ref={sugListRef}
            ></div>
        </div>
    );
}

export default SearchBar;
