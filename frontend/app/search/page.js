"use client";
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');

  return (
    <div className="container-custom mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Search Results</h1>
      {query ? (
        <p className="text-gray-600 mb-8">Showing results for: <span className="text-abp-red font-bold text-xl">"{query}"</span></p>
      ) : (
        <p className="text-gray-600">Please enter a search term.</p>
      )}
      
      {/* Dummy results for demonstration */}
      {query && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {[1, 2, 3].map(i => (
             <div key={i} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white">
               <div className="h-48 bg-gray-200 w-full animate-pulse"></div>
               <div className="p-4">
                 <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                 <div className="h-3 bg-gray-200 rounded w-1/2"></div>
               </div>
             </div>
           ))}
        </div>
      )}
       {!query && (
         <div className="text-center py-20 text-gray-400">
           Start typing in the navbar to search
         </div>
       )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-10">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
