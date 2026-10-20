import * as z from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/[0-9]/, "Must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Must contain at least one special character");

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(3, "Full name must be at least 3 characters")
      .max(100, "Full name cannot exceed 100 characters")
      .trim(),
    nationalId: z
      .string()
      .min(6, "National/Alien ID must be at least 6 characters")
      .max(20, "National/Alien ID is too long")
      .regex(
        /^[A-Za-z0-9-]+$/,
        "ID must contain only alphanumeric characters and hyphens",
      )
      .trim(),
    email: z.email({ error: "Invalid email address" }),
    phoneNumber: z
      .string()
      .min(9, "Phone number must be at least 9 digits")
      .max(15, "Phone number is too long")
      .regex(
        /^\+?[0-9\s-]+$/,
        "Please enter a valid phone number format (e.g. +254712345678)",
      ),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }

    if (data.password.includes(data.email)) {
      ctx.addIssue({
        code: "custom",
        message: "Password cannot contain your email",
        path: ["password"],
      });
    }
  });

export type RegisterInput = z.infer<typeof registerSchema>;
