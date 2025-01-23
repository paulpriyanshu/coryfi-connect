"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Search, X, Clock, TrendingUp, User } from "lucide-react"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { fetchAllUsers } from "@/app/api/actions/media"

// This would typically come from your API or database
const recentSearches = ["React", "Next.js", "Tailwind CSS", "TypeScript"]
const trendingSearches = ["JavaScript", "Node.js", "GraphQL", "Docker"]

interface SearchResult {
  id: string
  email: string
  name: string
  attachments?: string[]
}

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()
  const router = useRouter()
  
  // Memoize users to prevent repeated fetching
  const [allUsers, setAllUsers] = useState([])

  // Fetch users only once when component mounts
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const resdata = await fetchAllUsers()
        setAllUsers(resdata)
      } catch (error) {
        console.error("Error fetching users:", error)
      }
    }

    if (session?.user?.email) {
      loadUsers()
    }
  }, [session])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const performSearch = useCallback((term: string) => {
    if (term.length > 0) {
      const filteredResults = allUsers.filter(
        (user) => 
          user.name.toLowerCase().includes(term.toLowerCase()) || 
          user.email.toLowerCase().includes(term.toLowerCase())
      )
      setSearchResults(filteredResults)
    } else {
      setSearchResults([])
    }
  }, [allUsers])

  const debouncedSearch = useCallback(
    debounce((term: string) => {
      if (term.length > 0 && session?.user?.email) {
        setIsLoading(true)
        try {
          performSearch(term)
        } catch (error) {
          console.error("Error searching:", error)
          setSearchResults([])
        } finally {
          setIsLoading(false)
        }
      } else {
        setSearchResults([])
      }
    }, 100), // Reduced delay to 100ms
    [performSearch, session],
  )

  useEffect(() => {
    debouncedSearch(searchTerm)
  }, [searchTerm, debouncedSearch])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setShowSuggestions(false)
  }

  const handleUserRoute = async (id) => {
    router.push(`/userProfile/${id}`)
  }

  const handleClearSearch = () => {
    setSearchTerm("")
    setShowSuggestions(false)
    setSearchResults([])
  }

  return (
    <div ref={searchRef} className="relative mb-6">
      <Card className="p-2 shadow-lg">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSearch(searchTerm)
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 md:h-4 md:w-4 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
              className="pl-9 pr-12"
            />
            {searchTerm && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-transparent"
                onClick={handleClearSearch}
              >
                <X className="h-4 w-4 text-muted-foreground" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>
          <Button type="submit" className="bg-primary">
            Search
          </Button>
        </form>
      </Card>
      {showSuggestions && (
        <Card className="absolute z-10 w-full mt-1 p-2 shadow-lg">
          <Command>
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              {isLoading ? (
                <CommandItem disabled>Loading...</CommandItem>
              ) : (
                <>
                  {searchResults.length > 0 && (
                    <CommandGroup heading="Search Results">
                      {searchResults.map((result) => (
                        <CommandItem key={result.id} onSelect={() => handleUserRoute(result.id)}>
                          <User className="mr-2 h-4 w-4" />
                          <div>
                            <div>
                              {result.name} ({result.email})
                            </div>
                            {result.attachments && result.attachments.length > 0 && (
                              <div className="text-sm text-muted-foreground">
                                Attachments: {result.attachments.join(", ")}
                              </div>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                  {searchTerm && searchResults.length === 0 && (
                    <CommandGroup heading="Suggestions">
                      <CommandItem onSelect={() => handleSearch(searchTerm)}>
                        <Search className="mr-2 h-4 w-4" />
                        Search for "{searchTerm}"
                      </CommandItem>
                    </CommandGroup>
                  )}
                  <CommandGroup heading="Recent Searches">
                    {recentSearches.map((term) => (
                      <CommandItem key={term} onSelect={() => handleSearch(term)}>
                        <Clock className="mr-2 h-4 w-4" />
                        {term}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandGroup heading="Trending Searches">
                    {trendingSearches.map((term) => (
                      <CommandItem key={term} onSelect={() => handleSearch(term)}>
                        <TrendingUp className="mr-2 h-4 w-4" />
                        {term}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </Card>
      )}
    </div>
  )
}

// Debounce function
function debounce<F extends (...args: any[]) => any>(func: F, wait: number): (...args: Parameters<F>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<F>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}