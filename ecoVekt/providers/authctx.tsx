import { auth, db } from "@/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import {
  signOut as fbSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";


// logikk for logging
type AuthContextType = {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  userNameSession: string | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuthSession() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuthSession must be within an AuthContext provider");
  }
  return value;
}

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [userSession, setUserSession] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      try {
        if (user) {
          setUserSession(user.email ?? null);
        } else {
          setUserSession(null);
        }
      } finally {
        setIsLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      await AsyncStorage.setItem("authSession", email);
      setUserSession(email);
      router.replace("/"); // nå: sender bruker til rot-siden ved innlogging
    } catch (error: any) {
      console.log("Login error:", error.code);
      if (error.code === "auth/user-not-found") {
        alert(
          "Ingen bruker funnet med denne e-posten. Prøv en annen eller registrer ny bruker"
        );
      } else if (error.code === "auth/wrong-password") {
        alert("Feil passord, prøv igjen.");
      } else {
        alert("Innlogging feilet..");
      }
    }
  };

  const signOut = async () => {
    await fbSignOut(auth);
    await AsyncStorage.removeItem("authSession");
    setUserSession(null);
    router.replace("/brukerregistrering/autentication");
  };

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        userNameSession: userSession,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContextProvider;
