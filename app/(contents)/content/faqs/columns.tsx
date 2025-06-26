"use client"
import { faq } from "@/lib/schema"
import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"

type FAQSelect = typeof faq.$inferSelect

export const columns: ColumnDef<FAQSelect>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                className="my-2"
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                className="my-2"
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
    },
    {
        accessorKey: "question",
        header: "Question",
        cell: ({ row }) => (
            <div className="line-clamp-2 sm:line-clamp-3">
                {row.getValue("question")}
            </div>
        ),
    },
    {
        accessorKey: "answer",
        header: "Answer",
        cell: ({ row }) => (
            <div className="line-clamp-2 sm:line-clamp-3 text-muted-foreground">
                {row.getValue("answer")}
            </div>
        ),
    },
]