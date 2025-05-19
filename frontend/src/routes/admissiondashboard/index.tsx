import { createFileRoute } from "@tanstack/react-router";
import Login from "../../Components/Dashboard/AdmissionDashboard";

export const Route = createFileRoute("/admissiondashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Login />;
} 
