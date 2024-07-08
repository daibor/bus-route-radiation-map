/**
 * 根据传入的 name 生成 hash 并映射为相同明度的随机颜色
 * @returns hex color
 */
export function getRandomColor() {
    const n = ((Math.random() * 0xfffff) | 0).toString(16);
    return (
        '#' +
        (n.length !== 6 ? ((Math.random() * 0xf) | 0).toString(16) + n : n)
    );
}

function getHashFromStr(name: string) {
    let hash = 0,
        chr;
    for (let i = 0; i < name.length; i++) {
        chr = name.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

function hslToHex(h: number, s: number, l: number) {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color)
            .toString(16)
            .padStart(2, '0'); // convert to Hex and prefix "0" if needed
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}
