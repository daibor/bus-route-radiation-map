'use client';
import { Icon } from '@iconify/react';
import { Button, useDisclosure } from '@nextui-org/react';
import KeySettingsModal from './modal';

export default function KeySettingsButton() {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <>
            <Button
                color="primary"
                variant="flat"
                onClick={onOpen}
                startContent={<Icon icon="material-symbols:settings-rounded" />}
            >
                配置地图密钥
            </Button>
            <KeySettingsModal isOpen={isOpen} onClose={onClose} />
        </>
    );
}
