import { createFileRoute, redirect } from "@tanstack/react-router";
import PeticashDashboard from "../../Components/bank/PeticashDashboard";
import axios from "axios";
import { toast } from "sonner";

// Add authorization headers to axios requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle unauthorized responses
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem("token");
      toast.error("Session expired. Please login again.");
     }
    return Promise.reject(error);
  }
);

export const Route = createFileRoute<{ id?: string }>("/bank/:id?")({
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
  component: RouteComponent,
});

function RouteComponent() {
  return <PeticashDashboard />;
}
