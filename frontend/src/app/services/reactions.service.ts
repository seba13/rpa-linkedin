import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from "@angular/common/http";
import { Reaction } from "../models/reaction";
import { Date_ } from "../models/date";
@Injectable({
  providedIn: 'root'
})
export class ReactionService {

  // Observable string sources
  private id_postSubject = new Subject<Number>();
  public id_companySubject = new Subject<Number>();

  // Observable string streams
  id_companySubject$ = this.id_companySubject.asObservable();
  id_postSubject$ = this.id_postSubject.asObservable();


  URL_API = 'http://127.0.0.1:3002/api/reactions'
  

  
  reactions : Reaction[] =[]
  companyReactions : Reaction[]=[]
  reactionsBetweenDates : Reaction[] = []

  constructor(private http: HttpClient) { }

  getReactions() {
    return this.http.get<Reaction[]>(this.URL_API)
  }

  getCompanyReactions(id_company: Number) {
    return this.http.get<Reaction[]>(`${this.URL_API}/company/${id_company}`)
  }

  getIdPost(id_post: Number) {
    this.id_postSubject.next(id_post);
   // return this.http.get<Comment[]>(`${this.URL_API}/${id_post}`)
  }

  getIdCompany(id_company: Number) {
    this.id_companySubject.next(id_company);
  }
  getPostsReactions(id_post: Number) {
    return this.http.get<Reaction[]>(`${this.URL_API}/${id_post}`)
  }

  clearReactions(){
    this.reactions = []
    this.companyReactions = []
  }
  clearCompanyReactions(){
    this.companyReactions = []
  }
}
