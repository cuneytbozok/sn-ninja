"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, SearchIcon } from "lucide-react";
import { toast } from "sonner";

function LuckyPageContent() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
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
          isLucky: true // This tells the API we only want the answer, no results
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Search request failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      setAnswer(data.answer);
    } catch (error) {
      console.error("Error searching:", error);
      toast.error("Search failed", {
        description: "There was an error processing your search. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid gap-6">
        {/* Back button */}
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/')}
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Button>
        </div>

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
            <div className="h-64 bg-secondary/50 rounded-xl animate-pulse"></div>
          </div>
        ) : (
          <>
            {/* Ninja Answer Section - Full Page */}
            {answer && (
              <Card className="border border-white/30 mb-6 overflow-hidden bg-background shadow-lg">
                <CardHeader className="bg-background py-3 border-b border-white/20">
                  <CardTitle className="text-lg">Ninja Answer:</CardTitle>
                </CardHeader>
                <ScrollArea className="max-h-[calc(100vh-250px)]">
                  <CardContent className="pt-4" ref={answerContentRef}>
                    <p className="whitespace-pre-line">{answer}</p>
                  </CardContent>
                </ScrollArea>
              </Card>
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
        <div className="flex items-center mb-4">
          <div className="h-10 w-32 bg-secondary/50 rounded-md animate-pulse"></div>
        </div>
        <div className="h-10 w-full bg-secondary/50 rounded-md animate-pulse"></div>
        <div className="h-64 bg-secondary/50 rounded-xl animate-pulse"></div>
      </div>
    </div>
  );
}

export default function LuckyPage() {
  return (
    <Suspense fallback={<LoadingPlaceholder />}>
      <LuckyPageContent />
    </Suspense>
  );
} 