export interface ImageUploadResult {
	url: string;
	publicId: string;
}

export interface ImageStoragePort {
	upload(file: Buffer, filename: string, folder?: string): Promise<ImageUploadResult>;
	delete(publicId: string): Promise<void>;
	getUrl(publicId: string, transformations?: Record<string, string | number>): string;
}
