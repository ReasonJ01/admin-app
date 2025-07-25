"use server";
import { db } from "@/lib/db";
import {
    bookingFlowQuestion,
    bookingFlowOption,
    bookingFlowOptionService,
    service,
} from "@/lib/schema";
import { eq, and } from "drizzle-orm";

// --- Booking Flow Question Actions ---
export async function createBookingFlowQuestion(data: { id: string; text: string; order?: number }) {
    return db.insert(bookingFlowQuestion).values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
    });
}

export async function getBookingFlowQuestions() {
    const questions = await db.select().from(bookingFlowQuestion).orderBy(bookingFlowQuestion.order);
    // If question with id 'start' is not found, create it
    if (!questions.find(q => q.id === 'start')) {
        await createBookingFlowQuestion({ id: 'start', text: 'Start', order: 0 });
    }
    return questions;
}

export async function getBookingFlowQuestionById(id: string) {
    return db.select().from(bookingFlowQuestion).where(eq(bookingFlowQuestion.id, id)).then(rows => rows[0]);
}

export async function updateBookingFlowQuestion(id: string, data: Partial<{ text: string; order: number }>) {
    return db.update(bookingFlowQuestion)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(bookingFlowQuestion.id, id));
}

export async function deleteBookingFlowQuestion(id: string) {
    return db.delete(bookingFlowQuestion).where(eq(bookingFlowQuestion.id, id));
}

// --- Booking Flow Option Actions ---
export async function createBookingFlowOption(data: {
    id: string;
    questionId: string;
    optionTitle: string;
    description?: string;
    nextQuestionId?: string;
    tag?: string;
    order?: number;
}) {
    return db.insert(bookingFlowOption).values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
    });
}

export async function getBookingFlowOptionsByQuestion(questionId: string) {
    return db.select().from(bookingFlowOption).where(eq(bookingFlowOption.questionId, questionId)).orderBy(bookingFlowOption.order);
}

export async function getBookingFlowOptionById(id: string) {
    return db.select().from(bookingFlowOption).where(eq(bookingFlowOption.id, id)).then(rows => rows[0]);
}

export async function updateBookingFlowOption(id: string, data: Partial<{ optionTitle: string; description?: string; nextQuestionId?: string; tag?: string; order?: number; services?: string[] }>) {
    // Update the option fields
    await db.update(bookingFlowOption)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(bookingFlowOption.id, id));
    // If services are provided, update the option-service links
    if (data.services) {
        // Remove all existing services for this option
        await db.delete(bookingFlowOptionService).where(eq(bookingFlowOptionService.optionId, id));
        // Add new services
        for (const serviceId of data.services) {
            await db.insert(bookingFlowOptionService).values({ optionId: id, serviceId });
        }
    }
}

export async function deleteBookingFlowOption(id: string) {
    return db.delete(bookingFlowOption).where(eq(bookingFlowOption.id, id));
}

// --- Option-Service Link Actions ---
export async function addServiceToOption(optionId: string, serviceId: string) {
    return db.insert(bookingFlowOptionService).values({ optionId, serviceId });
}

export async function removeServiceFromOption(optionId: string, serviceId: string) {
    return db.delete(bookingFlowOptionService).where(and(
        eq(bookingFlowOptionService.optionId, optionId),
        eq(bookingFlowOptionService.serviceId, serviceId)
    ));
}

export async function getServicesForOption(optionId: string) {
    return db.select().from(bookingFlowOptionService).where(eq(bookingFlowOptionService.optionId, optionId));
}

// --- Booking Flow Question + Options Combined Action ---
export async function getBookingFlowQuestionsWithOptions() {
    // Get all questions
    const questions = await db.select().from(bookingFlowQuestion).orderBy(bookingFlowQuestion.order);
    // Get all options
    const options = await db.select().from(bookingFlowOption).orderBy(bookingFlowOption.order);
    // Get all option-service links
    const optionServices = await db.select().from(bookingFlowOptionService);
    // Get all services
    const services = await db.select().from(service);

    // Group services by optionId
    const servicesByOption: Record<string, typeof services> = {};
    for (const os of optionServices) {
        const svc = services.find(s => s.id === os.serviceId);
        if (!svc) continue;
        if (!servicesByOption[os.optionId]) servicesByOption[os.optionId] = [];
        servicesByOption[os.optionId].push(svc);
    }

    // Group options by questionId and attach services to each option
    type OptionWithServices = (typeof options)[0] & { services: typeof services };
    const optionsByQuestion: Record<string, OptionWithServices[]> = {};
    for (const option of options) {
        const optionWithServices = { ...option, services: servicesByOption[option.id] || [] };
        if (!optionsByQuestion[option.questionId]) optionsByQuestion[option.questionId] = [];
        optionsByQuestion[option.questionId].push(optionWithServices);
    }

    // Attach options to questions
    return questions.map(q => ({
        ...q,
        options: optionsByQuestion[q.id] || []
    }));
} 