import { createFileRoute, redirect } from "@tanstack/react-router";
import Institutes from "../../Components/courses/Registertable";
import { toast } from "sonner";

export const Route = createFileRoute("/courses/")({
  beforeLoad: async ({ fetch }) => {
    const role = localStorage.getItem("role");
    if (role !== "admin" && role !== "admission" && role !== "viceprincipal" && role!== "hod") {
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
  return <Institutes />;
}
