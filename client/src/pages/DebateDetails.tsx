import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getDebate, 
  generateRebuttals,
  generateCounterArguments,
  deleteDebate
} from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DebateDetails() {
  const [, params] = useRoute("/debate/:id");
  const id = params?.id ? parseInt(params.id) : 0;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isRebuttalDialogOpen, setIsRebuttalDialogOpen] = useState(false);
  const [isCounterDialogOpen, setIsCounterDialogOpen] = useState(false);
  const [selectedSide, setSelectedSide] = useState<"proposition" | "opposition">("proposition");
  const [selectedArgument, setSelectedArgument] = useState("");
  const [rebuttalCount, setRebuttalCount] = useState(2);
  const [counterCount, setCounterCount] = useState(3);
  const [additionalRebuttals, setAdditionalRebuttals] = useState<string[]>([]);
  const [counterArguments, setCounterArguments] = useState<string[]>([]);

  // Fetch debate by ID
  const { data: debate, isLoading, error } = useQuery({
    queryKey: ["/api/debates", id],
    queryFn: () => getDebate(id),
    enabled: id > 0,
  });

  // Delete debate mutation
  const { mutate: deleteMutate } = useMutation({
    mutationFn: deleteDebate,
    onSuccess: () => {
      toast({
        title: "Debate deleted",
        description: "The debate has been successfully deleted.",
      });
      window.location.href = "/saved";
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete debate. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Generate additional rebuttals
  const { mutate: rebuttalMutate, isPending: isRebuttalPending } = useMutation({
    mutationFn: generateRebuttals,
    onSuccess: (data) => {
      setAdditionalRebuttals(data);
      toast({
        title: "Rebuttals generated",
        description: `${data.length} new rebuttals generated successfully.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate rebuttals. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Generate counter arguments
  const { mutate: counterMutate, isPending: isCounterPending } = useMutation({
    mutationFn: generateCounterArguments,
    onSuccess: (data) => {
      setCounterArguments(data);
      toast({
        title: "Counter-arguments generated",
        description: `${data.length} counter-arguments generated successfully.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate counter-arguments. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateRebuttals = () => {
    if (debate) {
      rebuttalMutate({
        topic: debate.topic,
        side: selectedSide,
        count: rebuttalCount
      });
    }
  };

  const handleGenerateCounterArguments = () => {
    if (debate) {
      counterMutate({
        argument: selectedArgument,
        topic: debate.topic,
        count: counterCount
      });
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this debate?")) {
      deleteMutate(id);
    }
  };

  // Format date for display
  const formatDate = (dateString: Date | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between mb-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-8 w-96 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error || !debate) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 p-6 rounded-lg inline-block">
          <h2 className="text-2xl font-bold text-red-800 mb-2">Debate not found</h2>
          <p className="text-red-700 mb-4">The debate you are looking for doesn't exist or was deleted.</p>
          <Link href="/saved">
            <Button>Go Back to Saved Debates</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/saved">
              <Button variant="ghost" size="sm" className="h-8 pr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">{debate.topic}</h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">
              {debate.language 
                ? debate.language.charAt(0).toUpperCase() + debate.language.slice(1) 
                : "English"}
            </Badge>
            <span className="text-sm text-gray-500">
              Created on {formatDate(debate.createdAt)}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDelete} className="text-red-500">
            Delete
          </Button>
          <Button onClick={() => setIsRebuttalDialogOpen(true)}>
            Generate More Rebuttals
          </Button>
        </div>
      </div>

      <Tabs defaultValue="points" className="w-full mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="points">Main Points</TabsTrigger>
          <TabsTrigger value="rebuttals">Rebuttals</TabsTrigger>
          <TabsTrigger value="counter">Counter Arguments</TabsTrigger>
          {debate.points.evidence && (
            <TabsTrigger value="evidence">Evidence</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="points">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Proposition Card */}
            <Card className="border-l-4 border-l-indigo-500">
              <CardHeader className="bg-indigo-50">
                <h3 className="text-xl font-semibold text-indigo-700">Proposition Arguments</h3>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-4">
                  {debate.points.proposition.map((point, index) => (
                    <li key={`prop-${index}`} className="flex items-start">
                      <span className="font-semibold text-indigo-600 mr-2">{index + 1}.</span>
                      <div>
                        <p>{point}</p>
                        <div className="mt-2 flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedArgument(point);
                              setIsCounterDialogOpen(true);
                            }}
                            className="text-xs h-6 px-2"
                          >
                            Generate Counter-Arguments
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Opposition Card */}
            <Card className="border-l-4 border-l-rose-500">
              <CardHeader className="bg-rose-50">
                <h3 className="text-xl font-semibold text-rose-700">Opposition Arguments</h3>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-4">
                  {debate.points.opposition.map((point, index) => (
                    <li key={`opp-${index}`} className="flex items-start">
                      <span className="font-semibold text-rose-600 mr-2">{index + 1}.</span>
                      <div>
                        <p>{point}</p>
                        <div className="mt-2 flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedArgument(point);
                              setIsCounterDialogOpen(true);
                            }}
                            className="text-xs h-6 px-2"
                          >
                            Generate Counter-Arguments
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rebuttals">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Proposition Rebuttals */}
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold text-indigo-700">Proposition Rebuttals</h3>
                <p className="text-sm text-gray-500">
                  Rebuttals against opposition arguments
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {debate.points.propositionRebuttals.map((rebuttal, index) => (
                    <li key={`prop-rebuttal-${index}`} className="flex items-start">
                      <span className="font-semibold text-indigo-600 mr-2">{index + 1}.</span>
                      <p>{rebuttal}</p>
                    </li>
                  ))}
                  {additionalRebuttals.length > 0 && selectedSide === "proposition" && (
                    <>
                      <div className="border-t border-dashed my-4"></div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Additional Rebuttals:</p>
                      {additionalRebuttals.map((rebuttal, index) => (
                        <li key={`add-rebuttal-${index}`} className="flex items-start">
                          <span className="font-semibold text-green-600 mr-2">+</span>
                          <p>{rebuttal}</p>
                        </li>
                      ))}
                    </>
                  )}
                </ul>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedSide("proposition");
                    setIsRebuttalDialogOpen(true);
                  }}
                >
                  Generate More
                </Button>
              </CardFooter>
            </Card>

            {/* Opposition Rebuttals */}
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold text-rose-700">Opposition Rebuttals</h3>
                <p className="text-sm text-gray-500">
                  Rebuttals against proposition arguments
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {debate.points.oppositionRebuttals.map((rebuttal, index) => (
                    <li key={`opp-rebuttal-${index}`} className="flex items-start">
                      <span className="font-semibold text-rose-600 mr-2">{index + 1}.</span>
                      <p>{rebuttal}</p>
                    </li>
                  ))}
                  {additionalRebuttals.length > 0 && selectedSide === "opposition" && (
                    <>
                      <div className="border-t border-dashed my-4"></div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Additional Rebuttals:</p>
                      {additionalRebuttals.map((rebuttal, index) => (
                        <li key={`add-rebuttal-${index}`} className="flex items-start">
                          <span className="font-semibold text-green-600 mr-2">+</span>
                          <p>{rebuttal}</p>
                        </li>
                      ))}
                    </>
                  )}
                </ul>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedSide("opposition");
                    setIsRebuttalDialogOpen(true);
                  }}
                >
                  Generate More
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="counter">
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Counter Arguments</h3>
              <p className="text-sm text-gray-500">
                Generate counter arguments against any point from the debate
              </p>
            </CardHeader>
            <CardContent>
              {counterArguments.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">
                    Select any argument from the debate points to generate counter-arguments
                  </p>
                  <Button onClick={() => setIsCounterDialogOpen(true)}>
                    Generate Counter Arguments
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium mb-2">Original Argument:</p>
                    <p className="text-gray-700">{selectedArgument}</p>
                  </div>
                  <div>
                    <p className="font-medium mb-3">Counter Arguments:</p>
                    <ul className="space-y-4">
                      {counterArguments.map((counter, index) => (
                        <li key={`counter-${index}`} className="flex items-start">
                          <span className="font-semibold text-amber-600 mr-2">{index + 1}.</span>
                          <p>{counter}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {debate.points.evidence && (
          <TabsContent value="evidence">
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold">Evidence & Sources</h3>
                <p className="text-sm text-gray-500">
                  Supporting evidence and references for debate points
                </p>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {debate.points.evidence.map((item, index) => (
                    <AccordionItem key={`evidence-${index}`} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {item.point}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pl-4 pt-2">
                          <p className="font-medium text-sm mb-2">Sources:</p>
                          <ul className="space-y-2 list-disc pl-5">
                            {item.sources.map((source, sourceIndex) => (
                              <li key={`source-${index}-${sourceIndex}`} className="text-sm">
                                {source}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Additional Rebuttals Dialog */}
      <Dialog open={isRebuttalDialogOpen} onOpenChange={setIsRebuttalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Additional Rebuttals</DialogTitle>
            <DialogDescription>
              Generate more rebuttal points for the {selectedSide} side of the debate.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="side">Side</Label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={selectedSide === "proposition" ? "default" : "outline"}
                  onClick={() => setSelectedSide("proposition")}
                  className={selectedSide === "proposition" ? "bg-indigo-600" : ""}
                >
                  Proposition
                </Button>
                <Button
                  type="button"
                  variant={selectedSide === "opposition" ? "default" : "outline"}
                  onClick={() => setSelectedSide("opposition")}
                  className={selectedSide === "opposition" ? "bg-rose-600" : ""}
                >
                  Opposition
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="count">Number of Rebuttals</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 5].map(num => (
                  <Button
                    key={`rebuttal-${num}`}
                    type="button"
                    variant={rebuttalCount === num ? "default" : "outline"}
                    onClick={() => setRebuttalCount(num)}
                    size="sm"
                  >
                    {num}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsRebuttalDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleGenerateRebuttals} 
              disabled={isRebuttalPending}
            >
              {isRebuttalPending ? "Generating..." : "Generate Rebuttals"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Counter Arguments Dialog */}
      <Dialog open={isCounterDialogOpen} onOpenChange={setIsCounterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Counter Arguments</DialogTitle>
            <DialogDescription>
              Generate counter arguments against a specific point from the debate.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="argument">Original Argument</Label>
              <Textarea
                id="argument"
                value={selectedArgument}
                onChange={(e) => setSelectedArgument(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="count">Number of Counter Arguments</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 5].map(num => (
                  <Button
                    key={`counter-${num}`}
                    type="button"
                    variant={counterCount === num ? "default" : "outline"}
                    onClick={() => setCounterCount(num)}
                    size="sm"
                  >
                    {num}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsCounterDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleGenerateCounterArguments} 
              disabled={isCounterPending || !selectedArgument.trim()}
            >
              {isCounterPending ? "Generating..." : "Generate Counter Arguments"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}