import { Card, CardContent } from "@/components/ui/card";

interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="max-w-2xl mx-auto mb-8">
      <Card className="bg-red-50 border border-red-200">
        <CardContent className="p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-red-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="font-medium text-red-700">Something went wrong</p>
              <p className="text-sm text-red-600">{message}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
