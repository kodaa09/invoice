import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { clientType } from './client.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private _http: HttpClient) { }

  login(credentials: { fullName?: string, email: string, password: string }) {
    return this._http.post(`${environment.api}/login`, credentials, { withCredentials: true });
  }

  signup(user: { fullName: string, email: string, password: string }) {
    return this._http.post(`${environment.api}/signup`, user);
  }


  check() {
    return this._http.get(`${environment.api}/check`, { withCredentials: true });
  }

  me() :Observable<clientType> {
    return this._http.get<clientType>(`${environment.api}/me`, { withCredentials: true });
  }

  logout() {
    return this._http.get(`${environment.api}/logout`);
  }
}
