import { createFileRoute } from "@tanstack/react-router";
import Login from "../../Components/Dashboard/MemberDashboard";

export const Route = createFileRoute("/memberdashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Login />;
}
