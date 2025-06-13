import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "./auth";


export const authClient = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001",
    plugins: [adminClient(), inferAdditionalFields<typeof auth>()],

})

export type Session = typeof authClient.$Infer.Session
export type User = typeof authClient.$Infer.Session.user