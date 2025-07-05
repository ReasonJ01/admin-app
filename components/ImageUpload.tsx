'use client'

import { Trash, Upload, Loader2, Check, X, } from "lucide-react";
import { Button } from "./ui/button";
import { upload } from '@vercel/blob/client';
import { useRef, useState } from "react";
import Image from "next/image";
import { type PutBlobResult } from '@vercel/blob';

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

interface ImageUploadProps {
    onUploadSuccess?: (result: PutBlobResult) => void;
}

export default function ImageUpload({ onUploadSuccess }: ImageUploadProps) {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [uploadsStatus, setUploadsStatus] = useState<{ key: string, promise: Promise<PutBlobResult>, status: "pending" | "success" | "error", result?: PutBlobResult, error?: Error }[]>([]);

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
            const blob = upload(file.file.name, file.file, {
                access: 'public',
                contentType: "image/*",
                handleUploadUrl: "https://6773-86-29-152-158.ngrok-free.app/api/images/upload",
                clientPayload: file.key
            })

            setUploadsStatus(prev => [...prev, { key: file.key, promise: blob, status: "pending" }]);

            blob.then((result) => {
                setUploadsStatus(prev => prev.map(status => status.key === file.key ? { ...status, status: "success", result } : status));
                setFiles(prev => prev.filter(f => f.key !== file.key));
                onUploadSuccess?.(result);
            }).catch((error) => {
                setUploadsStatus(prev => prev.map(status => status.key === file.key ? { ...status, status: "error", error } : status));
            });

        }

    }

    function handleRemove(key: string) {
        setFiles(prev => prev.filter(file => file.key !== key));
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
                {files.length > 0 && (
                    <div className="flex flex-wrap gap-4 mt-4 border-2 border-dashed rounded-lg p-4">
                        {files.map((uploadedFile) => {
                            const status = uploadsStatus.find(status => status.key === uploadedFile.key);
                            const isUploading = status?.status === "pending";
                            const isUploaded = status?.status === "success";
                            const hasError = status?.status === "error";

                            return (
                                <div key={uploadedFile.key} className="flex flex-col items-center justify-center relative">
                                    <Image src={uploadedFile.preview} alt={uploadedFile.file.name} width={100} height={100} className={isUploading ? "opacity-50" : ""} />
                                    <p className="text-sm text-muted-foreground">{uploadedFile.file.name}</p>

                                    {isUploading && (
                                        <div className="flex items-center gap-2 mt-2 text-sm text-blue-600 bg-blue-100 rounded px-2 py-1">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Uploading...
                                        </div>
                                    )}

                                    {isUploaded && (
                                        <div className="mt-2 text-sm text-green-700 bg-green-100 rounded px-2 py-1">
                                            <Check className="w-4 h-4" /> Uploaded
                                        </div>
                                    )}

                                    {hasError && (
                                        <div className="mt-2 text-sm text-red-700 bg-red-100 rounded px-2 py-1">
                                            <X className="w-4 h-4" /> {status?.error?.message || "Upload failed"}
                                        </div>
                                    )}

                                    {!isUploading && !isUploaded && (
                                        <Button variant="outline" size="sm" className="mt-2" onClick={() => handleRemove(uploadedFile.key)}>
                                            <Trash className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                <Button type="submit" disabled={files.length === 0 || uploadsStatus.some(status => status.status === "pending")} className="mt-4 w-full h-10">Upload</Button>
            </form>
        </div>


    )

}