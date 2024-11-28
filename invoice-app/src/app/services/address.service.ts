import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AddressService {

  constructor(private _http: HttpClient) { }

  store(addressInfo: AddressInfo) {
    return this._http.post(`${environment.api}/addresses`, addressInfo,  { withCredentials: true })
  }
}

export type AddressInfo = {
  street: string,
  city: string;
  postcode: string,
  country: string,
  userId?: number | null,
  clientId?: number | null
}
