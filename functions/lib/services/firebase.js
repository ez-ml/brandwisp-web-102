"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseService = void 0;
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
class FirebaseService {
    static async saveProduct(storeId, productData) {
        try {
            const productRef = db.collection('stores').doc(storeId).collection('products').doc(productData.id);
            const product = Object.assign(Object.assign({}, productData), { storeId, syncedAt: admin.firestore.Timestamp.now(), updatedAt: admin.firestore.Timestamp.now() });
            // Check if product exists
            const existingProduct = await productRef.get();
            if (!existingProduct.exists) {
                product.createdAt = admin.firestore.Timestamp.now();
            }
            await productRef.set(product, { merge: true });
        }
        catch (error) {
            console.error('Error saving product:', error);
            throw error;
        }
    }
    static async updateStoreLastSync(storeId) {
        try {
            await db.collection('stores').doc(storeId).update({
                lastSyncAt: admin.firestore.Timestamp.now(),
                updatedAt: admin.firestore.Timestamp.now(),
            });
        }
        catch (error) {
            console.error('Error updating store last sync:', error);
            throw error;
        }
    }
    static async getStore(storeId) {
        try {
            const storeDoc = await db.collection('stores').doc(storeId).get();
            return storeDoc.exists ? Object.assign({ id: storeDoc.id }, storeDoc.data()) : null;
        }
        catch (error) {
            console.error('Error getting store:', error);
            return null;
        }
    }
    static async getAllConnectedStores(provider) {
        try {
            let query = db.collection('stores').where('status', '==', 'connected');
            if (provider) {
                query = query.where('provider', '==', provider);
            }
            const snapshot = await query.get();
            return snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        }
        catch (error) {
            console.error('Error getting connected stores:', error);
            return [];
        }
    }
    static async getStoreByDomain(domain) {
        try {
            const snapshot = await db.collection('stores')
                .where('storeUrl', '==', domain)
                .limit(1)
                .get();
            return snapshot.empty ? null : Object.assign({ id: snapshot.docs[0].id }, snapshot.docs[0].data());
        }
        catch (error) {
            console.error('Error getting store by domain:', error);
            return null;
        }
    }
}
exports.FirebaseService = FirebaseService;
//# sourceMappingURL=firebase.js.map