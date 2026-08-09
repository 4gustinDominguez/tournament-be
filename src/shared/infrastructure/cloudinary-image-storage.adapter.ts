import { UploadApiResponse, v2 as cloudinary } from "cloudinary";

import { ImageStoragePort, ImageUploadResult } from "../domain/image-storage.port";

export class CloudinaryImageStorageAdapter implements ImageStoragePort {
	constructor() {
		cloudinary.config({
			cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
			api_key: process.env.CLOUDINARY_API_KEY,
			api_secret: process.env.CLOUDINARY_API_SECRET,
		});
	}

	async upload(file: Buffer, filename: string, folder = "tournament"): Promise<ImageUploadResult> {
		const result = await new Promise<UploadApiResponse>((resolve, reject) => {
			cloudinary.uploader
				.upload_stream(
					{
						folder,
						public_id: filename,
						resource_type: "image",
					},
					(error, result) => {
						if (error) {
							reject(error);
						} else if (result) {
							resolve(result);
						}
					},
				)
				.end(file);
		});

		return {
			url: result.secure_url,
			publicId: result.public_id,
		};
	}

	async delete(publicId: string): Promise<void> {
		await cloudinary.uploader.destroy(publicId);
	}

	getUrl(publicId: string, transformations?: Record<string, string | number>): string {
		if (!transformations) {
			return cloudinary.url(publicId, { secure: true });
		}

		return cloudinary.url(publicId, { secure: true, transformation: [transformations] });
	}
}
