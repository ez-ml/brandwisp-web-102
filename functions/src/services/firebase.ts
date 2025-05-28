import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

export class FirebaseService {
  static async saveProduct(storeId: string, productData: any): Promise<void> {
    try {
      const productRef = db.collection('stores').doc(storeId).collection('products').doc(productData.id);
      
      const product = {
        ...productData,
        storeId,
        syncedAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      };

      // Check if product exists
      const existingProduct = await productRef.get();
      if (!existingProduct.exists) {
        product.createdAt = admin.firestore.Timestamp.now();
      }

      await productRef.set(product, { merge: true });
    } catch (error) {
      console.error('Error saving product:', error);
      throw error;
    }
  }

  static async updateStoreLastSync(storeId: string): Promise<void> {
    try {
      await db.collection('stores').doc(storeId).update({
        lastSyncAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating store last sync:', error);
      throw error;
    }
  }

  static async getStore(storeId: string): Promise<any> {
    try {
      const storeDoc = await db.collection('stores').doc(storeId).get();
      return storeDoc.exists ? { id: storeDoc.id, ...storeDoc.data() } : null;
    } catch (error) {
      console.error('Error getting store:', error);
      return null;
    }
  }

  static async getAllConnectedStores(provider?: string): Promise<any[]> {
    try {
      let query = db.collection('stores').where('status', '==', 'connected');
      
      if (provider) {
        query = query.where('provider', '==', provider);
      }
      
      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting connected stores:', error);
      return [];
    }
  }

  static async getStoreByDomain(domain: string): Promise<any> {
    try {
      const snapshot = await db.collection('stores')
        .where('storeUrl', '==', domain)
        .limit(1)
        .get();
      
      return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    } catch (error) {
      console.error('Error getting store by domain:', error);
      return null;
    }
  }
} 