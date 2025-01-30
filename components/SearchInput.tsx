"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/Input"

export function SearchInput() {
  return (
    <div className="relative w-64">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input placeholder="Search products..." className="pl-8" />
    </div>
  )
}

