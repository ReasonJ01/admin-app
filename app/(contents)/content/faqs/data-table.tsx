"use client"

import * as React from "react"
import {
    ColumnDef,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    RowSelectionState,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RelativeDate } from "@/components/ui/relative-date"
import { Pencil, Trash } from "lucide-react"
import { UpdateFAQForm } from "./update-faq"
import { faq } from "@/lib/schema"
import { useRouter } from "next/navigation"

type FAQSelect = typeof faq.$inferSelect

interface DataTableProps<TData extends FAQSelect, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

export function DataTable<TData extends FAQSelect, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
    const [openSheetId, setOpenSheetId] = React.useState<string | null>(null)
    const router = useRouter()

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onRowSelectionChange: setRowSelection,
        state: {
            rowSelection,
        },
    })

    const handleUpdateSuccess = () => {
        setOpenSheetId(null)
        // Refresh the page data
        router.refresh()
    }

    return (
        <div className="space-y-4 w-full">
            <div className="flex items-center justify-center w-full py-2">
                <div className="flex flex-col gap-2 w-full px-2">
                    {
                        table.getRowModel().rows.map((row) => (
                            <Card key={row.id}>
                                <CardHeader>
                                    <CardTitle>
                                        {row.original.question}
                                    </CardTitle>
                                    <CardAction className="flex items-center gap-4">
                                        <Sheet open={openSheetId === row.id} onOpenChange={(open) => setOpenSheetId(open ? row.id : null)}>
                                            <SheetTrigger asChild>
                                                <Button variant="outline" size="icon">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </SheetTrigger>
                                            <SheetContent side="bottom" className="h-[80vh]">
                                                <SheetHeader>
                                                    <SheetTitle>Edit FAQ</SheetTitle>
                                                    <SheetDescription>
                                                        Update the question and answer for this FAQ.
                                                    </SheetDescription>
                                                </SheetHeader>
                                                <div className="mt-6 px-2">
                                                    <UpdateFAQForm faq={row.original} onSuccess={handleUpdateSuccess} />
                                                </div>
                                            </SheetContent>
                                        </Sheet>
                                        <Button variant="outline" size="icon">
                                            <Trash className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </CardAction>
                                </CardHeader>
                                <CardContent>
                                    <p>{row.original.answer}</p>
                                </CardContent>
                                {
                                    (() => {
                                        const date = row.original.updatedAt || row.original.createdAt;
                                        const label = row.original.updatedAt ? 'Updated' : 'Created';

                                        return date ? (
                                            <CardFooter>
                                                <RelativeDate date={date} label={label} />
                                            </CardFooter>
                                        ) : null;
                                    })()
                                }
                            </Card>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}