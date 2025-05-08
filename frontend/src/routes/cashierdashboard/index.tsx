import { createFileRoute } from "@tanstack/react-router";
import Login from "../../Components/Dashboard/CashierDashboard";

export const Route = createFileRoute("/cashierdashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Login />;
} 
