import { Button } from "./ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, } from "./ui/drawer";
import { BookingFlowOptionForm, OptionFormValues } from "./BookingFlowOptionForm";
import React, { useEffect, useState } from "react";

type Service = { id: string; name: string };

type Option = {
    id: string;
    optionTitle: string;
    description: string | null;
    tag: string | null;
    nextQuestionId: string | null;
    services: Service[];
    order?: number;
};

type Question = {
    id: string;
    text: string;
    options: Option[];
};

type QuestionEditorProps = {
    question: Question;
    onSave: (newText: string) => void;
    onAddOption: () => void;
    addOptionOpen: boolean;
    onCloseAddOption: () => void;
    onSubmitAddOption: (values: OptionFormValues) => void;
    allServices: Service[];
    questions: { id: string; text: string }[];
    initialOptionValues: OptionFormValues;
    onEditOption: (optionId: string, values: OptionFormValues) => void;
};

export function QuestionEditor({
    question,
    onSave,
    onAddOption,
    addOptionOpen,
    onCloseAddOption,
    onSubmitAddOption,
    allServices,
    questions,
    initialOptionValues,
    onEditOption,
}: QuestionEditorProps) {
    const [editQuestionText, setEditQuestionText] = useState(question.text);
    const [editOption, setEditOption] = useState<Option | null>(null);

    useEffect(() => {
        setEditQuestionText(question.text);
    }, [question]);

    return (
        <div className="mt-8 p-4 border rounded-lg ">
            <h2 className="text-lg font-semibold mb-2">Edit Question</h2>
            <input
                type="text"
                className="w-full p-2 border rounded mb-4"
                value={editQuestionText}
                onChange={e => setEditQuestionText(e.target.value)}
                placeholder="Question text"
            />
            <Button
                className="mb-4"
                onClick={() => onSave(editQuestionText)}
                disabled={editQuestionText === question.text || !editQuestionText.trim()}
            >
                Save
            </Button>
            <h3 className="font-semibold mb-2">Add Option</h3>
            <Button className="mb-4 w-fit" onClick={onAddOption}>Add Option</Button>
            <Drawer open={addOptionOpen} onOpenChange={onCloseAddOption}>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>Add Option</DrawerTitle>
                    </DrawerHeader>
                    <BookingFlowOptionForm
                        initialValues={initialOptionValues}
                        allServices={allServices}
                        questions={questions}
                        onSubmit={onSubmitAddOption}
                        submitLabel="Add Option"
                    />
                </DrawerContent>
            </Drawer>
            <Drawer open={!!editOption} onOpenChange={() => setEditOption(null)}>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>Edit Option</DrawerTitle>
                    </DrawerHeader>
                    <div className="max-w-md mx-auto">
                        {editOption && (
                            <BookingFlowOptionForm
                                initialValues={{
                                    optionTitle: editOption.optionTitle,
                                    description: editOption.description || "",
                                    services: editOption.services.map(s => s.id),
                                    next: editOption.nextQuestionId || "__END__",
                                    tag: editOption.tag || ""
                                }}
                                allServices={allServices}
                                questions={questions}
                                onSubmit={values => {
                                    if (typeof onEditOption === 'function') onEditOption(editOption.id, values);
                                    setEditOption(null);
                                }}
                                submitLabel="Save Changes"
                            />
                        )}
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    );
} 