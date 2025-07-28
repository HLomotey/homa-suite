import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { AuthProvider, ProtectedRoute } from "@/components/auth";
import { router } from "./routes";
import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  // Force dark theme by setting a class on the document element
  useEffect(() => {
    document.documentElement.classList.add('dark');
    // Remove the no-js class if it exists
    document.documentElement.classList.remove('no-js');
    
    // Disable theme switching by setting a flag
    localStorage.setItem('homa-suite-theme', 'dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" forcedTheme="dark" storageKey="homa-suite-theme">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <ProtectedRoute>
              <RouterProvider router={router} />
            </ProtectedRoute>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
