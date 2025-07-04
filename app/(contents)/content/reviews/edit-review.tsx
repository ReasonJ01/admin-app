"use client"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { updateReview } from "@/lib/review_actions"
import { review } from "@/lib/schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

type ReviewSelect = typeof review.$inferSelect;

const formSchema = z.object({
    name: z.string().min(1, {
        message: "Name is required.",
    }),
    comment: z.string().min(1, {
        message: "Comment is required.",
    }),
    isApproved: z.boolean().optional(),
    reviewDate: z.date(),
})

interface EditReviewFormProps {
    review: ReviewSelect;
    onSuccess?: (review: ReviewSelect) => void;
}

export function EditReviewForm({ review, onSuccess }: EditReviewFormProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: review.name ?? "",
            comment: review.comment,
            isApproved: review.isApproved,
            reviewDate: review.reviewDate ?? new Date(),
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const result = await updateReview({
            ...values,
            id: review.id,
            createdAt: review.createdAt,
            updatedAt: new Date(),
            userId: review.userId,
            isApproved: values.isApproved ?? false,
            reviewDate: values.reviewDate ?? new Date(),
        })
        if (Array.isArray(result)) {
            form.reset()
            onSuccess?.(result[0])
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Reviewer Name</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="comment"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Review Comment</FormLabel>
                            <FormControl>
                                <Textarea {...field} rows={3} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="reviewDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Review Date</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-[240px] pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value ? (
                                                format(field.value, "PPP")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) =>
                                            date > new Date() || date < new Date("1900-01-01")
                                        }
                                        captionLayout="dropdown"
                                    />
                                </PopoverContent>
                            </Popover>

                            <FormMessage />
                        </FormItem>)} />

                <FormField
                    control={form.control}
                    name="isApproved"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>Is Approved</FormLabel>
                                <FormDescription>
                                    This is the review approval status. If it is approved, the review will be displayed on the website.
                                </FormDescription>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full">Update Review</Button>
            </form>
        </Form>
    )
}