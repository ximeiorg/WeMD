import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { Search, Plus, Trash2, MoreHorizontal, Edit2, Copy } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { useHistoryStore } from '../../store/historyStore';
import type { HistorySnapshot } from '../../store/historyStore';
import './HistoryPanel.css';

export function HistoryPanel() {
  const history = useHistoryStore((state) => state.history);
  const loading = useHistoryStore((state) => state.loading);
  const filter = useHistoryStore((state) => state.filter);
  const setFilter = useHistoryStore((state) => state.setFilter);
  const deleteEntry = useHistoryStore((state) => state.deleteEntry);
  const clearHistory = useHistoryStore((state) => state.clearHistory);
  const saveSnapshot = useHistoryStore((state) => state.saveSnapshot);
  const updateTitle = useHistoryStore((state) => state.updateTitle);
  const persistActive = useHistoryStore((state) => state.persistActiveSnapshot);
  const activeId = useHistoryStore((state) => state.activeId);
  const setActiveId = useHistoryStore((state) => state.setActiveId);
  const loadHistory = useHistoryStore((state) => state.loadHistory);

  const setMarkdown = useEditorStore((state) => state.setMarkdown);
  const setTheme = useEditorStore((state) => state.setTheme);
  const setCustomCSS = useEditorStore((state) => state.setCustomCSS);
  const themeName = useEditorStore((state) => state.themeName);
  const resetDocument = useEditorStore((state) => state.resetDocument);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState<string>('未命名文章');
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [menuEntry, setMenuEntry] = useState<HistorySnapshot | null>(null);

  const handleRestore = async (entry?: HistorySnapshot) => {
    if (!entry) return;
    const editorState = useEditorStore.getState();
    await persistActive({
      markdown: editorState.markdown,
      theme: editorState.theme,
      customCSS: editorState.customCSS,
      themeName,
    });
    setMarkdown(entry.markdown);
    setTheme(entry.theme);
    setCustomCSS(entry.customCSS);
    setActiveId(entry.id);
    setRenamingId(null);
    setActionMenuId(null);
  };

  const handleDelete = async (id: string) => {
    await deleteEntry(id);
    if (renamingId === id) {
      setRenamingId(null);
    }
    if (activeId === id) {
      const { history: updatedHistory, activeId: nextActive } = useHistoryStore.getState();
      if (nextActive) {
        const nextEntry = updatedHistory.find((item) => item.id === nextActive);
        if (nextEntry) {
          setMarkdown(nextEntry.markdown);
          setTheme(nextEntry.theme);
          setCustomCSS(nextEntry.customCSS);
        }
      } else {
        resetDocument();
      }
    }
  };

  const handleCreateArticle = async () => {
    const initial = '# 新文章\n\n';
    const editorState = useEditorStore.getState();
    await persistActive({
      markdown: editorState.markdown,
      theme: editorState.theme,
      customCSS: editorState.customCSS,
      themeName,
    });
    resetDocument({ markdown: initial, theme: 'default', customCSS: '', themeName });
    const newEntry = await saveSnapshot(
      { markdown: initial, theme: 'default', customCSS: '', title: '新文章', themeName },
      { force: true },
    );
    if (newEntry) {
      setActiveId(newEntry.id);
    }
    toast.success('已创建新文章');
  };

  const startRename = (entry: HistorySnapshot) => {
    setRenamingId(entry.id);
    setTempTitle(entry.title || '未命名文章');
    setActionMenuId(null);
    setMenuEntry(null);
  };

  const confirmRename = async (entry: HistorySnapshot) => {
    await updateTitle(entry.id, tempTitle);
    toast.success('标题已更新');
    setRenamingId(null);
  };

  const copyTitle = async (entry: HistorySnapshot) => {
    try {
      await navigator.clipboard.writeText(entry.title || '未命名文章');
      toast.success('标题已复制');
    } catch (error) {
      console.error(error);
      toast.error('复制失败');
    }
  };

  const handleMenuToggle = (event: React.MouseEvent, entry: HistorySnapshot) => {
    event.stopPropagation();
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    const width = 180;
    const padding = 12;
    const maxLeft = window.innerWidth - width - padding;
    const minLeft = padding;
    const desiredLeft = rect.right - width;
    const left = Math.max(minLeft, Math.min(maxLeft, desiredLeft));
    const top = rect.bottom + 8;

    if (actionMenuId === entry.id) {
      setActionMenuId(null);
      setMenuEntry(null);
      return;
    }

    setActionMenuId(entry.id);
    setMenuEntry(entry);
    setMenuPosition({ top, left });
  };

  const closeActionMenu = () => {
    setActionMenuId(null);
    setMenuEntry(null);
  };

  useEffect(() => {
    const handleWindowClick = () => closeActionMenu();
    const handleWindowScroll = () => closeActionMenu();
    window.addEventListener('click', handleWindowClick);
    window.addEventListener('scroll', handleWindowScroll, true);
    return () => {
      window.removeEventListener('click', handleWindowClick);
      window.removeEventListener('scroll', handleWindowScroll, true);
    };
  }, []);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const sidebarClass = 'history-sidebar';
  const keyword = filter.trim().toLowerCase();
  const filteredHistory = useMemo(() => {
    if (!keyword) return history;
    return history.filter((entry) =>
      (entry.title || '未命名文章').toLowerCase().includes(keyword),
    );
  }, [history, keyword]);

  const hasEntries = filteredHistory.length > 0;

  return (
    <>
      <aside className={sidebarClass}>
        <div className="history-header">
          <h3>历史记录</h3>
          <div className="history-actions">
            <button className="btn-secondary btn-icon-only" onClick={handleCreateArticle} title="新增文章">
              <Plus size={16} />
            </button>
            <button
              className="btn-secondary btn-icon-only"
              onClick={async () => {
                if (confirm('确定要清空所有历史记录吗？')) {
                  await clearHistory();
                  resetDocument();
                }
              }}
              title="清空历史"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        <div className="history-search">
          <div className="search-wrapper">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="搜索..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>
        {loading ? (
          <div className="history-empty">正在加载...</div>
        ) : !hasEntries ? (
          <div className="history-empty">
            {filter ? '无匹配结果' : '暂无记录'}
          </div>
        ) : (
          <div className="history-body">
            <div className="history-list">
              {filteredHistory.map((entry) => (
                <div
                  key={entry.id}
                  className={`history-item ${activeId === entry.id ? 'active' : ''}`}
                  onClick={() => handleRestore(entry)}
                >
                  <div className="history-item-main">
                    <div className="history-title-block">
                      <span className="history-time">{new Date(entry.savedAt).toLocaleString()}</span>
                      {renamingId === entry.id ? (
                        <div className="history-rename" onClick={(e) => e.stopPropagation()}>
                          <input
                            value={tempTitle}
                            onChange={(e) => setTempTitle(e.target.value)}
                            autoFocus
                          />
                          <button onClick={() => confirmRename(entry)}>确认</button>
                          <button onClick={() => setRenamingId(null)}>取消</button>
                        </div>
                      ) : (
                        <span className="history-title">{entry.title || '未命名文章'}</span>
                      )}
                      <span className="history-theme">{entry.themeName || '未命名主题'}</span>
                    </div>
                    <div className="history-actions-menu-wrapper">
                      <button
                        className="history-action-trigger"
                        onClick={(e) => handleMenuToggle(e, entry)}
                        aria-label="操作菜单"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>
      {actionMenuId && menuEntry &&
        createPortal(
          <div
            className="history-action-menu"
            style={{ top: menuPosition.top, left: menuPosition.left }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => { copyTitle(menuEntry); closeActionMenu(); }}>
              <Copy size={14} />
              复制标题
            </button>
            <button onClick={() => { startRename(menuEntry); closeActionMenu(); }}>
              <Edit2 size={14} />
              重命名
            </button>
            <button className="danger" onClick={() => { handleDelete(menuEntry.id); closeActionMenu(); }}>
              <Trash2 size={14} />
              删除
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
