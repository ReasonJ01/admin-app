"use server";
import { createBookingFlowQuestion } from "@/lib/actions/booking_flow_actions";

export async function addQuestionServerAction(formData: FormData) {
    const text = formData.get("text") as string;
    if (!text) return;
    await createBookingFlowQuestion({ id: crypto.randomUUID(), text });
} 