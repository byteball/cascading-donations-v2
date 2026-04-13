export default function Loading() {
  return (
    <div className="mt-12 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row justify-between md:items-center">
        <div className="flex flex-col md:flex-row justify-start md:items-center md:space-x-8 space-y-4 md:space-y-0">
          <div className="w-[70px] h-[70px] rounded-full bg-gray-200" />
          <div className="h-8 w-64 bg-gray-200 rounded" />
        </div>
        <div className="flex space-x-4 md:mt-0 mt-4">
          <div className="h-12 w-28 bg-gray-200 rounded-xl" />
          <div className="h-12 w-32 bg-gray-200 rounded-xl" />
        </div>
      </div>

      {/* Description skeleton */}
      <div className="mt-6 space-y-2 max-w-3xl">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>

      {/* Meta tags skeleton */}
      <div className="flex gap-3 mt-2">
        <div className="h-4 w-20 bg-gray-200 rounded" />
        <div className="h-4 w-12 bg-gray-200 rounded" />
        <div className="h-4 w-12 bg-gray-200 rounded" />
        <div className="h-4 w-24 bg-gray-200 rounded" />
      </div>

      {/* Stats skeleton */}
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        <div className="h-24 bg-gray-200 rounded-xl" />
        <div className="h-24 bg-gray-200 rounded-xl" />
        <div className="h-24 bg-gray-200 rounded-xl" />
      </div>

      {/* Content skeleton */}
      <div className="mt-24 space-y-8">
        <div className="h-6 w-48 bg-gray-200 rounded" />
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          <div className="h-20 bg-gray-200 rounded-xl" />
          <div className="h-20 bg-gray-200 rounded-xl" />
          <div className="h-20 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
