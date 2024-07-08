import { NextResponse } from "next/server";

function extractLinks(scriptString: string) {
    // 定义正则表达式，匹配 src 和 href 的值
    const srcRegex = /src="([^"]+)"/;
    const hrefRegex = /href="([^"]+)"/;

    // 使用正则表达式提取匹配项
    const srcMatches = scriptString.match(srcRegex)?.[1];
    const hrefMatches = scriptString.match(hrefRegex)?.[1];

    // 将提取的链接返回
    return {
        srcLink: srcMatches,
        hrefLink: hrefMatches,
    };
}

export async function GET(req: Request) {
    const url = new URL(req.url);
    const ak = url.searchParams.get('ak');
    const v = url.searchParams.get('v');

    const resp = await fetch(
        `https://api.map.baidu.com/api?type=webgl&v=${v}&ak=${ak}`,
    ).then((resp) => resp.text());

    return NextResponse.json({
        ...extractLinks(resp),
    });
}
