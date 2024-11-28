import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { clientResponse, ClientService } from './client.service';
import { AddressInfo, AddressService } from './address.service';
import { filter, map, switchMap } from 'rxjs';
import { userResponse, UserService } from './user.service';
import { AuthStore } from '../stores/auth.store';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  _http: HttpClient = inject(HttpClient)
  _addressService = inject(AddressService)
  _clientService = inject(ClientService)
  _userService = inject(UserService)
  _authStore = inject(AuthStore)


  index() {
    return this._http.get<invoiceResponse[]>(`${environment.api}/invoices`, { withCredentials: true })
      .pipe(
        map(invoices => {
          invoices.forEach(invoice => {
            invoice.total = 0;
            invoice.invoiceItem.forEach(invoiceItem => {
              const itemTotalPrice = invoiceItem.price * invoiceItem.quantity;
              invoice.total += itemTotalPrice
            })
          })
          return invoices;
        }),
      )
  }

  getByStatus(status: string) {
    return this.index().pipe(
      map(invoices => invoices.filter(invoice => {
        if (status === "all") return invoice
        return invoice.status === status
      }))
    )
  }

  show(id: number) {
    return this._http.get<invoiceResponse>(`${environment.api}/invoices/${id}`, { withCredentials: true })
      .pipe(
        map(invoice => {
            invoice.total = 0;
            invoice.invoiceItem.forEach(invoiceItem => {
              const itemTotalPrice = invoiceItem.price * invoiceItem.quantity;
              invoiceItem.total = itemTotalPrice
              invoice.total += itemTotalPrice
            })
          return invoice;
        }),
      )
  }

  store(invoiceData: invoiceType) {
    return this._http.post(`${environment.api}/invoices`, invoiceData, { withCredentials: true });
  }

  storeWithUser(values: any) {
    const userId = this._authStore.store().id;

    if (userId === null) {
      throw new Error('Unknown user');
    }

    return this._userService.patch(userId,{
      address: {
        city: values.userForm.userCity,
        street: values.userForm.userStreet,
        postcode: values.userForm.userPostcode,
        country: values.userForm.userCountry,
      }
    }).pipe(
      switchMap(user => {
        return this.storeWithClient(values)
      })
    )
    // return this._addressService.store({
    //   city: values.userForm.userCity,
    //   country: values.userForm.userCountry,
    //   postcode: values.userForm.userPostcode,
    //   street: values.userForm.userStreet,
    //   userId: this._authStore.store().id,
    //   clientId: null
    // }).pipe(
    //   switchMap(user => {
    //     return this.storeWithClient(values)
    //   })
    // )
  }

  storeWithClient(values: any){
    const userId = this._authStore.store().id;

    if (userId === null) {
      throw new Error('Unknown user');
    }

    return this._clientService.store({
      fullName: values.clientForm.clientName,
      email: values.clientForm.clientEmail,
      address: {
        street: values.clientForm.clientStreet,
        city: values.clientForm.clientCity,
        postcode: values.clientForm.clientPostcode,
        country: values.clientForm.clientCountry,
      }
    }).pipe(
      switchMap((client: clientResponse) => {
        const items: itemType[] = values.items.map((item: { [key: string]: any }) => ({
          name: item['name'],
          quantity: item['quantity'],
          price: item['price']
        }));

        return this.store({
          description: values.description,
          paymentTerms: values.paymentTerms,
          status: values.status,
          invoiceDate: new Date(values.date),
          items,
          clientId: client.id,
          userId
        })
      })
    )
  }

  delete(id: number) {
    return this._http.delete(`${environment.api}/invoices/${id}`, { withCredentials: true })
  }

  patch(id: number, invoiceData: invoiceTypePatch) {
    return this._http.patch(`${environment.api}/invoices/${id}`, invoiceData,{ withCredentials: true })
  }

  patchUserClientAndInvoice(userId: number, clientId: number, invoiceId: number, values: any) {
    return this._userService.patch(userId,{
      address: {
        street: values.userForm.userStreet,
        city: values.userForm.userCity,
        postcode: values.userForm.userPostcode,
        country: values.userForm.userCountry,
      }
    }).pipe(
      switchMap(user => {
        return this.patchWithClient(clientId, invoiceId, values)
      })
    )
  }

  patchWithClient(clientId: number, invoiceId: number, values: any) {
    return this._clientService.patch(clientId, {
      fullName: values.clientForm.clientName,
      email: values.clientForm.clientEmail,
      address: {
        street: values.clientForm.clientStreet,
        city: values.clientForm.clientCity,
        postcode: values.clientForm.clientPostcode,
        country: values.clientForm.clientCountry,
      }
    }).pipe(
      switchMap((client: clientResponse) => {
        const items: itemType[] = values.items.map((item: { [key: string]: any }) => ({
          name: item['name'],
          quantity: item['quantity'],
          price: item['price']
        }));

        return this.patch(invoiceId,{
          description: values.description,
          paymentTerms: values.paymentTerms,
          status: values.status,
          invoiceDate: new Date(values.date),
          items,
        })
      })
    )
  }
}

export type invoiceResponse = {
  id: number,
  paymentTerms: string,
  description: string,
  status: string,
  invoiceNumber: string,
  invoiceDate: string,
  userId: number,
  user: userResponse,
  clientId: number,
  client: clientResponse,
  invoiceItem: itemType[],
  total: number
}

export type invoiceType = {
  paymentTerms: string,
  description: string,
  userId: number,
  clientId: number,
  status: string,
  invoiceDate: Date,
  items: itemType[]
}

export type invoiceTypePatch = {
  paymentTerms?: string,
  description?: string,
  userId?: number,
  clientId?: number,
  status?: string,
  invoiceDate?: Date,
  items?: itemType[]
}

export type itemType = {
  id: number,
  name: string,
  quantity: number,
  price: number,
  total: number,
}
