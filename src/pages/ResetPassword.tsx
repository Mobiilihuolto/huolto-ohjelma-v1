import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wrench } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { supabase } from "@/integrations/supabase/client";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation(['auth', 'common']);

  useEffect(() => {
    // Listen for PASSWORD_RECOVERY event from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setRecoveryMode(true);
          setIsValidating(false);
        } else if (event === 'SIGNED_IN' && !recoveryMode) {
          // If user is already signed in and not in recovery mode, redirect
          navigate('/');
        }
      }
    );

    // Timeout: If no recovery token is received within 3 seconds, show error
    const timeout = setTimeout(() => {
      if (!recoveryMode) {
        setIsValidating(false);
        toast({
          title: t('common:error'),
          description: t('auth:invalidResetLink'),
          variant: "destructive",
        });
        setTimeout(() => navigate("/auth"), 2000);
      }
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate, toast, t, recoveryMode]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast({
        title: t('common:error'),
        description: t('auth:errors.fillAllFields'),
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: t('common:error'),
        description: t('auth:errors.passwordLength'),
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: t('common:error'),
        description: t('auth:passwordsDoNotMatch'),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    setLoading(false);

    if (error) {
      toast({
        title: t('common:error'),
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: t('common:success'),
        description: t('auth:passwordResetSuccess'),
      });
      navigate("/auth");
    }
  };

  // Show loading state while validating token
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">{t('auth:validatingResetLink')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error if recovery mode is not active
  if (!recoveryMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[300px]">
            <p className="text-destructive mb-4">{t('auth:invalidResetLink')}</p>
            <Button onClick={() => navigate("/auth")}>{t('auth:backToSignIn')}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Wrench className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">{t('auth:resetPassword')}</CardTitle>
          <CardDescription>
            {t('auth:enterNewPassword')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">{t('auth:newPassword')}</Label>
              <PasswordInput
                id="new-password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">{t('auth:confirmPassword')}</Label>
              <PasswordInput
                id="confirm-password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('auth:updatePassword')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => navigate("/auth")}
            >
              {t('auth:backToSignIn')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
