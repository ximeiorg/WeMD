// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./types/markdown-it-plugins.d.ts" />
import MarkdownIt from "markdown-it";
import markdownItDeflist from "markdown-it-deflist";
import markdownItImplicitFigures from "markdown-it-implicit-figures";
import markdownItTableOfContents from "markdown-it-table-of-contents";
import markdownItRuby from "markdown-it-ruby";
import markdownItMark from "markdown-it-mark";

import markdownItSub from "markdown-it-sub";
import markdownItSup from "markdown-it-sup";
import { full as markdownItEmoji } from "markdown-it-emoji";

// Local plugins

import markdownItMath from "./plugins/markdown-it-math";

import markdownItSpan from "./plugins/markdown-it-span";

import markdownItTableContainer from "./plugins/markdown-it-table-container";

import markdownItLinkfoot from "./plugins/markdown-it-linkfoot";

import markdownItImageFlow from "./plugins/markdown-it-imageflow";

import markdownItMultiquote from "./plugins/markdown-it-multiquote";

import markdownItLiReplacer from "./plugins/markdown-it-li";

import markdownItGitHubAlert from "./plugins/markdown-it-github-alert";

import highlightjs from "./utils/langHighlight";

export const createMarkdownParser = () => {
  const markdownParser: MarkdownIt = new MarkdownIt({
    html: true,
    highlight: (str: string, lang: string): string => {
      if (lang === undefined || lang === "") {
        lang = "bash";
      }
      // 加上custom则表示自定义样式，而非微信专属，避免被remove pre
      if (lang && highlightjs.getLanguage(lang)) {
        try {
          const formatted = highlightjs.highlight(lang, str, true).value;
          return (
            '<pre class="custom"><code class="hljs">' +
            formatted +
            "</code></pre>"
          );
        } catch {
          // Ignore highlight errors
        }
      }
      return (
        '<pre class="custom"><code class="hljs">' +
        markdownParser.utils.escapeHtml(str) +
        "</code></pre>"
      );
    },
  });

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
    .use(markdownItEmoji) // Emoji :smile:
    .use(markdownItGitHubAlert); // GitHub 风格 Alert 语法

  return markdownParser;
};
