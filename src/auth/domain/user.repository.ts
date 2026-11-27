import { User } from "./user";

export interface UserRepository {
	save(user: User): Promise<void>;
	findByEmail(email: string): Promise<User | null>;
	findById(id: string): Promise<User | null>;
	findByResetToken(token: string): Promise<User | null>;
	findByVerificationToken(token: string): Promise<User | null>;
	getAll(): Promise<User[]>;
	update(user: User): Promise<void>;
}
