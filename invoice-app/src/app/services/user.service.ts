import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AddressInfo } from './address.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  _http: HttpClient = inject(HttpClient)

  patch(id: number, userData: userPatch) {
    console.log(userData);
    return this._http.patch(`${environment.api}/users/${id}`, userData,{ withCredentials: true })
  }
}

export type userResponse = {
  id: number,
  fullName: string,
  email: string,
  address: AddressInfo
}

export type userPatch = {
  id?: number,
  fullName?: string,
  email?: string,
  address?: AddressInfo
}
