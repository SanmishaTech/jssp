import { createFileRoute, redirect } from "@tanstack/react-router";
import Institutes from "../../Components/inventory/Registertable";
import { toast } from "sonner";

export const Route = createFileRoute("/inventory/")({
  beforeLoad: async ({ fetch }) => {
    const role = localStorage.getItem("role");
    if (role !== "admin" && role !== "backoffice" && role!=="viceprincipal" && role!=="nonteachingstaff"  && role!="superadmin" && role!="storekeeper" && role !== "accountant" ) {
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
