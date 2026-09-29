import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DecisionStatus, DocumentItem } from './document.model';

@Injectable({ providedIn: 'root' })
export class DocumentApiService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = '/api/documents';

  getAll(): Promise<DocumentItem[]> {
    return firstValueFrom(this.http.get<DocumentItem[]>(this.endpoint));
  }

  decide(id: string, status: DecisionStatus, reason: string): Promise<DocumentItem> {
    return firstValueFrom(
      this.http.post<DocumentItem>(`${this.endpoint}/${id}/decision`, { status, reason }),
    );
  }
}
