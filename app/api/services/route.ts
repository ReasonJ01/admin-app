import { NextRequest, NextResponse } from "next/server";
import { deleteService } from "@/lib/actions/service_actions";

export async function DELETE(request: NextRequest) {
    try {
        const { id } = await request.json();
        if (!id) {
            return NextResponse.json({ error: "Missing id" }, { status: 400 });
        }
        const result = await deleteService(id);
        if (result.error) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }
        return NextResponse.json({ message: "Service deleted" });
    } catch {
        return NextResponse.json({ error: "Failed to delete service" }, { status: 500 });
    }
} 