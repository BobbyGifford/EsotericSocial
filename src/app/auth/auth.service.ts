import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AuthData } from "./auth-data-model";
import { Subject } from "rxjs";

@Injectable({ providedIn: "root" })
export class AuthService {
  private isAuthenticated = false;
  private token: string;
  private authStatusListner = new Subject<boolean>();

  constructor(private http: HttpClient) {}

  getToken() {
    return this.token;
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getAuthStatusListner() {
    return this.authStatusListner.asObservable();
  }

  createUser(email: string, password: string) {
    const authData: AuthData = { email: email, password: password };
    this.http
      .post("http://localhost:3000/api/user/signup", authData)
      .subscribe(res => {
        console.log(res);
      });
  }

  login(email: string, password: string) {
    const authData: AuthData = { email: email, password: password };
    this.http
      .post<{ token: string }>("http://localhost:3000/api/user/login", authData)
      .subscribe(res => {
        const token = res.token;
        this.token = token;
        if (token) {
          this.isAuthenticated = true;
          this.authStatusListner.next(true);
        }
      });
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListner.next(false);
  }
}
