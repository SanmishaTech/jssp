import { createFileRoute } from "@tanstack/react-router";
import ExamManagement from "@/Components/addexam/Registertable";

export const Route = createFileRoute("/addexam/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ExamManagement />;
}
