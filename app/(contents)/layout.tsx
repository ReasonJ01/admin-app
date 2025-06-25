import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TitleBar } from "@/components/layout/title-bar"

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <div className="flex h-screen w-full overflow-hidden">
                <AppSidebar />
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <TitleBar />
                    <main className="flex-1 p-2 overflow-y-auto overflow-x-hidden">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    )
}