import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/account/")({
  component: AccountIndexRedirect,
});

function AccountIndexRedirect() {
  return <Navigate to={"/account/dashboard" as any} replace />;
}
