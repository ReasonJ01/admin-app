'use client';

import * as React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Define the route mapping for breadcrumb labels
const routeLabels: Record<string, string> = {
    'content': 'Site Content',
    'reviews': 'Customer Reviews',
    'faqs': 'FAQs',
    'appointments': 'Appointments',
    'calendar': 'Calendar',
    'settings': 'Settings',
    'profile': 'Profile',
};

// Helper to get the label for a route segment
const getRouteLabel = (segment: string): string => {
    return routeLabels[segment] || segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export function TitleBar() {
    const pathname = usePathname();

    // Convert path segments into breadcrumb items
    const getBreadcrumbs = () => {
        const segments = pathname.split('/').filter(Boolean);

        // If we're on the root, return empty array
        if (pathname === '/') {
            return [];
        }

        return segments.map((segment, index) => {
            const href = '/' + segments.slice(0, index + 1).join('/');
            const label = getRouteLabel(segment);
            return { href, label };
        });
    };

    const breadcrumbs = getBreadcrumbs();

    // If no breadcrumbs (we're on dashboard), just show the title bar without breadcrumb
    if (breadcrumbs.length === 0) {
        return (
            <div className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4">
                <SidebarTrigger />
                <div className="h-6 w-px bg-border" />
            </div>
        );
    }

    return (
        <div className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4">
            <SidebarTrigger />
            <div className="h-6 w-px bg-border" />
            <Breadcrumb>
                <BreadcrumbList>
                    {breadcrumbs.map((crumb, index, array) => (
                        <React.Fragment key={crumb.href}>
                            <BreadcrumbItem>
                                {index === array.length - 1 ? (
                                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link href={crumb.href}>{crumb.label}</Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                            {index < array.length - 1 && <BreadcrumbSeparator />}
                        </React.Fragment>
                    ))}
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    );
} 