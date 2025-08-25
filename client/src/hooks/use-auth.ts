import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

interface AuthStatus {
  isAuthenticated: boolean;
  username: string | null;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Always return authenticated status for open access
  const { data: authStatus, isLoading } = useQuery<AuthStatus>({
    queryKey: ["/api/auth/status"],
    retry: false,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/auth/logout", {
        method: "POST",
      });
    },
    onSuccess: () => {
      // No need to redirect on logout for open access
      queryClient.setQueryData(["/api/auth/status"], {
        isAuthenticated: true,
        username: 'admin',
      });
    },
  });

  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    isAuthenticated: true, // Always authenticated for open access
    username: 'admin',
    isLoading: false,
    logout,
    isLoggingOut: logoutMutation.isPending,
  };
}