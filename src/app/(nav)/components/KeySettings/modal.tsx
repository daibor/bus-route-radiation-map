import { useAppStore } from '@/store';
import {
    Button,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from '@nextui-org/react';
import Link from 'next/link';
import { FormEventHandler } from 'react';

interface FormJsonValue extends Record<string, unknown> {
    amapKey?: string;
    bmapKey?: string;
}

export default function Settings(props: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const { isOpen, onClose } = props;

    const { amapKey, bmapKey, setAmapKey, setBmapKey } = useAppStore(
        (state) => ({
            amapKey: state.amapKey,
            bmapKey: state.bmapKey,
            setAmapKey: state.setAmapKey,
            setBmapKey: state.setBmapKey,
        }),
    );

    const handleFormChange: FormEventHandler<HTMLFormElement> = (eve) => {
        const formData = new FormData(eve.currentTarget as HTMLFormElement);
        const formJsonValue: FormJsonValue = {};
        formData.forEach((value, key) => (formJsonValue[key] = value));

        setAmapKey({
            key: formJsonValue.amapKey as string,
            securityKey: formJsonValue.amapSecureKey as string,
        });
        setBmapKey(formJsonValue.bmapKey as string);
    };

    return (
        <Modal backdrop="blur" isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            配置
                        </ModalHeader>
                        <ModalBody>
                            <form onChange={handleFormChange}>
                                <Input
                                    autoFocus
                                    label={
                                        <div>
                                            <span>高德地图 js 密钥</span>
                                            <Link
                                                className="ml-1 text-blue-400"
                                                href="https://lbs.amap.com/api/javascript-api-v2/prerequisites"
                                            >
                                                如何获取？
                                            </Link>
                                        </div>
                                    }
                                    placeholder="密钥仅存储在你的本地"
                                    variant="underlined"
                                    name="amapKey"
                                    value={amapKey.key}
                                />
                                <Input
                                    label={
                                        <div>
                                            <span>高德地图安全密钥</span>
                                        </div>
                                    }
                                    placeholder=""
                                    variant="underlined"
                                    name="amapSecureKey"
                                    value={amapKey.securityKey}
                                />
                                <Input
                                    className="mt-3"
                                    label={
                                        <div>
                                            <span>百度地图 js 密钥</span>
                                            <Link
                                                className="ml-1 text-blue-400"
                                                href="https://lbsyun.baidu.com/index.php?title=jspopularGL/guide/getkey"
                                            >
                                                如何获取？
                                            </Link>
                                        </div>
                                    }
                                    placeholder="密钥仅存储在你的本地"
                                    variant="underlined"
                                    name="bmapKey"
                                    value={bmapKey}
                                />
                            </form>
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
