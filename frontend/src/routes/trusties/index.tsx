import { createFileRoute, redirect } from "@tanstack/react-router";
import Members from "../../Components/Trusties/Registertable";
import { toast } from "sonner";

export const Route = createFileRoute("/trusties/")({
  beforeLoad: async ({ fetch }) => {
    const role = localStorage.getItem("role");
    console.log("current Role", role);
    if (role !== "superadmin") {
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
