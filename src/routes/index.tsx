import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { isSignedIn } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "Rhea" }, { name: "robots", content: "noindex" }],
  }),
  component: HomeRedirect,
});

function HomeRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: isSignedIn() ? "/app" : "/signin", replace: true });
  }, [navigate]);

  return null;
}
