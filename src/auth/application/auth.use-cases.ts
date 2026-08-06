import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { User, UserRole, UserPlan } from "../domain/user";
import { UserRepository } from "../domain/user.repository";
import { RefereeUseCases } from "../../referees/application/referee.use-cases";
import { getJwtSecret } from "../../shared/config";

interface LoginResponse {
    token: string;
    user: Omit<User, "passwordHash">;
}

export class AuthUseCases {
    private readonly jwtSecret = getJwtSecret();

    constructor(
        private readonly userRepository: UserRepository,
        private readonly refereeUseCases?: RefereeUseCases
    ) { }

    async register(userData: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        role?: UserRole;
    }): Promise<Omit<User, "passwordHash">> {
        const existingUser = await this.userRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new Error("User already exists");
        }

        const passwordHash = await bcrypt.hash(userData.password, 10);

        const newUser: User = {
            id: uuid(),
            email: userData.email,
            passwordHash,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role || UserRole.PLAYER,
            plan: 'free',
            ownedTournaments: []
        };

        if (newUser.role === UserRole.REFEREE && this.refereeUseCases) {
            await this.refereeUseCases.createReferee(
                `${newUser.firstName} ${newUser.lastName}`,
                [], // No tournaments assigned initially
                newUser.id, // Requester is the user themselves
                newUser.role,
                newUser.id // Link to the user
            );
        }

        await this.userRepository.save(newUser);

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

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            this.jwtSecret,
            { expiresIn: "1d" }
        );

        const { passwordHash: _, ...userWithoutPassword } = user;

        return {
            token,
            user: userWithoutPassword
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
}
