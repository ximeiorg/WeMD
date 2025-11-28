import { useState, useEffect } from 'react';
import { useSettingsStore } from '../../store/settingsStore';
import type { ImageHostingType } from '../../store/settingsStore';
import './SettingsPanel.css';
import toast from 'react-hot-toast';

interface SettingsPanelProps {
    open: boolean;
    onClose: () => void;
}

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
    const { imageHostingType, githubConfig, localConfig, setImageHostingType, setGithubConfig, setLocalConfig } = useSettingsStore();

    const [hostingType, setHostingType] = useState<ImageHostingType>('local');
    const [token, setToken] = useState('');
    const [repo, setRepo] = useState('');
    const [branch, setBranch] = useState('');
    const [useJsDelivr, setUseJsDelivr] = useState(true);
    const [serverUrl, setServerUrl] = useState('');

    useEffect(() => {
        if (open) {
            setHostingType(imageHostingType);
            setToken(githubConfig.token);
            setRepo(githubConfig.repo);
            setBranch(githubConfig.branch);
            setUseJsDelivr(githubConfig.useJsDelivr);
            setServerUrl(localConfig.serverUrl);
        }
    }, [open, imageHostingType, githubConfig, localConfig]);

    if (!open) return null;

    const handleSave = () => {
        setImageHostingType(hostingType);

        if (hostingType === 'github') {
            setGithubConfig({
                token: token.trim(),
                repo: repo.trim(),
                branch: branch.trim() || 'main',
                useJsDelivr,
            });
        } else {
            setLocalConfig({
                serverUrl: serverUrl.trim() || 'http://localhost:4000',
            });
        }

        toast.success('设置已保存');
        onClose();
    };

    return (
        <div className="settings-overlay" onClick={onClose}>
            <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
                <div className="settings-header">
                    <h3>设置</h3>
                    <button className="close-btn" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="settings-body">
                    <div className="settings-section">
                        <h4>图床配置</h4>
                        <p className="settings-desc">选择图片存储方式，支持本地服务器或 GitHub 仓库。</p>

                        <div className="form-group">
                            <label>图床类型</label>
                            <select
                                value={hostingType}
                                onChange={(e) => setHostingType(e.target.value as ImageHostingType)}
                                className="hosting-type-select"
                            >
                                <option value="local">本地服务器 / COS (推荐)</option>
                                <option value="github">GitHub 仓库</option>
                            </select>
                        </div>

                        {hostingType === 'local' && (
                            <>
                                <div className="form-group">
                                    <label>服务器地址</label>
                                    <input
                                        value={serverUrl}
                                        onChange={(e) => setServerUrl(e.target.value)}
                                        placeholder="http://localhost:4000"
                                    />
                                    <p className="field-hint">本地开发使用 localhost，生产环境填写实际域名。后端可配置连接 COS。</p>
                                </div>
                            </>
                        )}

                        {hostingType === 'github' && (
                            <>
                                <div className="form-group">
                                    <label>GitHub Token</label>
                                    <input
                                        type="password"
                                        value={token}
                                        onChange={(e) => setToken(e.target.value)}
                                        placeholder="ghp_xxxxxxxxxxxx"
                                    />
                                    <p className="field-hint">需要 repo 权限的 Personal Access Token</p>
                                </div>

                                <div className="form-group">
                                    <label>仓库名称 (username/repo)</label>
                                    <input
                                        value={repo}
                                        onChange={(e) => setRepo(e.target.value)}
                                        placeholder="username/repo"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>分支 (Branch)</label>
                                    <input
                                        value={branch}
                                        onChange={(e) => setBranch(e.target.value)}
                                        placeholder="main"
                                    />
                                </div>

                                <div className="form-group checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={useJsDelivr}
                                            onChange={(e) => setUseJsDelivr(e.target.checked)}
                                        />
                                        使用 jsDelivr CDN 加速
                                    </label>
                                    <p className="field-hint">推荐开启，可显著提高国内访问速度</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="settings-footer">
                    <button className="btn-secondary" onClick={onClose}>取消</button>
                    <button className="btn-primary" onClick={handleSave}>保存</button>
                </div>
            </div>
        </div>
    );
}
