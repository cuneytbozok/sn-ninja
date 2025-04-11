"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";

export default function Home() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4">
      <div className="w-full max-w-2xl flex flex-col items-center space-y-10">
        <h1 className="text-4xl font-bold text-center">
          SN Ninja here to help
        </h1>
        
        <form onSubmit={handleSearch} className="w-full space-y-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Ask any ServiceNow question..."
              className="w-full pl-10 pr-4 py-6 bg-secondary border border-border/50 rounded-xl text-lg shadow-md focus-visible:ring-2 focus-visible:ring-primary"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
          
          <div className="flex justify-center space-x-4">
            <Button 
              type="submit" 
              variant="secondary"
              className="px-6 py-2"
              disabled={!query.trim()}
            >
              Search
            </Button>
            <Button 
              type="button" 
              variant="outline"
              className="px-6 py-2"
              onClick={() => {
                // This would integrate with your AI model in the future
                if (query.trim()) {
                  router.push(`/search?q=${encodeURIComponent(query)}`);
                }
              }}
              disabled={!query.trim()}
            >
              I'm Feeling Lucky
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
