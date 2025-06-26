import { ReviewsTable } from "./review-table";
import { getReviews } from "@/lib/review_actions";

export default async function ReviewsPage() {
    const reviews = await getReviews();
    return (
        <div>
            <ReviewsTable reviews={reviews} />
        </div>
    )
}