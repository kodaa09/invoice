import { Component, inject, OnDestroy, OnInit, Signal, signal } from '@angular/core';
import { DatePipe, Location, TitleCasePipe } from '@angular/common';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { invoiceResponse, InvoiceService } from '../../services/invoice.service';
import { Subject, takeUntil } from 'rxjs';
import { HlmCaptionComponent, HlmTableComponent, HlmTdComponent, HlmThComponent, HlmTrowComponent } from '@spartan-ng/ui-table-helm';
import { HlmSheetComponent, HlmSheetContentComponent } from '@spartan-ng/ui-sheet-helm';
import { BrnSheetContentDirective, BrnSheetTriggerDirective } from '@spartan-ng/ui-sheet-brain';
import { UpdateInvoiceComponent } from '../../components/update-invoice/update-invoice.component';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [
    HlmButtonDirective,
    TitleCasePipe,
    DatePipe,
    HlmCaptionComponent,
    HlmTableComponent,
    HlmTdComponent,
    HlmThComponent,
    HlmTrowComponent,
    HlmSheetComponent,
    HlmSheetContentComponent,
    BrnSheetContentDirective,
    BrnSheetTriggerDirective,
    UpdateInvoiceComponent,
  ],
  template: `
    <div class="h-full mr-auto ml-auto max-w-[730px]">
      <div class="my-10">
        <button hlmBtn type="button" variant="link" (click)="goBack()">Go back</button>
      </div>
      @if (!isLoading()) { @defer (when invoice()) {
      <div class="flex justify-between bg-white py-8 px-5 rounded-lg mb-10">
        <div class="flex gap-4 items-center">
          <p>Status</p>
          <div>
            {{ invoice()?.status | titlecase }}
          </div>
        </div>
        <div class="flex gap-4 items-center">
          <hlm-sheet>
            <button hlmBtn brnSheetTrigger side="left" type="button" variant="secondary">Edit</button>
            <hlm-sheet-content *brnSheetContent="let ctx">
              <app-update-invoice [invoice]="invoice()" (invoiceUpdated)="fetchInvoice($event, ctx)" />
            </hlm-sheet-content>
          </hlm-sheet>
          <button hlmBtn type="button" variant="destructive" (click)="onDelete()">Delete</button>
          @if (invoice()?.status !== "paid") {
          <button hlmBtn type="button" (click)="onChangeStatus()">Mark as paid</button>
          }
        </div>
      </div>
      <div class="bg-white py-6 px-8 rounded-lg">
        <div class="mb-11">
          <div class="flex items-center justify-between mb-10">
            <div>
              <h1 class="font-bold">#{{ invoice()?.invoiceNumber }}</h1>
              <p class="text-primary">{{ invoice()?.description }}</p>
            </div>
            <div>
              <p>{{ invoice()?.user?.address?.street }}</p>
              <p>{{ invoice()?.user?.address?.city }}</p>
              <p>{{ invoice()?.user?.address?.postcode }}</p>
              <p>{{ invoice()?.user?.address?.country }}</p>
            </div>
          </div>
          <div class="flex gap-28">
            <div>
              <div class="mb-8">
                <h3 class="text-primary text-xs">Invoice Date</h3>
                <p class="font-bold">{{ invoice()?.invoiceDate | date }}</p>
              </div>
              <div>
                <h3>Payment Due</h3>
                <p>{{ invoice()?.paymentTerms }}</p>
              </div>
            </div>
            <div>
              <h3>Bill To</h3>
              <p>{{ invoice()?.client?.fullName }}</p>
              <p>{{ invoice()?.client?.address?.street }}</p>
              <p>{{ invoice()?.client?.address?.city }}</p>
              <p>{{ invoice()?.client?.address?.postcode }}</p>
              <p>{{ invoice()?.client?.address?.country }}</p>
            </div>
            <div>
              <h3>Sent to</h3>
              <p>{{ invoice()?.client?.email }}</p>
            </div>
          </div>
        </div>
        <div>
          <hlm-table>
            <hlm-caption>Items list of your invoice.</hlm-caption>
            <hlm-trow>
              <hlm-th class="w-2/5">Item name</hlm-th>
              <hlm-th class="w-1/5 justify-end">Quantity</hlm-th>
              <hlm-th class="w-1/5 justify-end">Price</hlm-th>
              <hlm-th class="w-1/5 justify-end">Total</hlm-th>
            </hlm-trow>
            @for (item of invoice()?.invoiceItem; track item.id) {
            <hlm-trow>
              <hlm-th class="w-2/5">{{ item.name }}</hlm-th>
              <hlm-th class="w-1/5 justify-end">{{ item.quantity }}</hlm-th>
              <hlm-th class="w-1/5 justify-end">{{ item.price }}€</hlm-th>
              <hlm-th class="w-1/5 justify-end">{{ item.total }}€</hlm-th>
            </hlm-trow>
            }
            <hlm-trow class="bg-muted/50 hover:bg-muted">
              <hlm-td class="w-[100px] font-semibold">Total</hlm-td>
              <hlm-td class="w-40"></hlm-td>
              <hlm-td class="flex-1"></hlm-td>
              <hlm-td class="justify-end w-40">{{ invoice()?.total }}€</hlm-td>
            </hlm-trow>
          </hlm-table>
        </div>
      </div>
      <div></div>
      } @placeholder {
      <p>Aucune facture ne correspond</p>
      } @loading {
      <p>Loading...</p>
      } @error {
      <p>Aucune facture ne correspond</p>
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
export class DetailComponent implements OnInit, OnDestroy {
  invoice = signal<invoiceResponse | null>(null);
  isLoading = signal(false);
  private _id: number | null = null;
  private _location = inject(Location);
  private _invoiceService = inject(InvoiceService);
  private _destroy$: Subject<boolean> = new Subject<boolean>();

  ngOnInit() {
    this.isLoading.set(true);
    this._id = Number.parseInt(this._location.path().split('invoice/')[1]);
    this._invoiceService
      .show(this._id)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res) => {
          this.invoice.set(res);
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

  onDelete() {
    if (!this._id) return;

    this.isLoading.set(true);
    this._invoiceService
      .delete(this._id)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: () => {
          this._location.back();
          this.isLoading.set(false);
        },
        error: console.error,
      });
  }

  onChangeStatus() {
    if (!this._id) return;

    this.isLoading.set(true);
    this._invoiceService
      .patch(this._id, { status: 'paid' })
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: () => {
          this._location.back();
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error(error);
          this.isLoading.set(false);
        },
      });
  }

  fetchInvoice(value: any, ctx: any) {
    if (!this._id) return;

    this.isLoading.set(true);
    this._invoiceService
      .show(this._id)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res: invoiceResponse) => {
          this.invoice.set(res);
          ctx.close();
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error(error);
          this.isLoading.set(true);
        },
      });
  }

  goBack() {
    this._location.back();
  }
}
