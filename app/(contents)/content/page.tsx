import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, HelpCircle, Image as ImageIcon, Calendar } from "lucide-react";
import Link from "next/link";

export default function ContentPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
                <p className="text-muted-foreground">
                    Manage your site&apos;s content, reviews, and frequently asked questions. If you are looking for the place to add policies, services, hours, these can be found in...
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Link href="/content/reviews">
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                Customer Reviews
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Manage and moderate customer reviews. Approve new reviews, respond to feedback, and maintain your online reputation.
                            </p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/content/faqs">
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <HelpCircle className="h-5 w-5" />
                                FAQs
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Create and manage frequently asked questions. Help customers find answers to common questions about your services.
                            </p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/content/images">
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ImageIcon className="h-5 w-5" />
                                Images
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Upload and manage images. Showcase your services and products with high-quality images.
                            </p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/content/booking-flow">
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Booking Flow
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Manage and customize your booking flow.
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}