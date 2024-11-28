import {Injectable, inject, signal} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthStore {
  readonly store = signal<AuthState>(initialAuthState);

  setNewValue(newState: AuthState): void {
    this.store.set({...newState});
  }
}

export interface AuthState {
  id: number | null;
  fullName: string | null;
  email: string | null;
  street: string | null,
  city: string | null,
  postcode: string | null,
  country: string | null,
}

export const initialAuthState = {
  id: null,
  fullName: null,
  email: null,
  street: null,
  city: null,
  postcode: null,
  country: null,
}
