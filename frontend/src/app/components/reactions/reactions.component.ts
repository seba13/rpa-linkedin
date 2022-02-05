import { Component, OnInit } from '@angular/core';
import { ReactionService } from "../../services/reactions.service";

// amCharts imports
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

//csv exports
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-reactions',
  templateUrl: './reactions.component.html',
  styleUrls: ['./reactions.component.css']
})
export class ReactionsComponent implements OnInit {

  constructor(public reactionService: ReactionService) { }

  ngOnInit(): void {
  }

  getReactions(){
    this.reactionService.getReactions().subscribe(
      res => {
        this.reactionService.reactions = res
      },
      err => console.log(err)
    )
  }

  downloadReactionsCsv(){
    this.getCompanyReactions_csv(this.reactionService.companyReactions);
  }

  getCompanyReactions_csv(data: any){
      const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
      const header = Object.keys(data[0]);
      let csv = data.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
      csv.unshift(header.join(','));
      let csvArray = csv.join('\r\n');

      var blob = new Blob([csvArray], {type: 'text/csv' })
      FileSaver.saveAs(blob, "reactions.csv");
  }

}

