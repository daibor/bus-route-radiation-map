'use client';

import { Icon } from '@iconify/react';
import { Button } from '@nextui-org/react';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { useBusLineStore } from '../../store';
import { useAppStore } from '@/store';

export default function LinePanel() {
    const { usingMap } = useAppStore((state) => ({
        usingMap: state.usingMap,
    }));
    const { selection } = useBusLineStore((state) => ({
        selection: state.selectionLine,
    }));
    const [show, setShow] = useState(false);
    useEffect(() => {
        if (selection) {
            console.log('selection', selection);
            setShow(true);
        }
    }, [selection]);
    useEffect(() => {
        if (usingMap) {
            setShow(false);
        }
    }, [usingMap]);

    const handleClose = () => {
        setShow(false);
    };
    return (
        <div
            className={classNames(
                'bg-white h-full rounded-sm shadow relative',
                {
                    'w-0 overflow-hidden': !show,
                    'w-[300px]': show,
                },
            )}
        >
            <div className="p-4">
                <Button
                    isIconOnly
                    radius="full"
                    className="absolute top-2 right-2 bg-white text-2xl"
                    onClick={handleClose}
                >
                    <Icon icon="material-symbols:close-rounded" />
                </Button>
                <h2 className="text-lg font-medium">线路</h2>
                <div className="mt-4">
                    <span>当前选中线路：</span>
                    <span className="text-blue-600">{selection}</span>
                </div>
            </div>
        </div>
    );
}
