"use server";

import { eq } from "drizzle-orm";
import { db } from "./db";
import { image } from "./schema";
import { z } from "zod";
import { del } from '@vercel/blob';


export async function getImageUrl(id: string) {
    const imageUrl = await db.select().from(image).where(eq(image.id, id));
    return imageUrl[0].url;
}

type ImageInsert = typeof image.$inferInsert;


export async function addImage(url: string) {
    try {
        const imageData: ImageInsert = {
            id: crypto.randomUUID(),
            url,
            createdAt: new Date(),
            updatedAt: new Date(),
            carousel: false,
        }
        const newImage = await db.insert(image).values(imageData as ImageInsert).returning();
        return { image: newImage[0] };
    } catch (error) {
        console.error("Failed to add image", error);
        return { error: "Failed to add image" };
    }
}

export async function getImages() {
    const images = await db.select().from(image);
    return images;
}



export async function deleteImage(id: string) {
    try {
        const url = await getImageUrl(id);
        del(url)
        await db.delete(image).where(eq(image.id, id));
        return { message: "Image deleted" };
    } catch (error) {
        console.error("Failed to delete image", error);
        return { error: "Failed to delete image" };
    }
}

type ImageSelect = typeof image.$inferSelect;

const updateImageSchema = z.object({
    url: z.string().optional(),
    carousel: z.boolean().optional(),
    updatedAt: z.date().default(new Date()),
});

export async function updateImage(imageData: Partial<ImageSelect>, id: string) {
    try {
        const validatedData = updateImageSchema.parse(imageData);
        await db.update(image).set(validatedData).where(eq(image.id, id));
        return { message: "Image updated" };
    } catch (error) {
        console.error("Failed to update image", error);
        return { error: "Failed to update image" };
    }
}