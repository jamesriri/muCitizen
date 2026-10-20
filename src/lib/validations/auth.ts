import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Username or Email is required"),
  password: z.string().min(1, "Password is required"),
});

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/[0-9]/, "Must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Must contain at least one special character");

export const registerSchema = z
    .object({
        first_name: z
            .string()
            .min(3, "Full name must be at least 3 characters")
            .max(100, "Full name cannot exceed 100 characters")
            .trim(),
        last_name: z
            .string()
            .min(3, "Full name must be at least 3 characters")
            .max(100, "Full name cannot exceed 100 characters")
            .trim(),
        national_id: z
            .string()
            .min(6, "National/Alien ID must be at least 6 characters")
            .max(20, "National/Alien ID is too long")
            .regex(
                /^[A-Za-z0-9-]+$/,
                "ID must contain only alphanumeric characters and hyphens",
            )
            .trim(),
        email: z.email({ error: "Invalid email address" }),
        phone_number: z
            .string()
            .min(9, "Phone number must be at least 9 digits")
            .max(15, "Phone number is too long")
            .regex(
                /^\+?[0-9\s-]+$/,
                "Please enter a valid phone number format (e.g. +254712345678)",
            ),
        password: passwordSchema,
        confirm_password: z.string(),
        county: z.string().min(2, "County name is required").trim(),
        residence_address: z
            .string()
            .min(3, "Estate, Street or Landmark is required")
            .trim(),
    });

export const personalInfoSchema = registerSchema.pick({
    first_name: true,
    last_name: true,
    national_id: true,
    phone_number: true,
});

export const accountSchema = z.object({
    email: registerSchema.shape.email,
    password: registerSchema.shape.password,
    confirm_password: registerSchema.shape.confirm_password,
})
    .superRefine((data, ctx) => {
    if (data.password !== data.confirm_password) {
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

export const locationSchema = registerSchema.pick({
    county: true,
    residence_address: true,
});

export const forgotPasswordSchema = z.object({
  email: z.email("Please enter a valid email address"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Verification token is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const notificationPreferencesSchema = z.object({
  emailRequestUpdates: z.boolean(),
  smsRequestUpdates: z.boolean(),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type NotificationPreferencesInput = z.infer<
  typeof notificationPreferencesSchema
>;
