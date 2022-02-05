import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { User } from "../models/user";
import { observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  // Observable string sources
  private url_userSubject = new Subject<string>();
  private id_companySubject = new Subject<Number>();
  // Observable string streams
  url_userSubject$ = this.url_userSubject.asObservable();
  id_companySubject$ = this.id_companySubject.asObservable();

  public url_ : Object = {
    url_user : '',
    algo: ''
  }

  selectedUrl_user : string
  users : User[] = []
  companyUsers : User[] = []
  usersTopTen : User[] = []
  countReactionsUsers : number[] = []

  URL_API = 'http://127.0.0.1:3002/api/users'



  constructor(private http: HttpClient) { }

  getUsers() {
    return this.http.get<User[]>(this.URL_API)
  }

  getUser(url_user : string) {
    this.url_ = {url_user : url_user}
    return this.http.post<User[]>(`${this.URL_API}/info`, this.url_)
  }

  getCompanyUsers(id_company : Number) {
    return this.http.get<User[]>(`${this.URL_API}/${id_company}`)
  }

  getIdCompany(id_company: Number) {
    this.id_companySubject.next(id_company);
  }

  getUrl_user(url_user : string) {
    this.url_userSubject.next(url_user);
  }

  clearUsers(){
    this.companyUsers = []
  }
}
