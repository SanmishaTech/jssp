import { createFileRoute } from "@tanstack/react-router";
import Login from "../../Components/Dashboard/StaffDashboard";

export const Route = createFileRoute("/staffdashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Login />;
}
