//ts-nocheck
import { createFileRoute, redirect } from "@tanstack/react-router";
import TaskManager from "../../Components/taskmanager/TaskManager";
import { toast } from "sonner";

export const Route = createFileRoute("/taskmanager/")({
  // beforeLoad: async () => {
  //   const role = localStorage.getItem("role");
  //   console.log("current Role", role);
  //   if (role !== "member" && role !== "cashier" && role !== "backoffice" && role !== "accountant" && role !== "admission" && role !== "admin" && role !== "teachingstaff") {
  //     toast.error("You are not authorized to access this page.");
  //     throw redirect({
  //       to: "/",
  //       search: {
  //         redirect: location.href,
  //       },
  //     });
  //   }
  // },
  component: RouteComponent
});

function RouteComponent() {
  return <TaskManager />;
}
