"use client";

import ImageUpload from "@/components/ImageUpload";
import { useEffect, useState } from "react";
import Image from "next/image";
import { image } from "@/lib/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type Image = typeof image.$inferSelect;

export default function ImagesPage() {
    const [images, setImages] = useState<Image[]>([]);

    useEffect(() => {
        const fetchImages = async () => {
            await fetch("/api/images").then(res => res.json().then(setImages))
        }
        fetchImages();
    }, []);

    async function handleUploadSuccess() {
        const prevLength = images.length;
        for (let index = 0; index < 5; index++) {
            const newImages = await fetch("/api/images").then(res => res.json())
            setImages(newImages)
            if (newImages.length > prevLength) {
                break;
            }
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    async function handleDelete(id: string) {
        setImages(prev => prev.filter(image => image.id !== id))
        await fetch(`/api/images`, {
            method: "DELETE",
            body: JSON.stringify({ id })
        })
    }

    async function handleCheckboxChange(id: string, checked: boolean) {
        setImages(prev => prev.map(image => image.id === id ? { ...image, carousel: checked } : image))
        await fetch(`/api/images`, {
            method: "PUT",
            body: JSON.stringify({ id, carousel: checked })
        })
    }


    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Images</h1>
            <p className="text-muted-foreground">
                Manage your site&apos;s images.
            </p>
            <ImageUpload onUploadSuccess={handleUploadSuccess} />
            <div className="flex flex-wrap gap-4 mt-4 justify-center">
                {images.map((image) => (
                    <Card key={image.id} className="flex flex-col p-2">
                        <CardContent className="flex-1 p-0">
                            <Image className="rounded-md" src={image.url} alt="Image" width={300} height={300} />
                        </CardContent>
                        <CardFooter className="flex flex-col gap-3 mt-auto">
                            <div className="flex items-center justify-between w-full mb-4">
                                <Label htmlFor={`carousel-${image.id}`} className="text-sm">Show in carousel</Label>
                                <Checkbox id={`carousel-${image.id}`} checked={image.carousel} onCheckedChange={() => handleCheckboxChange(image.id, !image.carousel)} />
                            </div>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="destructive" size="sm" className="w-full">
                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Delete Image?</DialogTitle>
                                        <DialogDescription className="flex flex-col gap-2 items-center">
                                            Are you sure you want to delete this image?
                                            <Image src={image.url} alt="Image" width={300} height={300} />
                                            This action cannot be undone.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <Button className="w-full" variant="destructive" onClick={() => handleDelete(image.id)}>Delete</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                        </CardFooter>
                    </Card>
                ))}

            </div>
        </div >
    )
}