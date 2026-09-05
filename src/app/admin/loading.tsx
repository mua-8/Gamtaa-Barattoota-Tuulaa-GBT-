export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-8">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-forest-200 border-t-forest-600"></div>
        <p className="text-sm font-medium text-forest-600">Loading data...</p>
      </div>
    </div>
  );
}
