import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from "@angular/common/http";

import { Follower } from "../models/follower";
import { Date_ } from "../models/date";

@Injectable({
  providedIn: 'root'
})
export class FollowerService {
  
  // Observable string sources
  public id_companySubject = new Subject<Number>();

  // Observable string streams
  id_companySubject$ = this.id_companySubject.asObservable();


  URL_API = 'http://127.0.0.1:3002/api/followers'

  followers : Follower[] = []

  public selectedDate : Date_ = {
    from : new Date,
    to : new Date
  }
  constructor(private http: HttpClient) { }

  getIdCompany(id_company: Number) {
    this.id_companySubject.next(id_company);
   // return this.http.get<Post[]>(`${this.URL_API}/${id_company}`)
  }

  getCompanyFollowers(id_company: Number) {
    return this.http.get<Follower[]>(`${this.URL_API}/${id_company}`)
  }

  getCompanyFollowersBetweenDates(id_company: Number) {
    return this.http.post<Follower[]>(`${this.URL_API}/${id_company}/query_between_dates`, this.selectedDate)
  }

  updateDates(dates: Date_){
    this.selectedDate = dates
  }

  clearFollowers(){
    this.followers = []
  }
}
