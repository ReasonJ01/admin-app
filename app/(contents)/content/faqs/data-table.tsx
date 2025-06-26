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
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RelativeDate } from "@/components/ui/relative-date"
import { Pencil, Plus, Trash } from "lucide-react"
import { UpdateFAQForm } from "./update-faq"
import { faq } from "@/lib/schema"
import { useRouter } from "next/navigation"
import { AddFAQForm } from "./add-faq"

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

    const handleAddSuccess = () => {
        setOpenSheetId(null)
        // Refresh the page data
        router.refresh()
    }

    return (
        <div className="space-y-4 w-full">
            <div className="flex items-center justify-center w-full py-2">
                <div className="flex flex-col gap-2 w-full px-2">
                    <Drawer open={openSheetId === 'add'} onOpenChange={(open) => setOpenSheetId(open ? 'add' : null)}>
                        <DrawerTrigger asChild>
                            <Button variant="outline" size="icon" className="w-full py-6 cursor-pointer">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </DrawerTrigger>
                        <DrawerContent className="p-6">
                            <DrawerHeader>
                                <DrawerTitle>Add FAQ</DrawerTitle>
                                <DrawerDescription>
                                    Add a new FAQ to the list.
                                </DrawerDescription>
                            </DrawerHeader>
                            <div className="flex justify-center items-start">
                                <div className="w-full max-w-md">
                                    <AddFAQForm onSuccess={handleAddSuccess} />
                                </div>
                            </div>
                        </DrawerContent>
                    </Drawer>


                    {
                        table.getRowModel().rows.map((row) => (
                            <Card key={row.id}>
                                <CardHeader>
                                    <CardTitle>
                                        {row.original.question}
                                    </CardTitle>
                                    <CardAction className="flex items-center gap-4">
                                        <Drawer open={openSheetId === row.id} onOpenChange={(open) => setOpenSheetId(open ? row.id : null)}>
                                            <DrawerTrigger asChild>
                                                <Button variant="outline" size="icon">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </DrawerTrigger>
                                            <DrawerContent className="p-6">
                                                <DrawerHeader>
                                                    <DrawerTitle>Edit FAQ</DrawerTitle>
                                                    <DrawerDescription>
                                                        Update the question and answer for this FAQ.
                                                    </DrawerDescription>
                                                </DrawerHeader>
                                                <div className="flex justify-center items-start">
                                                    <div className="w-full max-w-md">
                                                        <UpdateFAQForm faq={row.original} onSuccess={handleUpdateSuccess} />
                                                    </div>
                                                </div>
                                            </DrawerContent>
                                        </Drawer>
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