import { ForgotPasswordForm } from "@/components/forms/auth";
import AuthRecoveryLayout from "@/components/forms/auth/AuthRecoveryLayout";

export const metadata = {
  title: "Forgot Password | muCitizen",
  description: "Recover access to your verified Murang'a County services account.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthRecoveryLayout>
      <ForgotPasswordForm />
    </AuthRecoveryLayout>
  );
}
