import { useRef, useState } from 'react';
import {
    Bold, Italic, Strikethrough,
    Heading1, Heading2, Heading3,
    List, ListOrdered, Quote, Code,
    Link, Image, Minus, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ImageHostManager } from '../../services/image/ImageUploader';
import type { ImageHostConfig } from '../../services/image/ImageUploader';
import './Toolbar.css';

interface ToolbarProps {
    onInsert: (prefix: string, suffix: string, placeholder: string) => void;
}

export function Toolbar({ onInsert }: ToolbarProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const tools = [
        { icon: Bold, label: "粗体", prefix: "**", suffix: "**", placeholder: "粗体文字" },
        { icon: Italic, label: "斜体", prefix: "*", suffix: "*", placeholder: "斜体文字" },
        { icon: Strikethrough, label: "删除线", prefix: "~~", suffix: "~~", placeholder: "删除文字" },
        { icon: Heading1, label: "一级标题", prefix: "# ", suffix: "", placeholder: "标题" },
        { icon: Heading2, label: "二级标题", prefix: "## ", suffix: "", placeholder: "标题" },
        { icon: Heading3, label: "三级标题", prefix: "### ", suffix: "", placeholder: "标题" },
        { icon: List, label: "无序列表", prefix: "- ", suffix: "", placeholder: "列表项" },
        { icon: ListOrdered, label: "有序列表", prefix: "1. ", suffix: "", placeholder: "列表项" },
        { icon: Quote, label: "引用", prefix: "> ", suffix: "", placeholder: "引用文字" },
        { icon: Code, label: "代码块", prefix: "```\n", suffix: "\n```", placeholder: "代码" },
        { icon: Link, label: "链接", prefix: "[", suffix: "](url)", placeholder: "链接文字" },
        { icon: Minus, label: "分割线", prefix: "\n---\n", suffix: "", placeholder: "" },
    ];

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 验证文件类型
        if (!file.type.startsWith('image/')) {
            toast.error('请选择图片文件');
            return;
        }

        // 验证文件大小（最大 10MB）
        if (file.size > 10 * 1024 * 1024) {
            toast.error('图片大小不能超过 10MB');
            return;
        }

        setUploading(true);
        try {
            // 获取图床配置
            const configStr = localStorage.getItem('imageHostConfig');
            const config: ImageHostConfig = configStr
                ? JSON.parse(configStr)
                : { type: 'official' };

            // 上传图片
            const manager = new ImageHostManager(config);
            const url = await manager.upload(file);

            // 插入 Markdown
            onInsert('![', `](${url})`, file.name.replace(/\.[^/.]+$/, ''));
            toast.success('图片上传成功');
        } catch (error) {
            console.error('图片上传失败:', error);
            toast.error(error instanceof Error ? error.message : '图片上传失败');
        } finally {
            setUploading(false);
            // 清空 input，允许重复上传同一文件
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="md-toolbar">
            {tools.map((tool, index) => (
                <button
                    key={index}
                    className="md-toolbar-btn"
                    onClick={() => onInsert(tool.prefix, tool.suffix, tool.placeholder)}
                    title={tool.label}
                >
                    <tool.icon size={16} />
                </button>
            ))}

            {/* 图片上传按钮 */}
            <button
                className="md-toolbar-btn"
                onClick={handleImageClick}
                disabled={uploading}
                title="上传图片"
            >
                {uploading ? <Loader2 size={16} className="spinning" /> : <Image size={16} />}
            </button>

            {/* 隐藏的文件输入 */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />
        </div>
    );
}
