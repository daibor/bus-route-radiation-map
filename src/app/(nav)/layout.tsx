import Nav from './components/Nav';

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className='flex flex-col w-screen h-screen'>
            <Nav />
            {children}
        </div>
    );
}
