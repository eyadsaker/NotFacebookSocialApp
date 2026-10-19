import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import { Offline } from "react-detect-offline";
import { WifiOff } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { router } from "./routing/AppRoutes";
import AuthProvider from "./context/AuthContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30000, retry: 1 },
    mutations: { retry: false, networkMode: "always" },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Offline polling={false}>
          <div role="status" className="sticky top-0 z-[100] flex items-center justify-center gap-2 bg-amber-100 px-4 py-2 text-sm text-amber-900">
            <WifiOff size={16} /> You are offline. Reconnect to load posts and save changes.
          </div>
        </Offline>
        <RouterProvider router={router} />
        <ToastContainer position="top-right" autoClose={4000} />
      </AuthProvider>
    </QueryClientProvider>
  );
}
