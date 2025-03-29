import { useState } from "react";
import { Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DebatePoint, DebateTopicRequest } from "@/lib/types";
import { generateDebatePoints, saveDebate } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import TopicInput from "@/components/TopicInput";
import DebateResults from "@/components/DebateResults";
import LoadingState from "@/components/LoadingState";
import ErrorMessage from "@/components/ErrorMessage";

export default function Home() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Debate topic and settings
  const [currentTopic, setCurrentTopic] = useState<string>("");
  const [debatePoints, setDebatePoints] = useState<DebatePoint | null>(null);
  const [language, setLanguage] = useState<string>("english");
  const [complexity, setComplexity] = useState<string>("intermediate");
  const [showOptions, setShowOptions] = useState<boolean>(false);
  
  // Generate debate points mutation
  const { 
    mutate: generateMutate, 
    isPending: isGenerating, 
    error: generateError, 
    reset: resetGenerate 
  } = useMutation({
    mutationFn: generateDebatePoints,
    onSuccess: (data) => {
      setDebatePoints(data);
    },
  });

  // Save debate mutation
  const { 
    mutate: saveMutate, 
    isPending: isSaving
  } = useMutation({
    mutationFn: (data: { topic: string, points: DebatePoint }) => saveDebate({
      topic: data.topic,
      points: data.points,
      userId: null,
      language: language,
      format: null
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/debates'] });
      toast({
        title: "Debate saved",
        description: "The debate has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save the debate. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (topic: string) => {
    setCurrentTopic(topic);
    
    const request: DebateTopicRequest = {
      topic,
      language,
      complexity
    };
    
    generateMutate(request);
  };

  const handleSaveDebate = () => {
    if (currentTopic && debatePoints) {
      saveMutate({
        topic: currentTopic,
        points: debatePoints
      });
    }
  };

  const resetForm = () => {
    setDebatePoints(null);
    resetGenerate();
  };

  return (
    <div className="bg-neutral-50 min-h-screen font-sans text-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-primary mr-2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
              </svg>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">DebateAI</h1>
                <p className="text-gray-600">
                  Generate compelling arguments for any debate topic
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/saved">
                <Button variant="outline" className="gap-2">
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
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                  </svg>
                  <span>Saved Debates</span>
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto">
          <Card className="mb-8">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Generate a Debate</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOptions(!showOptions)}
                  className="text-gray-500"
                >
                  {showOptions ? "Hide Options" : "Show Options"}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 ml-1 transition-transform ${
                      showOptions ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Debate options */}
              {showOptions && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pt-2 pb-4 border-b">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="hindi">Hindi</SelectItem>
                        <SelectItem value="spanish">Spanish</SelectItem>
                        <SelectItem value="french">French</SelectItem>
                        <SelectItem value="german">German</SelectItem>
                        <SelectItem value="chinese">Chinese</SelectItem>
                        <SelectItem value="japanese">Japanese</SelectItem>
                        <SelectItem value="russian">Russian</SelectItem>
                        <SelectItem value="arabic">Arabic</SelectItem>
                        <SelectItem value="portuguese">Portuguese</SelectItem>
                        <SelectItem value="bengali">Bengali</SelectItem>
                        <SelectItem value="korean">Korean</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="complexity">Complexity Level</Label>
                    <Select value={complexity} onValueChange={setComplexity}>
                      <SelectTrigger id="complexity">
                        <SelectValue placeholder="Select complexity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <div className="bg-green-50 text-green-700 p-2 rounded-md text-sm w-full">
                      All debates now include evidence and sources!
                    </div>
                  </div>
                </div>
              )}

              {/* Topic Input Form */}
              <TopicInput onSubmit={handleSubmit} isPending={isGenerating} />
            </CardContent>
          </Card>

          {/* Loading State */}
          {isGenerating && <LoadingState />}

          {/* Error Message */}
          {generateError && (
            <ErrorMessage 
              message={generateError instanceof Error ? generateError.message : "An unknown error occurred"} 
            />
          )}

          {/* Debate Results */}
          {debatePoints && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  Results: <span className="text-primary">{currentTopic}</span>
                </h2>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={resetForm} 
                    className="gap-2"
                  >
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
                      <path d="M12 5v14" />
                      <path d="M5 12h14" />
                    </svg>
                    <span>New Debate</span>
                  </Button>
                  <Button 
                    onClick={handleSaveDebate} 
                    disabled={isSaving}
                    className="gap-2"
                  >
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
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                      <polyline points="17 21 17 13 7 13 7 21" />
                      <polyline points="7 3 7 8 15 8" />
                    </svg>
                    <span>{isSaving ? "Saving..." : "Save Debate"}</span>
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="main" className="mb-8">
                <TabsList className="mb-6">
                  <TabsTrigger value="main">Main Arguments</TabsTrigger>
                  <TabsTrigger value="rebuttals">Rebuttals</TabsTrigger>
                  {debatePoints.evidence && (
                    <TabsTrigger value="evidence">Evidence</TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="main">
                  <DebateResults 
                    topic={currentTopic}
                    points={debatePoints}
                    onReset={resetForm}
                    onSave={handleSaveDebate}
                    isSaving={isSaving}
                  />
                </TabsContent>

                <TabsContent value="rebuttals">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Proposition Rebuttals */}
                    <Card className="border-l-4 border-l-indigo-500">
                      <CardHeader className="bg-indigo-50">
                        <h3 className="text-xl font-semibold text-indigo-700">Proposition Rebuttals</h3>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-4">
                          {debatePoints.propositionRebuttals.map((rebuttal, index) => (
                            <li key={`prop-rebuttal-${index}`} className="flex items-start">
                              <span className="font-semibold text-indigo-600 mr-2">{index + 1}.</span>
                              <p>{rebuttal}</p>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Opposition Rebuttals */}
                    <Card className="border-l-4 border-l-rose-500">
                      <CardHeader className="bg-rose-50">
                        <h3 className="text-xl font-semibold text-rose-700">Opposition Rebuttals</h3>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-4">
                          {debatePoints.oppositionRebuttals.map((rebuttal, index) => (
                            <li key={`opp-rebuttal-${index}`} className="flex items-start">
                              <span className="font-semibold text-rose-600 mr-2">{index + 1}.</span>
                              <p>{rebuttal}</p>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {debatePoints.evidence && (
                  <TabsContent value="evidence">
                    <Card>
                      <CardHeader>
                        <h3 className="text-xl font-semibold">Evidence & Sources</h3>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-6">
                          {debatePoints.evidence.map((item, index) => (
                            <li key={`evidence-${index}`} className="border-b pb-4 last:border-0">
                              <p className="font-medium text-gray-900 mb-2">{item.point}</p>
                              <div className="pl-4">
                                <p className="text-sm font-medium text-gray-700 mb-1">Sources:</p>
                                <ol className="list-decimal pl-5 text-sm text-gray-600 space-y-1">
                                  {item.sources.map((source, sourceIndex) => (
                                    <li key={`source-${index}-${sourceIndex}`}>{source}</li>
                                  ))}
                                </ol>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}
              </Tabs>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>DebateAI uses Groq's LLama3-8b-8192 model to generate debate points.</p>
          <p className="mt-1">&copy; {new Date().getFullYear()} DebateAI. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
