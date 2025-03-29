import {
  Card,
  CardContent,
  CardHeader
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DebatePoint } from "@/lib/types";

interface DebateResultsProps {
  topic: string;
  points: DebatePoint;
  onReset: () => void;
  onSave?: () => void;
  isSaving?: boolean;
}

export default function DebateResults({ 
  topic, 
  points, 
  onReset, 
  onSave, 
  isSaving = false 
}: DebateResultsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Proposition Card */}
      <Card className="overflow-hidden border-l-4 border-l-indigo-500">
        <CardHeader className="p-4 bg-indigo-50">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-indigo-600 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h3 className="text-xl font-semibold text-indigo-700">Proposition Arguments</h3>
          </div>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <p className="text-sm text-gray-500">Key points supporting this position:</p>
          
          <ul className="space-y-3">
            {points.proposition.map((point, index) => (
              <li key={`prop-${index}`} className="flex">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-indigo-600 flex-shrink-0 mr-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      
      {/* Opposition Card */}
      <Card className="overflow-hidden border-l-4 border-l-rose-500">
        <CardHeader className="p-4 bg-rose-50">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-rose-600 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <h3 className="text-xl font-semibold text-rose-700">Opposition Arguments</h3>
          </div>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <p className="text-sm text-gray-500">Key points against this position:</p>
          
          <ul className="space-y-3">
            {points.opposition.map((point, index) => (
              <li key={`opp-${index}`} className="flex">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-rose-600 flex-shrink-0 mr-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
