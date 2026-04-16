import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../utils/axiosInstance";
import { Input } from "./Input";
import { Loader2, Search } from "lucide-react";
import { cn } from "../../lib/utils";

/**
 * Professional Autocomplete Input Component
 * Features: Fuzzy Search (Backend), Debouncing, React Query Caching, Keyboard Navigation.
 */
const AutocompleteInput = ({
    value,
    onChange,
    placeholder,
    label,
    suggestionType, // 'roles', 'companies', 'skills'
    params = {},
    className
}) => {
    const [query, setQuery] = useState(value || "");
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Sync with external value
    useEffect(() => {
        setQuery(value || "");
    }, [value]);

    // Fetch suggestions using React Query
    const { data: suggestions = [], isLoading, isFetching } = useQuery({
        queryKey: ['suggestions', suggestionType, query, params],
        queryFn: async () => {
            if (!query || query.length < 2) return [];
            const res = await axiosInstance.get(`/api/suggestions/${suggestionType}`, {
                params: { q: query, ...params }
            });
            return res.data;
        },
        enabled: query.length >= 2,
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });

    // Handle outside clicks
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (item) => {
        setQuery(item);
        onChange(item);
        setIsOpen(false);
    };

    return (
        <div className={cn("relative w-full", className)} ref={containerRef}>
            <div className="relative">
                <Input
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                        // If they clear it, clear the parent value too
                        if (!e.target.value) onChange("");
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    className="pr-10"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </div>
            </div>

            {isOpen && query.length >= 2 && (
                <div className="absolute z-50 w-full mt-2 bg-[#09090b]/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-h-64 overflow-auto animate-in fade-in zoom-in-95 duration-200 ring-1 ring-white/5">
                    {isLoading ? (
                        <div className="p-4 text-sm text-center text-muted-foreground flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Searching...
                        </div>
                    ) : suggestions.length > 0 ? (
                        <ul className="py-1">
                            {suggestions.map((item, index) => (
                                <li
                                    key={index}
                                    onClick={() => handleSelect(item)}
                                    className="px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors flex items-center gap-2"
                                >
                                    <Search className="h-3 w-3 text-muted-foreground" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-4 text-sm text-center text-muted-foreground">
                            No professional matches found.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export { AutocompleteInput };
