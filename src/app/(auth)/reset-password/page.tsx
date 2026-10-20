import { ResetPasswordForm } from "@/components/forms/auth";
import AuthRecoveryLayout from "@/components/forms/auth/AuthRecoveryLayout";
import { Suspense } from "react";

export const metadata = {
    title: "Reset Password | muCitizen",
    description: "Set a new password for your muCitizen account.",
};

interface ResetPasswordPageProps {
    searchParams: Promise<{ token?: string }>;
}

export default function ResetPasswordPage({
    searchParams,
}: ResetPasswordPageProps) {
    return (
        <AuthRecoveryLayout>
            <Suspense
                fallback={
                    <div className="rounded-2xl border border-border/70 bg-card p-8 text-center text-sm text-muted-foreground shadow-sm">
                        Preparing secure password reset…
                    </div>
                }
            >
                <ResetPasswordContent searchParams={searchParams} />
            </Suspense>
        </AuthRecoveryLayout>
    );
}

async function ResetPasswordContent({
    searchParams,
}: ResetPasswordPageProps) {
    const { token } = await searchParams;
    return <ResetPasswordForm token={token || null} />;
}
