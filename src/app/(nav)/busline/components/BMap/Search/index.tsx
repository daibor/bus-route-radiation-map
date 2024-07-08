import React, { useEffect, useRef } from 'react';
import { Input } from '@nextui-org/react';
import { Icon } from '@iconify/react/dist/iconify.js';
import classNames from 'classnames';

import styles from './index.module.scss';

interface IProps {
    isMapReady: boolean;
    onSelectedPoi: (poi: BMapGL.Point) => void;
}

const inputElID = 'amap-search-input';

function SearchBar(props: IProps) {
    const { isMapReady, onSelectedPoi } = props;
    const autoCompleteRef = useRef<BMapGL.Autocomplete>();

    const sugListRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isMapReady) return;
        autoCompleteRef.current = new BMapGL.Autocomplete({
            input: inputElID,
        });

        onInteraction();
    }, [isMapReady]);

    const onInteraction = () => {
        (autoCompleteRef.current as any).addEventListener(
            'onconfirm',
            (params: any) => {
                const item = params.item.value as BMapGL.AutocompleteResultPoi;

                console.log('params', params, item);
                // props.handleSetPoi(params.item);

                const localSearch = new BMapGL.LocalSearch('北京', {
                    onSearchComplete() {
                        const result = localSearch.getResults();
                        const { point } = (
                            Array.isArray(result) ? result[0] : result
                        ).getPoi(0);
                        // props.handleSetPoi(point);
                        console.log('point', point);
                        onSelectedPoi(point);
                    },
                });
                localSearch.search(
                    `${item.province}${item.city}${item.district}${item.street}${item.business}`,
                );
            },
        );
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
