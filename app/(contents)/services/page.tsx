"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { CheckCircle2, Plus, Settings, XCircle } from "lucide-react";
import { AddServiceForm } from "./add-service";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import GeneralSettingsForm from "./general-settings-form";
import { getAdminConfigs } from "@/lib/actions/admin_config_actions";
import type { GeneralSettings } from "@/types/general-settings";
import { getServices } from "@/lib/actions/service_actions";
import { service } from "@/lib/schema";
import { EditServiceForm } from "./edit-service";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";

export type Service = typeof service.$inferSelect & {
    overridePreBuffer?: boolean;
    overridePostBuffer?: boolean;
};
export default function ServicesPage() {
    const [generalSettings, setGeneralSettings] = useState<GeneralSettings | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editService, setEditService] = useState<Service | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);

    useEffect(() => {
        getAdminConfigs().then((settings) => setGeneralSettings(settings as GeneralSettings));
        getServices().then(setServices);
    }, []);

    if (!generalSettings) return <div>Loading...</div>;

    function formatDuration(minutes: number): string {
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        let result = '';
        if (hrs > 0) result += `${hrs} hr${hrs > 1 ? 's' : ''}`;
        if (hrs > 0 && mins > 0) result += ' ';
        if (mins > 0) result += `${mins} min${mins > 1 ? 's' : ''}`;
        if (result === '') result = '0 min';
        return result;
    }

    async function handleDelete(id: string) {
        setServices(prev => prev.filter(service => service.id !== id));
        await fetch("/api/services", {
            method: "DELETE",
            body: JSON.stringify({ id })
        });
        setDeleteDialogOpen(null);
    }

    async function refetchServices() {
        const updated = await getServices();
        setServices(updated);
    }

    return (
        <div className="space-y-4">
            {/* Add Service Drawer */}
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                <DrawerTrigger asChild>
                    <Button variant="default" className="w-full py-8 cursor-pointer font-semibold text-lg shadow-lg">
                        <Plus className="h-6 w-6 mr-2" />
                        Add New Service
                    </Button>
                </DrawerTrigger>
                <DrawerContent className="p-6">
                    <DrawerHeader>
                        <DrawerTitle>Add Service</DrawerTitle>
                        <DrawerDescription>
                            Add a new Service to the list.
                        </DrawerDescription>
                    </DrawerHeader>
                    <div className="flex justify-center items-start">
                        <div className="w-full max-w-md">
                            <AddServiceForm generalSettings={generalSettings} onSuccess={() => { setDrawerOpen(false); refetchServices(); }} />
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>

            {/* Edit Service Drawer */}
            <Drawer open={!!editService} onOpenChange={open => { if (!open) setEditService(null); }}>
                <DrawerContent className="p-6">
                    <DrawerHeader>
                        <DrawerTitle>Edit Service</DrawerTitle>
                        <DrawerDescription>
                            Edit the details of this service.
                        </DrawerDescription>
                    </DrawerHeader>
                    <div className="flex justify-center items-start">
                        <div className="w-full max-w-md">
                            {editService && (
                                <EditServiceForm service={editService} generalSettings={generalSettings} onSuccess={() => { setEditService(null); refetchServices(); }} />
                            )}
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>

            <Card className="mb-6 p-6">
                <Accordion type="single" collapsible>
                    <AccordionItem value="config">
                        <AccordionTrigger className="text-md font-semibold p-0 hover:cursor-pointer"><p className="flex items-center gap-2">General Service Settings<Settings className="h-4 w-4" /></p></AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-4 pt-4">
                                <GeneralSettingsForm generalSettings={generalSettings} setGeneralSettings={setGeneralSettings} />
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </Card>
            <div className="flex flex-col gap-4">
                {services.map((service) => {
                    const enabled = service.showOnWebsite;
                    return (
                        <Card
                            key={service.id}
                            className={`border-2 ${enabled ? 'border-green-500 bg-green-50' : 'border-orange-400 bg-orange-50'} shadow-sm rounded-lg`}
                        >
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="py-0">{service.name}</CardTitle>
                                    {enabled ? (
                                        <CheckCircle2 className="text-green-500" />
                                    ) : (
                                        <XCircle className="text-orange-400" />
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="gap-0">
                                <div className="space-y-2">
                                    <p className="text-gray-600">{service.description}</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <p className="text-gray-500">Price</p>
                                            <p >{service.price / 100}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Duration</p>
                                            <p >{formatDuration(service.duration)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Pre-session Buffer</p>
                                            <p >{service.overridePreBuffer ? formatDuration(service.preBufferMinutes ?? 0) : formatDuration(generalSettings.preBufferMinutes)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Post-session Buffer</p>
                                            <p >{service.overridePostBuffer ? formatDuration(service.postBufferMinutes ?? 0) : formatDuration(generalSettings.postBufferMinutes)}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-start gap-2">
                                <Button variant="outline" onClick={() => setEditService(service)}>Edit</Button>
                                <Dialog open={deleteDialogOpen === service.id} onOpenChange={open => setDeleteDialogOpen(open ? service.id : null)}>
                                    <DialogTrigger asChild>
                                        <Button variant="destructive"><Trash2 className="w-4 h-4 mr-2" />Delete</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Delete Service?</DialogTitle>
                                            <DialogDescription>
                                                Are you sure you want to delete the service &quot;{service.name}&quot;? This action cannot be undone.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setDeleteDialogOpen(null)}>Cancel</Button>
                                            <Button variant="destructive" onClick={() => handleDelete(service.id)}>Delete</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        </div>
    )
}