import {CanActivate, Router} from "@angular/router";
import { inject, Injectable } from '@angular/core';
import { AuthStore, initialAuthState } from '../stores/auth.store';
import {AuthService} from "../services/auth.service";
import {catchError, map, of} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private _authStore = inject(AuthStore);
  private _router = inject(Router)
  private _authService = inject(AuthService);

  canActivate() {
    return this._authService.me()
      .pipe(
        map((res: any) => {
          if (res) {
            this._authStore.setNewValue({id: res.id, fullName: res.fullName, email: res.email, street: res.street, city: res.city, postcode: res.postcode, country: res.country});
            return true;
          } else {
            this._router.navigate(['']);
            this._authStore.setNewValue(initialAuthState);
            return false;
          }
        }), catchError((error) => {
          this._router.navigate(['']);
          this._authStore.setNewValue(initialAuthState);
          return of(false);
        })
      );
  }
}
