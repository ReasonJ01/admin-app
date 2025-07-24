"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Service } from "./page";
import { updateService } from "@/lib/actions/service_actions";

const formSchema = z.object({
    name: z.string().min(1, { message: "Name is required." }),
    description: z.string(),
    price: z.string().regex(/^[0-9]+(\.[0-9]{1,2})?$/, { message: "Enter a valid price (e.g., 12.34)" }),
    duration: z.string().regex(/^\d*$/, { message: "Duration must be a number." }).refine(val => val === "" || parseInt(val, 10) > 0, { message: "Duration must be 1 or more." }),
    showOnWebsite: z.boolean(),
    preBufferMinutes: z.number().optional(),
    postBufferMinutes: z.number().optional(),
    overridePreBuffer: z.boolean().optional(),
    overridePostBuffer: z.boolean().optional(),
});

interface EditServiceFormProps {
    service: Service;
    generalSettings: { preBufferMinutes: number; postBufferMinutes: number };
    onSuccess?: (service: Service) => void;
}

export function EditServiceForm({ service, generalSettings, onSuccess }: EditServiceFormProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: service.name ?? "",
            description: service.description ?? "",
            price: (service.price / 100).toFixed(2),
            duration: service.duration?.toString() ?? "",
            showOnWebsite: service.showOnWebsite ?? true,
            preBufferMinutes: typeof service.preBufferMinutes === 'number' ? service.preBufferMinutes : 0,
            postBufferMinutes: typeof service.postBufferMinutes === 'number' ? service.postBufferMinutes : 0,
            overridePreBuffer: service.overridePreBuffer ?? false,
            overridePostBuffer: service.overridePostBuffer ?? false,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const priceCents = Math.round(parseFloat(values.price) * 100);
        await updateService({
            ...service,
            name: values.name,
            description: values.description,
            price: priceCents,
            duration: parseInt(values.duration, 10),
            showOnWebsite: values.showOnWebsite,
            preBufferMinutes: values.overridePreBuffer ? (values.preBufferMinutes ?? 0) : generalSettings.preBufferMinutes,
            postBufferMinutes: values.overridePostBuffer ? (values.postBufferMinutes ?? 0) : generalSettings.postBufferMinutes,
            overridePreBuffer: !!values.overridePreBuffer,
            overridePostBuffer: !!values.overridePostBuffer,
            updatedAt: new Date(),
        });
        form.reset();
        if (onSuccess) onSuccess({
            ...service,
            name: values.name,
            description: values.description,
            price: priceCents,
            duration: parseInt(values.duration, 10),
            showOnWebsite: values.showOnWebsite,
            preBufferMinutes: values.overridePreBuffer ? (values.preBufferMinutes ?? 0) : generalSettings.preBufferMinutes,
            postBufferMinutes: values.overridePostBuffer ? (values.postBufferMinutes ?? 0) : generalSettings.postBufferMinutes,
            overridePreBuffer: !!values.overridePreBuffer,
            overridePostBuffer: !!values.overridePostBuffer,
            updatedAt: new Date(),
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Service Name</FormLabel>
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
                                <Textarea {...field} rows={3} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    inputMode="decimal"
                                    pattern="^\d*(\.\d{0,2})?$"
                                    {...field}
                                    placeholder="0.00"
                                    onChange={e => {
                                        let val = e.target.value.replace(/[^\d.]/g, "");
                                        const parts = val.split('.');
                                        if (parts.length > 2) {
                                            val = parts[0] + '.' + parts.slice(1).join('');
                                        }
                                        if (val.includes('.')) {
                                            const [intPart, decPart] = val.split('.');
                                            val = intPart + '.' + decPart.slice(0, 2);
                                        }
                                        field.onChange(val);
                                    }}
                                />
                            </FormControl>
                            <FormDescription>e.g., 19.99</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Duration (minutes)</FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="^\d*$"
                                    {...field}
                                    value={field.value}
                                    onChange={e => {
                                        const val = e.target.value.replace(/\D/g, "").replace(/^0+/, "");
                                        field.onChange(val);
                                    }}
                                    placeholder="15"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="showOnWebsite"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>Show on Website</FormLabel>
                                <FormDescription>
                                    If checked, this service will be visible on the website.
                                </FormDescription>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="preBufferMinutes"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex flex-col gap-1">
                                <FormLabel>Pre-session Buffer (minutes)</FormLabel>
                                <FormField
                                    control={form.control}
                                    name="overridePreBuffer"
                                    render={({ field: overrideField }) => (
                                        <div className="flex flex-row items-center space-x-2 mb-1">
                                            <FormControl>
                                                <Checkbox
                                                    checked={overrideField.value}
                                                    onCheckedChange={checked => {
                                                        overrideField.onChange(checked);
                                                        if (!checked) {
                                                            form.setValue('preBufferMinutes', typeof service.preBufferMinutes === 'number' ? service.preBufferMinutes : 0);
                                                        }
                                                    }}
                                                />
                                            </FormControl>
                                            <FormLabel>Override default pre-session buffer</FormLabel>
                                        </div>
                                    )}
                                />
                                <FormControl>
                                    <Input
                                        type="number"
                                        inputMode="numeric"
                                        {...field}
                                        value={form.watch('overridePreBuffer') ? (field.value === undefined || field.value === null ? '' : field.value) : ''}
                                        onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                                        disabled={!form.watch('overridePreBuffer')}
                                        placeholder={generalSettings?.preBufferMinutes?.toString() ?? ''}
                                    />
                                </FormControl>
                                <FormMessage />
                            </div>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="postBufferMinutes"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex flex-col gap-1">
                                <FormLabel>Post-session Buffer (minutes)</FormLabel>
                                <FormField
                                    control={form.control}
                                    name="overridePostBuffer"
                                    render={({ field: overrideField }) => (
                                        <div className="flex flex-row items-center space-x-2 mb-1">
                                            <FormControl>
                                                <Checkbox
                                                    checked={overrideField.value}
                                                    onCheckedChange={checked => {
                                                        overrideField.onChange(checked);
                                                        if (!checked) {
                                                            form.setValue('postBufferMinutes', typeof service.postBufferMinutes === 'number' ? service.postBufferMinutes : 0);
                                                        }
                                                    }}
                                                />
                                            </FormControl>
                                            <FormLabel>Override default post-session buffer</FormLabel>
                                        </div>
                                    )}
                                />
                                <FormControl>
                                    <Input
                                        type="number"
                                        inputMode="numeric"
                                        {...field}
                                        value={form.watch('overridePostBuffer') ? (field.value === undefined || field.value === null ? '' : field.value) : ''}
                                        onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                                        disabled={!form.watch('overridePostBuffer')}
                                        placeholder={generalSettings?.postBufferMinutes?.toString() ?? ''}
                                    />
                                </FormControl>
                                <FormMessage />
                            </div>
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full">Update Service</Button>
            </form>
        </Form>
    );
}
