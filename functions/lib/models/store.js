"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreModel = void 0;
const firebase_1 = require("../services/firebase");
class StoreModel {
    static async getById(id) {
        return firebase_1.FirebaseService.getStore(id);
    }
    static async getAllConnectedStores(provider) {
        return firebase_1.FirebaseService.getAllConnectedStores(provider);
    }
    static async getByDomain(domain) {
        return firebase_1.FirebaseService.getStoreByDomain(domain);
    }
    static async updateLastSync(storeId) {
        return firebase_1.FirebaseService.updateStoreLastSync(storeId);
    }
}
exports.StoreModel = StoreModel;
//# sourceMappingURL=store.js.map