//ts-nocheck
import { createFileRoute, redirect } from "@tanstack/react-router";
import Members from "../../Components/card/Edittestcard";
import { toast } from "sonner";

export const Route = createFileRoute("/card/")({
  // beforeLoad: async ({ fetch }) => {
  //   const role = localStorage.getItem("role");
  //   console.log("current Role", role);
  //   if (role !== "nonteachingstaff" && role !== "cashier" && role !== "admission" && role !== "backoffice" && role !== "accountant" && role !== "admin" && role !== "teachingstaff" ) {
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
  return <Members />;
}
