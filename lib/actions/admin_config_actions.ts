"use server";
import { Redis } from "@upstash/redis";
import { db } from "@/lib/db";
import { service } from "@/lib/schema";
import { eq } from "drizzle-orm";
import type { GeneralSettings } from "@/types/general-settings";

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function saveAdminConfigs(config: Record<string, unknown>) {
    // Get previous config
    const prevConfig = await getAdminConfigs() as GeneralSettings | null;
    const newConfig = config as GeneralSettings;
    const result = await redis.set("admin_configs", config);

    // If preBufferMinutes or postBufferMinutes changed, update all services with override=false
    if (
        prevConfig &&
        (prevConfig.preBufferMinutes !== newConfig.preBufferMinutes || prevConfig.postBufferMinutes !== newConfig.postBufferMinutes)
    ) {
        if (prevConfig.preBufferMinutes !== newConfig.preBufferMinutes) {
            await db.update(service)
                .set({ preBufferMinutes: newConfig.preBufferMinutes })
                .where(eq(service.overridePreBuffer, false));
        }
        if (prevConfig.postBufferMinutes !== newConfig.postBufferMinutes) {
            await db.update(service)
                .set({ postBufferMinutes: newConfig.postBufferMinutes })
                .where(eq(service.overridePostBuffer, false));
        }
    }
    return result;
}

export async function getAdminConfigs() {
    const configs = await redis.get("admin_configs");
    return configs;
}