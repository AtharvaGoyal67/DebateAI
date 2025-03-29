import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface TopicInputProps {
  onSubmit: (topic: string) => void;
  isPending: boolean;
}

export default function TopicInput({ onSubmit, isPending }: TopicInputProps) {
  const [topic, setTopic] = useState("");
  const [charCount, setCharCount] = useState(0);
  const MAX_CHARS = 200;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newTopic = e.target.value;
    if (newTopic.length <= MAX_CHARS) {
      setTopic(newTopic);
      setCharCount(newTopic.length);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && !isPending) {
      onSubmit(topic.trim());
    }
  };

  return (
    <div className="max-w-2xl mx-auto mb-8">
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic" className="text-sm font-medium text-gray-700">
                Debate Topic
              </Label>
              <div className="relative">
                <Textarea
                  id="topic"
                  placeholder="Enter a debate topic (e.g., 'Should social media be regulated?')"
                  value={topic}
                  onChange={handleChange}
                  rows={3}
                  className="resize-none pr-16"
                  disabled={isPending}
                />
                <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                  {charCount}/{MAX_CHARS}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!topic.trim() || isPending}
                className="bg-primary hover:bg-primary/90"
              >
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
                  <path d="M12 2a10 10 0 1 0 10 10H12V2Z" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                  <path d="M21 14a4 4 0 0 1-3 4" />
                </svg>
                Generate Debate Points
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
