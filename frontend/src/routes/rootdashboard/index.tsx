import { createFileRoute } from "@tanstack/react-router";
import Login from "../../Components/Dashboard/SuperadminDashboard";

export const Route = createFileRoute("/rootdashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Login />;
}
