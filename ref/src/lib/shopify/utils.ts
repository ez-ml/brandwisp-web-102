import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function getAccessTokenForShop(shop: string, userId: string): Promise<string | null> {
  const docRef = doc(db, `users/${userId}/shopifyStores/${shop}`);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  return data?.accessToken || null;
}
