import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";

import {
	passwordChangedEmail,
	resetPasswordEmail,
	verifyEmail,
	welcomeEmail,
} from "../../emails/templates";
import { RefereeUseCases } from "../../referees/application/referee.use-cases";
import { getFrontendUrl, getJwtSecret } from "../../shared/config";
import { EmailService } from "../../shared/domain/email.service";
import { User, UserRole } from "../domain/user";
import { UserRepository } from "../domain/user.repository";

interface LoginResponse {
	token: string;
	user: Omit<User, "passwordHash">;
}

type EmailLocale = "en" | "es";

function normalizeLocale(locale?: string): EmailLocale {
	return locale === "en" ? "en" : "es";
}

export class AuthUseCases {
	private readonly jwtSecret = getJwtSecret();

	constructor(
		private readonly userRepository: UserRepository,
		private readonly emailService?: EmailService | null,
		private readonly refereeUseCases?: RefereeUseCases,
	) {}

	async register(userData: {
		email: string;
		password: string;
		firstName: string;
		lastName: string;
		role?: UserRole;
		locale?: string;
	}): Promise<Omit<User, "passwordHash">> {
		const existingUser = await this.userRepository.findByEmail(userData.email);
		if (existingUser) {
			throw new Error("User already exists");
		}

		const passwordHash = await bcrypt.hash(userData.password, 10);
		const verificationToken = uuid();

		const newUser: User = {
			id: uuid(),
			email: userData.email,
			passwordHash,
			firstName: userData.firstName,
			lastName: userData.lastName,
			role: userData.role ?? UserRole.PLAYER,
			plan: "free",
			ownedTournaments: [],
			verificationToken,
			emailVerified: false,
		};

		if (newUser.role === UserRole.REFEREE && this.refereeUseCases) {
			await this.refereeUseCases.createReferee(
				`${newUser.firstName} ${newUser.lastName}`,
				[],
				newUser.id,
				newUser.role,
				newUser.id,
			);
		}

		await this.userRepository.save(newUser);

		if (this.emailService) {
			const frontendUrl = getFrontendUrl();
			const locale = normalizeLocale(userData.locale);

			try {
				const welcome = welcomeEmail({
					name: newUser.firstName,
					actionUrl: `${frontendUrl}/login`,
					locale,
				});
				await this.emailService.send({
					to: newUser.email,
					subject: welcome.subject,
					html: welcome.html,
					locale,
				});

				const verification = verifyEmail({
					name: newUser.firstName,
					actionUrl: `${frontendUrl}/verify-email?token=${verificationToken}`,
					locale,
				});
				await this.emailService.send({
					to: newUser.email,
					subject: verification.subject,
					html: verification.html,
					locale,
				});
			} catch {
				// Email sending should not block registration
			}
		}

		const { passwordHash: _, ...userWithoutPassword } = newUser;

		return userWithoutPassword;
	}

	async login(email: string, password: string): Promise<LoginResponse> {
		const user = await this.userRepository.findByEmail(email);
		if (!user) {
			throw new Error("Invalid credentials");
		}

		const isMatch = await bcrypt.compare(password, user.passwordHash);
		if (!isMatch) {
			throw new Error("Invalid credentials");
		}

		const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, this.jwtSecret, {
			expiresIn: "1d",
		});

		const { passwordHash: _, ...userWithoutPassword } = user;

		return {
			token,
			user: userWithoutPassword,
		};
	}

	async getMe(id: string): Promise<Omit<User, "passwordHash">> {
		const user = await this.userRepository.findById(id);
		if (!user) {
			throw new Error("User not found");
		}
		const { passwordHash: _, ...userWithoutPassword } = user;

		return userWithoutPassword;
	}

	async updateProfile(
		userId: string,
		data: {
			firstName?: string;
			lastName?: string;
			currentPassword?: string;
			newPassword?: string;
			locale?: string;
		},
	): Promise<Omit<User, "passwordHash">> {
		const user = await this.userRepository.findById(userId);
		if (!user) {
			throw new Error("User not found");
		}

		if (data.firstName !== undefined) {
			user.firstName = data.firstName;
		}
		if (data.lastName !== undefined) {
			user.lastName = data.lastName;
		}

		const passwordChanged = !!data.newPassword;

		if (data.newPassword) {
			if (!data.currentPassword) {
				throw new Error("Current password is required");
			}
			const isMatch = await bcrypt.compare(data.currentPassword, user.passwordHash);
			if (!isMatch) {
				throw new Error("Current password is incorrect");
			}
			user.passwordHash = await bcrypt.hash(data.newPassword, 10);
		}

		await this.userRepository.update(user);

		if (passwordChanged && this.emailService) {
			const locale = normalizeLocale(data.locale);
			try {
				const email = passwordChangedEmail({
					name: user.firstName,
					locale,
				});
				await this.emailService.send({
					to: user.email,
					subject: email.subject,
					html: email.html,
					locale,
				});
			} catch {
				// Email sending should not block profile update
			}
		}

		const { passwordHash: _, ...userWithoutPassword } = user;

		return userWithoutPassword;
	}

	async forgotPassword(email: string, locale?: string): Promise<void> {
		const user = await this.userRepository.findByEmail(email);
		if (!user) {
			// Silently return to avoid email enumeration
			return;
		}

		const resetToken = uuid();
		const resetTokenExpiry = Date.now() + 3600000; // 1 hour

		user.resetToken = resetToken;
		user.resetTokenExpiry = resetTokenExpiry;
		await this.userRepository.update(user);

		if (this.emailService) {
			const frontendUrl = getFrontendUrl();
			const emailLocale = normalizeLocale(locale);
			try {
				const reset = resetPasswordEmail({
					name: user.firstName,
					actionUrl: `${frontendUrl}/reset-password?token=${resetToken}`,
					locale: emailLocale,
				});
				await this.emailService.send({
					to: user.email,
					subject: reset.subject,
					html: reset.html,
					locale: emailLocale,
				});
			} catch {
				// Email sending should not block the flow
			}
		}
	}

	async resetPassword(token: string, newPassword: string): Promise<void> {
		const user = await this.userRepository.findByResetToken(token);

		if (!user || !user.resetTokenExpiry || user.resetTokenExpiry <= Date.now()) {
			throw new Error("Invalid or expired token");
		}

		user.passwordHash = await bcrypt.hash(newPassword, 10);
		user.resetToken = undefined;
		user.resetTokenExpiry = undefined;
		await this.userRepository.update(user);
	}

	async verifyEmail(token: string): Promise<void> {
		const user = await this.userRepository.findByVerificationToken(token);

		if (!user) {
			throw new Error("Invalid verification token");
		}

		user.emailVerified = true;
		user.verificationToken = undefined;
		await this.userRepository.update(user);
	}
}
