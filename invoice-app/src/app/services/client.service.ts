import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AddressInfo } from './address.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  constructor(private _http: HttpClient) { }

  index() {
    return this._http.get<clientResponse>(`${environment.api}/clients`,{ withCredentials: true });
  }

  store(clientInfos: clientType): Observable<clientResponse> {
    return this._http.post<clientResponse>(`${environment.api}/clients`, clientInfos, { withCredentials: true });
  }

  patch(id: number, clientData: clientType) {
    return this._http.patch<clientResponse>(`${environment.api}/clients/${id}`, clientData,{ withCredentials: true })
  }
}

export type clientType = {
  fullName: string,
  email: string,
  address: AddressInfo
}

export type clientResponse = {
  id: number,
  fullName: string,
  email: string,
  address: AddressInfo
}
