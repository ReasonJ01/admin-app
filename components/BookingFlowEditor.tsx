"use client"
import { getBookingFlowQuestionsWithOptions } from "@/lib/actions/booking_flow_actions";
import { bookingFlowQuestion, bookingFlowOption, service } from "@/lib/schema";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { deleteBookingFlowQuestion } from "@/lib/actions/booking_flow_actions";
import { createBookingFlowQuestion } from "@/lib/actions/booking_flow_actions";
import { updateBookingFlowQuestion } from "@/lib/actions/booking_flow_actions";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer";
import { BookingFlowOptionForm, OptionFormValues } from "./BookingFlowOptionForm";
import { createBookingFlowOption, updateBookingFlowOption, deleteBookingFlowOption } from "@/lib/actions/booking_flow_actions";
import { Badge } from "./ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { getServices } from "@/lib/actions/service_actions";


type BookingFlowQuestion = typeof bookingFlowQuestion.$inferSelect;
type BookingFlowOption = typeof bookingFlowOption.$inferSelect;
type Service = typeof service.$inferSelect;
type BookingFlowOptionWithServices = BookingFlowOption & { services: Service[] };
type BookingFlowQuestionWithOptions = BookingFlowQuestion & { options: BookingFlowOptionWithServices[] };

export default function BookingFlowEditor() {
    const [questions, setQuestions] = useState<BookingFlowQuestionWithOptions[]>([]);
    const [allServices, setAllServices] = useState<Service[]>([]);
    const [addOptionOpen, setAddOptionOpen] = useState<string | null>(null); // Track which question is adding an option
    const [editOptionOpen, setEditOptionOpen] = useState<{ questionId: string; optionId: string } | null>(null); // Track which option is being edited
    const [editingQuestion, setEditingQuestion] = useState<string | null>(null); // Track which question is being edited
    const [editQuestionText, setEditQuestionText] = useState("");
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [questionToDelete, setQuestionToDelete] = useState<BookingFlowQuestionWithOptions | null>(null);
    const [deleteOptionModalOpen, setDeleteOptionModalOpen] = useState(false);
    const [optionToDelete, setOptionToDelete] = useState<{ questionId: string; optionId: string; optionTitle: string } | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        getBookingFlowQuestionsWithOptions().then(setQuestions);
        getServices().then(setAllServices);
    }, []);

    const handleAddQuestion = async () => {
        setIsCreating(true);
        const nextOrder = questions.length > 0 ? Math.max(...questions.map(q => q.order)) + 1 : 1;
        const newId = crypto.randomUUID();
        await createBookingFlowQuestion({ id: newId, text: "New Question", order: nextOrder });
        const updatedQuestions = await getBookingFlowQuestionsWithOptions();
        setQuestions(updatedQuestions);
        setIsCreating(false);
    };

    // Handler for opening add option drawer for a specific question
    const handleOpenAddOption = (questionId: string) => setAddOptionOpen(questionId);
    const handleCloseAddOption = () => setAddOptionOpen(null);

    // Handler for opening edit option drawer
    const handleOpenEditOption = (questionId: string, optionId: string) => setEditOptionOpen({ questionId, optionId });
    const handleCloseEditOption = () => setEditOptionOpen(null);

    // Handler for submitting edit option form
    const handleEditOptionSubmit = async (values: OptionFormValues) => {
        if (!editOptionOpen) return;
        await updateBookingFlowOption(editOptionOpen.optionId, {
            optionTitle: values.optionTitle,
            description: values.description,
            nextQuestionId: values.next === "__END__" ? undefined : values.next,
            tag: values.tag,
            services: values.services,
        });
        setEditOptionOpen(null);
        // Refresh questions
        const updatedQuestions = await getBookingFlowQuestionsWithOptions();
        setQuestions(updatedQuestions);
    };

    // Handler for starting to edit a question
    const handleStartEditQuestion = (question: BookingFlowQuestionWithOptions) => {
        setEditingQuestion(question.id);
        setEditQuestionText(question.text);
    };

    // Handler for saving question text
    const handleSaveQuestionText = async () => {
        if (!editingQuestion || !editQuestionText.trim()) return;
        await updateBookingFlowQuestion(editingQuestion, { text: editQuestionText });
        setEditingQuestion(null);
        setEditQuestionText("");
        // Refresh questions
        const updatedQuestions = await getBookingFlowQuestionsWithOptions();
        setQuestions(updatedQuestions);
    };

    // Handler for canceling question edit
    const handleCancelEditQuestion = () => {
        setEditingQuestion(null);
        setEditQuestionText("");
    };

    // Handler for submitting add option form
    const handleAddOptionSubmit = async (values: OptionFormValues) => {
        if (!addOptionOpen) return;
        await createBookingFlowOption({
            id: crypto.randomUUID(),
            questionId: addOptionOpen,
            optionTitle: values.optionTitle,
            description: values.description,
            nextQuestionId: values.next === "__END__" ? undefined : values.next,
            tag: values.tag,
        });
        setAddOptionOpen(null);
        // Refresh questions
        const updatedQuestions = await getBookingFlowQuestionsWithOptions();
        setQuestions(updatedQuestions);
    };

    // Handler for delete question
    const handleDeleteQuestion = async () => {
        if (questionToDelete) {
            await deleteBookingFlowQuestion(questionToDelete.id);
            setDeleteModalOpen(false);
            setQuestionToDelete(null);
            // Refresh questions
            getBookingFlowQuestionsWithOptions().then(setQuestions);
        }
    };

    // Handler for delete option
    const handleDeleteOption = async () => {
        if (!optionToDelete) return;
        await deleteBookingFlowOption(optionToDelete.optionId);
        setDeleteOptionModalOpen(false);
        setOptionToDelete(null);
        // Refresh questions
        const updatedQuestions = await getBookingFlowQuestionsWithOptions();
        setQuestions(updatedQuestions);
    };

    // Handler for scrolling to a question
    const scrollToQuestion = (questionId: string) => {
        const element = document.getElementById(`question-${questionId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    return (
        <div>
            <div className="flex flex-col gap-4">
                <Button className="w-full py-8 shadow-lg" onClick={handleAddQuestion} disabled={isCreating}>
                    {isCreating ? "Creating..." : "Add Question"}
                </Button>
                {[...questions].sort((a, b) => a.order - b.order).map((question) => (
                    <Card key={question.id} id={`question-${question.id}`}>
                        {question.id === 'start' && (
                            <Badge className="bg-green-600 text-white mx-4">Start</Badge>
                        )}
                        <CardHeader className="flex flex-row gap-4">

                            {editingQuestion === question.id ? (
                                <div className="flex-1 flex gap-2 items-center">
                                    <input
                                        type="text"
                                        className="flex-1 p-2 border rounded font-semibold"
                                        value={editQuestionText}
                                        onChange={(e) => setEditQuestionText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSaveQuestionText();
                                            if (e.key === 'Escape') handleCancelEditQuestion();
                                        }}
                                        autoFocus
                                    />
                                    <Button size="sm" onClick={handleSaveQuestionText}>Save</Button>
                                    <Button size="sm" variant="outline" onClick={handleCancelEditQuestion}>Cancel</Button>
                                </div>
                            ) : (
                                <>
                                    <CardTitle className="flex-1">{question.text}</CardTitle>
                                    <Button size="sm" variant="outline" onClick={() => handleStartEditQuestion(question)}>
                                        <Pencil className="w-4 h-4 mr-1" /> Edit
                                    </Button>
                                    {question.id !== 'start' && (
                                        <Button size="sm" variant="destructive" onClick={() => { setQuestionToDelete(question); setDeleteModalOpen(true); }}>
                                            Delete
                                        </Button>
                                    )}
                                </>
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-sm font-semibold">Options:</p>
                                <Button size="sm" onClick={() => handleOpenAddOption(question.id)}>
                                    Add Option
                                </Button>
                            </div>
                            <div className="flex flex-col gap-2">
                                {question.options
                                    .slice()
                                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                                    .map((option) => (
                                        <div key={option.id} className="border p-3 rounded-lg border-l-4 border-l-accent">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <p className="font-medium font-semibold text-lg">{option.optionTitle}</p>
                                                    {option.description && (
                                                        <p className="text text-gray-600">{option.description}</p>
                                                    )}
                                                    {option.services && option.services.length > 0 && (
                                                        <div className="mt-2 flex flex-wrap gap-1">
                                                            {option.services.map((service) => (
                                                                <Badge key={service.id} variant="outline" className="font-semibold text-xs">
                                                                    {service.name}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {option.tag && (
                                                        <div className="mt-2">
                                                            <Badge variant="default" className="text-xs bg-purple-100 text-purple-800">
                                                                Tag: {option.tag}
                                                            </Badge>
                                                        </div>
                                                    )}
                                                    <div className="mt-2">
                                                        <Badge
                                                            variant={option.nextQuestionId ? "secondary" : "destructive"}
                                                            className={`text-xs ${option.nextQuestionId ? "bg-blue-100 text-blue-800 cursor-pointer text-decoration-line underline hover:bg-blue-200 border border-blue-300 hover:border-blue-400 transition-colors" : "bg-orange-100 text-orange-800"}`}
                                                            onClick={option.nextQuestionId ? () => scrollToQuestion(option.nextQuestionId!) : undefined}
                                                        >
                                                            {option.nextQuestionId ? (() => {
                                                                const nextQuestion = questions.find(q => q.id === option.nextQuestionId);
                                                                const displayText = nextQuestion ? nextQuestion.text : option.nextQuestionId;
                                                                return `Next: ${displayText.length > 20 ? displayText.substring(0, 20) + '...' : displayText}`;
                                                            })() : "End of Flow"}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => handleOpenEditOption(question.id, option.id)}>
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button size="sm" variant="outline" onClick={() => {
                                                        setOptionToDelete({ questionId: question.id, optionId: option.id, optionTitle: option.optionTitle });
                                                        setDeleteOptionModalOpen(true);
                                                    }}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            {/* Add Option Drawer */}
            <Drawer open={!!addOptionOpen} onOpenChange={handleCloseAddOption}>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>Add Option</DrawerTitle>
                    </DrawerHeader>
                    <div className="max-w-md mx-auto">
                        <BookingFlowOptionForm
                            initialValues={{ optionTitle: "", description: "", services: [], next: "__END__", tag: "" }}
                            allServices={allServices}
                            questions={questions.map(q => ({ id: q.id, text: q.text }))}
                            onSubmit={handleAddOptionSubmit}
                            submitLabel="Add Option"
                        />
                    </div>
                </DrawerContent>
            </Drawer>
            {/* Edit Option Drawer */}
            <Drawer open={!!editOptionOpen} onOpenChange={handleCloseEditOption}>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>Edit Option</DrawerTitle>
                    </DrawerHeader>
                    <div className="max-w-md mx-auto">
                        {editOptionOpen && (() => {
                            const question = questions.find(q => q.id === editOptionOpen.questionId);
                            const option = question?.options.find(o => o.id === editOptionOpen.optionId);
                            return option ? (
                                <BookingFlowOptionForm
                                    initialValues={{
                                        optionTitle: option.optionTitle,
                                        description: option.description || "",
                                        services: option.services.map(s => s.id),
                                        next: option.nextQuestionId || "__END__",
                                        tag: option.tag || ""
                                    }}
                                    allServices={allServices}
                                    questions={questions.map(q => ({ id: q.id, text: q.text }))}
                                    onSubmit={handleEditOptionSubmit}
                                    submitLabel="Save Changes"
                                />
                            ) : null;
                        })()}
                    </div>
                </DrawerContent>
            </Drawer>
            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Question</DialogTitle>
                    </DialogHeader>
                    <p>Are you sure you want to delete this question? This action cannot be undone.</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteQuestion}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={deleteOptionModalOpen} onOpenChange={setDeleteOptionModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Option</DialogTitle>
                    </DialogHeader>
                    <p>Are you sure you want to delete the option&quot;{optionToDelete?.optionTitle}&quot;? This action cannot be undone.</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteOptionModalOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteOption}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}