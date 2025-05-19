import { createFileRoute, redirect } from "@tanstack/react-router";
import Institutes from "../../Components/cashiers/Registertable";
import { toast } from "sonner";

export const Route = createFileRoute("/cashiers/")({
  beforeLoad: async ({ fetch }) => {
    const role = localStorage.getItem("role");
    if (role !== "cashier" && role !== "member" && role !== "admin") {
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
