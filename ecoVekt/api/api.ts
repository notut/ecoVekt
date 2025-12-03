import { FirebaseError } from "firebase/app";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { db, auth } from "@/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";

export interface apiData {
    name: string, 
    age: number, 
    address: string,
}

export async function uploadData(data: apiData) {
    try {
        const docRef = await addDoc(collection(db, "exampleData"), data);
        console.log("Doc written with id: ", docRef.id);
        return null;
    } catch (e) {
        if (e instanceof FirebaseError) {
            switch (e.code) {
                case "permission-denied":
                    return "Du har ikke lov til å utføre denne operasjonen";
                case "unauthenticated":
                    return "Du er ikke autorisert til å gjøre denne handlingen";
                default:
                    return "Ukjent feil oppstod";
            }
        }
        return "Ukjent feil oppstod";
    }
}

export async function getData(): Promise<[apiData[], string | null]> {
    try {
        const snapshot = await getDocs(collection(db, "exampleData"));
        return [snapshot.docs.map((doc) => doc.data()) as apiData[], null];
    } catch (e) {
        if (e instanceof FirebaseError) {
            return [[], e.message];
        }

        const message = e instanceof Error ? e.message : "unknown error"
        return [[], message];
    }
}

export async function signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
}