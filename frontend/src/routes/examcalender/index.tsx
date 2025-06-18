import { createFileRoute } from "@tanstack/react-router";
import Calendar from "../../Components/examcalender/calender";
 
export const Route = createFileRoute("/examcalender/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Calendar />;
}
