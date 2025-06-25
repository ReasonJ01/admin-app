"use client"
import { faq } from "@/lib/schema"
import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { UpdateFAQForm } from "./update-faq"
import { useIsMobile } from "@/hooks/use-mobile"
import { useState } from "react"

type FAQSelect = typeof faq.$inferSelect

function ActionsCell({ faq }: { faq: FAQSelect }) {
    const [open, setOpen] = useState(false)
    const isMobile = useIsMobile()

    const handleSuccess = () => {
        setOpen(false)
    }

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                    </Button>
                </DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>Edit FAQ</DrawerTitle>
                        <DrawerDescription>
                            Update the FAQ details below.
                        </DrawerDescription>
                    </DrawerHeader>
                    <div className="p-4">
                        <UpdateFAQForm faq={faq} onSuccess={handleSuccess} />
                    </div>
                </DrawerContent>
            </Drawer>
        )
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Edit FAQ</SheetTitle>
                    <SheetDescription>
                        Update the FAQ details below.
                    </SheetDescription>
                </SheetHeader>
                <div className="p-4">
                    <UpdateFAQForm faq={faq} onSuccess={handleSuccess} />
                </div>
            </SheetContent>
        </Sheet>
    )
}

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
        id: "actions",
        cell: ({ row }) => <ActionsCell faq={row.original} />,
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