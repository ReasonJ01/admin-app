'use client';
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function Dashboard() {
    const router = useRouter();

    return (
        <div>
            <h1>Dashboard</h1>
            <Button onClick={() => authClient.signOut({
                fetchOptions: {
                    onSuccess: () => {
                        router.push('/auth');
                    }
                }
            })}>Sign Out</Button>
        </div>
    );
}