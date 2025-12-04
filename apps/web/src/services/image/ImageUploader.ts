/**
 * 图床上传接口
 */
export interface ImageUploader {
    /** 图床名称 */
    name: string;

    /** 上传图片 */
    upload(file: File): Promise<string>;

    /** 配置图床（可选） */
    configure?(config: any): void;

    /** 验证配置（可选） */
    validate?(): Promise<boolean>;
}

/**
 * 图床配置
 */
export interface ImageHostConfig {
    type: 'official' | 'qiniu' | 'aliyun' | 'tencent';
    config?: any;
}

/**
 * 图床管理器
 */
export class ImageHostManager {
    private uploader: ImageUploader;

    constructor(config: ImageHostConfig) {
        this.uploader = this.createUploader(config);
    }

    private createUploader(config: ImageHostConfig): ImageUploader {
        switch (config.type) {
            case 'official':
                return new OfficialUploader(config.config);
            case 'qiniu':
                return new QiniuUploader(config.config);
            case 'aliyun':
                return new AliyunUploader(config.config);
            case 'tencent':
                return new TencentUploader(config.config);
            default:
                return new OfficialUploader(config.config);
        }
    }

    async upload(file: File): Promise<string> {
        return await this.uploader.upload(file);
    }

    async validate(): Promise<boolean> {
        if (this.uploader.validate) {
            return await this.uploader.validate();
        }
        return true;
    }
}

// 导入各个实现
import { OfficialUploader } from './uploaders/OfficialUploader';
import { QiniuUploader } from './uploaders/QiniuUploader';
import { AliyunUploader } from './uploaders/AliyunUploader';
import { TencentUploader } from './uploaders/TencentUploader';
