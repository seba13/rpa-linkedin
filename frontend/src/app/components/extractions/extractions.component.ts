import { Component, OnInit } from '@angular/core';
import { Extraction } from "../../models/extraction";
import { ExtractionService } from "../../services/extraction.service"
import { NgForm } from "@angular/forms";
import { formatCurrency } from '@angular/common';
import { exit } from 'process';


@Component({
  selector: 'app-extractions',
  templateUrl: './extractions.component.html',
  styleUrls: ['./extractions.component.css']
})
export class ExtractionsComponent implements OnInit {

  showMe: boolean;
  public selectedExtraction : Extraction = {
    user_name: '',
    creation_date: new Date,
    isAdmin: new Boolean,
    company_number: '',
    priority: 0
  }
  constructor(public extractionService: ExtractionService) { }

  ngOnInit(): void {
    this.getExtractions()
  }

  getExtractions(){
    this.extractionService.getExtractions().subscribe(
      res=>{
        this.extractionService.extractions = res;
      },
      err=>{console.log(err)}
    )
  }

  addExtraction(form: NgForm ){
    var now = new Date();
    var jsonDate = now.toJSON();
    var then = new Date(jsonDate);
    if(this.extractionService.extractions.length == 4){
      form.reset()
      alert("Se ingresó el número máximo de extracciones")
      return 0
    }
    if(form.value.user_name == null || form.value.user_name == '' || (form.value.isAdmin  && (form.value.company_number == '' || form.value.company_number == null ))){
      form.reset()
      alert("Error")
      return 0
    }
    if(form.value.company_number){
      if(!this.onlyNumbers(form.value.company_number)){
        form.reset()
        alert("Error")
        return 0
      }
    }
    if(form.value.isAdmin){
      this.extractionService.selectedExtraction = {
        user_name: this.replaceSpaces(form.value.user_name),
        creation_date: then,
        isAdmin: true,
        company_number: form.value.company_number,
        priority: (this.extractionService.extractions.length+1)
      }
    }else{
      this.extractionService.selectedExtraction = {
        user_name: this.replaceSpaces(form.value.user_name),
        creation_date: then,
        isAdmin: false,
        company_number: null,
        priority: (this.extractionService.extractions.length+1)
      }
    }
    
    if(form.value.id_extraction){
      this.extractionService.selectedExtraction = {
        id_extraction: form.value.id_extraction,
        user_name: this.replaceSpaces(form.value.user_name),
        creation_date: then,
        isAdmin: false,
        company_number: null,
        priority: (this.extractionService.extractions.length+1)
      }
      
      this.extractionService.updateExtraction(this.extractionService.selectedExtraction).subscribe(
        res=>{
          form.reset()
          console.log(res)
        },
        err =>console.log(err)
      )
    }else{
      this.extractionService.createExtraction(this.extractionService.selectedExtraction).subscribe(
        res=> {
          this.getExtractions()
          form.reset()
        },
        err => console.log(err)
      );
    }    
  }

  deleteExtraction(id_extraction: string){
    
    if(confirm('Are u sure you want delete it?')){
      this.updatePriority()
      this.extractionService.deleteExtraction(id_extraction).subscribe(
        res=> {
          console.log(res)
          this.getExtractions()
        },
        err => console.log(err)
      )
    }
  }

  editExtraction(extraction: Extraction){
    this.extractionService.selectedExtraction = extraction;
  }

  resertForm(form: NgForm){
    form.reset()
  }

  onlyNumbers(company_number: string){
    for(let i = 0; i < company_number.length; i++){
      if('1234567890'.indexOf((company_number[i]))== -1 ){
        return false
      }
    }
    return true
  }

  replaceSpaces(user_name: string){
    var str = user_name.replace(/ /gi, "-");
    return str;
  }

  updatePriority(){
    let i = 1 
    for (let e of this.extractionService.extractions){
      e.priority = i
      this.extractionService.updateExtraction(e).subscribe(
        res=>{
          console.log(res)
        },
        err =>console.log(err)
      )
      i++
    }
    this.getExtractions()
  }

  increasePriority(extraction: Extraction){

    this.extractionService.selectedExtractionPriority1 = extraction
    this.extractionService.selectedExtractionPriority1.priority = this.extractionService.selectedExtractionPriority1.priority-1

    let current_i = this.extractionService.extractions.indexOf(extraction)

    this.extractionService.selectedExtractionPriority2 = this.extractionService.extractions[current_i-1]
    this.extractionService.selectedExtractionPriority2.priority = this.extractionService.selectedExtractionPriority2.priority+1
    
    this.extractionService.updateExtraction(this.extractionService.selectedExtractionPriority1).subscribe(
      res=>{
        console.log(res)
      },
      err =>console.log(err)
    )
    this.extractionService.updateExtraction(this.extractionService.selectedExtractionPriority2).subscribe(
      res=>{
        this.getExtractions()
        console.log(res)
      },
      err =>console.log(err)
    )
  }

  decreasePriority(extraction: Extraction){
    this.extractionService.selectedExtractionPriority1 = extraction
    this.extractionService.selectedExtractionPriority1.priority = this.extractionService.selectedExtractionPriority1.priority+1

    let current_i = this.extractionService.extractions.indexOf(extraction)
    
    this.extractionService.selectedExtractionPriority2 = this.extractionService.extractions[current_i+1]
    this.extractionService.selectedExtractionPriority2.priority = this.extractionService.selectedExtractionPriority2.priority-1
    
    this.extractionService.updateExtraction(this.extractionService.selectedExtractionPriority1).subscribe(
      res=>{
        console.log(res)
      },
      err =>console.log(err)
    )
    this.extractionService.updateExtraction(this.extractionService.selectedExtractionPriority2).subscribe(
      res=>{
        console.log(res)
      },
      err =>console.log(err)
    )

    this.getExtractions()
  }
}
