"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, ExternalLink, SearchIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { FeedbackButtons } from "@/components/ui/feedback-buttons";
import { saveSearch, saveFeedback } from "@/lib/supabase-helpers";

interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
}

function SearchPageContent() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [searchId, setSearchId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const answerContentRef = useRef<HTMLDivElement>(null);
  const initialLoadComplete = useRef(false);

  // Load query from sessionStorage on initial render
  useEffect(() => {
    // Only run this effect once
    if (initialLoadComplete.current) return;
    initialLoadComplete.current = true;
    
    // Use try-catch to handle potential sessionStorage errors
    try {
      const savedQuery = sessionStorage.getItem('lastQuery');
      if (savedQuery) {
        setQuery(savedQuery);
        performSearch(savedQuery);
      }
    } catch (error) {
      console.error("Error accessing sessionStorage:", error);
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    try {
      // Update sessionStorage with the current query
      sessionStorage.setItem('lastQuery', query);
    } catch (error) {
      // Non-critical error, can continue without storing
      console.error("Error storing in sessionStorage:", error);
    }
    
    performSearch(query);
  };

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: searchQuery,
          isLucky: false 
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Search request failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      setAnswer(data.answer);
      
      // Assign IDs to results if they don't have them
      const resultsWithIds = data.results.map((result: SearchResult, index: number) => ({
        ...result,
        id: result.id || `result-${index}`
      }));
      
      setResults(resultsWithIds);
      
      // Save search to supabase
      const mockUserId = "user-123"; // In a real app, get this from auth context
      try {
        const savedSearch = await saveSearch(mockUserId, searchQuery, data.answer);
        setSearchId(savedSearch.id);
      } catch (error) {
        console.error("Error saving search:", error);
        // Non-critical error, continue without saving
      }
    } catch (error) {
      console.error("Error searching:", error);
      toast.error("Search failed", {
        description: "There was an error processing your search. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (itemId: string | number, isHelpful: boolean) => {
    if (!searchId) {
      toast.error("Cannot save feedback", { 
        description: "Search session not properly initialized" 
      });
      return;
    }
    
    const mockUserId = "user-123"; // In a real app, get this from auth context
    const itemType = itemId === 'answer' ? 'answer' : 'result';
    
    try {
      await saveFeedback(
        mockUserId,
        searchId,
        itemId.toString(),
        itemType,
        isHelpful
      );
    } catch (error) {
      console.error("Error saving feedback:", error);
      throw error; // Let the FeedbackButtons component handle this
    }
  };

  // This effect is for future UI enhancements
  useEffect(() => {
    // Commented out to avoid ESLint warnings while preserving the intention
    // for future implementation
    /*
    if (answerContentRef.current) {
      const contentHeight = answerContentRef.current.scrollHeight;
      const containerHeight = 120; // Same as the max-h-[120px]
      const overflows = contentHeight > containerHeight;
      // We could use this to show an indicator or auto-expand if needed
    }
    */
  }, [answer]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid gap-6">
        {/* Search Bar */}
        <div className="flex w-full items-center space-x-2 mb-4">
          <form onSubmit={handleSearch} className="flex w-full">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Ask any ServiceNow question..."
                className="w-full pl-10 pr-4 h-10 bg-background border border-border/50 rounded-l-md focus-visible:ring-1 focus-visible:ring-primary"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button 
              type="submit" 
              className="rounded-l-none h-10"
              disabled={!query.trim() || isLoading}
            >
              Search
            </Button>
          </form>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-32 bg-secondary/50 rounded-xl animate-pulse"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-24 bg-secondary/30 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Ninja Answer Section */}
            {answer && (
              <Card className="border border-white/30 mb-6 overflow-hidden bg-background shadow-lg">
                <CardHeader className="bg-background py-3 border-b border-white/20">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Ninja Answer:</CardTitle>
                    <div className="flex items-center space-x-2">
                      <FeedbackButtons 
                        itemId="answer"
                        itemType="answer"
                        onFeedback={handleFeedback}
                      />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2 ml-2"
                        onClick={() => setIsExpanded(!isExpanded)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                        <span className="ml-1 text-xs">
                          {isExpanded ? "Collapse" : "Expand"}
                        </span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <ScrollArea className={isExpanded ? "max-h-[500px]" : "max-h-[120px]"}>
                  <CardContent className="pt-4" ref={answerContentRef}>
                    <p className="whitespace-pre-line">{answer}</p>
                  </CardContent>
                </ScrollArea>
              </Card>
            )}

            {/* Search Results */}
            {results.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Search Results</h2>
                
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <div key={index} className="border-b border-border/30 pb-4 last:border-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <a 
                            href={result.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center"
                          >
                            <h3 className="text-lg font-medium">{result.title}</h3>
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                          <p className="text-sm text-muted-foreground mt-1">{result.url}</p>
                        </div>
                        <div className="flex items-center">
                          <FeedbackButtons 
                            itemId={result.id}
                            itemType="result"
                            onFeedback={handleFeedback}
                          />
                          <Badge variant="outline" className="text-xs ml-2">Source</Badge>
                        </div>
                      </div>
                      <p className="mt-2 text-sm">{result.snippet}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Loading placeholder
function LoadingPlaceholder() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid gap-6">
        <div className="h-10 w-full bg-secondary/50 rounded-md animate-pulse"></div>
        <div className="h-32 bg-secondary/50 rounded-xl animate-pulse"></div>
        <div className="h-6 w-48 bg-secondary/50 rounded-md animate-pulse mt-4"></div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 bg-secondary/30 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingPlaceholder />}>
      <SearchPageContent />
    </Suspense>
  );
} 