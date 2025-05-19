//ts-nocheck
import { createFileRoute, redirect } from "@tanstack/react-router";
import Members from "../../Components/profiles/Edittestcard";
import { toast } from "sonner";

export const Route = createFileRoute("/profiles/")({
  beforeLoad: async ({ fetch }) => {
    const role = localStorage.getItem("role");
    console.log("current Role", role);
    if (role !== "member" && role !== "cashier" && role !== "backoffice" && role !== "accountant" && role !== "admission" && role !== "admin") {
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
