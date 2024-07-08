import classNames from 'classnames';
import styles from './layout.module.scss';

export default function MdxLayout({ children }: { children: React.ReactNode }) {
    // Create any shared layout or styles here
    return (
        <main className={classNames('w-full h-full flex-1 overflow-y-auto', styles.guide)}>
            {children}
        </main>
    );
}
