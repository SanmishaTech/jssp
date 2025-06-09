import { createFileRoute, redirect } from "@tanstack/react-router";
import WeeklyHoliday from "../../Components/WeeklyHoliday/WeeklyHoliday";
import { toast } from "sonner";

export const Route = createFileRoute("/weeklyholiday/")({
  beforeLoad: async ({ fetch }) => {
    const role = localStorage.getItem("role");
    console.log("current Role", role);
    if (role !== "viceprincipal" && role !== "cashier" && role !== "backoffice" && role !== "accountant" && role !== "admission" && role !== "admin" && role !== "teachingstaff") {
      toast.error("You are not authorized to access this page.");
      throw redirect({
        to: "/",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <WeeklyHoliday />;
}
