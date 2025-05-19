import { createFileRoute, redirect } from "@tanstack/react-router";
import Additem from "../../../Components/semester/TestCard";

import { toast } from "sonner";

export const Route = createFileRoute("/semester/add/")({
  beforeLoad: async ({ fetch }) => {
    const role = localStorage.getItem("role");
    console.log("current Role institutes", role);
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
  return <Additem />;
}
