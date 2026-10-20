"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckCircle2, ArrowRight, Loader2, ArrowLeft, FileText } from "lucide-react";

import { CategorySummary, Priority } from "@/types/domain";
import { createRequestSchema, type CreateRequestInput } from "../schemas/request.schema";
import { submitRequestAction } from "../actions/submit.request.action";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Label, Textarea } from "@/components/ui";
import { CategorySelector } from "./CategorySelector";
import { LocationPicker } from "./LocationPicker";
import { ImageDropzone } from "./ImageDropzone";
import { FormField, StepIndicator } from "@/components/forms";

interface CreateRequestFormProps {
  categories: CategorySummary[];
}

const STEPS = [
  { title: "Category", description: "Select incident department & SLA window." },
  { title: "Incident Details", description: "Describe the hazard and location." },
  { title: "Evidence & Review", description: "Attach photo evidence and confirm." },
];

export default function CreateRequestForm({ categories }: CreateRequestFormProps) {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [createdReference, setCreatedReference] = React.useState<string | null>(null);

  const form = useForm<CreateRequestInput>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      title: "",
      categoryId: categories[0]?.id || "",
      priority: Priority.MEDIUM,
      description: "",
      locationAddress: "",
      latitude: null,
      longitude: null,
    },
    mode: "onChange",
  });

  const selectedCategoryId = useWatch({
    control: form.control,
    name: "categoryId",
  });
  const locationAddress = useWatch({
    control: form.control,
    name: "locationAddress",
  });
  const latitude = useWatch({ control: form.control, name: "latitude" });
  const longitude = useWatch({ control: form.control, name: "longitude" });
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  const onFinalSubmit = async (data: CreateRequestInput) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("categoryId", data.categoryId);
    formData.append("priority", data.priority);
    formData.append("description", data.description);
    formData.append("locationAddress", data.locationAddress);

    if (data.latitude) formData.append("latitude", data.latitude.toString());
    if (data.longitude) formData.append("longitude", data.longitude.toString());
    if (imageFile) formData.append("image", imageFile);

    const res = await submitRequestAction(formData);

    if (res.success && res.referenceNumber) {
      setCreatedReference(res.referenceNumber);
      toast.success("Incident registered successfully!");
    } else {
      toast.error(res.error || "Submission failed.");
    }
  };

  if (createdReference) {
    return (
      <Card className="max-w-xl mx-auto text-center border-primary/30 shadow-lg">
        <CardHeader className="pt-8 pb-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mb-3">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold">Request Lodged Successfully</CardTitle>
          <CardDescription className="text-sm">
            Your report has been sent to the relevant county service team.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-xl border bg-muted/40 p-4">
            <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
              Official Reference Tracking Code
            </p>
            <p className="font-mono text-2xl font-extrabold text-primary mt-1">
              {createdReference}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Save this reference number. Anyone can monitor public status progress without logging in.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Button
              className="w-full sm:flex-1"
              onClick={() => router.push("/my-requests")}
            >
              Go to My Requests
            </Button>
            <Button
              variant="outline"
              className="w-full sm:flex-1"
              onClick={() => router.push(`/track?code=${createdReference}`)}
            >
              Track Public Status
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-3xl mx-auto shadow-md border-border/70">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Report a Local Issue</CardTitle>
        <CardDescription>
          Tell us what needs attention and where. We&apos;ll send it to the right team.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <StepIndicator currentStep={step} steps={STEPS} />

        <form onSubmit={form.handleSubmit(onFinalSubmit)} className="space-y-6">
          {/* STEP 1: CATEGORY */}
          {step === 1 && (
            <div className="space-y-4">
              <Label className="text-sm font-semibold">Select Incident Category *</Label>
              <CategorySelector
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onSelect={(id) => form.setValue("categoryId", id, { shouldValidate: true })}
              />

              <div className="flex justify-end pt-4">
                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!selectedCategoryId}
                  className="gap-2"
                >
                  Continue to Details <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: DETAILS & LOCATION */}
          {step === 2 && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                label="Incident Headline *"
                placeholder="e.g. Major sewer pipe burst flooding sidewalk"
                icon={FileText}
              />

              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what happened, any immediate road or safety hazards, and notable landmarks..."
                  className="min-h-27.5"
                  {...form.register("description")}
                />
                {form.formState.errors.description && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Urgency Level</Label>
                <select
                  id="priority"
                  {...form.register("priority")}
                  className="w-full h-11 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-hidden"
                >
                  <option value={Priority.LOW}>Low - Routine Maintenance</option>
                  <option value={Priority.MEDIUM}>Medium - Standard Civic Issue</option>
                  <option value={Priority.HIGH}>High - Disrupting Daily Activity</option>
                  <option value={Priority.URGENT}>Urgent - Immediate Safety or Health Hazard</option>
                </select>
              </div>

              <LocationPicker
                address={locationAddress}
                onAddressChange={(addr) => form.setValue("locationAddress", addr, { shouldValidate: true })}
                latitude={latitude ?? null}
                longitude={longitude ?? null}
                onCoordinatesChange={(lat, lng) => {
                  form.setValue("latitude", lat);
                  form.setValue("longitude", lng);
                }}
              />

              <div className="flex items-center justify-between pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button
                  type="button"
                  onClick={async () => {
                    const valid = await form.trigger(["title", "description", "locationAddress"]);
                    if (valid) setStep(3);
                  }}
                  className="gap-2"
                >
                  Continue to Evidence <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: EVIDENCE & REVIEW */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label>On-Site Photo Evidence (Optional)</Label>
                <ImageDropzone file={imageFile} onFileChange={setImageFile} />
              </div>

              {/* Review Summary Card */}
              <div className="rounded-xl border bg-muted/30 p-4 space-y-2 text-sm">
                <p className="font-semibold text-foreground text-xs uppercase tracking-wider">
                  Dispatch Summary
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <div>
                    <span className="text-muted-foreground">Department:</span>
                    <p className="font-medium text-foreground">{selectedCategory?.name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Statutory SLA:</span>
                    <p className="font-medium text-foreground">{selectedCategory?.slaHours} Hours</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Location:</span>
                    <p className="font-medium text-foreground">{locationAddress}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setStep(2)} className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="gap-2 font-semibold"
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Lodging Request...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Submit Request
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
