"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, SearchIcon } from "lucide-react";

export default function LuckyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const answerContentRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/lucky?q=${encodeURIComponent(query)}`);
      performSearch(query);
    }
  };

  const performSearch = async (query: string) => {
    setIsLoading(true);
    
    // Mock data - would be replaced with real API call
    try {
      // In a real implementation, we would use the query parameter to fetch data:
      console.log(`Fetching answer for: ${query}`);
      // const response = await fetch(`/api/search?query=${encodeURIComponent(query)}&lucky=true`);
      // const data = await response.json();
      // setAnswer(data.answer);
      
      // For now, using setTimeout to simulate API call
      setTimeout(() => {
        setAnswer("ServiceNow is a cloud computing platform that automates IT business management workflows. It includes products for IT service, operations, and business management. The core of ServiceNow's platform is IT service management (ITSM), which helps organizations to consolidate and automate service relationships across the enterprise.\n\nServiceNow was founded in 2004 by Fred Luddy, who previously served as CTO at Peregrine Systems and Remedy Corporation. The company initially focused on IT service management but has since expanded into other areas like IT operations management, IT business management, customer service management, HR service delivery, and security operations.\n\nServiceNow's platform is built on a single data model and uses a common service data platform. This allows for seamless integration between different modules and applications. The platform includes features such as workflow automation, AI and machine learning capabilities, virtual agents, performance analytics, and a mobile experience.\n\nMany large enterprises use ServiceNow to manage their IT services and business workflows. The platform is highly customizable and can be tailored to meet specific organizational needs. ServiceNow also offers a developer program that allows developers to build custom applications on the Now Platform.");
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