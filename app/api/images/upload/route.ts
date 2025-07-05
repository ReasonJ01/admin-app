import { addImage } from "@/lib/image_actions";
import { HandleUploadBody, handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export const OPTIONS = () =>
    new Response(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
    });


export async function POST(request: Request): Promise<NextResponse> {
    const body = await request.json() as HandleUploadBody;

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (clientPayload) => {
                return {
                    addRandomSuffix: true,
                    allowedContentTypes: ["image/*"],
                    maxSize: 15 * 1024 * 1024,
                    tokenPayload: clientPayload
                }

            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                console.log("Upload complete", blob, tokenPayload);

                try {
                    const imageUrl = await addImage(blob.url);
                    console.log("Image added", imageUrl);
                } catch (error) {
                    console.error("Failed to add image", error);
                }
            }
        })

        return NextResponse.json(jsonResponse, {
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            }
        });
    }
    catch (error) {
        console.error("Error uploading image", error);
        return NextResponse.json({ error: "Failed to upload image" }, {
            status: 500, headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            }
        });
    }

}