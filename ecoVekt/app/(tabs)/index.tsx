import { Redirect, Href } from "expo-router";
import { useEffect, useState } from "react";
import { auth, db } from "@/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function TabsIndex() {
  const [target, setTarget] = useState<Href | null>(null);

  useEffect(() => {
    const run = async () => {
      const user = auth.currentUser;

      // Ikke innlogget → til login
      if (!user) {
        setTarget("/brukerregistrering/login");
        return;
      }

      // Hent brukerdata
      const snap = await getDoc(doc(db, "users", user.uid));
      const data = snap.exists() ? snap.data() : {};
      const selectedWaste = (data as any).selectedWaste;

      const hasSelectedWaste =
        Array.isArray(selectedWaste) && selectedWaste.length > 0;

      // Ny bruker (kommer til welkommen
      if (!hasSelectedWaste) {
        setTarget("/(tabs)/welcome");
      } else {
        setTarget("/(tabs)/chooseWaste");
      }
    };

    run();
  }, []);

  if (!target) return null;

  return <Redirect href={target} />;
}
