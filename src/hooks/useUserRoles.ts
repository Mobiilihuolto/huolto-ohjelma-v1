import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'teknikko' | 'kayttaja';
  created_at: string;
}

export interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  roles: string[];
}

// Fetch all users with their roles
export function useUsersWithRoles() {
  return useQuery({
    queryKey: ["users-with-roles"],
    queryFn: async () => {
      // First, get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: true });

      if (profilesError) throw profilesError;

      // Then, get all user roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      // Combine the data
      const usersWithRoles: UserWithRole[] = profiles.map((profile) => {
        const userRoles = roles
          ?.filter((role) => role.user_id === profile.user_id)
          .map((role) => role.role) || [];

        return {
          id: profile.user_id,
          email: profile.email || "",
          full_name: profile.full_name,
          created_at: profile.created_at,
          roles: userRoles,
        };
      });

      return usersWithRoles;
    },
  });
}

// Add role to user
export function useAddUserRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'admin' | 'teknikko' | 'kayttaja' }) => {
      const { data, error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-with-roles"] });
      toast({
        title: "Rooli lisätty",
        description: "Käyttäjälle on lisätty uusi rooli.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Virhe",
        description: error.message || "Roolin lisääminen epäonnistui.",
        variant: "destructive",
      });
    },
  });
}

// Remove role from user
export function useRemoveUserRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'admin' | 'teknikko' | 'kayttaja' }) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-with-roles"] });
      toast({
        title: "Rooli poistettu",
        description: "Käyttäjän rooli on poistettu.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Virhe",
        description: error.message || "Roolin poistaminen epäonnistui.",
        variant: "destructive",
      });
    },
  });
}

// Get current user's roles
export function useCurrentUserRoles() {
  return useQuery({
    queryKey: ["current-user-roles"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (error) throw error;
      return data.map((r) => r.role as 'admin' | 'teknikko' | 'kayttaja');
    },
  });
}

// Delete user completely from system
export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (userId: string) => {
      // First delete all user roles
      const { error: rolesError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (rolesError) throw rolesError;

      // Then delete the profile
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("user_id", userId);

      if (profileError) throw profileError;

      // Finally delete from auth (requires admin privileges)
      // Note: This requires service role key, so we'll handle this via edge function if needed
      // For now, we just delete roles and profile
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-with-roles"] });
      toast({
        title: "Käyttäjä poistettu",
        description: "Käyttäjä on poistettu järjestelmästä.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Virhe",
        description: error.message || "Käyttäjän poistaminen epäonnistui.",
        variant: "destructive",
      });
    },
  });
}
