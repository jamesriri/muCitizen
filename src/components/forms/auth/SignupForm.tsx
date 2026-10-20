"use client";

import { useEffect, useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import * as z from "zod";
import {
    Building2,
    EyeIcon,
    EyeOffIcon,
    LockIcon,
    MailIcon,
    MapPin,
    PhoneIcon,
    UserIcon,
    ShieldCheck,
} from "lucide-react";

import {
    personalInfoSchema,
    accountSchema,
    locationSchema,
} from "@/lib/validations";
import { useAuthStore, useUIStore } from "@/store";
import { signupAction, type SignupInput } from "@/features/auth/actions";
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Field,
} from "@/components/ui";
import FormField from "../FormField";
import StepIndicator from "../StepIndicator";

type SignupFormValues = z.infer<typeof personalInfoSchema> &
    z.infer<typeof accountSchema> &
    z.infer<typeof locationSchema>;

const stepTitles = {
    1: {
        title: "Citizen Identification",
        description: "Provide your official legal name and national registration number.",
    },
    2: {
        title: "Secure Your Credentials",
        description: "Choose a protected password and verify your primary email.",
    },
    3: {
        title: "Jurisdiction & Location",
        description: "Enter your county and area so your report reaches the right team.",
    },
} as const;

const stepIndicatorSteps = [
    { title: "Identity", description: "Official citizen identity details." },
    { title: "Security", description: "Login credentials & passkey." },
    { title: "County & area", description: "County and where you live." },
];

export default function SignupForm() {
    const router = useRouter();
    const {
        step,
        draftRevision,
        setStep,
        signupData,
        updateSignupData,
        persistDraft,
        reset,
    } = useAuthStore();
    const { isPasswordVisible, togglePassword } = useUIStore();

    const schema = useMemo(() => {
        if (step === 1) return personalInfoSchema;
        if (step === 2) return accountSchema;
        return locationSchema;
    }, [step]);

    const form = useForm<SignupFormValues>({
        resolver: zodResolver(schema) as unknown as Resolver<SignupFormValues>,
        defaultValues: signupData as Partial<SignupFormValues>,
        mode: "onChange",
    });

    useEffect(() => {
        form.reset(
            useAuthStore.getState().signupData as Partial<SignupFormValues>,
        );
    }, [form, step, draftRevision]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/incompatible-library
        const subscription = form.watch((value) => {
            updateSignupData(value as Partial<SignupFormValues>);
        });
        return () => subscription.unsubscribe();
    }, [form, updateSignupData]);

    const onNext = (data: Partial<SignupFormValues>) => {
        const nextData = { ...signupData, ...data };
        updateSignupData(nextData);
        persistDraft(nextData, step + 1);
        setStep(step + 1);
    };

    const onFinalSubmit = async (data: Partial<SignupFormValues>) => {
        const finalData: SignupInput = {
            first_name: signupData.first_name ?? data.first_name ?? "",
            last_name: signupData.last_name ?? data.last_name ?? "",
            national_id: signupData.national_id ?? data.national_id ?? "",
            phone_number: signupData.phone_number ?? data.phone_number ?? "",
            email: signupData.email ?? data.email ?? "",
            password: signupData.password ?? data.password ?? "",
            confirm_password: signupData.confirm_password ?? data.confirm_password ?? "",
            county: signupData.county ?? data.county,
            residence_address: signupData.residence_address ?? data.residence_address,
        };

        const result = await signupAction(finalData);
        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Citizen account created successfully!");
            reset();
            router.push("/my-requests");
            router.refresh();
        }
    };

    const handleBack = () => {
        const prevStep = Math.max(1, step - 1);
        persistDraft({ ...signupData, ...form.getValues() }, prevStep);
        setStep(prevStep);
    };

    const currentStepConfig = stepTitles[step as keyof typeof stepTitles];

    return (
        <Card className="border-border/60 shadow-lg">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold tracking-tight">
                    {currentStepConfig.title}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                    {currentStepConfig.description}
                </CardDescription>
            </CardHeader>

            <CardContent>
                <div className="mb-6">
                    <StepIndicator currentStep={step} steps={stepIndicatorSteps} />
                </div>

                <form
                    onSubmit={form.handleSubmit((data) => {
                        if (step === 1 || step === 2) {
                            onNext(data);
                            return;
                        }
                        void onFinalSubmit(data);
                    })}
                    className="space-y-6"
                >
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div
                                key="step1"
                                initial={{ x: 10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -10, opacity: 0 }}
                                className="grid gap-3"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <FormField
                                        control={form.control}
                                        name="first_name"
                                        label="First Name"
                                        placeholder="Jane"
                                        autoComplete="given-name"
                                        icon={UserIcon}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="last_name"
                                        label="Last Name"
                                        placeholder="Wanjiku"
                                        autoComplete="family-name"
                                        icon={UserIcon}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="national_id"
                                    label="National / Alien ID Number"
                                    placeholder="10928374"
                                    icon={ShieldCheck}
                                />

                                <FormField
                                    control={form.control}
                                    name="phone_number"
                                    label="Phone Number"
                                    placeholder="+254712345678"
                                    autoComplete="tel"
                                    icon={PhoneIcon}
                                />
                            </motion.div>
                        ) : step === 2 ? (
                            <motion.div
                                key="step2"
                                initial={{ x: 10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -10, opacity: 0 }}
                                className="grid gap-3"
                            >
                                <FormField
                                    control={form.control}
                                    name="email"
                                    label="Email Address"
                                    placeholder="jane@example.com"
                                    autoComplete="email"
                                    icon={MailIcon}
                                />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    label="Account Password"
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    type={isPasswordVisible ? "text" : "password"}
                                    description="Must have 8+ characters, including 1 uppercase and 1 number."
                                    icon={LockIcon}
                                    rightContent={isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
                                    rightContentClassName="cursor-pointer"
                                    onRightContentClick={togglePassword}
                                />

                                <FormField
                                    control={form.control}
                                    name="confirm_password"
                                    label="Confirm Password"
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    type={isPasswordVisible ? "text" : "password"}
                                    icon={LockIcon}
                                    rightContent={isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
                                    rightContentClassName="cursor-pointer"
                                    onRightContentClick={togglePassword}
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="step3"
                                initial={{ x: 10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -10, opacity: 0 }}
                                className="grid gap-3"
                            >
                                <FormField
                                    control={form.control}
                                    name="county"
                                    label="County / Area"
                                    placeholder="Nairobi County"
                                    icon={Building2}
                                />

                                <FormField
                                    control={form.control}
                                    name="residence_address"
                                    label="Estate / Physical Landmark"
                                    placeholder="Kilimani, Argwings Kodhek Rd"
                                    icon={MapPin}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Field className="grid gap-3 items-center sm:grid-cols-2">
                        {(step === 2 || step === 3) && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleBack}
                                className="h-11"
                            >
                                Back
                            </Button>
                        )}
                        <Button
                            type="submit"
                            disabled={form.formState.isSubmitting || !form.formState.isValid}
                            className={`h-11 ${step === 1 ? "sm:col-span-2" : ""}`}
                        >
                            {form.formState.isSubmitting
                                ? "Processing..."
                                : step === 1 || step === 2
                                    ? "Continue"
                                    : "Complete Registration"}
                        </Button>
                    </Field>
                </form>
            </CardContent>
        </Card>
    );
}
