import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "./ui/form";
import { Input } from "./ui/input";
import { MultiSelect } from "./ui/multi-select";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { DrawerFooter } from "./ui/drawer";

export const optionSchema = z.object({
    optionTitle: z.string().min(1, { message: "Option title is required" }),
    description: z.string().optional(),
    services: z.array(z.string()), // No .min(1) so empty is allowed
    next: z.string().optional(),
    tag: z.string().optional(),
});

export type OptionFormValues = z.infer<typeof optionSchema>;

interface ServiceOption {
    id: string;
    name: string;
}
interface QuestionOption {
    id: string;
    text: string;
}

interface BookingFlowOptionFormProps {
    initialValues: OptionFormValues;
    allServices: ServiceOption[];
    questions: QuestionOption[];
    onSubmit: (values: OptionFormValues) => void;
    submitLabel?: string;
}

export function BookingFlowOptionForm({ initialValues, allServices, questions, onSubmit, submitLabel = "Save" }: BookingFlowOptionFormProps) {
    const form = useForm<OptionFormValues>({
        resolver: zodResolver(optionSchema),
        defaultValues: initialValues,
    });

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit, (errors) => {
                    console.error('Form validation errors:', errors);
                })}
                className="flex flex-col gap-2 p-4"
            >
                <FormField
                    control={form.control}
                    name="optionTitle"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Option Title</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Controller
                    control={form.control}
                    name="services"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Services</FormLabel>
                            <FormControl>
                                <MultiSelect
                                    options={allServices.map(s => ({ label: s.name, value: s.id }))}
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    placeholder="Select Services"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="next"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Next Question</FormLabel>
                            <FormControl>
                                <Select value={field.value ?? "__END__"} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Next Question" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__END__">End of Flow</SelectItem>
                                        {questions.map(q => (
                                            <SelectItem key={q.id} value={q.id}>{q.text}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="tag"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tag (optional)</FormLabel>
                            <FormDescription>
                                Add a tag to highlight this option on the booking page, such as best-seller, most popular, or new.
                            </FormDescription>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <DrawerFooter>
                    <Button type="submit">{submitLabel}</Button>
                </DrawerFooter>
            </form>
        </Form>
    );
} 