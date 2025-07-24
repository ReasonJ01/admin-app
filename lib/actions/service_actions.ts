"use server"

import { db } from "@/lib/db";
import { service } from "@/lib/schema";
import { eq } from "drizzle-orm";
import type { Service } from "@/app/(contents)/services/page";


type InsertService = typeof service.$inferInsert;

export async function getServices() {
    const services = await db.select().from(service);
    return services;
}

export async function getWebsiteServices() {
    const services = await db.select().from(service).where(eq(service.showOnWebsite, true));
    return services;
}


export async function getService(id: string) {
    const result = await db.select().from(service).where(eq(service.id, id));
    return result[0];
}


export async function createService(newService: InsertService) {
    // Get the admin configurations details such as pre/post buffer time
    // min booking notice, slot interval, booking window
    await db.insert(service).values(newService);
}

export async function updateService(svc: Service) {
    await db.update(service)
        .set({
            name: svc.name,
            description: svc.description,
            price: svc.price,
            duration: svc.duration,
            preBufferMinutes: svc.overridePreBuffer ? svc.preBufferMinutes : 0,
            postBufferMinutes: svc.overridePostBuffer ? svc.postBufferMinutes : 0,
            overridePreBuffer: svc.overridePreBuffer,
            overridePostBuffer: svc.overridePostBuffer,
            showOnWebsite: svc.showOnWebsite,
            updatedAt: new Date(),
        })
        .where(eq(service.id, svc.id));
}

export async function deleteService(id: string) {
    try {
        await db.delete(service).where(eq(service.id, id));
        return { message: "Service deleted" };
    } catch (error) {
        console.error("Failed to delete service", error);
        return { error: "Failed to delete service" };
    }
}