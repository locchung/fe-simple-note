import { debounce } from 'lodash';
import React, { useState, useEffect, useCallback } from 'react'

interface SearchComponentProps {
  onSearch: (query: string) => void;
  loading?: boolean;
}

const SearchComponent: React.FC<SearchComponentProps> = ({ onSearch, loading }) => {
  const [query, setQuery] = useState('')

  // Debounce search to prevent too many API calls
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      onSearch(searchQuery)
    }, 500),
    []
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    debouncedSearch(value)
  }

  return (
    <div className="search-component relative">
      <div className="flex items-center">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search notes..."
          className="border p-2 rounded w-full pr-8"
        />
        {loading && (
          <div className="absolute right-3">
            <div className="animate-spin h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full" />
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchComponent
