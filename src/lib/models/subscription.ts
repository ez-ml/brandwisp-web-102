import { collection, doc, getDoc, setDoc, updateDoc, query, where, getDocs } from '@firebase/firestore';
import { db } from '@/lib/firebase';
import { Subscription, PlanTier } from '@/types/subscription';
import { generateId } from '@/lib/utils';

const SUBSCRIPTIONS_COLLECTION = 'subscriptions';

export class SubscriptionModel {
  static async create(data: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subscription> {
    const id = generateId();
    const now = new Date();
    const subscription: Subscription = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(doc(db, SUBSCRIPTIONS_COLLECTION, id), subscription);
    return subscription;
  }

  static async update(id: string, data: Partial<Subscription>): Promise<void> {
    const updateData = {
      ...data,
      updatedAt: new Date(),
    };
    await updateDoc(doc(db, SUBSCRIPTIONS_COLLECTION, id), updateData);
  }

  static async getById(id: string): Promise<Subscription | null> {
    const docRef = doc(db, SUBSCRIPTIONS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as Subscription : null;
  }

  static async getByUserId(userId: string): Promise<Subscription | null> {
    const q = query(
      collection(db, SUBSCRIPTIONS_COLLECTION),
      where('userId', '==', userId),
      where('status', '==', 'active')
    );
    const querySnapshot = await getDocs(q);
    const subscriptions = querySnapshot.docs.map(doc => doc.data() as Subscription);
    return subscriptions[0] || null;
  }

  static async cancelSubscription(id: string): Promise<void> {
    await this.update(id, {
      status: 'canceled',
      cancelAtPeriodEnd: true,
    });
  }

  static async reactivateSubscription(id: string): Promise<void> {
    await this.update(id, {
      status: 'active',
      cancelAtPeriodEnd: false,
    });
  }
} 