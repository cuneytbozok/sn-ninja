"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SavedSearch, getUserSearchHistory, getHelpfulSearches } from "@/lib/supabase-helpers";
import { CalendarIcon, SearchIcon, ThumbsUp, ChevronDown, ChevronUp } from "lucide-react";

export default function SavedSearchesPage() {
  const router = useRouter();
  const [searchHistory, setSearchHistory] = useState<SavedSearch[]>([]);
  const [helpfulSearches, setHelpfulSearches] = useState<SavedSearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState("");
  const [expandedAnswers, setExpandedAnswers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const mockUserId = "user-123"; // In a real app, get this from auth context
        const history = await getUserSearchHistory(mockUserId);
        const helpful = await getHelpfulSearches(mockUserId);
        
        setSearchHistory(history);
        setHelpfulSearches(helpful);
      } catch (error) {
        console.error("Error loading search history:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const toggleAnswerExpansion = (searchId: string) => {
    setExpandedAnswers(prev => ({
      ...prev,
      [searchId]: !prev[searchId]
    }));
  };

  const filteredHistory = searchHistory.filter(search => 
    search.query.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const filteredHelpful = helpfulSearches.filter(search => 
    search.query.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const runSearch = (query: string) => {
    // Store the query in sessionStorage so the search page can pick it up
    sessionStorage.setItem('lastQuery', query);
    router.push('/search');
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Your Saved Searches</h1>
      
      <div className="mb-6">
        <Input
          placeholder="Filter searches..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="max-w-md"
        />
      </div>
      
      <Tabs defaultValue="helpful" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="helpful">Helpful Answers</TabsTrigger>
          <TabsTrigger value="all">All Searches</TabsTrigger>
        </TabsList>
        
        <TabsContent value="helpful" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Helpful Answers</CardTitle>
              <CardDescription>
                Searches with answers you marked as helpful
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-secondary/30 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : filteredHelpful.length > 0 ? (
                <div className="space-y-4">
                  {filteredHelpful.map((search) => (
                    <Card key={search.id} className="border border-border/50">
                      <CardHeader className="py-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center">
                              <SearchIcon className="h-4 w-4 mr-2 text-primary" />
                              <CardTitle className="text-lg">{search.query}</CardTitle>
                            </div>
                            <CardDescription className="flex items-center mt-1">
                              <CalendarIcon className="h-3 w-3 mr-1" />
                              {new Date(search.created_at).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <div className="flex items-center">
                            <Badge className="mr-2 bg-green-100 text-green-700 border-green-200">
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              <span>{search.helpful_results.length} helpful</span>
                            </Badge>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2"
                              onClick={() => toggleAnswerExpansion(search.id)}
                            >
                              {expandedAnswers[search.id] ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      {expandedAnswers[search.id] && (
                        <CardContent className="pt-0">
                          <ScrollArea className="max-h-[200px] rounded border p-4 bg-secondary/10">
                            <p className="whitespace-pre-line text-sm">{search.answer}</p>
                          </ScrollArea>
                          <div className="flex justify-end mt-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-8"
                              onClick={() => runSearch(search.query)}
                            >
                              Search Again
                            </Button>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No helpful answers found.</p>
                  <p className="text-sm mt-1">Mark answers as helpful during searches to save them here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>All Searches</CardTitle>
              <CardDescription>
                Your complete search history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-12 bg-secondary/30 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : filteredHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Query</TableHead>
                      <TableHead className="w-[180px]">Date</TableHead>
                      <TableHead className="w-[100px]">Helpful</TableHead>
                      <TableHead className="w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHistory.map((search) => (
                      <TableRow key={search.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <SearchIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                            {search.query}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-muted-foreground">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            {new Date(search.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          {search.helpful_results.length > 0 ? (
                            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              <span>{search.helpful_results.length}</span>
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">None</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => runSearch(search.query)}
                          >
                            Search Again
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No searches found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 