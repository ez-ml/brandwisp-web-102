import { FirebaseService } from '../services/firebase';

export class StoreModel {
  static async getById(id: string): Promise<any> {
    return FirebaseService.getStore(id);
  }

  static async getAllConnectedStores(provider?: string): Promise<any[]> {
    return FirebaseService.getAllConnectedStores(provider);
  }

  static async getByDomain(domain: string): Promise<any> {
    return FirebaseService.getStoreByDomain(domain);
  }

  static async updateLastSync(storeId: string): Promise<void> {
    return FirebaseService.updateStoreLastSync(storeId);
  }
} 