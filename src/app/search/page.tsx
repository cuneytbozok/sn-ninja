"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, ExternalLink, SearchIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [answer, setAnswer] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const answerContentRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      performSearch(query);
    }
  };

  const performSearch = async (query: string) => {
    setIsLoading(true);
    
    // Mock data - would be replaced with real API call
    try {
      // In a real implementation, we would use the query parameter:
      console.log(`Searching for: ${query}`);
      // const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
      // const data = await response.json();
      // setAnswer(data.answer);
      // setResults(data.results);
      
      setTimeout(() => {
        setAnswer("ServiceNow is a cloud computing platform that automates IT business management workflows. It includes products for IT service, operations, and business management. The core of ServiceNow's platform is IT service management (ITSM), which helps organizations to consolidate and automate service relationships across the enterprise.\n\nServiceNow was founded in 2004 by Fred Luddy, who previously served as CTO at Peregrine Systems and Remedy Corporation. The company initially focused on IT service management but has since expanded into other areas like IT operations management, IT business management, customer service management, HR service delivery, and security operations.\n\nServiceNow's platform is built on a single data model and uses a common service data platform. This allows for seamless integration between different modules and applications. The platform includes features such as workflow automation, AI and machine learning capabilities, virtual agents, performance analytics, and a mobile experience.\n\nMany large enterprises use ServiceNow to manage their IT services and business workflows. The platform is highly customizable and can be tailored to meet specific organizational needs. ServiceNow also offers a developer program that allows developers to build custom applications on the Now Platform.");
        
        setResults([
          {
            title: "What is ServiceNow? | ServiceNow",
            url: "https://www.servicenow.com/what-is-servicenow.html",
            snippet: "ServiceNow is a platform that enables digital workflows to drive business growth, increase resilience, and enhance employee productivity..."
          },
          {
            title: "ServiceNow - Wikipedia",
            url: "https://en.wikipedia.org/wiki/ServiceNow",
            snippet: "ServiceNow is an American software company based in Santa Clara, California that develops a cloud computing platform to help companies manage digital workflows..."
          },
          {
            title: "ServiceNow - Overview, Products, Competitors",
            url: "https://docs.servicenow.com/bundle/tokyo-platform-administration/page/administer/overview",
            snippet: "ServiceNow is a software platform that enables organizations to manage digital workflows for enterprise operations. ServiceNow provides cloud-based solutions..."
          },
          {
            title: "ServiceNow Developer Documentation",
            url: "https://developer.servicenow.com/dev.do",
            snippet: "ServiceNow Developer documentation provides resources for building applications on the Now Platform. Find guides, API references, and more..."
          },
          {
            title: "ServiceNow Community Forums",
            url: "https://community.servicenow.com",
            snippet: "Connect with ServiceNow experts, ask questions, share ideas, and access resources to make the most of your ServiceNow implementation..."
          }
        ]);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

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
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2"
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
                        <Badge variant="outline" className="text-xs">Source</Badge>
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