"use server";

import { eq } from "drizzle-orm";
import { db } from "./db";
import { image } from "./schema";


export async function getImageUrl(id: string) {
    const imageUrl = await db.select().from(image).where(eq(image.id, id));
    return imageUrl[0].url;
}

type ImageInsert = typeof image.$inferInsert;

export async function addImage(url: string) {
    const imageData: ImageInsert = {
        id: crypto.randomUUID(),
        url,
        createdAt: new Date(),
        updatedAt: new Date()
    }
    try {
        const newImage = await db.insert(image).values(imageData as ImageInsert).returning();
        return { image: newImage[0] };
    } catch (error) {
        console.error("Failed to add image", error);
        return { error: "Failed to add image" };
    }
}