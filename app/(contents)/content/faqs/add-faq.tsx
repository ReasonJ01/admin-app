"use client"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { addFAQ } from "@/lib/actions"
import { faq } from "@/lib/schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

type FAQSelect = typeof faq.$inferSelect;


const formSchema = z.object({
    question: z.string().min(1, {
        message: "Question is required.",
    }),
    answer: z.string().min(1, {
        message: "Answer is required.",
    }),
})

interface AddFAQFormProps {
    onSuccess?: (faq: FAQSelect) => void;
}

export function AddFAQForm({ onSuccess }: AddFAQFormProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            question: "",
            answer: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {

        const result = await addFAQ(values.question, values.answer)
        if (!result.error) {
            form.reset()
            onSuccess?.(result.newFAQ?.[0] as FAQSelect)
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
                                This is the answer that will be displayed to the user. You can add links in the answer using the following format: [link text](url).
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full">Add FAQ</Button>
            </form>
        </Form>
    )
}