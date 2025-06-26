"use client"

import { formatDistanceToNow, format } from "date-fns"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface RelativeDateProps {
    date: Date
    label?: string
    className?: string
}

export function RelativeDate({ date, label, className }: RelativeDateProps) {
    const relativeTime = formatDistanceToNow(date, { addSuffix: true })
    const fullDate = format(date, "PPP 'at' p")

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span className={`text-sm text-muted-foreground underline decoration-dotted ${className}`}>
                        {label && `${label}: `}{relativeTime}
                    </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                    <p className="text-xs">{fullDate}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
} 