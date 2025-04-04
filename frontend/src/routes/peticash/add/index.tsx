import { createFileRoute, redirect } from "@tanstack/react-router";
import PeticashForm from "../../../Components/peticash/PeticashForm";
import { toast } from "sonner";

export const Route = createFileRoute("/peticash/add/")({
  beforeLoad: async () => {
    // Check authentication
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to access this page");
      throw redirect({
        to: "/login",
        search: {
          redirect: window.location.pathname,
        },
      });
    }
  },
  component: AddPeticashRoute,
});

function AddPeticashRoute() {
  return <PeticashForm />;
} 