import { DataTable } from "./data-table";
import { getFaqs } from "@/lib/actions";
import { columns } from "./columns";

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function FAQsPage() {
    const result = await getFaqs();

    if (result.error) {
        return <div>Error: {result.error}</div>
    }

    if (!result.faqs) {
        return <div>No FAQs found</div>
    }

    return (
        <div className="w-full flex justify-center">
            <div className="w-full lg:w-3/4">
                <DataTable columns={columns} data={result.faqs} />
            </div>
        </div>
    )
}