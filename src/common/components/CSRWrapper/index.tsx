'use client';

import React, { useEffect, useState } from 'react';

export default function CSRWrapper(props: { children: React.ReactNode }) {
    const { children } = props;
    const [isCSR, setIsCSR] = useState(false);

    useEffect(() => {
        setIsCSR(true);
    }, []);

    return <>{isCSR ? children : null}</>;
}
