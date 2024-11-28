import { Component, inject, input, Input, OnDestroy, OnInit, output, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { HlmLabelDirective } from '@spartan-ng/ui-label-helm';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconComponent } from '@spartan-ng/ui-icon-helm';
import { provideIcons } from '@ng-icons/core';
import { lucidePlusCircle, lucideTrash2 } from "@ng-icons/lucide"
import { Subject, takeUntil } from 'rxjs';
import { clientType } from '../../services/client.service';
import { invoiceResponse, InvoiceService } from '../../services/invoice.service';
import { BrnSelectImports } from '@spartan-ng/ui-select-brain';
import { HlmSelectImports } from '@spartan-ng/ui-select-helm';

@Component({
  selector: 'app-update-invoice',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HlmInputDirective,
    HlmLabelDirective,
    HlmButtonDirective,
    HlmIconComponent,
    BrnSelectImports,
    HlmSelectImports
  ],
  providers: [provideIcons({ lucidePlusCircle, lucideTrash2 })],
  template: `
    <div>
      <h2 class="text-2xl font-bold mb-10">Nouvelle facture</h2>
      <form [formGroup]="invoiceForm" (submit)="onSubmit()">
          @defer (when !isLoading()) {
            <div class="mb-8" [formGroup]="userForm">
              <h3 class="mb-4 text-primary">Bill from</h3>
              <div class="mb-2">
                <input class="w-full" type="text" hlmInput placeholder="Votre adresse*" formControlName="userStreet">
                @if (userStreetControl.invalid && (userStreetControl.dirty || userStreetControl.touched)) {
                  <p class="text-xs text-red-600">Champs obligatoire</p>
                }
              </div>
              <div class="flex gap-2">
                <div>
                  <input class="w-full" type="text" hlmInput placeholder="Votre ville*" formControlName="userCity">
                  @if (userCityControl.invalid && (userCityControl.dirty || userCityControl.touched)) {
                    <p class="text-xs text-red-600">Champs obligatoire</p>
                  }
                </div>
                <div>
                  <input class="w-full" type="text" hlmInput placeholder="Votre code postale*" formControlName="userPostcode">
                  @if (userPostcodeControl.invalid && (userPostcodeControl.dirty || userPostcodeControl.touched)) {
                    <p class="text-xs text-red-600">Champs obligatoire</p>
                  }
                </div>
                <div>
                  <input class="w-full" type="text" hlmInput placeholder="Votre Pays*" formControlName="userCountry">
                  @if (userCountryControl.invalid && (userCountryControl.dirty || userCountryControl.touched)) {
                    <p class="text-xs text-red-600">Champs obligatoire</p>
                  }
                </div>
              </div>
            </div>
          } @placeholder {
            <p>loading...</p>
          }
        <div class="mb-8" [formGroup]="clientForm">
          <h3 class="mb-4 text-primary">Bill to</h3>
          <div class="mb-2">
            <input class="w-full" type="text" hlmInput placeholder="Nom client*" formControlName="clientName">
            @if (clientNameControl.invalid && (clientNameControl.dirty || clientNameControl.touched)) {
              <p class="text-xs text-red-600">Champs obligatoire</p>
            }
          </div>
          <div class="mb-2">
            <input class="w-full" type="email" hlmInput placeholder="Email client*" formControlName="clientEmail">
            @if (clientEmailControl.invalid && (clientEmailControl.dirty || clientEmailControl.touched)) {
              <p class="text-xs text-red-600">Champs obligatoire</p>
            }
          </div>
          <div class="mb-2">
            <input class="w-full" type="text" hlmInput placeholder="Adresse*" formControlName="clientStreet">
            @if (clientStreetControl.invalid && (clientStreetControl.dirty || clientStreetControl.touched)) {
              <p class="text-xs text-red-600">Champs obligatoire</p>
            }
          </div>
          <div class="flex gap-2">
            <div>
              <input class="w-full" type="text" hlmInput placeholder="Ville*" formControlName="clientCity">
              @if (clientCityControl.invalid && (clientCityControl.dirty || clientCityControl.touched)) {
                <p class="text-xs text-red-600">Champs obligatoire</p>
              }
            </div>
            <div>
              <input class="w-full" type="text" hlmInput placeholder="Code postale*" formControlName="clientPostcode">
              @if (clientPostcodeControl.invalid && (clientPostcodeControl.dirty || clientPostcodeControl.touched)) {
                <p class="text-xs text-red-600">Champs obligatoire</p>
              }
            </div>
            <div>
              <input class="w-full" type="text" hlmInput placeholder="Pays*" formControlName="clientCountry">
              @if (clientCountryControl.invalid && (clientCountryControl.dirty || clientCountryControl.touched)) {
                <p class="text-xs text-red-600">Champs obligatoire</p>
              }
            </div>
          </div>
        </div>
        <div class="mb-2 flex gap-2">
          <div class="w-full">
            <input class="w-full" type="text" hlmInput placeholder="Description*" formControlName="description">
            @if (descriptionControl.invalid && (descriptionControl.dirty || descriptionControl.touched)) {
              <p class="text-xs text-red-600">Champs obligatoire</p>
            }
          </div>
          <div class="w-full">
            <input class="w-full" type="date" hlmInput placeholder="Description*" formControlName="date">
            @if (dateControl.invalid && (dateControl.dirty || dateControl.touched)) {
              <p class="text-xs text-red-600">Champs obligatoire</p>
            }
          </div>
        </div>
        <div class="mb-8 flex gap-2">
          <div class="w-full">
            <brn-select class="inline-block w-full" placeholder="Modalité de paiement*" formControlName="paymentTerms">
              <hlm-select-trigger class="w-full">
                <hlm-select-value />
              </hlm-select-trigger>
              <hlm-select-content>
                <hlm-option value="30">30 jours</hlm-option>
                <hlm-option value="60">60 jours</hlm-option>
              </hlm-select-content>
            </brn-select>
            @if (paymentTermsControl.invalid && (paymentTermsControl.dirty || paymentTermsControl.touched)) {
              <p class="text-xs text-red-600">Champs obligatoire</p>
            }
          </div>
          <div class="w-full">
            <brn-select class="inline-block w-full" placeholder="Status*" formControlName="status">
              <hlm-select-trigger class="w-full">
                <hlm-select-value />
              </hlm-select-trigger>
              <hlm-select-content>
                <hlm-option value="pending">En attente</hlm-option>
                <hlm-option value="draft">Brouillon</hlm-option>
                <hlm-option value="paid">Payer</hlm-option>
              </hlm-select-content>
            </brn-select>
            @if (statusControl.invalid && (statusControl.dirty || statusControl.touched)) {
              <p class="text-xs text-red-600">Champs obligatoire</p>
            }
          </div>
        </div>
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <h3 class="mb-4 text-primary">Items</h3>
            <button type="button" (click)="addItems()">
              <hlm-icon size='sm' name="lucidePlusCircle" />
            </button>
          </div>
          <div>
            @for (item of items.controls; let index = $index; track item) {
              <div class="flex items-center justify-between gap-4 mb-2" [formGroup]="item">
                <input class="w-full" type="text" hlmInput placeholder="Nom*" formControlName="name">
                <input class="w-full" type="text" hlmInput placeholder="Quantité*" formControlName="quantity">
                <input class="w-full" type="text" hlmInput placeholder="Prix*" formControlName="price">
                <button type="button" (click)="items.removeAt(index)">
                  <hlm-icon size='sm' name="lucideTrash2" />
                </button>
              </div>
            }
            @if (items.controls.length === 0) {
              <p class="text-sm text-text-secondary">Vous n'avez pas ajouté d'item, cliquez sur le bouton ci-dessus</p>
            }
          </div>
        </div>
        <button class="mb-4" type="submit" hlmBtn [disabled]="invoiceForm.invalid">Créer la facture</button>
      </form>
    </div>
  `,
  styles: `
    :host {
      height: 100%;
      display: block;
    }
  `
})
export class UpdateInvoiceComponent implements OnInit, OnDestroy {
  user = signal<clientType | null>(null);
  isLoading = signal(false);
  invoice = input<invoiceResponse | null>(null)
  invoiceUpdated = output<boolean>()
  invoiceForm = new FormGroup({
    userForm: new FormGroup({
      userStreet: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      userCity: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      userPostcode: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      userCountry: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    }),
    clientForm: new FormGroup({
      clientName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      clientEmail: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
      clientStreet: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      clientCity: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      clientPostcode: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      clientCountry: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    date: new FormControl(new Date().toISOString().substring(0, 10), { nonNullable: true, validators: [Validators.required] }),
    paymentTerms: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    status: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    items: new FormArray<FormGroup>([])
  })
  private _invoiceService = inject(InvoiceService)
  private _destroy$: Subject<boolean> = new Subject<boolean>();

  get userForm() {
    return this.invoiceForm.controls.userForm;
  }

  get userCityControl() {
    return this.userForm.controls['userCity'];
  }

  get userStreetControl() {
    return this.userForm.controls['userStreet'];
  }

  get userPostcodeControl() {
    return this.userForm.controls['userPostcode'];
  }

  get userCountryControl() {
    return this.userForm.controls['userCountry'];
  }

  get clientForm() {
    return this.invoiceForm.controls.clientForm;
  }

  get clientNameControl() {
    return this.clientForm.controls['clientName'];
  }

  get clientEmailControl() {
    return this.clientForm.controls['clientEmail'];
  }

  get clientStreetControl() {
    return this.clientForm.controls['clientStreet'];
  }

  get clientPostcodeControl() {
    return this.clientForm.controls['clientPostcode'];
  }

  get clientCityControl() {
    return this.clientForm.controls['clientCity'];
  }

  get clientCountryControl() {
    return this.clientForm.controls['clientCountry'];
  }

  get items() {
    return this.invoiceForm.controls.items;
  }

  get descriptionControl() {
    return this.invoiceForm.controls['description'];
  }

  get dateControl() {
    return this.invoiceForm.controls['date'];
  }

  get statusControl() {
    return this.invoiceForm.controls['status'];
  }

  get paymentTermsControl() {
    return this.invoiceForm.controls['paymentTerms'];
  }

  ngOnInit() {
    this.userForm.patchValue({
      userStreet: this.invoice()?.user?.address?.street,
      userCity: this.invoice()?.user?.address?.city,
      userPostcode: this.invoice()?.user?.address?.postcode,
      userCountry: this.invoice()?.user?.address?.country,
    });
    this.clientForm.patchValue({
      clientName: this.invoice()?.client.fullName,
      clientEmail: this.invoice()?.client.email,
      clientStreet: this.invoice()?.client.address?.street,
      clientCity: this.invoice()?.client.address?.city,
      clientPostcode: this.invoice()?.client.address?.postcode,
      clientCountry: this.invoice()?.client.address?.country,
    });
    this.invoiceForm.patchValue({
      description: this.invoice()?.description,
      //date: this.invoice()?.invoiceDate,
      paymentTerms: this.invoice()?.paymentTerms,
      status: this.invoice()?.status,
    });

    const invoiceItems = this.invoice()?.invoiceItem || [];
    invoiceItems.forEach(item => {
      const itemGroup = new FormGroup({
        name: new FormControl(item.name, [Validators.required]),
        quantity: new FormControl(item.quantity, [Validators.required]),
        price: new FormControl(item.price, [Validators.required]),
      });
      this.items.push(itemGroup);
    });
  }

  ngOnDestroy() {
    this._destroy$.next(true);
  }

  addItems() {
    this.items.push(
      new FormGroup({
        name: new FormControl('', [Validators.required]),
        quantity: new FormControl('', [Validators.required]),
        price: new FormControl('', [Validators.required]),
      })
    )
  }

  public onSubmit() {
    const values = this.invoiceForm.getRawValue();

    this._invoiceService.patchUserClientAndInvoice(this.invoice()!.userId, this.invoice()!.clientId, this.invoice()!.id, values)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
      next: () => {
        this.invoiceUpdated.emit(true)
      },
      error: console.error
    });
  }
}

