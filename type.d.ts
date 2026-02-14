interface AuthState {
    isSignedIn: boolean;
    userName: string | null;
    userId: string | null;
}

type AuthContextType = {
    isSignedIn: boolean;
    userName: string | null;
    userId: string | null;
    refreshAuth: () => Promise<boolean>;
    signIn: () => Promise<boolean>;
    signOut: () => Promise<boolean>;
}