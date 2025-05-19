import { createFileRoute } from "@tanstack/react-router";
import Login from "../../Components/Dashboard/BackofficeDashboard";

export const Route = createFileRoute("/backofficedashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Login />;
} 
