import { createFileRoute, redirect } from "@tanstack/react-router";
import PeticashDashboard from "../../Components/cashbook/PeticashDashboard";
import { toast } from "sonner";

export const Route = createFileRoute("/cashbook/$id")({
  beforeLoad: async () => {
    // Check authentication
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to access this page");
      throw redirect({
        to: "/",
        search: {
          redirect: window.location.pathname,
        },
      });
    }
  },
  component: PeticashDetailRoute,
});

function PeticashDetailRoute() {
  return <PeticashDashboard />;
}
