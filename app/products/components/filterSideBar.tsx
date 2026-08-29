import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
} from '@/components/ui/sidebar'
import FilterList from './filterList'
import FilterActiveBar from './FilterActiveBar'
import ShowResultsButton from './ShowResultsButton'

export default async function FilterSideBar() {
  return (
    <Sidebar
      variant="sidebar"
      collapsible="offcanvas"
      className="sticky top-16 border-r z-40 h-[calc(100vh-64px)]"
    >
      <SidebarHeader className="gap-3 border-b p-0">
        <h3 className="px-4 pt-4 text-lg font-bold tracking-tight">Filters</h3>
        <FilterActiveBar />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <FilterList />
        </SidebarGroup>
      </SidebarContent>
      <ShowResultsButton />
    </Sidebar>
  )
}
