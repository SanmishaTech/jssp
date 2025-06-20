//ts-nocheck
import { createFileRoute, redirect } from "@tanstack/react-router";
import Members from "../../Components/leaveapproval/Edittestcard";
import { toast } from "sonner";

export const Route = createFileRoute("/leaveapproval/")({
  beforeLoad: async ({ fetch }) => {
    const role = localStorage.getItem("role");
    console.log("current Role", role);
    if (role !== "admin" && role !== "superadmin" && role !=="viceprincipal"  && role !=="hod" && role !== "officesuperintendent" ) {
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
  return <Members />;
}
