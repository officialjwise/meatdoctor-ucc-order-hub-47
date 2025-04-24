import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ThemeProvider } from "./hooks/use-theme";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import AdminOTP from "./pages/AdminOTP";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route component to handle auth
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const tokenExpiry = localStorage.getItem("tokenExpiry");
    
    // Check if token exists and hasn't expired
    const isValid = token && tokenExpiry && new Date().getTime() < parseInt(tokenExpiry);
    setIsAuthenticated(!!isValid);
    
    // If token has expired, clear it
    if (token && tokenExpiry && new Date().getTime() >= parseInt(tokenExpiry)) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("tokenExpiry");
    }
  }, []);
  
  if (isAuthenticated === null) {
    // Still checking authentication
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/admin" replace />;
};

// Main App component
function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <TooltipProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/otp" element={<AdminOTP />} />
              <Route 
                path="/admin/dashboard/*" 
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;