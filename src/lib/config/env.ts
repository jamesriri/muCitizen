import { z } from 'zod';

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL: z.url().min(1, "Database URL is required"),
    NEXTAUTH_SECRET: z.string().min(32, "NEXTAUTH_SECRET is required and should have at least 32 characters").default('defaultsecretkeydefaultsecretkeydefaultsecretkey'),
    NEXT_PUBLIC_APP_URL: z.url().min(1, "NEXT_PUBLIC_APP_URL is required"),
});

const parseEnv = () => {
    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
        console.error('Invalid enviroment variables:', JSON.stringify(parsed.error.format(), null, 2));
        throw new Error('Invalid environment variables. Please check the logs for details.');
    }

    return parsed.data;
};

export const env = parseEnv();
