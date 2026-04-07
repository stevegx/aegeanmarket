import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
} from '@/components/ui/sidebar'
import FilterList from './filterList'

export default async function FilterSideBar() {
  return (
    <Sidebar
      variant="sidebar"
      collapsible="offcanvas"
      className="sticky top-16 border-r z-40 h-[calc(100vh-64px)]"
    >
      <SidebarHeader>
        <h3 className="p-4 font-bold text-lg tracking-tight">Filters</h3>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <FilterList />
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
