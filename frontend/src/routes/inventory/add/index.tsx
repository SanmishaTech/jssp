import { createFileRoute, redirect } from "@tanstack/react-router";
import Additem from "../../../Components/inventory/TestCard";

import { toast } from "sonner";

export const Route = createFileRoute("/inventory/add/")({
  beforeLoad: async ({ fetch }) => {
    const role = localStorage.getItem("role");
    if (role !== "cashier" && role !== "admin" && role !== "superadmin") {
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
  return <Additem />;
}
