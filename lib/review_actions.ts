'use server';

import { db } from "./db";
import { review } from "./schema";
import { desc, eq } from "drizzle-orm";

type Review = typeof review.$inferSelect

export async function getReviews() {
    const reviews = await db.select().from(review).orderBy(desc(review.createdAt));
    return reviews;
}

export async function addReview(reviewData: Review) {
    try {
        const newReview = await db.insert(review).values({
            id: crypto.randomUUID(),
            name: reviewData.name,
            comment: reviewData.comment,
            isApproved: reviewData.isApproved,
            reviewDate: reviewData.reviewDate,
            createdAt: reviewData.createdAt || new Date(),
            updatedAt: reviewData.updatedAt || new Date(),
        }).returning();
        return newReview;
    } catch (error) {
        console.error("Failed to add review:", error);
        return { error: "Failed to add review" };
    }
}

export async function deleteReview(id: string) {
    try {
        await db.delete(review).where(eq(review.id, id));
    } catch (error) {
        console.error("Failed to delete review:", error);
        return { error: "Failed to delete review" };
    }
}


export async function updateReview(reviewData: Review) {
    try {
        const updatedReview = await db.update(review).set(reviewData).where(eq(review.id, reviewData.id)).returning();
        return updatedReview;
    } catch (error) {
        console.error("Failed to update review:", error);
        return { error: "Failed to update review" };
    }
}