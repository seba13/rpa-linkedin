import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Date_ } from "../models/date";
import { Extraction } from "../models/extraction";

@Injectable({
  providedIn: 'root'
})
export class ExtractionService {
  
  URL_API = 'http://127.0.0.1:3002/api/extractions'

  extractions : Extraction[] = []

  public selectedDate : Date_ = {
    from : new Date,
    to : new Date
  }

  public selectedExtraction : Extraction = {
    user_name: '',
    creation_date: new Date,
    isAdmin: false,
    company_number: '',
    priority: 0
  }
  public selectedExtractionPriority1 : Extraction = {
    user_name: '',
    creation_date: new Date,
    isAdmin: false,
    company_number: '',
    priority: 0
  }
  public selectedExtractionPriority2 : Extraction = {
    user_name: '',
    creation_date: new Date,
    isAdmin: false,
    company_number: '',
    priority: 0
  }

  constructor(private http: HttpClient) { }

  getExtractions() {
    return this.http.get<Extraction[]>(`${this.URL_API}`)
  }

  createExtraction(extraction: Extraction){
    return this.http.post(this.URL_API,extraction);
  }

  deleteExtraction(id_extraction: string){
    return this.http.delete(`${this.URL_API}/${id_extraction}`)
  }

  updateExtraction(extraction: Extraction){
    return this.http.put(`${this.URL_API}/${extraction.id_extraction}`, extraction)
  }

}
