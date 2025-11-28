import { useState, useEffect, useRef } from 'react';
import { useEditorStore } from '../../store/editorStore';
import './SearchPanel.css';

interface SearchResult {
    text: string;
    line: number;
    column: number;
    context: string;
}

interface SearchPanelProps {
    open: boolean;
    onClose: () => void;
}

export function SearchPanel({ open, onClose }: SearchPanelProps) {
    if (!open) return null;

    const { markdown, setMarkdown } = useEditorStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [currentResultIndex, setCurrentResultIndex] = useState(0);
    const [caseSensitive, setCaseSensitive] = useState(false);
    const [useRegex, setUseRegex] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [open]);

    useEffect(() => {
        performSearch();
    }, [searchTerm, caseSensitive, useRegex, markdown]);

    const performSearch = () => {
        if (!searchTerm.trim()) {
            setResults([]);
            setCurrentResultIndex(0);
            return;
        }

        const lines = markdown.split('\n');
        const searchResults: SearchResult[] = [];

        lines.forEach((line, lineIndex) => {
            if (!line.trim()) return;

            const searchPattern = useRegex
                ? new RegExp(searchTerm, caseSensitive ? 'g' : 'gi')
                : searchTerm;

            let match;
            if (useRegex) {
                const regex = new RegExp(searchTerm, caseSensitive ? 'g' : 'gi');
                while ((match = regex.exec(line)) !== null) {
                    const start = Math.max(0, match.index - 30);
                    const end = Math.min(line.length, match.index + match[0].length + 30);
                    const context = line.substring(start, end);

                    searchResults.push({
                        text: match[0],
                        line: lineIndex + 1,
                        column: match.index + 1,
                        context: context
                    });
                }
            } else {
                const searchContent = caseSensitive ? line : line.toLowerCase();
                const searchTarget = caseSensitive ? searchTerm : searchTerm.toLowerCase();
                const index = searchContent.indexOf(searchTarget);

                if (index !== -1) {
                    const start = Math.max(0, index - 30);
                    const end = Math.min(line.length, index + searchTerm.length + 30);
                    const context = line.substring(start, end);

                    searchResults.push({
                        text: searchTerm,
                        line: lineIndex + 1,
                        column: index + 1,
                        context: context
                    });
                }
            }
        });

        setResults(searchResults);
        setCurrentResultIndex(0);
    };

    const highlightSearchResults = () => {
        if (results.length === 0) return;

        const lines = markdown.split('\n');
        const result = results[currentResultIndex];

        // 高亮当前结果
        if (result) {
            const { line, column, text } = result;
            const lineIndex = line - 1;

            // 创建高亮标记
            const highlightedText = useRegex
                ? lines[lineIndex].replace(new RegExp(text, caseSensitive ? 'g' : 'gi'), '==SEARCH_HIGHLIGHT==$&==')
                : lines[lineIndex].replace(new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '==SEARCH_HIGHLIGHT==$&==');

            lines[lineIndex] = highlightedText;

            // 更新 markdown 内容，包含高亮标记
            setMarkdown(lines.join('\n'));

            // 滚动到结果位置
            setTimeout(() => {
                const highlightedElement = document.querySelector('search-highlight');
                if (highlightedElement) {
                    highlightedElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            }, 100);
        }
    };

    const navigateResult = (direction: 'next' | 'prev') => {
        if (results.length === 0) return;

        if (direction === 'next') {
            setCurrentResultIndex((prev) => (prev + 1) % results.length);
        } else {
            setCurrentResultIndex((prev) => (prev - 1 + results.length) % results.length);
        }
    };

    const goToResult = (index: number) => {
        setCurrentResultIndex(index);
    };

    const clearHighlights = () => {
        const lines = markdown.split('\n');
        const cleanLines = lines.map(line =>
            line.replace(/==SEARCH_HIGHLIGHT==\$&==/g, '')
        );
        setMarkdown(cleanLines.join('\n'));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            highlightSearchResults();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            navigateResult('next');
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            navigateResult('prev');
        } else if (e.key === 'Escape') {
            e.preventDefault();
            clearHighlights();
            onClose();
        }
    };

    return (
        <div className="search-overlay" onClick={onClose}>
            <div className="search-modal" onClick={(e) => e.stopPropagation()}>
                <div className="search-header">
                    <h3>文档搜索</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="search-body">
                    <div className="search-input-group">
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="搜索文档内容..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="search-input"
                        />
                        <div className="search-options">
                            <label className="checkbox-group">
                                <input
                                    type="checkbox"
                                    checked={caseSensitive}
                                    onChange={(e) => setCaseSensitive(e.target.checked)}
                                />
                                <span>区分大小写</span>
                            </label>
                            <label className="checkbox-group">
                                <input
                                    type="checkbox"
                                    checked={useRegex}
                                    onChange={(e) => setUseRegex(e.target.checked)}
                                />
                                <span>正则表达式</span>
                            </label>
                        </div>
                    </div>

                    {results.length > 0 && (
                        <div className="search-results">
                            <div className="results-header">
                                <span>找到 {results.length} 个结果</span>
                                {currentResultIndex + 1 <= results.length && (
                                    <span className="current-result">
                                        第 {currentResultIndex + 1} 个，共 {results.length} 个
                                    </span>
                                )}
                            </div>

                            <div className="results-list">
                                {results.map((result, index) => (
                                    <div
                                        key={index}
                                        className={`result-item ${index === currentResultIndex ? 'active' : ''}`}
                                        onClick={() => goToResult(index)}
                                    >
                                        <div className="result-info">
                                            <span className="result-line">第 {result.line} 行，第 {result.column} 列</span>
                                            <span className="result-text">"{result.text}"</span>
                                        </div>
                                        <div className="result-context">{result.context}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="search-actions">
                                <button
                                    onClick={() => navigateResult('prev')}
                                    disabled={currentResultIndex === 0}
                                    className="btn-secondary"
                                >
                                    ↑ 上一个
                                </button>
                                <button
                                    onClick={highlightSearchResults}
                                    className="btn-primary"
                                >
                                    定位到结果
                                </button>
                                <button
                                    onClick={() => navigateResult('next')}
                                    disabled={currentResultIndex === results.length - 1}
                                    className="btn-secondary"
                                >
                                    下一个 ↓
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}