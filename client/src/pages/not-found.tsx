import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-neutral-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="pt-8 pb-4 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="bg-rose-100 p-4 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-rose-500"
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
            <h1 className="text-3xl font-bold text-gray-900">Page Not Found</h1>
            <p className="text-gray-600 max-w-sm mt-2">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center pb-8">
          <Link href="/">
            <Button className="gap-2">
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
              <span>Back to Home</span>
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
