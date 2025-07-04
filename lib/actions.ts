'use server';

import { db } from "@/lib/db";
import { faq, user } from "@/lib/schema";
import { eq, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidateTag } from "next/cache";

export async function checkEmailRole(email: string) {
    try {
        const dbUser = await db.query.user.findFirst({
            where: eq(user.email, email),
            columns: {
                role: true
            }
        });

        return { role: dbUser?.role ?? 'user' };
    } catch (err) {
        console.error("Failed to check role:", err);
        return { error: "Failed to check role" };
    }
}

export async function checkUserRole() {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) {
            return { error: "Not authenticated" };
        }

        const dbUser = await db.query.user.findFirst({
            where: eq(user.id, session.user.id),
            columns: {
                role: true
            }
        });

        return { role: dbUser?.role ?? 'user' };
    } catch (err) {
        console.error("Failed to check role:", err);
        return { error: "Failed to check role" };
    }
}

export async function getFaqs() {
    try {
        // Force fresh data by adding cache control
        const faqs = await db.query.faq.findMany({
            orderBy: (faq, { asc }) => [asc(faq.order)]
        });
        return { faqs };
    } catch (err) {
        console.error("Failed to get FAQs:", err);
        return { error: "Failed to get FAQs" };
    }
}

export async function addFAQ(question: string, answer: string) {
    try {
        // Get the highest order value to calculate the next one
        const maxOrderResult = await db.select({ maxOrder: faq.order }).from(faq);
        const maxOrder = maxOrderResult.length > 0 ? Math.max(...maxOrderResult.map(r => r.maxOrder)) : 0;
        const nextOrder = maxOrder + 1;

        const faqToInsert = {
            id: crypto.randomUUID(),
            question,
            answer,
            order: nextOrder,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        const newFAQ = await db.insert(faq).values(faqToInsert).returning()
        revalidateTag("faqs");
        return { newFAQ };
    } catch (err) {
        console.error("Failed to add FAQ:", err);
        return { error: "Failed to add FAQ" };
    }
}

export async function deleteFAQ(ids: string[]) {
    try {
        await db.delete(faq).where(inArray(faq.id, ids))
        revalidateTag("faqs");
    } catch (err) {
        console.error("Failed to delete FAQs:", err);
        return { error: "Failed to delete FAQs" };
    }
}

export async function updateFAQ(id: string, question: string, answer: string) {
    try {
        const updatedFAQ = await db.update(faq)
            .set({
                question,
                answer,
                updatedAt: new Date(),
            })
            .where(eq(faq.id, id))
            .returning();

        revalidateTag("faqs");
        return { updatedFAQ: updatedFAQ[0] };
    } catch (err) {
        console.error("Failed to update FAQ:", err);
        return { error: "Failed to update FAQ" };
    }
}

export async function updateFAQOrder(updates: { id: string; order: number }[]) {
    try {
        // Use a transaction to update all FAQs atomically
        const results = await db.transaction(async (tx) => {
            const updatePromises = updates.map(({ id, order }) =>
                tx.update(faq)
                    .set({ order })
                    .where(eq(faq.id, id))
                    .returning()
            );

            return await Promise.all(updatePromises);
        });

        revalidateTag("faqs");
        return { updatedFAQs: results.flat() };
    } catch (err) {
        console.error("Failed to update FAQ order:", err);
        return { error: "Failed to update FAQ order" };
    }
}