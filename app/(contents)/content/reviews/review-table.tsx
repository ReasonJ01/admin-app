"use client"
import { Card, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { review } from "@/lib/schema"
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle2, XCircle, Pencil, Trash } from "lucide-react";
import { AddReviewForm } from "./add-review";
import { RelativeDate } from "@/components/ui/relative-date";
import { deleteReview } from "@/lib/review_actions";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EditReviewForm } from "./edit-review";

type ReviewSelect = typeof review.$inferSelect

interface ReviewRowProps {
    review: ReviewSelect;
    onDelete?: () => void;
    onEdit?: (updates: Partial<ReviewSelect>) => void;
}

function ReviewRow({ review, onDelete, onEdit }: ReviewRowProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [openSheetId, setOpenSheetId] = useState<string | null>(null)
    return (
        <Card key={review.id}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>{review.comment}</CardTitle>
                    {review.isApproved ? (
                        <CheckCircle2 className="text-green-500" />
                    ) : (
                        <XCircle className="text-red-500" />
                    )}
                </div>
                <CardDescription>
                    {review.userId && <span>User ID: {review.userId} &middot; </span>}
                    {review.reviewDate && (
                        <span>
                            Reviewed: {new Date(review.reviewDate).toLocaleDateString()}
                        </span>
                    )}
                </CardDescription>
            </CardHeader>
            <CardFooter>
                <div className="flex justify-between items-center w-full">
                    <div>
                        <div className="text-sm text-muted-foreground">{review.name}</div>
                        {review.updatedAt && (
                            <RelativeDate date={review.updatedAt} label="Updated" />
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Drawer open={openSheetId === review.id} onOpenChange={(open) => setOpenSheetId(open ? review.id : null)}>
                            <DrawerTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => onEdit?.(review)}
                                    title="Edit"
                                >
                                    <Pencil className="w-4 h-4" />
                                </Button>
                            </DrawerTrigger>
                            <DrawerContent className="p-6">
                                <DrawerHeader>
                                    <DrawerTitle>Edit Review</DrawerTitle>
                                    <DrawerDescription>
                                        Edit the review for {review.name}
                                    </DrawerDescription>
                                </DrawerHeader>
                                <div className="flex justify-center items-start">
                                    <div className="w-full max-w-md">
                                        <EditReviewForm review={review} onSuccess={(updates) => {
                                            onEdit?.(updates)
                                            setOpenSheetId(null)
                                        }} />
                                    </div>
                                </div>
                            </DrawerContent>
                        </Drawer>
                        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="destructive"
                                    title="Delete"
                                >
                                    <Trash className="w-4 h-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Are you sure?</DialogTitle>
                                    <DialogDescription>
                                        This action cannot be undone. This will permanently delete the review
                                        &ldquo;{review.comment.substring(0, 50)}{review.comment.length > 50 ? '...' : ''}&rdquo; by {review.name}
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => {
                                            onDelete?.();
                                            setDeleteDialogOpen(false);
                                        }}
                                    >
                                        Delete
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}

interface ReviewsTableProps {
    reviews: ReviewSelect[];
}

export function ReviewsTable({ reviews: initialData }: ReviewsTableProps) {
    const [reviews, setReviews] = useState<ReviewSelect[]>(initialData)

    const [openSheetId, setOpenSheetId] = useState<string | null>(null)

    const handleDelete = (id: string) => {
        setReviews(reviews.filter(review => review.id !== id))
    }

    const handleEditSuccess = (id: string, updates: Partial<ReviewSelect>) => {
        setReviews(reviews.map(review => review.id === id ? { ...review, ...updates } : review))
        setOpenSheetId(null)
    }

    const handleAddSuccess = (review: ReviewSelect) => {
        setReviews([...reviews, review])
        setOpenSheetId(null)
    }

    return (
        <div className="space-y-4">
            <Drawer open={openSheetId === 'add'} onOpenChange={(open) => setOpenSheetId(open ? 'add' : null)}>
                <DrawerTrigger asChild>
                    <Button variant="outline" className="w-full py-6 cursor-pointer">
                        <Plus className="h-4 w-4" />
                    </Button>
                </DrawerTrigger>
                <DrawerContent className="p-6">
                    <DrawerHeader>
                        <DrawerTitle>Add Review</DrawerTitle>
                        <DrawerDescription>
                            Add a new Review to the list.
                        </DrawerDescription>
                    </DrawerHeader>
                    <div className="flex justify-center items-start">
                        <div className="w-full max-w-md">
                            <AddReviewForm onSuccess={handleAddSuccess} />
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>

            <div className="space-y-4">
                <AnimatePresence>
                    {reviews.map(review => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.25 }}
                            layout
                        >
                            <ReviewRow
                                review={review}
                                onDelete={() => {
                                    handleDelete(review.id)
                                    deleteReview(review.id)
                                }}
                                onEdit={(updates) => {
                                    handleEditSuccess(review.id, updates)
                                }}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    )
}