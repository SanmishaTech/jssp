import { createFileRoute } from "@tanstack/react-router";
import Login from "../../Components/Dashboard/AccountantDashboard";

export const Route = createFileRoute("/accountantdashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Login />;
} 
