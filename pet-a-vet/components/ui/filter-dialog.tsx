"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, RefreshCw } from "lucide-react"

interface FilterOption {
  id: string
  label: string
  value: string
}

interface FilterGroup {
  id: string
  label: string
  type: "multi-select" | "single-select" | "date-range"
  options?: FilterOption[]
  value: string[] | string
}

interface SortOption {
  id: string
  label: string
}

interface FilterDialogProps {
  filterGroups: FilterGroup[]
  sortOptions: SortOption[]
  onFilterChange: (filters: FilterGroup[]) => void
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void
  onReset: () => void
  buttonLabel?: string
}

export function FilterDialog({
  filterGroups,
  sortOptions,
  onFilterChange,
  onSortChange,
  onReset,
  buttonLabel = "Filter",
}: FilterDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState<FilterGroup[]>(filterGroups)
  const [sortBy, setSortBy] = useState<string>(sortOptions[0]?.id || "defaultSort")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const handleMultiSelectChange = (groupId: string, optionId: string) => {
    setLocalFilters((prev) =>
      prev.map((group) => {
        if (group.id === groupId) {
          const currentValues = group.value as string[]
          const newValues = currentValues.includes(optionId)
            ? currentValues.filter((id) => id !== optionId)
            : [...currentValues, optionId]
          return { ...group, value: newValues }
        }
        return group
      }),
    )
  }

  const handleSingleSelectChange = (groupId: string, value: string) => {
    setLocalFilters((prev) =>
      prev.map((group) => {
        if (group.id === groupId) {
          return { ...group, value }
        }
        return group
      }),
    )
  }

  const handleApplyFilters = () => {
    onFilterChange(localFilters)
    onSortChange(sortBy, sortOrder)
    setIsOpen(false)
  }

  const handleReset = () => {
    onReset()
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          {buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filter and Sort</DialogTitle>
          <DialogDescription>Select criteria to filter and sort the list.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {localFilters.map((group) => (
            <div key={group.id} className="space-y-2">
              <Label>{group.label}</Label>

              {group.type === "multi-select" && group.options && (
                <div className="flex flex-wrap gap-2">
                  {group.options.map((option) => (
                    <Badge
                      key={option.id}
                      variant={(group.value as string[]).includes(option.id) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleMultiSelectChange(group.id, option.id)}
                    >
                      {option.label}
                    </Badge>
                  ))}
                </div>
              )}

              {group.type === "single-select" && group.options && (
                <Select
                  value={group.value as string}
                  onValueChange={(value) => handleSingleSelectChange(group.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${group.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any {group.label.toLowerCase()}</SelectItem>
                    {group.options.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}

          <div className="space-y-2">
            <Label>Sort By</Label>
            <div className="flex items-center space-x-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select field to sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleReset} type="button">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApplyFilters}>Apply</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
