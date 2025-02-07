import {
  createRootRoute,
  Link,
  Outlet,
  useLocation,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import Layout from "../Components/sidebar/layout";
import { Toaster } from "sonner";

export const Route = createRootRoute({
  component: () => {
    const location = useLocation();

    // Define the path where you don't want to show the sidebar
    const noSidebarPath = "/";

    // Check if the current location path is not the login path
    const shouldShowSidebar = location.pathname !== noSidebarPath;

    return (
      <>
        <Toaster />
        <div className={shouldShowSidebar ? "flex pt-2" : "flex"}>
          {shouldShowSidebar && (
            <div className="text-white">
              <Layout />
            </div>
          )}
          <div className="rounded-2xl w-full">
            <Outlet />
            <TanStackRouterDevtools />
          </div>
        </div>
      </>
    );
  },
});
