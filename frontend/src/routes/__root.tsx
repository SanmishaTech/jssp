import {
  createRootRoute,
  Outlet,
  useLocation,
} from "@tanstack/react-router";
// import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import Layout from "../Components/sidebar/layout";
import { Toaster } from "sonner";
import { ErrorProvider } from "../Context"; // Import your ErrorProvider
import ErrorBoundary from "../ErrorBoundary"; // Import your ErrorBoundary
import Notfound from "../Notfound";

export const Route = createRootRoute({
  component: () => {
    const location = useLocation();

    // Define the paths where you don't want to show the sidebar
    const noSidebarPaths = ["/", "/login"];

    // Check if the current location path is not in noSidebarPaths
    const shouldShowSidebar = !noSidebarPaths.includes(location.pathname);

    return (
      <ErrorBoundary>
        <ErrorProvider>
          <>
            <Toaster 
              position="top-right"
              closeButton
              toastOptions={{
                style: {
                  marginTop: '1rem',
                  left: '50%',
                  transform: 'translateX(-50%)',
                },
              }}
            />
            <div className={shouldShowSidebar ? "flex pt-2 w-full h-screen overflow-hidden" : "flex w-full h-screen overflow-hidden"}>
              {shouldShowSidebar ? (
                <Layout>
                  <div className="rounded-2xl w-full h-full">
                    <Outlet />
                  </div>
                </Layout>
              ) : (
                <div className="rounded-2xl w-full h-full">
                  <Outlet />
                </div>
              )}
            </div>
          </>
        </ErrorProvider>
      </ErrorBoundary>
    );
  },
  notFoundComponent: () => {
    return <Notfound />;
  },
});
