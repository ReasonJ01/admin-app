"use client";

import { createContext, useContext, type ReactNode } from "react";
import { authClient } from "@/lib/auth-client";

type SessionWithUser = Awaited<ReturnType<typeof authClient.getSession>>["data"];


const SessionContext = createContext<SessionWithUser | null>(null);

export function useSession() {
    return useContext(SessionContext);
}

interface ProvidersProps {
    children: ReactNode;
    session: SessionWithUser | null;
}

export default function SessionProvider({ children, session }: ProvidersProps) {
    return (
        <SessionContext.Provider value={session}>
            {children}
        </SessionContext.Provider>
    );
}
