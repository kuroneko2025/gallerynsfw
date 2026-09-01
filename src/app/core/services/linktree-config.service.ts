import { Injectable, inject } from '@angular/core';
import { ApiResponse } from '../models/access.models';
import { LinktreePublicConfig } from '../models/linktree.models';
import { KuronekoApiService } from './kuroneko-api.service';

type LinktreeConfigResponse = ApiResponse<Partial<LinktreePublicConfig>>;
type LinktreeConfigCacheEntry = {
  readonly savedAt: number;
  readonly config: LinktreePublicConfig;
};

const LINKTREE_CONFIG_CACHE_KEY = 'kuronekoLinktreePublicConfig';
const LINKTREE_CONFIG_CACHE_TTL_MS = 2 * 60 * 1000;

@Injectable({
  providedIn: 'root'
})
export class LinktreeConfigService {
  private readonly api = inject(KuronekoApiService);
  private pendingRequest: Promise<LinktreePublicConfig> | null = null;

  async getPublicConfig(): Promise<LinktreePublicConfig> {
    const cachedConfig = this.readCachedConfig();
    if (cachedConfig) return cachedConfig;
    if (this.pendingRequest) return this.pendingRequest;

    const request = this.fetchPublicConfig();
    this.pendingRequest = request;

    try {
      const config = await request;
      this.writeCachedConfig(config);

      return config;
    } finally {
      if (this.pendingRequest === request) {
        this.pendingRequest = null;
      }
    }
  }

  clearCachedPublicConfig(): void {
    this.pendingRequest = null;

    try {
      sessionStorage.removeItem(LINKTREE_CONFIG_CACHE_KEY);
    } catch {
      // Storage can be unavailable in restricted browser modes.
    }
  }

  private async fetchPublicConfig(): Promise<LinktreePublicConfig> {
    const response = await this.api.post<LinktreeConfigResponse>({
      action: 'get_linktree_config'
    });

    if (!response.success) {
      throw new Error(response.message || 'Could not load Linktree configuration.');
    }

    if (!response.settings || !Array.isArray(response.items)) {
      throw new Error('Invalid Linktree configuration response.');
    }

    return {
      settings: response.settings,
      items: response.items
    };
  }

  private readCachedConfig(): LinktreePublicConfig | null {
    try {
      const rawCache = sessionStorage.getItem(LINKTREE_CONFIG_CACHE_KEY);
      if (!rawCache) return null;

      const parsed = JSON.parse(rawCache) as unknown;
      if (!this.isCacheEntry(parsed)) {
        sessionStorage.removeItem(LINKTREE_CONFIG_CACHE_KEY);
        return null;
      }

      if (Date.now() - parsed.savedAt > LINKTREE_CONFIG_CACHE_TTL_MS) {
        sessionStorage.removeItem(LINKTREE_CONFIG_CACHE_KEY);
        return null;
      }

      return parsed.config;
    } catch {
      return null;
    }
  }

  private writeCachedConfig(config: LinktreePublicConfig): void {
    try {
      const entry: LinktreeConfigCacheEntry = {
        savedAt: Date.now(),
        config
      };

      sessionStorage.setItem(LINKTREE_CONFIG_CACHE_KEY, JSON.stringify(entry));
    } catch {
      // Cache is an optimization only; the backend response remains the source of truth.
    }
  }

  private isCacheEntry(value: unknown): value is LinktreeConfigCacheEntry {
    if (!this.isRecord(value)) return false;
    if (typeof value['savedAt'] !== 'number') return false;

    const config = value['config'];
    return this.isRecord(config) && this.isRecord(config['settings']) && Array.isArray(config['items']);
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
