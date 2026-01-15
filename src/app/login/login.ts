import { Component, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../firebase-services/auth-services';

/**
 * Login component responsible for user authentication and registration.
 *
 * This component provides:
 * - User login with email and password
 * - User registration (sign-up) with validation
 * - Guest login
 * - UI state handling for login and sign-up modes
 *
 * It uses Firebase authentication through the {@link AuthService}
 * and navigates to the summary page after successful authentication.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss', 'login-media.scss']
})
export class Login {
  /** User name used during sign-up */
  name = '';

  /** User email address */
  email = '';

  /** User password */
  password = '';

  /** Password confirmation used during sign-up */
  confirmPassword = '';

  /** Indicates whether the component is in sign-up mode */
  isSignUp = false;

  /** Set to true when login fails */
  loginError = false;

  /** Validation error: name is missing */
  nameError = false;

  /** Validation error: email is missing */
  emailError = false;

  /** Validation error: passwords do not match */
  passwordMatchError = false;

  /** Validation error: password is missing */
  passwordError = false;

  /** Validation error: password is too short */
  passwordTooShortError = false;

  /** Validation error: email format is invalid */
  invalidEmailError = false;

  /** Indicates whether the user accepted the policy/terms */
  agreed = false;

  /** Error shown when the email is already registered */
  emailTakenError = false;

  /**
   * Creates an instance of the Login component.
   *
   * @param auth Authentication service handling Firebase auth logic
   * @param router Angular router used for navigation
   * @param cd Change detector used to manually trigger UI updates
   */
  constructor(
    private auth: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  /**
   * Logs in a user using email and password.
   *
   * On success, the user is redirected to the summary page.
   * On failure, a login error flag is set.
   *
   * @returns A promise that resolves when the login attempt finishes
   */
  async login(): Promise<void> {
    this.loginError = false;
    try {
      await this.auth.login(this.email, this.password);
      this.router.navigate(['/summary']);
    } catch (error: any) {
      this.loginError = true;
      this.cd.detectChanges();
    }
  }

  /**
   * Registers a new user after validating input fields.
   *
   * Performs validation for:
   * - Name presence
   * - Email presence and format
   * - Password presence, length, and match
   *
   * On success, the user is redirected to the summary page.
   * On error, specific validation flags are set.
   *
   * @returns A promise that resolves when the sign-up process finishes
   */
  async signup(): Promise<void> {
    this.nameError = !this.name?.trim();
    this.emailError = !this.email?.trim();
    this.invalidEmailError = false;
    this.passwordError = !this.password;
    this.passwordTooShortError = false;
    this.passwordMatchError = false;
    this.emailTakenError = false;

    if (!this.emailError) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(this.email)) {
        this.invalidEmailError = true;
      }
    }

    if (!this.passwordError && this.password.length < 6) {
      this.passwordTooShortError = true;
    }

    if (
      !this.passwordError &&
      !this.passwordTooShortError &&
      this.password !== this.confirmPassword
    ) {
      this.passwordMatchError = true;
    }

    if (
      this.nameError ||
      this.emailError ||
      this.invalidEmailError ||
      this.passwordError ||
      this.passwordTooShortError ||
      this.passwordMatchError
    ) {
      return;
    }

    try {
      await this.auth.signup(this.name, this.email, this.password);
      this.router.navigate(['/summary']);
    } catch (error: any) {
      if (
        error.code === 'auth/email-already-in-use' ||
        error.message?.includes('already in use')
      ) {
        this.emailTakenError = true;
        this.cd.detectChanges();
      } else {
        console.error(error);
      }
    }
  }

  /**
   * Logs in a guest user without credentials.
   *
   * On success, the user is redirected to the summary page.
   *
   * @returns A promise that resolves when guest login finishes
   */
  async guestLogin(): Promise<void> {
    try {
      await this.auth.loginGuest();
      this.router.navigate(['/summary']);
    } catch (error: any) {}
  }

  /**
   * Toggles between login and sign-up mode.
   *
   * Also resets relevant error states when switching modes.
   */
  openSignUp(): void {
    this.isSignUp = !this.isSignUp;
    this.loginError = false;
    this.passwordMatchError = false;
  }
}
