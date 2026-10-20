import type { Metadata } from "next";
import { Database, Eye, LockKeyhole, UserRoundCheck } from "lucide-react";
import { LegalPageLayout } from "@/components/public";
import { type LegalSection } from "@/components/public/LegalPageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how muCitizen uses information to process reports and how you can manage your data.",
};

const sections: LegalSection[] = [
  {
    title: "Information used for a report",
    icon: Database,
    content: (
      <>
        <p>
          We use the details you provide to create and route service requests,
          keep your account working, and prevent misuse of the portal. Depending
          on how you use the service, that may include:
        </p>
        <ul className="list-disc space-y-2 pl-5 marker:text-emerald-700 dark:marker:text-emerald-300">
          <li>
            <strong className="font-semibold text-foreground">Account details</strong>
            {" "}such as your name, email address, phone number, and
            identification number.
          </li>
          <li>
            <strong className="font-semibold text-foreground">Report details</strong>
            {" "}such as the issue description, service category, and updates
            about its progress.
          </li>
          <li>
            <strong className="font-semibold text-foreground">Location</strong>
            {" "}you enter or choose, so response teams can find the issue.
          </li>
          <li>
            <strong className="font-semibold text-foreground">Attachments</strong>
            {" "}you choose to provide, such as a photo that helps explain the
            issue.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "How information is used and protected",
    icon: LockKeyhole,
    content: (
      <>
        <p>
          Information is used to operate the portal, verify accounts, direct
          reports to the appropriate service team, and keep a record of request
          activity. Access to account and report information is limited to the
          service functions that need it.
        </p>
        <p>
          Passwords are stored as one-way hashes rather than readable text.
          Session cookies are configured with protections including
          <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">HttpOnly</code>
          and
          <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">SameSite</code>.
          No online service can promise that risk is eliminated, but we take
          steps intended to protect the information entrusted to the portal.
        </p>
      </>
    ),
  },
  {
    title: "Public request tracking",
    icon: Eye,
    content: (
      <>
        <p>
          A reference number lets you view a limited set of information about a
          report without signing in, such as its status and non-internal
          timeline updates. The public tracker does not display the
          reporter&apos;s name, email address, phone number, or identification
          number.
        </p>
        <p>
          Treat your reference number like a private link. Anyone who has it may
          be able to view the report information made available by the public
          tracker.
        </p>
      </>
    ),
  },
  {
    title: "Your choices and questions",
    icon: UserRoundCheck,
    content: (
      <>
        <p>
          You can review your submitted requests from your account. If account
          information is incorrect, or if you have a question about how
          information is handled, contact the service team through the
          appropriate county service channel.
        </p>
        <p>
          Personal information is handled in accordance with applicable data
          protection requirements, including the Kenya Data Protection Act,
          2019. Any request to access or correct personal information may
          require verification so we can protect your account.
        </p>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      eyebrow="Your information"
      title="Privacy, in plain language."
      description="Here’s what information helps us handle a service report, how it appears in public tracking, and what you can do if something needs attention."
      updated="October 2026"
      sections={sections}
    />
  );
}
