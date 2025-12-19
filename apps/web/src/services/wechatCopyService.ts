import toast from 'react-hot-toast';
import { processHtml, createMarkdownParser } from '@wemd/core';
import katexCss from 'katex/dist/katex.min.css?raw';
import { loadMathJax } from '../utils/mathJaxLoader';
import { hasMathFormula } from '../utils/katexRenderer';
import { getLinkToFootnoteEnabled } from '../components/Editor/Toolbar';

const buildCopyCss = (themeCss: string) => {
    if (!themeCss) return katexCss;
    return `${themeCss}\n${katexCss}`;
};

/**
 * 将外部链接转换为脚注引用
 * 微信内部链接（mp.weixin.qq.com）不转换
 */
function convertLinksToFootnotes(html: string): string {
    const links: { text: string; url: string }[] = [];
    let counter = 1;

    // 匹配 <a href="url">text</a>，提取 href 和文本内容
    const result = html.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi,
        (match, url, text) => {
            // 跳过微信内部链接
            if (url.includes('mp.weixin.qq.com')) return match;
            // 跳过锚点链接
            if (url.startsWith('#')) return match;
            // 跳过空链接
            if (!url || url === 'url') return text;

            links.push({ text: text.trim(), url });
            return `${text}<sup style="color:#576b95;font-size:80%;vertical-align:super;">[${counter++}]</sup>`;
        }
    );

    // 如果有外链，在末尾添加脚注列表
    if (links.length > 0) {
        const footnoteSection = `
<section style="margin-top:24px;padding-top:16px;border-top:1px solid rgba(0,0,0,0.1);">
<p style="font-size:12px;color:rgba(0,0,0,0.4);margin:0 0 8px 0;">参考链接</p>
${links.map((l, i) =>
            `<p style="font-size:12px;color:rgba(0,0,0,0.5);margin:4px 0;line-height:1.5;"><span style="color:rgba(0,0,0,0.6);">[${i + 1}]</span> ${l.text}<br/><span style="color:rgba(0,0,0,0.35);word-break:break-all;">${l.url}</span></p>`
        ).join('')}
</section>`;
        return result + footnoteSection;
    }

    return result;
}

export async function copyToWechat(markdown: string, css: string): Promise<void> {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '-9999px';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    try {
        const shouldLoadMath = hasMathFormula(markdown);
        if (shouldLoadMath) {
            await loadMathJax();
        }
        const parser = createMarkdownParser();
        const rawHtml = parser.render(markdown);
        const themedCss = buildCopyCss(css);
        let styledHtml = processHtml(rawHtml, themedCss);

        // 如果开启了外链转脚注，处理链接
        if (getLinkToFootnoteEnabled()) {
            styledHtml = convertLinksToFootnotes(styledHtml);
        }

        container.innerHTML = styledHtml;

        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(container);
        selection?.removeAllRanges();
        selection?.addRange(range);

        document.execCommand('copy');

        if (navigator.clipboard && window.ClipboardItem) {
            try {
                const blob = new Blob([container.innerHTML], { type: 'text/html' });
                const textBlob = new Blob([markdown], { type: 'text/plain' });
                await navigator.clipboard.write([
                    new ClipboardItem({
                        'text/html': blob,
                        'text/plain': textBlob
                    })
                ]);
            } catch (e) {
                console.error('Clipboard API 失败，使用回退方案', e);
            }
        }

        toast.success('已复制，可以直接粘贴至微信公众号', {
            duration: 3000,
            icon: '✅',
        });
    } catch (error) {
        console.error('复制失败:', error);
        toast.error('复制失败，请重试');
        throw error;
    } finally {
        document.body.removeChild(container);
    }
}

