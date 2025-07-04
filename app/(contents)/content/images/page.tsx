import ImageUpload from "@/components/ImageUpload";

export default function ImagesPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Images</h1>
            <p className="text-muted-foreground">
                Manage your site&apos;s images.
            </p>
            <ImageUpload />
        </div>
    )
}