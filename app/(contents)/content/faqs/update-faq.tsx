"use client"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { updateFAQ } from "@/lib/actions"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { faq } from "@/lib/schema"

const formSchema = z.object({
    question: z.string().min(1, {
        message: "Question is required.",
    }),
    answer: z.string().min(1, {
        message: "Answer is required.",
    }),
})

interface UpdateFAQFormProps {
    faq: typeof faq.$inferSelect;
    onSuccess?: (id: string, values: z.infer<typeof formSchema>) => void;
}

export function UpdateFAQForm({ faq: faqData, onSuccess }: UpdateFAQFormProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            question: faqData.question,
            answer: faqData.answer,
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const result = await updateFAQ(faqData.id, values.question, values.answer)
        if (!result.error) {
            onSuccess?.(faqData.id, values)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="question"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Question</FormLabel>
                            <FormControl>
                                <Textarea {...field} rows={3} />
                            </FormControl>
                            <FormDescription>
                                This is the question that will be displayed to the user.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="answer"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Answer</FormLabel>
                            <FormControl>
                                <Textarea {...field} rows={3} />
                            </FormControl>
                            <FormDescription>
                                This is the answer that will be displayed to the user.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full">Update FAQ</Button>
            </form>
        </Form>
    )
} 