import type { ImageUploader } from '../ImageUploader';

interface OfficialConfig {
    serverUrl?: string;
}

/**
 * 官方图床（通过后端上传到腾讯云 COS）
 */
export class OfficialUploader implements ImageUploader {
    name = '官方图床';
    private serverUrl: string;

    constructor(config?: OfficialConfig) {
        this.serverUrl = config?.serverUrl || 'http://localhost:4000';
    }

    configure(config: OfficialConfig) {
        if (config.serverUrl) {
            this.serverUrl = config.serverUrl;
        }
    }

    async upload(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${this.serverUrl}/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`上传失败: ${response.statusText}`);
        }

        const data = await response.json();
        return data.url;
    }
}
