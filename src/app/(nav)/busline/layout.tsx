import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '公交线路辐射图',
    description:
        '利用可视化地图，展示任意地点附近的全部公交线路走向。帮助您全面、直观地评估地点公交辐射能力，在买房、租房、旅游订酒店时挑到交通便利的好位置！一键查询，覆盖全国。',
    keywords:
        '公交线路辐射图,公交线路辐射,附近公交,周边公交,公交线路,公交车路线',
    authors: [
        {
            name: 'daibor',
            url: 'https://daibor.com',
        },
    ],
    icons: ['/assets/busline/favico.ico'],
};

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <>{children}</>;
}
