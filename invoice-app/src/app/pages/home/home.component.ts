import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { HlmLabelDirective } from '@spartan-ng/ui-label-helm';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { JsonPipe } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ReactiveFormsModule, HlmInputDirective, HlmLabelDirective, HlmButtonDirective, JsonPipe],
  template: `
    <div class="w-1/2 bg-primary">
    </div>
    <div class="w-1/2 flex flex-col justify-center relative">
      <button class="absolute top-10 right-10" hlmBtn type="button" (click)="onDisplayForm()">{{ isLoginForm() ? "Inscription" : "Connexion" }}</button>
      <h1 class="text-2xl font-bold mb-1 text-center">
        {{ isLoginForm() ? 'Connexion' : 'Créer votre compte' }}
      </h1>
      <p class="mb-6 text-center">
        {{ isLoginForm() ? 'Entrez vos informations pour vous connecter' : 'Entrer votre nom complet, email, et mot de passe' }}
      </p>
      <form class="flex items-center flex-col" [formGroup]="authForm" (submit)="onSubmit($event)">
        @if (!isLoginForm()) {
          <div class="mb-4">
            <input class="w-80" hlmInput placeholder='Nom complet*' type='text' formControlName="fullName" />
            @if (fullNameControl.invalid && (fullNameControl.dirty || fullNameControl.touched)) {
              <p class="text-xs text-red-600">Champs obligatoire</p>
            }
          </div>
        }
        <div class="mb-4">
          <input class="w-80" hlmInput placeholder='Email*' type='email' formControlName="email" />
          @if (emailControl.invalid && (emailControl.dirty || emailControl.touched)) {
            <p class="text-xs text-red-600">{{ emailControl.errors?.['required'] ? 'Champs obligatoire' : 'Email non valide' }}</p>
          }
        </div>
        <div class="mb-4">
          <input class="w-80" hlmInput placeholder='Mot de passe*' type='password' formControlName="password" />
          @if (passwordControl.invalid && (passwordControl.dirty || passwordControl.touched)) {
            <p class="text-xs text-red-600">Champs obligatoire</p>
          }
        </div>
        <button class="w-80 mb-4" hlmBtn type="submit" [disabled]="authForm.invalid">
          {{ isLoginForm() ? 'Connexion' : 'Inscription' }}
        </button>
      </form>
      <p class="text-center w-80 mr-auto ml-auto">By clicking continue, you agree to our Terms of Service and Privacy Policy .</p>
      <p class="text-center text-sm text-red-600 mb-4">{{ authErrorMessage() }}</p>
    </div>
  `,
  styles: `
    :host {
      height: 100%;
      display: flex;
    }
  `
})
export class HomeComponent implements OnInit {
  authForm = new FormGroup({
    fullName: new FormControl(''),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  public isLoginForm = signal(true);
  public authErrorMessage = signal('');
  private _router = inject(Router);
  private _authService: AuthService = inject(AuthService)
  private _destroy$: Subject<boolean> = new Subject<boolean>();

  constructor() {
    effect(() => {
      this._addValidators()
    })
  }

  get fullNameControl() {
    return this.authForm.controls['fullName'];
  }

  get emailControl() {
    return this.authForm.controls['email'];
  }

  get passwordControl() {
    return this.authForm.controls['password'];
  }

  ngOnInit() {
    this._addValidators();
  }

  ngOnDestroy() {
    this._destroy$.next(true);
  }

  onSubmit(event: Event) {
    const formValues = this.authForm.value;
    const credentials = {
      fullName: formValues.fullName || '',
      email: formValues.email || '',
      password: formValues.password || ''
    };

    if (this.isLoginForm()) {
      this._authService.login(credentials)
        .pipe(takeUntil(this._destroy$))
        .subscribe({
          next: (response) => {
            this._router.navigate(['/dashboard'])
          },
          error: (error) => {
            this.authErrorMessage.set(error.error.errors[0].message)
          }
      })
    }
    else {
      this._authService.signup(credentials)
        .pipe(takeUntil(this._destroy$))
        .subscribe({
          next: (response) => {
            this.isLoginForm.set(true);
          },
          error: (error) => {
            console.log(error);
          }
        })
    }
  }

  onDisplayForm() {
    this.isLoginForm.update((oldValue) => !oldValue);
    this.authForm.reset();
  }

  private _addValidators() {
    const fullNameControl = this.authForm.get('fullName');

    if (!this.isLoginForm()) fullNameControl!.setValidators([Validators.required]);
    else fullNameControl!.clearValidators();

    fullNameControl!.updateValueAndValidity();
  }
}
