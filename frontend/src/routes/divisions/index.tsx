import { createFileRoute, redirect } from "@tanstack/react-router";
import Institutes from "../../Components/divisions/Registertable";
import { toast } from "sonner";

export const Route = createFileRoute("/divisions/")({
  beforeLoad: async ({ fetch }) => {
    const role = localStorage.getItem("role");
    if (role !== "admin" && role !== "admission") {
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
