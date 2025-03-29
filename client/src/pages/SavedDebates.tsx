import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { getDebates, deleteDebate } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { Debate } from "@/lib/types";

export default function SavedDebates() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get all debates
  const { data: debates, isLoading, error } = useQuery({
    queryKey: ["/api/debates"],
    queryFn: () => getDebates(),
  });

  // Delete debate mutation
  const { mutate: deleteMutate } = useMutation({
    mutationFn: deleteDebate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/debates"] });
      toast({
        title: "Debate deleted",
        description: "The debate has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete debate. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Filter debates based on search term
  const filteredDebates = debates?.filter((debate) =>
    debate.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date for display
  const formatDate = (dateString: Date | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle debate deletion
  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this debate?")) {
      deleteMutate(id);
    }
  };

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-50 p-4 rounded-md mb-6 text-red-800 inline-block">
          <h3 className="text-lg font-medium">Error loading debates</h3>
          <p>Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Saved Debates</h1>
          <p className="text-gray-500 mt-1">
            View and manage your saved debate topics
          </p>
        </div>
        <Link href="/">
          <Button variant="outline">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to Generator
          </Button>
        </Link>
      </div>

      <Card className="mb-8">
        <CardHeader className="pb-3">
          <CardTitle>Your Debates</CardTitle>
          <CardDescription>
            All debate topics you've generated and saved
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search by topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : filteredDebates && filteredDebates.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60%]">Topic</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDebates.map((debate: Debate) => (
                    <TableRow key={debate.id}>
                      <TableCell className="font-medium">
                        {debate.topic}
                      </TableCell>
                      <TableCell>
                        {debate.language
                          ? debate.language.charAt(0).toUpperCase() +
                            debate.language.slice(1)
                          : "English"}
                      </TableCell>
                      <TableCell>{formatDate(debate.createdAt)}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Link href={`/debate/${debate.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDelete(debate.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto text-gray-400 mb-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No saved debates found
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm
                  ? `No debates matching "${searchTerm}"`
                  : "Generate and save a debate to see it here"}
              </p>
              <Link href="/">
                <Button>Generate New Debate</Button>
              </Link>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-4 text-sm text-gray-500">
          {filteredDebates?.length ?? 0} debates found
        </CardFooter>
      </Card>
    </div>
  );
}