"use client"

import * as React from "react"
import { getCoreRowModel, useReactTable, getPaginationRowModel, RowSelectionState, ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RelativeDate } from "@/components/ui/relative-date"
import { ArrowDown, ArrowUp, Pencil, Plus, Trash } from "lucide-react"
import { UpdateFAQForm } from "./update-faq"
import { faq } from "@/lib/schema"
import { AddFAQForm } from "./add-faq"
import { motion, AnimatePresence } from "motion/react"
import { deleteFAQ, updateFAQOrder } from "@/lib/actions"

type FAQSelect = typeof faq.$inferSelect

interface FAQRowProps {
    faq: FAQSelect;
    onEdit?: (updates: Partial<FAQSelect>) => void;
    onDelete?: () => void;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
}

function FAQRow({ faq, onEdit, onDelete, onMoveUp, onMoveDown }: FAQRowProps) {
    const [open, setOpen] = React.useState(false)
    return (
        <Card key={faq.id}>
            <CardHeader>
                <CardTitle>{faq.question}</CardTitle>
                <CardAction className="flex items-center gap-4">
                    <Drawer open={open} onOpenChange={setOpen}>
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
                                    <UpdateFAQForm faq={faq} onSuccess={(id, updates) => { setOpen(false); onEdit?.(updates); }} />
                                </div>
                            </div>
                        </DrawerContent>
                    </Drawer>
                    <Button variant="outline" size="icon" onClick={() => onDelete && onDelete()}>
                        <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                </CardAction>
            </CardHeader>
            <CardContent>
                <p>{faq.answer}</p>
            </CardContent>
            {(() => {
                const date = faq.updatedAt || faq.createdAt;
                const label = faq.updatedAt ? 'Updated' : 'Created';
                return date ? (
                    <CardFooter className="flex justify-between">
                        <RelativeDate date={date} label={label} />
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={() => onMoveUp && onMoveUp()}>
                                <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => onMoveDown && onMoveDown()}>
                                <ArrowDown className="h-4 w-4" />
                            </Button>
                        </div>

                    </CardFooter>
                ) : null;
            })()}
        </Card>
    )
}

interface DataTableProps {
    columns: ColumnDef<FAQSelect, unknown>[];
    data: FAQSelect[];
}

export function DataTable({
    columns,
    data: initialData,
}: DataTableProps) {
    const [faqs, setFaqs] = React.useState<FAQSelect[]>(initialData)
    const [openSheetId, setOpenSheetId] = React.useState<string | null>(null)
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})

    const table = useReactTable({
        data: faqs,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onRowSelectionChange: setRowSelection,
        state: {
            rowSelection,
        },
    })

    const updateFAQ = (id: string, updates: Partial<FAQSelect>) => {
        setFaqs(faqs => faqs.map(faq => faq.id === id ? { ...faq, ...updates } : faq))
    }
    const addFAQ = (newFaq: FAQSelect) => {
        const maxOrder = Math.max(...faqs.map(faq => faq.order || 0), 0);
        const optimisticFaq = {
            ...newFaq,
            order: maxOrder + 1
        };

        setFaqs(faqs => [optimisticFaq, ...faqs])
    }
    const removeFAQ = (id: string) => {
        setFaqs(faqs => faqs.filter(faq => faq.id !== id))
    }

    const handleAddSuccess = (newFaq: FAQSelect) => {
        addFAQ(newFaq)
        setOpenSheetId(null)
    }

    const handleEditSuccess = (id: string, updates: Partial<FAQSelect>) => {
        updateFAQ(id, updates)
        setOpenSheetId(null)
    }

    const moveFAQ = async (id: string, direction: 'up' | 'down') => {
        const currentIndex = faqs.findIndex(faq => faq.id === id);
        if (currentIndex === -1) return;

        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (newIndex < 0 || newIndex >= faqs.length) return;

        const currentFAQ = faqs[currentIndex];
        const targetFAQ = faqs[newIndex];

        setFaqs(faqs => {
            const newFaqs = faqs.map(faq => ({ ...faq }));
            const updatedCurrentFAQ = newFaqs[currentIndex];
            const updatedTargetFAQ = newFaqs[newIndex];

            const tempOrder = updatedCurrentFAQ.order;
            updatedCurrentFAQ.order = updatedTargetFAQ.order;
            updatedTargetFAQ.order = tempOrder;

            return newFaqs.sort((a, b) => a.order - b.order);
        });

        // Send update to server
        updateFAQOrder([
            { id: currentFAQ.id, order: targetFAQ.order },
            { id: targetFAQ.id, order: currentFAQ.order }
        ]);
    }

    return (
        <div className="space-y-4 w-full">


            <div className="flex items-center justify-center w-full py-2">
                <div className="flex flex-col gap-2 w-full px-2">
                    <Drawer open={openSheetId === 'add'} onOpenChange={(open) => setOpenSheetId(open ? 'add' : null)}>
                        <DrawerTrigger asChild>
                            <Button variant="outline" className="w-full py-6 cursor-pointer">
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
                    <AnimatePresence>
                        {table.getRowModel().rows.map(row => (
                            <motion.div
                                key={row.original.id}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.25 }}
                                layout
                            >
                                <FAQRow
                                    faq={row.original}
                                    onEdit={(updates) => handleEditSuccess(row.original.id, updates)}
                                    onDelete={() => {
                                        removeFAQ(row.original.id);
                                        deleteFAQ([row.original.id]);

                                    }}
                                    onMoveUp={() => {
                                        moveFAQ(row.original.id, 'up');
                                    }}
                                    onMoveDown={() => {
                                        moveFAQ(row.original.id, 'down');
                                    }}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}