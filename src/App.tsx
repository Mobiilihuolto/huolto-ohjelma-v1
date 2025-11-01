import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Asiakkaat from "./pages/Asiakkaat";
import Laitteet from "./pages/Laitteet";
import Huollot from "./pages/Huollot";
import HuoltoKaavake from "./pages/HuoltoKaavake";
import Laskutus from "./pages/Laskutus";
import LaskuEsikatselu from "./pages/LaskuEsikatselu";
import Varasto from "./pages/Varasto";
import Takuu from "./pages/Takuu";
import Asetukset from "./pages/Asetukset";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import "@/i18n/config";

const queryClient = new QueryClient();

const App = () => {
  return (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/asiakkaat" element={
                <ProtectedRoute>
                  <Layout>
                    <Asiakkaat />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/laitteet" element={
                <ProtectedRoute>
                  <Layout>
                    <Laitteet />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/huollot" element={
                <ProtectedRoute>
                  <Layout>
                    <Huollot />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/huollot/:id/kaavake" element={
                <ProtectedRoute>
                  <HuoltoKaavake />
                </ProtectedRoute>
              } />
              <Route path="/laskutus" element={
                <ProtectedRoute>
                  <Layout>
                    <Laskutus />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/laskutus/:id/esikatselu" element={
                <ProtectedRoute>
                  <LaskuEsikatselu />
                </ProtectedRoute>
              } />
              <Route path="/varasto" element={
                <ProtectedRoute>
                  <Layout>
                    <Varasto />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/takuu" element={
                <ProtectedRoute>
                  <Layout>
                    <Takuu />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/asetukset" element={
                <ProtectedRoute>
                  <Layout>
                    <Asetukset />
                  </Layout>
                </ProtectedRoute>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
  );
};

export default App;
