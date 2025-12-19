
import { useState, useEffect, createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: string | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user role
          setTimeout(async () => {
            try {
              const { data: roleData, error } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', session.user.id)
                .maybeSingle(); // Use maybeSingle() to prevent errors when no role is found
              
              if (error) {
                console.error('Error fetching user role:', error);
              }
              
              setUserRole(roleData?.role ?? null);
            } catch (error) {
              console.error('Error fetching user role:', error);
            }
          }, 0);
        } else {
          setUserRole(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string, userData: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`,
        data: userData
      }
    });

    if (error) {
      // Handle "User already registered" case with a friendlier message
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        toast({
          title: "Account Exists",
          description: "An account with this email already exists. Please sign in instead or reset your password.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Signup Error",
          description: error.message,
          variant: "destructive"
        });
      }
    } else if (data?.user?.identities?.length === 0) {
      // User already exists but tried to sign up again
      toast({
        title: "Account Already Exists",
        description: "An account with this email already exists. Please sign in or reset your password if you forgot it.",
        variant: "destructive"
      });
      return { error: new Error("User already exists") };
    } else if (data?.user && !data?.session) {
      // Email confirmation required
      toast({
        title: "Check Your Email!",
        description: "We've sent a confirmation link to your email. Please click it to activate your account before signing in.",
      });
    } else {
      toast({
        title: "Success!",
        description: "Account created successfully!",
      });
    }

    return { error };
  }, [toast]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      // Provide friendlier error messages
      let errorMessage = error.message;
      let errorTitle = "Login Error";
      
      if (error.message.includes('Invalid login credentials')) {
        errorTitle = "Unable to Sign In";
        errorMessage = "Invalid email or password. If you just signed up, please check your email for a confirmation link first.";
      } else if (error.message.includes('Email not confirmed')) {
        errorTitle = "Email Not Verified";
        errorMessage = "Please check your email and click the confirmation link before signing in.";
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
    }

    return { error };
  }, [toast]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  }, [toast]);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?mode=reset`
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Reset email sent",
        description: "Check your email for password reset instructions"
      });
    }

    return { error };
  }, [toast]);

  const value = useMemo(() => ({
    user,
    session,
    userRole,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword
  }), [user, session, userRole, loading, signUp, signIn, signOut, resetPassword]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
