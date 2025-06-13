import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins"

import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import * as schema from "@/lib/schema";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema,
    }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
    },
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60 // Cache for 5 minutes
        },
        select: {
            user: {
                role: true
            }
        }
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: "user",
                input: false, // don't allow user to set role
            },
        },
    },
    plugins: [admin()]
})

export type Session = typeof auth.$Infer.Session
