'use client'

import { Upload } from "lucide-react";
import { Button } from "./ui/button";
import { upload } from '@vercel/blob/client';
import { useRef, useState } from "react";
import Image from "next/image";

const generateImageKey = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${random}`;
};

interface UploadedFile {
    file: File;
    key: string;
    preview: string;
}

export default function ImageUpload() {
    const [files, setFiles] = useState<UploadedFile[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const uploadedFiles = e.target.files;
        if (uploadedFiles) {
            const newFiles: UploadedFile[] = Array.from(uploadedFiles).map(file => ({
                file,
                key: generateImageKey(),
                preview: URL.createObjectURL(file)
            }));
            setFiles(prev => [...prev, ...newFiles]);
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (files.length === 0) {
            console.log("No files to upload");
            return;
        }

        for (const file of files) {
            await upload(file.file.name, file.file, {
                access: 'public',
                contentType: "image/*",
                handleUploadUrl: "/api/images/upload"

            })
        }

    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div className="border-2 border-dashed rounded-lg p-4">


                    <div className="flex flex-col items-center justify-center h-full">
                        <Upload className="w-10 h-10 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Click to upload</p>
                        <Button variant="outline" className="cursor-pointer font-semibold text-lg mt-4" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="h-6 w-6 mr-2" />
                            Upload Image
                        </Button>

                        <input type="file" className="hidden" ref={fileInputRef} multiple onChange={(e) => handleUpload(e)} accept="image/*" />
                    </div>


                </div>
                <div className="flex flex-col gap-4 mt-4">
                    {files.map((uploadedFile) => (
                        <div key={uploadedFile.key}>
                            <Image src={uploadedFile.preview} alt={uploadedFile.file.name} width={100} height={100} />
                            <p className="text-sm text-muted-foreground">{uploadedFile.file.name}</p>
                            <p className="text-xs text-muted-foreground">Key: {uploadedFile.key}</p>
                        </div>
                    ))}

                </div>
                <Button type="submit" className="mt-4">Upload</Button>
            </form>
        </div>


    )

}