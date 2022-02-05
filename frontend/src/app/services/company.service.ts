import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Company } from "../models/company";
import { Date_ } from "../models/date";

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  URL_API = 'http://127.0.0.1:3002/api/companies'

  companies : Company[] = []
  selectedCompanies : Company[] = []


  constructor(private http: HttpClient) { }

  getCompanies() {
    return this.http.get<Company[]>(this.URL_API)
  }

  clearPosts(){
    this.selectedCompanies = []
  }

}
