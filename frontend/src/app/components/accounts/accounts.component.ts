import { Component, OnInit } from '@angular/core';
import { Account } from "../../models/account";
import { AccountService } from "../../services/account.service"
import { NgForm } from "@angular/forms";

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css']
})
export class AccountsComponent implements OnInit {
  
  showMe: boolean;
  
  public selectedAccount : Account = {
    user_name: '',
    password: '',
    priority: 0
  }
  
  constructor(public accountService: AccountService) { }

  ngOnInit(): void {
    this.getAccounts()
  }

  getAccounts(){
    this.accountService.getAccounts().subscribe(
      res=>{
        this.accountService.accounts = res;
      },
      err=>{console.log(err)}
    )
  }


  agregarCuenta(form: NgForm){
    var now = new Date();
    var jsonDate = now.toJSON();
    var then = new Date(jsonDate);
    
    if(form.value.user_name == null || form.value.user_name == '' || form.value.password == '' || form.value.password == null){
      form.reset()
      alert("Error")
      return 0
    }

    if(form.value.id_account){
      console
      this.accountService.selectedAccount = {
        id_account: form.value.id_account,
        user_name: form.value.user_name,
        password: form.value.password,
        priority: (this.accountService.accounts.length+1)
      }
      
      this.accountService.updateAccount(this.accountService.selectedAccount).subscribe(
        res=>{
          form.reset()
          console.log(res)
        },
        err =>console.log(err)
      )
    }else{
      this.accountService.createAccount(this.accountService.selectedAccount).subscribe(
        res=> {
          this.getAccounts()
          form.reset()
        },
        err => console.log(err)
      );
    }    
  }


  addAccount(form: NgForm ){
    var now = new Date();
    var jsonDate = now.toJSON();
    var then = new Date(jsonDate);
    
    if(form.value.user_name == null || form.value.user_name == '' || form.value.password == '' || form.value.password == null){
      form.reset()
      alert("Error")
      return 0
    }

    if(form.value.id_account){
      console
      this.accountService.selectedAccount = {
        id_account: form.value.id_account,
        user_name: form.value.user_name,
        password: form.value.password,
        priority: (this.accountService.accounts.length+1)
      }
      
      this.accountService.updateAccount(this.accountService.selectedAccount).subscribe(
        res=>{
          form.reset()
          console.log(res)
        },
        err =>console.log(err)
      )
    }else{
      this.accountService.createAccount(this.accountService.selectedAccount).subscribe(
        res=> {
          this.getAccounts()
          form.reset()
        },
        err => console.log(err)
      );
    }    
  }

  deleteAccount(id_account: string){
    
    if(confirm('Are u sure you want delete it?')){
      this.accountService.deleteAccount(id_account).subscribe(
        res=> {
          console.log(res)
          this.getAccounts()
        },
        err => console.log(err)
      )
    }
  }

  editAccount(account: Account){
    this.accountService.selectedAccount = account;
  }

  resetForm(form: NgForm){
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

  

}
