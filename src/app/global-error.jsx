"use client"; // This must be a client component

export default function GlobalError({ error, reset }) {
  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">500 - Server Error</h1>
      <p>Something went wrong.</p>
      <button onClick={reset} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
        Try Again
      </button>
    </main>
  );
}