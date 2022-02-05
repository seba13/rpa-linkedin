import { Component, OnInit, Inject, NgZone, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, JsonPipe } from '@angular/common';

//services services
import { UserService } from "../../services/user.service";

// amCharts imports
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

//csv exports
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  
  constructor(public userService: UserService) { }

  ngOnInit(): void {
    this.getCompanyUsers()
  }
  
  getUser(){
    this.userService.url_userSubject$.subscribe(
      res => {
        this.userService.getUser(res).subscribe(
          response => {
            this.userService.users = response
          },
          error=> console.log(error)
        )
      },
      err => console.log(err)
    )
  }

  getCompanyUsers(){
    this.userService.id_companySubject$.subscribe(
      res=>{
        this.userService.getCompanyUsers(res).subscribe(
          response => {
            
            this.userService.companyUsers = response
            
          },
          error=> console.log(error)
        )
      },
      err => console.log(err)
    )
  }


  getUsers(){
    this.userService.getUsers().subscribe(
      res=> this.userService.users = res,
      err => console.log(err)
    )
  }

  //csv exports
  downloadUsers(){
    this.downloadFile(this.userService.companyUsers, 'users')
  }

  downloadFile(data: any, filename:string) {
    const replacer = (key, value) => value === null ? '' : value;
    const header = Object.keys(data[0]);
    let csv = data.map(row => header.map(fieldName => JSON.stringify(row[fieldName],replacer)).join(','));
    csv.unshift(header.join(','));
    let csvArray = csv.join('\r\n');
    var blob = new Blob([csvArray], {type: 'text/csv' })
    FileSaver.saveAs(blob, filename + ".csv");
  }
}
