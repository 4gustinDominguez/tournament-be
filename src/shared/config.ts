const isProduction = process.env.NODE_ENV === "production";

export function getJwtSecret(): string {
	const secret = process.env.JWT_SECRET;
	if (secret) {
		return secret;
	}
	if (isProduction) {
		throw new Error("JWT_SECRET environment variable is required in production");
	}

	return "dev-secret-not-for-production";
}

export function getFrontendUrl(): string {
	return process.env.FRONTEND_URL ?? "http://localhost:3001";
}
