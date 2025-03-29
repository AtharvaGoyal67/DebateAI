export default function LoadingState() {
  return (
    <div className="max-w-2xl mx-auto mb-8 text-center">
      <div className="inline-block h-12 w-12 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-600">Generating debate points...</p>
    </div>
  );
}
