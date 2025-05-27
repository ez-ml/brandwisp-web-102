import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, getDocs, runTransaction, deleteField } from '@firebase/firestore';
import { db } from '@/lib/firebase';
import { StoreConnection, StoreProvider, StoreStatus, StoreWebhook } from '@/types/store';
import { generateId } from '@/lib/utils';

const STORES_COLLECTION = 'stores';
const WEBHOOKS_COLLECTION = 'webhooks';

export class StoreModel {
  static async create(data: Omit<StoreConnection, 'id' | 'createdAt' | 'updatedAt'>): Promise<StoreConnection> {
    const id = generateId();
    const now = new Date();
    const store: StoreConnection = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(doc(db, STORES_COLLECTION, id), store);
    return store;
  }

  static async update(id: string, data: Partial<StoreConnection>): Promise<void> {
    const updateData = {
      ...data,
      updatedAt: new Date(),
    };
    await updateDoc(doc(db, STORES_COLLECTION, id), updateData);
  }

  static async getById(id: string): Promise<StoreConnection | null> {
    const docRef = doc(db, STORES_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as StoreConnection) : null;
  }

  static async getByUserId(userId: string): Promise<StoreConnection[]> {
    const q = query(collection(db, STORES_COLLECTION), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as StoreConnection);
  }

  static async getByProvider(userId: string, provider: StoreProvider): Promise<StoreConnection[]> {
    const q = query(
      collection(db, STORES_COLLECTION),
      where('userId', '==', userId),
      where('provider', '==', provider)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as StoreConnection);
  }

  static async getActiveByDomain(domain: string): Promise<StoreConnection | null> {
    const q = query(
      collection(db, STORES_COLLECTION),
      where('storeUrl', '==', domain),
      where('status', '==', 'connected')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty ? null : (querySnapshot.docs[0].data() as StoreConnection);
  }

  static async disconnect(id: string): Promise<void> {
    try {
      // Get the current store
      const store = await this.getById(id);
      if (!store) {
        throw new Error('Store not found');
      }

      // Remove all webhooks if they exist
      if (store.webhooks && store.webhooks.length > 0) {
        for (const webhook of store.webhooks) {
          try {
            await this.removeWebhook(store.id, webhook.id);
          } catch (err) {
            console.error(`Failed to remove webhook ${webhook.id}:`, err);
            // Continue with other webhooks even if one fails
          }
        }
      }

      // Update store status and clear sensitive data
      const updateData = {
        status: 'disconnected' as StoreStatus,
        webhooks: [],
        updatedAt: new Date(),
      };

      // Remove sensitive fields
      await updateDoc(doc(db, STORES_COLLECTION, id), {
        ...updateData,
        accessToken: deleteField(),
        refreshToken: deleteField(),
      });

      console.log('Successfully disconnected store:', id);
    } catch (error) {
      console.error('Error in disconnect:', error);
      throw error; // Re-throw to handle in the API layer
    }
  }

  static async reconnect(id: string, data: Partial<StoreConnection>): Promise<void> {
    await runTransaction(db, async (transaction) => {
      const storeRef = doc(db, STORES_COLLECTION, id);
      const storeDoc = await transaction.get(storeRef);
      
      if (!storeDoc.exists()) {
        throw new Error('Store not found');
      }

      const store = storeDoc.data() as StoreConnection;
      if (store.status !== 'disconnected') {
        throw new Error('Store is not in disconnected state');
      }

      transaction.update(storeRef, {
        ...data,
        status: 'connected',
        updatedAt: new Date(),
      });
    });
  }

  static async addWebhook(storeId: string, webhook: Omit<StoreWebhook, 'id' | 'storeId' | 'createdAt' | 'updatedAt'>): Promise<StoreWebhook> {
    const id = generateId();
    const now = new Date();
    const webhookData: StoreWebhook = {
      ...webhook,
      id,
      storeId,
      createdAt: now,
      updatedAt: now,
      status: 'active',
    };

    await setDoc(doc(db, WEBHOOKS_COLLECTION, id), webhookData);
    
    // Update store's webhooks array
    const store = await this.getById(storeId);
    if (store) {
      const webhooks = store.webhooks || [];
      webhooks.push(webhookData);
      await this.update(storeId, { webhooks });
    }

    return webhookData;
  }

  static async removeWebhook(storeId: string, webhookId: string): Promise<void> {
    await deleteDoc(doc(db, WEBHOOKS_COLLECTION, webhookId));
    
    // Update store's webhooks array
    const store = await this.getById(storeId);
    if (store && store.webhooks) {
      const webhooks = store.webhooks.filter(w => w.id !== webhookId);
      await this.update(storeId, { webhooks });
    }
  }

  static async validateNewConnection(userId: string, provider: StoreProvider, domain: string): Promise<boolean> {
    // Check if the same user already has this store connected
    const q = query(
      collection(db, STORES_COLLECTION),
      where('userId', '==', userId),
      where('storeUrl', '==', domain),
      where('status', '==', 'connected')
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      throw {
        code: 'DUPLICATE_STORE',
        message: 'You have already connected this store to your account',
      };
    }

    // Get user's current store count
    const userStores = await this.getByUserId(userId);
    const activeStores = userStores.filter(s => s.status === 'connected');

    // TODO: Get user's plan limit from subscription
    const storeLimit = 3; // Default limit, should come from user's subscription plan
    if (activeStores.length >= storeLimit) {
      throw {
        code: 'STORE_LIMIT_EXCEEDED',
        message: `You have reached your store limit (${storeLimit}). Please upgrade your plan to add more stores.`,
      };
    }

    return true;
  }

  static async getAllConnectedStores(provider?: StoreProvider): Promise<StoreConnection[]> {
    let q;
    if (provider) {
      q = query(
        collection(db, STORES_COLLECTION),
        where('status', '==', 'connected'),
        where('provider', '==', provider)
      );
    } else {
      q = query(
        collection(db, STORES_COLLECTION),
        where('status', '==', 'connected')
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as StoreConnection);
  }

  static async getByDomain(domain: string): Promise<StoreConnection | null> {
    const q = query(
      collection(db, STORES_COLLECTION),
      where('storeUrl', '==', domain)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty ? null : (querySnapshot.docs[0].data() as StoreConnection);
  }

  static async updateLastSync(storeId: string): Promise<void> {
    await this.update(storeId, {
      lastSyncAt: new Date(),
    });
  }
} 