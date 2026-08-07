import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { getJwtSecret } from "../../shared/config";
import { UserRole } from "../domain/user";

const jwtSecret = getJwtSecret();

export const isAuthenticated = (
	req: Request,
	res: Response,
	next: NextFunction,
): void | Response => {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).json({ message: "No token provided" });
	}

	const token = authHeader.split(" ")[1];

	try {
		const decoded = jwt.verify(token, jwtSecret);
		(req as any).user = decoded;
		next();
	} catch (_error) {
		return res.status(401).json({ message: "Invalid or expired token" });
	}
};

export const hasRole = (
	roles: UserRole[],
): ((req: Request, res: Response, next: NextFunction) => void | Response) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const user = (req as any).user;
		if (!user || !roles.includes(user.role)) {
			return res.status(403).json({ message: "Unauthorized role" });
		}
		next();
	};
};
