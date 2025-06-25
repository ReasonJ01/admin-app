'use server';

import { db } from "@/lib/db";
import { faq, user } from "@/lib/schema";
import { eq, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

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
        const faqs = await db.query.faq.findMany();
        return { faqs };
    } catch (err) {
        console.error("Failed to get FAQs:", err);
        return { error: "Failed to get FAQs" };
    }
}

export async function addFAQ(question: string, answer: string) {
    const faqToInsert = {
        id: crypto.randomUUID(),
        question,
        answer,
        createdAt: new Date(),
        updatedAt: new Date(),
    }

    try {
        const newFAQ = await db.insert(faq).values(faqToInsert).returning()
        return { newFAQ };
    } catch (err) {
        console.error("Failed to add FAQ:", err);
        return { error: "Failed to add FAQ" };
    }
}

export async function deleteFAQ(ids: string[]) {
    try {
        await db.delete(faq).where(inArray(faq.id, ids))
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

        return { updatedFAQ: updatedFAQ[0] };
    } catch (err) {
        console.error("Failed to update FAQ:", err);
        return { error: "Failed to update FAQ" };
    }
}