import { Link } from "react-router-dom";
import { SearchX } from "lucide-react";
import { Button } from "@/Common/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center py-24 text-center">
      <SearchX className="h-14 w-14 text-muted-foreground" />
      <h1 className="mt-4 text-2xl font-extrabold">Page not found</h1>
      <p className="mt-1 text-sm text-muted-foreground">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/">
        <Button className="mt-5">Back to Home</Button>
      </Link>
    </div>
  );
}
