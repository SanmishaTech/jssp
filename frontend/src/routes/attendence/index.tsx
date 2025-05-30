//ts-nocheck
import { createFileRoute, redirect } from "@tanstack/react-router";
import Attendence from "../../Components/Attendence/Attendence";
import { toast } from "sonner";

export const Route = createFileRoute("/attendence/")({
  beforeLoad: async () => {
    const role = localStorage.getItem("role");
    console.log("current Role", role);
    if (role !== "member" && role !== "cashier" && role !== "backoffice" && role !== "accountant" && role !== "admission" && role !== "admin" && role !== "teachingstaff") {
      toast.error("You are not authorized to access this page.");
      throw redirect({
        to: "/",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: RouteComponent
});

function RouteComponent() {
  return <Attendence />;
}
