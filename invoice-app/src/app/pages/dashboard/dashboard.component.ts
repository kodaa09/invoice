import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CreateInvoiceComponent } from '../../components/create-invoice/create-invoice.component';
import { HlmButtonModule } from '@spartan-ng/ui-button-helm';
import { BrnSelectImports } from '@spartan-ng/ui-select-brain';
import { HlmSelectImports } from '@spartan-ng/ui-select-helm';
import { BrnSheetContentDirective, BrnSheetTriggerDirective } from '@spartan-ng/ui-sheet-brain';
import { HlmSheetComponent, HlmSheetContentComponent, HlmSheetHeaderComponent, HlmSheetTitleDirective } from '@spartan-ng/ui-sheet-helm';
import { HlmCaptionComponent, HlmTableComponent, HlmTdComponent, HlmThComponent, HlmTrowComponent } from '@spartan-ng/ui-table-helm';
import { invoiceResponse, InvoiceService } from '../../services/invoice.service';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule, DatePipe, Location, TitleCasePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    HlmButtonModule,
    BrnSelectImports,
    HlmSelectImports,
    HlmSheetComponent,
    HlmSheetContentComponent,
    BrnSheetContentDirective,
    BrnSheetTriggerDirective,
    CreateInvoiceComponent,
    HlmSheetHeaderComponent,
    HlmSheetTitleDirective,
    HlmCaptionComponent,
    HlmTableComponent,
    HlmTdComponent,
    HlmThComponent,
    HlmTrowComponent,
    DatePipe,
    RouterLink,
    TitleCasePipe,
    CommonModule,
    ReactiveFormsModule,
  ],
  template: `
    <div class="h-full w-11/12 mr-auto ml-auto">
      <div class="flex flex-col gap-4 sm:gap-8 sm:flex-row sm:items-center sm:justify-between my-20">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold">Factures</h1>
            @if (invoices().length > 0) {
            <p class="text-xs text-text-secondary">Nombre de facture : {{ invoices().length }}</p>
            } @else {
            <p class="text-xs text-text-secondary">Pas de factures</p>
            }
          </div>
          <hlm-sheet>
            <button class="block sm:hidden" type="button" brnSheetTrigger hlmBtn side="left">Créer une facture</button>
            <hlm-sheet-content *brnSheetContent="let ctx">
              <app-create-invoice (invoiceCreated)="fetchInvoices($event, ctx)" />
            </hlm-sheet-content>
          </hlm-sheet>
        </div>
        <div class="flex flex-col sm:flex-row sm:items-center gap-5 justify-between">
          <form>
            <brn-select class="inline-block" placeholder="Filtrer par status">
              <hlm-select-trigger class="w-56">
                <hlm-select-value />
              </hlm-select-trigger>
              <hlm-select-content>
                <hlm-option value="all" (click)="onChangeStatus($event)">Toutes les factures</hlm-option>
                <hlm-option value="paid" (click)="onChangeStatus($event)">Payer</hlm-option>
                <hlm-option value="pending" (click)="onChangeStatus($event)">En attente</hlm-option>
                <hlm-option value="draft" (click)="onChangeStatus($event)">Brouillon</hlm-option>
              </hlm-select-content>
            </brn-select>
          </form>
          <hlm-sheet>
            <button class="hidden sm:block" type="button" brnSheetTrigger hlmBtn side="left">Créer une facture</button>
            <hlm-sheet-content *brnSheetContent="let ctx">
              <app-create-invoice (invoiceCreated)="fetchInvoices($event, ctx)" />
            </hlm-sheet-content>
          </hlm-sheet>
        </div>
      </div>
      @if (!isLoading()) { @defer (when invoices().length > 0) {
      <hlm-table class="w-full min-w-[400px]">
        <hlm-caption class="mt-10">A list of your recent invoices.</hlm-caption>
        <hlm-trow>
          <hlm-th class="w-[20%]">Invoice</hlm-th>
          <hlm-th class="w-[20%]">Date</hlm-th>
          <hlm-th class="w-[20%]">Client</hlm-th>
          <hlm-th class="w-[20%]">Amount</hlm-th>
          <hlm-th class="w-[20%]">Status</hlm-th>
        </hlm-trow>
        @for (invoice of invoices(); track invoice.id) {
        <a [routerLink]="['/invoice', invoice.id]">
          <hlm-trow>
            <hlm-th class="w-[20%]">{{ invoice.invoiceNumber }}</hlm-th>
            <hlm-th class="w-[20%]">{{ invoice.invoiceDate | date }}</hlm-th>
            <hlm-th class="w-[20%]">{{ invoice.client.fullName }}</hlm-th>
            <hlm-th class="w-[20%]">{{ invoice.total }}€</hlm-th>
            <hlm-th
              class="w-[20%]"
              [ngClass]="{
                'text-orange-600': invoice.status === 'pending',
                'text-green-600': invoice.status === 'paid',
                'text-grey-600': invoice.status === 'draft'
              }"
            >
              {{ invoice.status | titlecase }}
            </hlm-th>
          </hlm-trow>
        </a>
        }
      </hlm-table>
      } @placeholder {
      <div class="flex flex-col items-center">
        <div>
          <img class="object-cover max-w-[250px]" src="/images/invoice-empty.png" alt="" />
        </div>
        <div class="flex flex-col items-center text-center">
          <h2 class="text-2xl font-bold mb-4">There is nothing here</h2>
          <p class="max-w-[195px] text-xs text-text-secondary">Create an invoice by clicking the New Invoice button and get started</p>
        </div>
      </div>
      } @loading {
      <p>Loading...</p>
      } @error {
      <div class="flex flex-col items-center">
        <div>
          <img class="object-cover max-w-[250px]" src="/images/invoice-empty.png" alt="" />
        </div>
        <div class="flex flex-col items-center text-center">
          <h2 class="text-2xl font-bold mb-4">There is nothing here</h2>
          <p class="max-w-[195px] text-xs text-text-secondary">Create an invoice by clicking the New Invoice button and get started</p>
        </div>
      </div>
      } } @else {
      <p>Loading...</p>
      }
    </div>
  `,
  styles: `
    :host {
      height: 100%;
      display: block;
    }
  `,
})
export class DashboardComponent implements OnInit, OnDestroy {
  invoices = signal<invoiceResponse[]>([]);
  isLoading = signal(false);
  private _invoiceService = inject(InvoiceService);
  private _destroy$: Subject<boolean> = new Subject<boolean>();
  private _router = inject(Router);
  private _location = inject(Location);

  ngOnInit() {
    this.isLoading.set(true);
    const queryParams = this._location.path().split('?status=')[1] ? this._location.path().split('?status=')[1] : 'all';
    this._invoiceService
      .getByStatus(queryParams)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res) => {
          this.invoices.set(res);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error(error);
          this.isLoading.set(false);
        },
      });
  }

  ngOnDestroy() {
    this._destroy$.next(true);
  }

  onChangeStatus(event: any) {
    this.isLoading.set(true);

    const status = event.currentTarget.getAttribute('value');
    this._router.navigate([], {
      queryParams: { status },
      queryParamsHandling: '',
    });

    this._invoiceService
      .getByStatus(status)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res) => {
          this.invoices.set(res);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error(error);
          this.isLoading.set(false);
        },
      });
  }

  fetchInvoices(value: any, ctx: any) {
    this.isLoading.set(true);
    this._invoiceService
      .index()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res: invoiceResponse[]) => {
          this.invoices.set(res);
          ctx.close();
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error(error);
          this.isLoading.set(true);
        },
      });
  }
}
