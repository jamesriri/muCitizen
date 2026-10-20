import * as bcrypt from "bcryptjs";
import { db } from "@/lib/db/prisma";
import { Role, UserSummary } from "@/types";
import { LoginInput, RegisterInput } from "../schemas";

export class AuthService {
  static async authenticateUser(credentials: LoginInput): Promise<UserSummary> {
    const user = await db.user.findUnique({
      where: { email: credentials.email },
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(
      credentials.password,
      user.passwordHash,
    );
      
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      nationalId: user.nationalId,
      role: user.role as Role,
    };
  }

  static async registerCitizen(input: RegisterInput): Promise<UserSummary> {
    const existingEmail = await db.user.findUnique({
      where: { email: input.email },
    });

    if (existingEmail) {
      throw new Error("An account with this email address already exists.");
    }

    const existingNationalId = await db.user.findUnique({
      where: { nationalId: input.nationalId },
    });

    if (existingNationalId) {
      throw new Error("An account with this National/Alien ID already exists.");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const newUser = await db.user.create({
      data: {
        fullName: input.fullName,
        email: input.email,
        nationalId: input.nationalId,
        phoneNumber: input.phoneNumber,
        passwordHash,
        role: "CITIZEN",
      },
    });

    return {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      phoneNumber: newUser.phoneNumber,
      nationalId: newUser.nationalId,
      role: newUser.role as Role,
    };
  }
}
