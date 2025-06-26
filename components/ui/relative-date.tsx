"use client"

import { formatDistanceToNow, format } from "date-fns"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useEffect, useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"

interface RelativeDateProps {
    date: Date
    label?: string
    className?: string
}

export function RelativeDate({ date, label, className }: RelativeDateProps) {
    const [mounted, setMounted] = useState(false)
    const [relativeTime, setRelativeTime] = useState("")
    const [fullDate, setFullDate] = useState("")
    const [showFullDate, setShowFullDate] = useState(false)
    const isMobile = useIsMobile()

    useEffect(() => {
        setMounted(true)
        setRelativeTime(formatDistanceToNow(date, { addSuffix: true }))
        setFullDate(format(date, "PPP 'at' p"))
    }, [date])

    // Show a fallback during SSR and before hydration
    if (!mounted) {
        return (
            <span className={`text-sm text-muted-foreground ${className}`}>
                {label && `${label}: `}Loading...
            </span>
        )
    }

    // On mobile, show full date on tap
    if (isMobile) {
        return (
            <button
                onClick={() => setShowFullDate(!showFullDate)}
                className={`text-sm text-muted-foreground underline decoration-dotted select-none ${className} text-left`}
            >
                {label && `${label}: `}
                {showFullDate ? fullDate : relativeTime}
            </button>
        )
    }

    // On desktop, use tooltip
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span className={`text-sm text-muted-foreground underline decoration-dotted select-none ${className}`}>
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