// Custom WeChat-themed markdown highlighting
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

export const wechatMarkdownHighlighting = syntaxHighlighting(
    HighlightStyle.define([
        // Headers - different shades of dark for hierarchy
        { tag: t.heading1, fontWeight: '700', fontSize: '1.8em', color: '#0f172a' },
        { tag: t.heading2, fontWeight: '700', fontSize: '1.5em', color: '#1e293b' },
        { tag: t.heading3, fontWeight: '600', fontSize: '1.3em', color: '#334155' },
        { tag: t.heading4, fontWeight: '600', fontSize: '1.1em', color: '#475467' },
        { tag: t.heading5, fontWeight: '600', color: '#64748b' },
        { tag: t.heading6, fontWeight: '600', color: '#64748b' },

        // Emphasis
        { tag: t.emphasis, fontStyle: 'italic', color: '#64748b' },
        { tag: t.strong, fontWeight: '700', color: '#0f172a' },
        { tag: t.strikethrough, textDecoration: 'line-through', color: '#94a3b8' },

        // Links - WeChat green
        { tag: t.link, color: '#07c160', textDecoration: 'underline' },
        { tag: t.url, color: '#07c160' },

        // Code
        { tag: t.monospace, fontFamily: 'var(--font-mono)', backgroundColor: '#f1f5f9', padding: '2px 4px', borderRadius: '3px', color: '#e11d48' },
        { tag: t.meta, color: '#94a3b8' },

        // Lists
        { tag: t.list, color: '#07c160' },

        // Quotes
        { tag: t.quote, color: '#64748b', fontStyle: 'italic' },

        // Special
        { tag: t.keyword, color: '#07c160', fontWeight: '600' },
        { tag: t.atom, color: '#059669' },
        { tag: t.contentSeparator, color: '#e2e8f0', fontWeight: '700' },
    ])
);
