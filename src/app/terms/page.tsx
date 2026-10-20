import type { Metadata } from "next";
import {
  AlertTriangle,
  FileText,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { LegalPageLayout } from "@/components/public";
import { type LegalSection } from "@/components/public/LegalPageLayout";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the terms for using muCitizen to submit and follow Murang'a County service requests.",
};

const sections: LegalSection[] = [
  {
    title: "Using this service",
    icon: Scale,
    content: (
      <>
        <p>
          By creating an account or submitting a service request, you agree to
          use this portal responsibly and to provide information that is
          accurate to the best of your knowledge.
        </p>
        <p>
          The portal helps residents report county service and
          infrastructure issues. It is not an emergency response service. For
          an immediate threat to life or safety, contact the appropriate
          emergency service directly.
        </p>
      </>
    ),
  },
  {
    title: "Making a report",
    icon: AlertTriangle,
    content: (
      <>
        <p>
          Reports should describe a genuine issue and include a useful location.
          Photos are optional; only upload material that relates to the issue
          and that you are entitled to share.
        </p>
        <p>
          Do not use the portal to submit knowingly false or misleading reports,
          upload unlawful or harmful material, or interfere with the work of
          response teams. Misuse may result in restrictions on your account or
          further action under applicable law.
        </p>
      </>
    ),
  },
  {
    title: "Review and service timelines",
    icon: ShieldCheck,
    content: (
      <>
        <p>
          Each request is routed to the relevant service area for review. The
          target timeframe shown for a category is an operational service
          target, not a guarantee that every report will be resolved by that
          time.
        </p>
        <p>
          The time needed to resolve an issue can depend on its location,
          urgency, available resources, weather, and other circumstances. We
          will update the request status as it progresses through the service
          workflow.
        </p>
      </>
    ),
  },
  {
    title: "Reference numbers and public tracking",
    icon: FileText,
    content: (
      <>
        <p>
          When a report is submitted, it receives a reference number. Keep it
          somewhere safe: you can use it to check the report&apos;s status
          without signing in.
        </p>
        <p>
          The public tracker may show the request details and non-internal
          progress updates. Do not share a reference number publicly if you do
          not want others to view that information. Personal contact and
          identity details are not displayed on the public tracker.
        </p>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPageLayout
      eyebrow="Murang'a County services"
      title="Terms of service"
      description="A few clear expectations help residents report local issues and help county teams respond."
      updated="October 2026"
      sections={sections}
    />
  );
}
