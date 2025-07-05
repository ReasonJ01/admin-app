import { NextRequest, NextResponse } from "next/server";
import { getImages, addImage, updateImage, deleteImage } from "@/lib/image_actions";


export async function GET() {
    try {
        const images = await getImages();
        return NextResponse.json(images);
    } catch (error) {
        console.error("Failed to fetch images:", error);
        return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { url } = body;

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        const result = await addImage(url);

        if (result.error) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json(result.image);
    } catch (error) {
        console.error("Failed to add image:", error);
        return NextResponse.json({ error: "Failed to add image" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, carousel, gallery } = body;

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        const updateData: { carousel?: boolean; gallery?: boolean } = {};
        if (carousel !== undefined) updateData.carousel = carousel;
        if (gallery !== undefined) updateData.gallery = gallery;

        const result = await updateImage(updateData, id);

        if (result.error) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json({ message: result.message });
    } catch (error) {
        console.error("Failed to update image:", error);
        return NextResponse.json({ error: "Failed to update image" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        const result = await deleteImage(id);

        if (result.error) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json({ message: result.message });
    } catch (error) {
        console.error("Failed to delete image:", error);
        return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
    }
} 