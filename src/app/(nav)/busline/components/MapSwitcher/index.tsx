'use client';
import React from 'react';
import {
    Button,
    ButtonGroup,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
} from '@nextui-org/react';
import { useAppStore } from '@/store';
import { Icon } from '@iconify/react';
import { MapType } from '@/types/map';

export default function MapSwitcher(props: { isDisabled: boolean }) {
    const { isDisabled } = props;

    const { usingMap, setUsingMap } = useAppStore((state) => ({
        usingMap: state.usingMap,
        setUsingMap: state.setUsingMap,
    }));

    const descriptionsMap: Record<MapType, string> = {
        amap: '推荐使用，可查看线路详细信息',
        bmap: '优化中…',
    };

    const labelsMap: Record<MapType, string> = {
        amap: '高德地图',
        bmap: '百度地图',
    };

    return (
        <ButtonGroup variant="shadow" size="sm">
            <Button isDisabled={isDisabled}>{labelsMap[usingMap]}</Button>
            <Dropdown placement="bottom-end" isDisabled={isDisabled}>
                <DropdownTrigger>
                    <Button isIconOnly>
                        <Icon icon="material-symbols:arrow-drop-down-rounded" />
                    </Button>
                </DropdownTrigger>
                <DropdownMenu<MapType>
                    disallowEmptySelection
                    aria-label="Merge options"
                    selectedKeys={new Set([usingMap])}
                    selectionMode="single"
                    onSelectionChange={(sel) => {
                        if (sel !== 'all' && sel.size === 1) {
                            setUsingMap(sel.values().next().value);
                        }
                    }}
                    className="max-w-[300px]"
                >
                    {Object.keys(labelsMap).map((_key) => {
                        const key = _key as MapType;
                        return (
                            <DropdownItem
                                key={key}
                                description={descriptionsMap[key]}
                            >
                                {labelsMap[key]}
                            </DropdownItem>
                        );
                    })}
                </DropdownMenu>
            </Dropdown>
        </ButtonGroup>
    );
}
