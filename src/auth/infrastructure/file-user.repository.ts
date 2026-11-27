import fs from "fs/promises";
import path from "path";

import { User } from "../domain/user";
import { UserRepository } from "../domain/user.repository";

export class FileUserRepository implements UserRepository {
	private readonly filePath = path.join(process.cwd(), "data", "users.json");

	private async ensureFile(): Promise<void> {
		try {
			await fs.access(this.filePath);
		} catch {
			await fs.mkdir(path.dirname(this.filePath), { recursive: true });
			await fs.writeFile(this.filePath, JSON.stringify([]));
		}
	}

	async save(user: User): Promise<void> {
		await this.ensureFile();
		const users = await this.getAll();
		users.push(user);
		await fs.writeFile(this.filePath, JSON.stringify(users, null, 2));
	}

	async findByEmail(email: string): Promise<User | null> {
		const users = await this.getAll();

		return users.find((u) => u.email === email) ?? null;
	}

	async findById(id: string): Promise<User | null> {
		const users = await this.getAll();

		return users.find((u) => u.id === id) ?? null;
	}

	async findByResetToken(token: string): Promise<User | null> {
		const users = await this.getAll();

		return users.find((u) => u.resetToken === token) ?? null;
	}

	async findByVerificationToken(token: string): Promise<User | null> {
		const users = await this.getAll();

		return users.find((u) => u.verificationToken === token) ?? null;
	}

	async getAll(): Promise<User[]> {
		await this.ensureFile();
		const data = await fs.readFile(this.filePath, "utf-8");

		return JSON.parse(data);
	}

	async update(user: User): Promise<void> {
		const users = await this.getAll();
		const index = users.findIndex((u) => u.id === user.id);
		if (index !== -1) {
			users[index] = user;
			await fs.writeFile(this.filePath, JSON.stringify(users, null, 2));
		}
	}
}
