import { StrictMode, useState } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import GlobalErrorComponent from "./Globalcomponent";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      onError: (error) => {
        if (error.response?.status === 500) {
          setShowGlobalError(true);
        }
      },
    },
    mutations: {
      onError: (error) => {
        if (error.response?.status === 500) {
          setShowGlobalError(true);
        }
      },
    },
  },
});

const App = () => {
  const [showGlobalError, setShowGlobalError] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      {showGlobalError ? (
        <GlobalErrorComponent />
      ) : (
        <RouterProvider router={router} />
      )}
    </QueryClientProvider>
  );
};

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
