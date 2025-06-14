import { AppSidebar } from '@/components/app-sidebar'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import LogoutButton from '@/components/logout-button'

export const Route = createFileRoute('/_auth/admin')({
  component: RouteComponent,
})

function RouteComponent() {
  // return <div>Hello "/admin"!</div>
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset >
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px]">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm">View Profile</Button>
            <LogoutButton />
          </div>
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
