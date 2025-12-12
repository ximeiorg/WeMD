import MarkdownIt from "markdown-it";
import markdownItContainer from "markdown-it-container";
import markdownItDeflist from "markdown-it-deflist";
import markdownItImplicitFigures from "markdown-it-implicit-figures";
import markdownItTableOfContents from "markdown-it-table-of-contents";
import markdownItRuby from "markdown-it-ruby";
import markdownItMark from "markdown-it-mark";

import markdownItSub from "markdown-it-sub";
import markdownItSup from "markdown-it-sup";
import { full as markdownItEmoji } from "markdown-it-emoji";

// Local plugins
// @ts-ignore
import markdownItMath from "./plugins/markdown-it-math";
// @ts-ignore
import markdownItSpan from "./plugins/markdown-it-span";
// @ts-ignore
import markdownItTableContainer from "./plugins/markdown-it-table-container";
// @ts-ignore
import markdownItLinkfoot from "./plugins/markdown-it-linkfoot";
// @ts-ignore
import markdownItImageFlow from "./plugins/markdown-it-imageflow";
// @ts-ignore
import markdownItMultiquote from "./plugins/markdown-it-multiquote";
// @ts-ignore
import markdownItLiReplacer from "./plugins/markdown-it-li";

// @ts-ignore
import highlightjs from "./utils/langHighlight";

export const createMarkdownParser = () => {
    const markdownParser = new MarkdownIt({
        html: true,
        highlight: (str, lang) => {
            if (lang === undefined || lang === "") {
                lang = "bash";
            }
            // 加上custom则表示自定义样式，而非微信专属，避免被remove pre
            if (lang && highlightjs.getLanguage(lang)) {
                try {
                    const formatted = highlightjs
                        .highlight(lang, str, true)
                        .value;
                    return '<pre class="custom"><code class="hljs">' + formatted + "</code></pre>";
                } catch (e) {
                }
            }
            return '<pre class="custom"><code class="hljs">' + markdownParser.utils.escapeHtml(str) + "</code></pre>";
        },
    });

    const calloutConfigs = [
        { type: "tip", label: "技巧", icon: "💡" },
        { type: "note", label: "提示", icon: "📝" },
        { type: "info", label: "信息", icon: "ℹ️" },
        { type: "success", label: "成功", icon: "✅" },
        { type: "warning", label: "注意", icon: "⚠️" },
        { type: "danger", label: "警告", icon: "❗" },
    ];

    const renderCallout = (type: string, defaultTitle: string, icon: string) => (tokens, idx) => {
        const token = tokens[idx];
        if (token.nesting === 1) {
            const info = token.info.trim().slice(type.length).trim();
            const title = info || defaultTitle;
            const escaped = markdownParser.utils.escapeHtml(title);
            return (
                `\n<section class="callout callout-${type}">` +
                `<div class="callout-title"><span class="callout-icon">${icon}</span><span>${escaped}</span></div>\n`
            );
        }
        return "</section>\n";
    };

    markdownParser
        .use(markdownItSpan) // 在标题标签中添加span
        .use(markdownItTableContainer) // 在表格外部添加容器
        .use(markdownItMath) // 数学公式
        .use(markdownItLinkfoot) // 修改脚注
        .use(markdownItTableOfContents, {
            transformLink: () => "",
            includeLevel: [2, 3],
            markerPattern: /^\[toc\]/im,
        }) // TOC仅支持二级和三级标题
        .use(markdownItRuby) // 注音符号
        .use(markdownItImplicitFigures, { figcaption: true }) // 图示
        .use(markdownItDeflist) // 定义列表
        .use(markdownItLiReplacer) // li 标签中加入 p 标签
        .use(markdownItImageFlow) // 横屏移动插件
        .use(markdownItMultiquote) // 给多级引用加 class
        .use(markdownItMark) // 高亮文本 ==text==
        .use(markdownItSub) // 下标 H~2~O
        .use(markdownItSup) // 上标 x^2^
        .use(markdownItEmoji); // Emoji :smile:

    calloutConfigs.forEach((config) => {
        markdownParser.use(markdownItContainer, config.type, {
            validate: (params: string) => params.trim().startsWith(config.type),
            render: renderCallout(config.type, config.label, config.icon),
        });
    });

    return markdownParser;
};
