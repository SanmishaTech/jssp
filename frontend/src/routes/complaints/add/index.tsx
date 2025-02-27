import { createFileRoute, redirect } from "@tanstack/react-router";
import Additem from "../../../Components/complaints/TestCard";

import { toast } from "sonner";

export const Route = createFileRoute("/complaints/add/")({
  // beforeLoad: async ({ fetch }) => {
  //   const role = localStorage.getItem("role");
  //   console.log("current Role institutes", role);
  //   if (role !== "superadmin") {
  //     toast.error("You are not authorized to access this page.");
  //     throw redirect({
  //       to: "/",
  //       search: {
  //         redirect: location.href,
  //       },
  //     });
  //   }
  // },
  component: RouteComponent,
});

function RouteComponent() {
  return <Additem />;
}
