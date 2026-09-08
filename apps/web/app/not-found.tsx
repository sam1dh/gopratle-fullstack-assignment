import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md w-full text-center space-y-4 px-4">
        <h1 className="text-4xl font-bold">404</h1>
        <h2 className="text-xl font-semibold">Page not found</h2>
        <p className="text-muted-foreground">
          The page you are looking for does not exist.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center h-10 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
