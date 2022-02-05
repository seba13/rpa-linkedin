import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Date_ } from "../models/date";
import { Account } from "../models/account";
@Injectable({
  providedIn: 'root'
})
export class AccountService {
  URL_API = 'http://127.0.0.1:3002/api/accounts'

  accounts : Account[] = []

  public selectedDate : Date_ = {
    from : new Date,
    to : new Date
  }

  public selectedAccount : Account = {
    user_name: '',
    password: '',
    priority: 0
  }

  constructor(private http: HttpClient) { }

  getAccounts() {
    return this.http.get<Account[]>(`${this.URL_API}`);
  }

    // se obtienen cuentas en el siguiente formato:
    // [
    //   {
    //     "id_account": 3,
    //     "user_name": "ejemplo1@gmail.com",
    //     "password": "ejemplopass1",
    //     "priority": 0
    //   }, ... ,
    //   {
    //     "id_account": 2,
    //     "user_name": "ejemplo2@gmail.com",
    //     "password": "ejemplopass2",
    //     "priority": 4
    //   }
    // ]

  createAccount(account: Account){
    return this.http.post(this.URL_API,account);
  }

  deleteAccount(id_account: string){
    return this.http.delete(`${this.URL_API}/${id_account}`)
  }

  updateAccount(account: Account){
    return this.http.put(`${this.URL_API}/${account.id_account}`, account)
  }
}
