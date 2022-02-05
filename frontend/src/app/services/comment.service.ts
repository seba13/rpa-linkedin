import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from "@angular/common/http";
import { Comment } from "../models/comment";
import { Date_ } from "../models/date";


@Injectable({
  providedIn: 'root'
})
export class CommentService {
// Observable string sources
  private id_postSubject = new Subject<Number>();
  public id_companySubject = new Subject<Number>();
  // Observable string streams
  id_postSubject$ = this.id_postSubject.asObservable();
  id_companySubject$ = this.id_companySubject.asObservable();


  URL_API = 'http://127.0.0.1:3002/api/comments'

  comments : Comment[] = []
  companyComments : Comment[] = []
  commentsBetweenDates : Comment[] = []

  public selectedDate : Date_ = {
    from : new Date,
    to : new Date
  }

  constructor(private http: HttpClient) { }

  getComments() {
    return this.http.get<Comment[]>(this.URL_API)
  }

  getIdPost(id_post: Number) {
    this.id_postSubject.next(id_post);
  // return this.http.get<Comment[]>(`${this.URL_API}/${id_post}`)
  }
  getPostsComments(id_post: Number) {
    return this.http.get<Comment[]>(`${this.URL_API}/${id_post}`)
  }
  
  getPostCommentsBetweenDates(id_post: Number) {
    return this.http.post<Comment[]>(`${this.URL_API}/${id_post}/query_between_dates`, this.selectedDate)
  }
//se obtiene información de comentarios entre fechas ingresadas con el siguiente formato:
// [
//   {
//     "id_comment": 74,
//     "idPost": 84,
//     "name": "Claudia Reyes",
//     "job": "Asesor de Inversiones Acreditada Banco de Chile",
//     "comment": "Felicitaciones a todos! En Especial a Nicolás y Mauricio!",
//     "sentiment": "positivo",
//     "url_user": "https://www.linkedin.com/in/claudia-reyes-10ba473b/",
//     "published_date": "2021-02-12T03:00:00.000Z"
//   }
// ]


  updateDates(dates: Date_){
    this.selectedDate = dates
  }

  getIdCompany(id_company: Number) {
    this.id_companySubject.next(id_company);
  }

  getCompanyComments(id_company: Number) {
    return this.http.get<Comment[]>(`${this.URL_API}/company/${id_company}`)
  }

  //se obtienen todos los comentarios de una compañia:
  // [
  //   {
  //     "id_comment": 1,
  //     "idPost": 1,
  //     "name": "Luisa Gallego",
  //     "job": "--",
  //     "comment": "Éxito Macarena !!!",
  //     "sentiment": "neutro",
  //     "url_user": "https://www.linkedin.com/in/luisa-gallego-119b29125/",
  //     "published_date": "2021-02-09T03:00:00.000Z"
  //   }
  // ]

  clearComments(){
    this.comments = []
    this.companyComments = []
  }

}
