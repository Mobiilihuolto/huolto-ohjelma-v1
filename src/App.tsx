import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Loader2 } from "lucide-react";
import "@/i18n/config";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Asiakkaat = lazy(() => import("./pages/Asiakkaat"));
const Laitteet = lazy(() => import("./pages/Laitteet"));
const Huollot = lazy(() => import("./pages/Huollot"));
const HuoltoKaavake = lazy(() => import("./pages/HuoltoKaavake"));
const Laskutus = lazy(() => import("./pages/Laskutus"));
const LaskuEsikatselu = lazy(() => import("./pages/LaskuEsikatselu"));
const Varasto = lazy(() => import("./pages/Varasto"));
const Takuu = lazy(() => import("./pages/Takuu"));
const Asetukset = lazy(() => import("./pages/Asetukset"));
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <div className="text-lg text-muted-foreground">Ladataan...</div>
    </div>
  </div>
);

const App = () => {
  return (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<LoadingFallback />}>
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
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
  );
};

export default App;
