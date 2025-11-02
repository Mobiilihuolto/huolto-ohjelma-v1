import { Suspense, lazy, useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LicenseActivation } from "@/components/LicenseActivation";
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
  const [isLicensed, setIsLicensed] = useState<boolean | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [currentCompanyId, setCurrentCompanyId] = useState<string>('');

  useEffect(() => {
    const checkLicense = async () => {
      if (!window.electron) {
        console.warn('Running in browser mode - skipping license check');
        setIsLicensed(true);
        return;
      }

      try {
        const result = await window.electron.checkLicense();

        if (result.valid) {
          const profileResult = await window.electron.db.get(
            'SELECT user_id, company_id FROM profiles WHERE role = ? LIMIT 1',
            ['admin']
          );

          if (profileResult.success && profileResult.data) {
            setCurrentUserId(profileResult.data.user_id);
            setCurrentCompanyId(profileResult.data.company_id);
            setIsLicensed(true);
          } else {
            setIsLicensed(false);
          }
        } else {
          setIsLicensed(false);
        }
      } catch (error) {
        console.error('License check error:', error);
        setIsLicensed(false);
      }
    };

    checkLicense();
  }, []);

  const handleLicenseActivated = (userId: string, companyId: string) => {
    setCurrentUserId(userId);
    setCurrentCompanyId(companyId);
    setIsLicensed(true);
  };

  if (isLicensed === null) {
    return <LoadingFallback />;
  }

  if (!isLicensed) {
    return <LicenseActivation onActivated={handleLicenseActivated} />;
  }

  return (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <AuthProvider userId={currentUserId} companyId={currentCompanyId}>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
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
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </AuthProvider>
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
  );
};

export default App;
