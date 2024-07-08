import React from 'react';
import {
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    Link,
} from '@nextui-org/react';
import KeySettingsButton from './KeySettings/button';
import styles from './Nav.module.scss';
import classNames from 'classnames';
import { GithubIcon } from './GithubIcon';

export default function Nav() {
    return (
        <>
            <Navbar maxWidth="full" position='static'>
                <NavbarBrand>
                    {/* <AcmeLogo /> */}
                    <p
                        className={classNames(
                            'font-bold text-inherit',
                            styles.brand,
                        )}
                    >
                        <span className='text-yellow-500'>公交线路</span>辐射图
                    </p>
                </NavbarBrand>
                <NavbarContent justify="end">
                    <NavbarItem>
                        <Link
                            className="text-2xl bg-white"
                            href="https://github.com/daibor/bus-route-radiation-map"
                            target='_blank'
                        >
                            <GithubIcon />
                        </Link>
                    </NavbarItem>
                    <NavbarItem>
                        <KeySettingsButton />
                    </NavbarItem>
                </NavbarContent>
            </Navbar>
        </>
    );
}
