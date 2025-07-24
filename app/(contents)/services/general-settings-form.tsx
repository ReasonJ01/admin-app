"use client";

import { FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { saveAdminConfigs } from "@/lib/actions/admin_config_actions";
import { getAdminConfigs } from "@/lib/actions/admin_config_actions";
import type { GeneralSettings } from "@/types/general-settings";
import { Dispatch, SetStateAction } from "react";

const UNIT_TO_MINUTES: Record<string, number> = {
    minutes: 1,
    hours: 60,
    days: 1440,
    weeks: 10080,
    months: 43200,
};

const formSchema = z.object({
    preBufferMinutes: z.preprocess(val => Number(val), z.number().min(0)),
    postBufferMinutes: z.preprocess(val => Number(val), z.number().min(0)),
    minBookingNotice: z.preprocess(val => Number(val), z.number().min(0)),
    minBookingNoticeUnit: z.enum(["minutes", "hours", "days", "weeks", "months"]),
    slotIntervalMinutes: z.preprocess(val => Number(val), z.number().min(0)),
    bookingWindowDays: z.preprocess(val => Number(val), z.number().min(0)),
    rollingBookingWindow: z.boolean(),
});

function toMinutes(value: number, unit: string) {
    switch (unit) {
        case "minutes": return value;
        case "hours": return value * 60;
        case "days": return value * 60 * 24;
        case "weeks": return value * 60 * 24 * 7;
        case "months": return value * 60 * 24 * 30;
        default: return value;
    }
}

export default function GeneralSettingsForm({ generalSettings, setGeneralSettings }: { generalSettings?: GeneralSettings, setGeneralSettings?: Dispatch<SetStateAction<GeneralSettings | null>> }) {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            preBufferMinutes: generalSettings?.preBufferMinutes ?? 0,
            postBufferMinutes: generalSettings?.postBufferMinutes ?? 0,
            minBookingNotice: generalSettings?.minBookingNotice ?? 2,
            minBookingNoticeUnit: generalSettings?.minBookingNoticeUnit ?? "days",
            slotIntervalMinutes: generalSettings?.slotIntervalMinutes ?? 15,
            bookingWindowDays: generalSettings?.bookingWindowDays ?? 30,
            rollingBookingWindow: generalSettings?.rollingBookingWindow ?? false,
        },
    });

    const [minBookingNoticeUnit, setMinBookingNoticeUnit] = useState<"minutes" | "hours" | "days" | "weeks" | "months">("days");
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        async function fetchAndSetConfigs() {
            const configs = await getAdminConfigs() as Record<string, unknown>;
            if (configs) {
                // Convert minBookingNotice (minutes) to the value in the selected unit
                const unitRaw = configs.minBookingNoticeUnit;
                const unit = typeof unitRaw === 'string' && ['minutes', 'hours', 'days', 'weeks', 'months'].includes(unitRaw)
                    ? unitRaw as 'minutes' | 'hours' | 'days' | 'weeks' | 'months'
                    : 'days';
                const divisor = UNIT_TO_MINUTES[unit] ?? 1;
                const minBookingNoticeRaw = configs.minBookingNotice;
                const minBookingNotice = typeof minBookingNoticeRaw === 'number'
                    ? Math.max(1, Math.floor(minBookingNoticeRaw / divisor))
                    : 1;
                form.reset({
                    ...configs,
                    minBookingNotice,
                    minBookingNoticeUnit: unit,
                });
                setMinBookingNoticeUnit(unit);
            }
        }
        fetchAndSetConfigs();
    }, [form]);

    async function onSubmit(values: z.output<typeof formSchema>) {
        try {
            const minutes = toMinutes(Number(values.minBookingNotice), values.minBookingNoticeUnit);
            const result = await saveAdminConfigs({
                ...values,
                minBookingNotice: minutes,
            });
            if (result === 'OK') {
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 2000);
                if (setGeneralSettings) {
                    setGeneralSettings({
                        ...values,
                        minBookingNotice: minutes,
                    });
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    function onInvalid(errors: Record<string, unknown>) {
        console.error('Validation errors:', errors);
    }

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="preBufferMinutes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Pre-session Buffer (minutes)</FormLabel>
                            <FormDescription>Give yourself some time to get ready before the appointment starts.</FormDescription>
                            <FormControl>
                                <Input
                                    type="number"
                                    inputMode="numeric"
                                    {...field}
                                    value={typeof field.value === 'number' && !isNaN(field.value) ? field.value : ''}
                                    onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="postBufferMinutes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Post-session Buffer (minutes)</FormLabel>
                            <FormDescription>Give yourself some time to clean up after the appointment ends, or wiggle room in case of delays.</FormDescription>
                            <FormControl>
                                <Input
                                    type="number"
                                    inputMode="numeric"
                                    {...field}
                                    value={typeof field.value === 'number' && !isNaN(field.value) ? field.value : ''}
                                    onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="minBookingNotice"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Minimum Booking Notice</FormLabel>
                            <FormDescription>
                                The minimum amount of time before the appointment starts that a client can book.
                            </FormDescription>
                            <FormControl>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        value={typeof field.value === 'number' && !isNaN(field.value) ? field.value : ''}
                                        min={1}
                                        onChange={e => {
                                            field.onChange(Number(e.target.value));
                                        }}
                                    />
                                    <select
                                        className="border rounded px-2"
                                        value={minBookingNoticeUnit}
                                        onChange={e => {
                                            const newUnit = e.target.value as typeof minBookingNoticeUnit;
                                            setMinBookingNoticeUnit(newUnit);
                                            form.setValue("minBookingNoticeUnit", newUnit);
                                        }}
                                    >
                                        <option value="minutes">minutes</option>
                                        <option value="hours">hours</option>
                                        <option value="days">days</option>
                                        <option value="weeks">weeks</option>
                                        <option value="months">months</option>
                                    </select>
                                </div>
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="slotIntervalMinutes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Slot Interval (minutes)</FormLabel>
                            <FormDescription>The interval between available start times. e.g if = 5 then a client can book at slot at 10:00, 10:05, 10:10, if = 15 then we have slots at 10:00, 10:15, 10:30.</FormDescription>
                            <FormControl>
                                <Input type="number" {...field} value={typeof field.value === 'number' && !isNaN(field.value) ? field.value : ''} />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="bookingWindowDays"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Booking Window (days)</FormLabel>
                            <FormDescription>The number of days in advance that a client can book an appointment.</FormDescription>
                            <FormControl>
                                <Input type="number" {...field} value={typeof field.value === 'number' && !isNaN(field.value) ? field.value : ''} />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="rollingBookingWindow"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Rolling Booking Window</FormLabel>
                            <FormDescription>If disabled, customers will only be able to book appointments x days in the future from the current date, if there is no availability for those days, no one else can book in.
                                <br /> If you enable the rolling booking window, there will always be x days of availailbility in the future. In other words, when one of your days becomes fully booked, another is made available.</FormDescription>
                            <Label>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                <span>Enable Rolling Booking Window</span>
                            </Label>
                        </FormItem>
                    )}
                />
                <Button type="submit" className={`w-full hover:cursor-pointer ${saveSuccess ? "bg-green-500 hover:bg-green-600" : ""}`}>{saveSuccess ? "Saved!" : "Save"}</Button>
            </form>
        </FormProvider>
    );
}