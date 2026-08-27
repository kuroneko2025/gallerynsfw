import { Injectable, inject } from '@angular/core';
import { ApiResponse } from '../models/access.models';
import { LinktreePublicConfig } from '../models/linktree.models';
import { KuronekoApiService } from './kuroneko-api.service';

type LinktreeConfigResponse = ApiResponse<Partial<LinktreePublicConfig>>;

@Injectable({
  providedIn: 'root'
})
export class LinktreeConfigService {
  private readonly api = inject(KuronekoApiService);

  async getPublicConfig(): Promise<LinktreePublicConfig> {
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
}
