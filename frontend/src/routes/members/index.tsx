import { createFileRoute, redirect } from "@tanstack/react-router";
import Members from "../../Components/members/Registertable";
import { toast } from "sonner";

export const Route = createFileRoute("/members/")({
  beforeLoad: async ({ fetch }) => {
    const role = localStorage.getItem("role");
    console.log("current Role", role);
    if (role !== "admin" && role !== "superadmin") {
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
