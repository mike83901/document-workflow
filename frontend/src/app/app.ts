import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DocumentApiService } from './documents-api.service';
import { DecisionStatus, DocumentItem, DocumentStatus } from './document.model';

type StatusFilter = 'All' | DocumentStatus;

@Component({
  selector: 'app-root',
  imports: [DatePipe, FormsModule],
  templateUrl: './approval-queue.html',
})
export class App {
  private readonly api = inject(DocumentApiService);
  protected readonly documents = signal<DocumentItem[]>([]);
  protected readonly filter = signal<StatusFilter>('All');
  protected readonly search = signal('');
  protected readonly selectedId = signal<string | null>(null);
  protected readonly modalAction = signal<DecisionStatus | null>(null);
  protected readonly reason = signal('');
  protected readonly loading = signal(true);
  protected readonly loadedAt = new Date();
  protected readonly saving = signal(false);
  protected readonly error = signal('');
  protected readonly notice = signal('');
  protected readonly visibleDocuments = computed(() => {
    const query = this.search().trim().toLocaleLowerCase();
    return this.documents().filter((document) => {
      const matchesFilter = this.filter() === 'All' || document.status === this.filter();
      const matchesSearch =
        !query ||
        [document.documentNumber, document.title, document.category, document.submittedBy].some(
          (value) => value.toLocaleLowerCase().includes(query),
        );
      return matchesFilter && matchesSearch;
    });
  });
  protected readonly selectedDocument = computed(
    () => this.documents().find((document) => document.id === this.selectedId()) ?? null,
  );
  protected readonly pendingCount = computed(
    () => this.documents().filter((document) => document.status === 'Pending').length,
  );
  protected readonly approvedCount = computed(
    () => this.documents().filter((document) => document.status === 'Approved').length,
  );
  protected readonly rejectedCount = computed(
    () => this.documents().filter((document) => document.status === 'Rejected').length,
  );

  constructor() {
    void this.loadDocuments();
  }

  protected async loadDocuments(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      this.documents.set(await this.api.getAll());
    } catch {
      this.error.set('เชื่อมต่อระบบไม่สำเร็จ กรุณาตรวจสอบว่า API กำลังทำงาน');
    } finally {
      this.loading.set(false);
    }
  }

  protected setFilter(filter: StatusFilter): void {
    this.filter.set(filter);
    this.selectedId.set(null);
  }

  protected toggleSelection(document: DocumentItem, event: Event): void {
    if (document.status !== 'Pending') return;
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedId.set(checked ? document.id : null);
    this.notice.set('');
  }

  protected openDecision(status: DecisionStatus): void {
    if (!this.selectedDocument() || this.selectedDocument()?.status !== 'Pending') return;
    this.reason.set('');
    this.error.set('');
    this.modalAction.set(status);
  }

  protected closeModal(): void {
    if (this.saving()) return;
    this.modalAction.set(null);
    this.reason.set('');
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closeModal();
  }

  protected async confirmDecision(): Promise<void> {
    const document = this.selectedDocument();
    const status = this.modalAction();
    const reason = this.reason().trim();
    if (!document || !status || !reason || this.saving()) return;

    this.saving.set(true);
    this.error.set('');
    try {
      const updated = await this.api.decide(document.id, status, reason);
      this.documents.update((documents) =>
        documents.map((item) => (item.id === updated.id ? updated : item)),
      );
      this.selectedId.set(null);
      this.modalAction.set(null);
      this.reason.set('');
      this.notice.set(
        status === 'Approved' ? 'อนุมัติเอกสารเรียบร้อยแล้ว' : 'ไม่อนุมัติเอกสารเรียบร้อยแล้ว',
      );
    } catch (error) {
      const response = error as HttpErrorResponse;
      this.error.set(
        response.status === 409
          ? 'เอกสารนี้ได้รับการพิจารณาไปแล้ว กรุณาโหลดรายการใหม่'
          : 'บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง',
      );
    } finally {
      this.saving.set(false);
    }
  }

  protected statusLabel(status: DocumentStatus): string {
    return { Pending: 'รออนุมัติ', Approved: 'อนุมัติแล้ว', Rejected: 'ไม่อนุมัติ' }[status];
  }
}
