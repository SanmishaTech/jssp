import { createFileRoute, redirect } from "@tanstack/react-router";
import Institutes from "../../Components/semester/Registertable";
import { toast } from "sonner";

export const Route = createFileRoute("/semester/")({
  beforeLoad: async ({ fetch }) => {
    // const role = localStorage.getItem("role");
    // if (role !== "superadmin") {
    //   toast.error("You are not authorized to access this page.");
    //   throw redirect({
    //     to: "/",
    //     search: {
    //       redirect: location.href,
    //     },
    //   });
    // }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Institutes />;
}
