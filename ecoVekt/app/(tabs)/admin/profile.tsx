import {View, Text, Pressable} from 'react-native';
import {Link, useRouter} from 'expo-router';
import {useAuthSession} from 'expo-auth-session';
import {useState, useCallback, use} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import { FlatList } from 'react-native-gesture-handler';

import {getFirestore, collection, doc, getDoc, getDocs, query, where} from 'firebase/firestore';
import {getApp, initializeApp} from 'firebase/app';

export default function ProfilPage() {
    const {userNameSession, signOut} = useAuthSession();
    const router = useRouter();
    const [trashItems, setTrashItems] = useState<TrashItemType[]>([]);
    const [loading, setLoading] = useState(true);

    const getMyTrash = async () => {
        if (!userNameSession){
            setTrashItems([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const userDocRef = doc(db, "users", userNameSession);
            const userDocSnap = await getDoc(userDocRef);

            let selectedWaste: string[] = [];
            if (userSnap.exsits()) {
                const data = userDocSnap.data();
                selectedWaste = Array.isArray(data.selectedWaste) ? data.selectedWaste : [];
            }

            if (selectedWaste.length === 0) {
                setTrashItems([]);
                setLoading(false);
                return;
            }

            const trashCol = collection(db, "trashItems");
            let q;
            if (selectedWaste.length <= 10) {
                q = query(trashCol, where("Author", "==", userNameSession), where("Type", "in", selectedWaste));
            } else {
                q = query(trashCol, where("author", "==", userNameSession));
            }
            const querySnap = await getDocs(q);
            let results: TrashItemType[] = [];
            querySnap.forEach ((docSnap) => {
                results.push(docSnap.id, ...docSnap.data()} as TrashItemType);
            });

            if (selectedWaste.length > 10) {
                results = results.filter(item => selectedWaste.includes(item.Type));
            }

            setTrashItems(results);
        } catch (error) {
            console.error("Feil ved henting av søppel: ", error);
            setTrashItems([]);
        } finally {
            setLoading(false);
        }
        useFocusEffect(
            useCallback(() => {
                getMyTrash();
            }, [userNameSession])
        );