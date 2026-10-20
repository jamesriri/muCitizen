import { RequestService } from "@/features/requests/services/request.service";
import { CreateRequestForm } from "@/features/requests/components";
import { requireRole } from "@/lib/security";
import { Role } from "@/types/domain";

export const metadata = {
    title: "Report an Issue | muCitizen",
    description: "Report a local issue to Murang'a County and follow its progress",
};

export default async function SubmitRequestPage() {
    await requireRole([Role.CITIZEN]);
    const categories = await RequestService.getCategories();

    return (
        <div className="max-w-4xl mx-auto py-2">
            <CreateRequestForm categories={categories} />
        </div>
    );
}
