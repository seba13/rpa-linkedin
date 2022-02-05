import { Component, OnInit, Input, Inject, NgZone, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NgForm } from '@angular/forms';
import { forkJoin, concat, from, Observable } from 'rxjs';

//models imports
import { Date_ } from "../../models/date";
import { User } from 'src/app/models/user';
import { Company } from 'src/app/models/company';
import { Reaction } from 'src/app/models/reaction';

//services imports
import { CompanyService } from "../../services/company.service";
import { PostService } from "../../services/post.service";
import { CommentService } from "../../services/comment.service";
import { FollowerService } from "../../services/follower.service";
import { ReactionService } from "../../services/reactions.service";
import { UserService } from "../../services/user.service";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


// amCharts imports
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { Comment } from 'src/app/models/comment';
import { Tag } from 'src/app/models/tag';
import { isNgTemplate } from '@angular/compiler';



@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.css']
})
export class CompaniesComponent implements OnInit {

  private chartPosts: am4charts.XYChart;
  private chartPostsComments: am4charts.XYChart;
  private chartReactionsTags: am4charts.XYChart;

  public selectedDate : Date_ = {
    from : new Date,
    to : new Date
  }
  comparePosts : Object[]
  @Input() id_company: String

  constructor(public companyService: CompanyService, 
              public postService: PostService, 
              public commentService: CommentService, 
              public followerService: FollowerService,
              public reactionService: ReactionService,
              public userService: UserService,
              public modalService: NgbModal,
              @Inject(PLATFORM_ID) private platformId,
              private zone: NgZone) { }

  ngOnInit(): void {
    this.getCompanies()
  }

  getCompanies(){
    this.companyService.getCompanies().subscribe(
      res => {
        this.companyService.companies = res
      },
      err => console.log(err)
    )
  }
  getPosts(id_company: Number){
    this.sendIdCompany(id_company)
    this.getCompanyPostsReactionsBetweenDates(id_company)
    this.getCompanyPostsCommentsBetweenDates(id_company)
  }
  sendIdCompany(_id: Number){
    this.commentService.clearComments();
    this.reactionService.clearReactions();
    this.reactionService.clearCompanyReactions();
    
    this.postService.getIdCompany(_id);
    this.postService.getDates(this.selectedDate)
    this.postService.getCompanyPostsBetweenDates(_id, this.selectedDate).subscribe(
      res=>{
        this.postService.posts = res
      }
    )
    this.getCompanyPostsReactionsBetweenDates(_id)
  }

  getCompanyPostsReactionsBetweenDates(id_company: Number){
    this.commentService.clearComments();
    this.reactionService.clearReactions();
    this.userService.clearUsers();
    this.postService.getCompanyPostsReactionsBetweenDates(id_company, this.selectedDate).subscribe(
      res=>{
        this.reactionService.reactionsBetweenDates = res},
      err => {console.log(err)}
    );
  }

  getCompanyPostsCommentsBetweenDates(id_company: Number){
    this.commentService.clearComments();
    this.reactionService.clearReactions();
    this.postService.getCompanyPostsCommentsBetweenDates(id_company, this.selectedDate).subscribe(
      res=>{
        this.commentService.commentsBetweenDates = res},
      err => {console.log(err)}
    );
  }


  sendIdCompanyReaction(id_company: Number){
    this.commentService.clearComments();
    this.reactionService.clearReactions();
    this.userService.clearUsers();
    this.reactionService.getCompanyReactions(id_company).subscribe(
      res=>{this.reactionService.companyReactions = res},
      err => {console.log(err)}
    );
  }

  sendIdCompanyComment(id_company: Number){
    this.commentService.clearComments();
    this.reactionService.clearReactions();
    this.userService.clearUsers();
    this.commentService.getCompanyComments(id_company).subscribe(
      res=>{this.commentService.companyComments = res},
      err => {console.log(err)}
    );
  }

  sendIdCompanyUsers(id_company : Number){
    this.commentService.clearComments();
    this.reactionService.clearReactions();
    this.userService.getCompanyUsers(id_company).subscribe(
      res=>{
        this.userService.usersTopTen=[]
        this.userService.companyUsers = res
        if(this.userService.companyUsers.length<10){
          for (var i = 0; i < this.userService.companyUsers.length; i++) {
            this.userService.usersTopTen.push(res[i])
         }
        }else{
          for (var i = 0; i < 10; i++) {
            this.userService.usersTopTen.push(res[i])
         }
        }
      },
      err => {console.log(err)}
    );
  }

  sendDates(form: NgForm) {
    this.postService.getDates(form.value)
    this.selectedDate.from = form.value.from
    this.selectedDate.to = form.value.to

    this.commentService.updateDates(this.selectedDate)
    this.followerService.updateDates(this.selectedDate)

    this.commentService.clearComments()
    this.reactionService.clearReactions()
    this.postService.clearPosts()
    this.followerService.clearFollowers()
  }

  clear(){
    this.postService.clearPosts();
    this.reactionService.clearReactions();
    this.followerService.clearFollowers();
    this.reactionService.clearCompanyReactions();
  }

  openXL(content){
    this.companyService.clearPosts()
    this.modalService.open(content, {  size: 'xl', scrollable: true });
  }

  addCompareCompany(company: Company){
    this.companyService.selectedCompanies.push(company)
  }
  removeCompareCompany(company: Company){
    const index = this.companyService.selectedCompanies.indexOf(company)
    this.companyService.selectedCompanies.splice(index)
  }



  addComparePostsCompany(companies: Company[]){
    let arrayOfData = [];
    
    let name_company = '';
    let cant_posts = 0;
    this.postService.clearComparePosts()
    for (var company of companies) {
      arrayOfData.push(this.getPostsFromAPI(company.id_company))
    }
    forkJoin(arrayOfData).subscribe(response => {
      for(let val in response){
        
        name_company = response[val][0].name_company
        cant_posts = Object.keys(response[val]).length   
        
        this.postService.comparePosts.push({
          "name_company": name_company,
          "cant_posts": cant_posts
        })
      }
      this.graphicPosts()
    }
    , error => {
      console.error(error);
    });
  }

  addCompareReactionsByTags(companies: Company[]){
    let arrayOfData = [];

    let cont_inversiones = 0
    let cont_pyme = 0
    let cont_pymeCharlas = 0
    let cont_wholesale = 0
    let cont_reputacion = 0
    let cont_mach = 0
    let cont_convenios = 0
    let cont_marcaEmpleadora = 0

    this.postService.clearCompareReactions() //se vacía el array con la data para el gráfico

    for (var company of companies) {
      arrayOfData.push(this.getReactionsFromAPI(company.id_company))
    }
    forkJoin(arrayOfData).subscribe(response => {
      for(let val in response){

        cont_inversiones = 0
        cont_pyme = 0
        cont_pymeCharlas = 0
        cont_wholesale = 0
        cont_reputacion = 0
        cont_mach = 0
        cont_convenios = 0
        cont_marcaEmpleadora = 0

        for(let i=0; i<Object.keys(response[val]).length; i++){
          if(response[val][i].tag == "Inversiones"){
            cont_inversiones = cont_inversiones+1
          }
          if(response[val][i].tag == "Pyme"){
            cont_pyme = cont_pyme+1
          }
          if(response[val][i].tag == "Pyme - Charlas"){
            cont_pymeCharlas = cont_pymeCharlas+1
          }
          if(response[val][i].tag == "Wholesale"){
            cont_wholesale = cont_wholesale+1
          }
          if(response[val][i].tag == "Reputación"){
            cont_reputacion = cont_reputacion+1
          }
          if(response[val][i].tag == "Mach"){
            cont_mach = cont_mach+1
          }
          if(response[val][i].tag == "Convenios"){
            cont_convenios = cont_convenios+1
          }
          if(response[val][i].tag == "Marca Empleadora"){
            cont_marcaEmpleadora = cont_marcaEmpleadora+1
          }
        }

        this.postService.compareReactionsByTags.push({
          "name_company": response[val][0].name_company,
          "cant_reactions_inversiones": cont_inversiones,
          "cant_reactions_pyme": cont_pyme,
          "cant_reactions_pymeCharlas": cont_pymeCharlas,
          "cant_reactions_wholesale": cont_wholesale,
          "cant_reactions_reputacion": cont_reputacion,
          "cant_reactions_mach": cont_mach,
          "cant_reactions_convenios": cont_convenios,
          "cant_reactions_marcaEmpleadora": cont_marcaEmpleadora,
        })
      }
      
      this.graphicReactionsTags()
    }
    
    , error => {
      console.error(error);
    });
  }

  addComparePostsCommentsReactions(companies: Company[]){
    this.forkjoinPosts(companies)
  }

  forkjoinPosts(companies: Company[]){
    this.postService.clearComparePosts2()

    let arrayOfPosts= [];

    for (var company of companies) {
      arrayOfPosts.push(this.getPostsFromAPI(company.id_company))
    }

    forkJoin(arrayOfPosts).subscribe(response => {
      for(let val in response){
        let item : Object = {
            name_company: response[val][0].name_company,
            cant_posts: Object.keys(response[val]).length
          }
        this.postService.comparePosts2.push(item)
      }
      this.forkjoinComments(companies)
    }
    , error => {
      console.error(error);
    });
  }

  forkjoinComments(companies: Company[]){
    this.postService.clearCompareComments()
    let arrayOfComments= [];
    for (var company of companies) {
      arrayOfComments.push(this.getCommentsFromAPI(company.id_company))
    }
    forkJoin(arrayOfComments).subscribe(response => {
      for(let val in response){
        let item ={
          name_company: response[val][0].name_company,
          cant_comments: Object.keys(response[val]).length
        }
        this.postService.compareComments.push(item)
      }
      this.forkjoinReactions(companies)
    }
    , error => {
      console.error(error);
    });
  }

  forkjoinReactions(companies: Company[]){
    this.postService.clearCompareReactions()
    let arrayOfReactions= [];

    for (var company of companies) {
      arrayOfReactions.push(this.getReactionsFromAPI(company.id_company))
    }

    forkJoin(arrayOfReactions).subscribe(response => {
      for(let val in response){
        let item ={
          name_company: response[val][0].name_company,
          cant_reactions: Object.keys(response[val]).length
        }
        this.postService.compareReactions.push(item)
      }
      for( let i in this.postService.comparePosts2){
        this.postService.comparePostsCommentsReactions.push({
          "name_company": Object.values(this.postService.comparePosts2[i])[0],
          "cant_posts": Object.values(this.postService.comparePosts2[i])[1],
          "cant_comments": Object.values(this.postService.compareComments[i])[1],
          "cant_reactions": Object.values(this.postService.compareReactions[i])[1],
        })
      }
      this.graphicPostsCommentsReactions() 

    }
    , error => {
      console.error(error);
    });
    
  }

  getPostsFromAPI(id_company: Number): any {
    return this.postService.getCompanyPostsBetweenDates(id_company, this.selectedDate);
   }

   getCommentsFromAPI(id_company: Number): any {
    return this.postService.getCompanyPostsCommentsBetweenDates(id_company, this.selectedDate);
   }

   getReactionsFromAPI(id_company: Number): any {
    return this.postService.getCompanyPostsReactionsBetweenDates(id_company, this.selectedDate);
   }

  //gráficos:

  ngAfterViewInit_example() {

      am4core.useTheme(am4themes_animated);

      let chart = am4core.create("chartdiv1", am4charts.XYChart);

      chart.paddingRight = 20;

      // Add data
      chart.data = [{
        "tipo": "comentario",
        "banco estado": 25,
        "banco de chile": 25,
        "banco itau": 21
      }, {
        "tipo": "post",
        "banco estado": 26,
        "banco de chile": 27,
        "banco itau": 22
      }, {
        "tipo": "reacciones",
        "banco estado": 28,
        "banco de chile": 29,
        "banco itau": 24
      }];

      chart.legend = new am4charts.Legend();
      chart.legend.position = "right";


      // Create axes
      let categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = "tipo";
      categoryAxis.renderer.grid.template.opacity = 0;


      let valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
      valueAxis.min = 0;
      valueAxis.renderer.grid.template.opacity = 0;
      valueAxis.renderer.ticks.template.strokeOpacity = 0.5;
      valueAxis.renderer.ticks.template.stroke = am4core.color("#495C43");
      valueAxis.renderer.ticks.template.length = 10;
      valueAxis.renderer.line.strokeOpacity = 0.5;
      valueAxis.renderer.baseGrid.disabled = true;
      valueAxis.renderer.minGridDistance = 40;


      // Create categories

      createSeries("banco estado", "banco estado");
      createSeries("banco de chile", "banco de chile");
      createSeries("banco itau", "banco itau");

      this.chartPosts = chart;

      function createSeries(field, name) {
        let series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.valueX = field;
        series.dataFields.categoryY = "tipo";
        series.stacked = true;
        series.name = name;
      
        let labelBullet = series.bullets.push(new am4charts.LabelBullet());
        labelBullet.locationX = 0.5;
        labelBullet.label.text = "{valueX}";
        labelBullet.label.fill = am4core.color("#fff");
      }
  }


  graphicPosts() {
    
      am4core.useTheme(am4themes_animated);

      let chart  = am4core.create("chartdiv2", am4charts.XYChart);

      chart.paddingRight = 20;

      // Add data
      chart.data = this.postService.comparePosts
           
      //chart.data = this.postService.comparePosts

      chart.legend = new am4charts.Legend();
      chart.legend.position = "right";


      // Create axes
      let categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = "name_company";
      categoryAxis.renderer.grid.template.opacity = 0;


      let valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
      valueAxis.min = 0;
      valueAxis.renderer.grid.template.opacity = 0;
      valueAxis.renderer.ticks.template.strokeOpacity = 0.5;
      valueAxis.renderer.ticks.template.stroke = am4core.color("#495C43");
      valueAxis.renderer.ticks.template.length = 10;
      valueAxis.renderer.line.strokeOpacity = 0.5;
      valueAxis.renderer.baseGrid.disabled = true;
      valueAxis.renderer.minGridDistance = 40;


      // Create categories

      createSeries("cant_posts", "cantidad de posts");

      this.chartPosts = chart;

      function createSeries(field, name) {
        let series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.valueX = field;
        series.dataFields.categoryY = "name_company";
        series.stacked = true;
        series.name = name;
      
        let labelBullet = series.bullets.push(new am4charts.LabelBullet());
        labelBullet.locationX = 0.5;
        labelBullet.label.text = "{valueX}";
        labelBullet.label.fill = am4core.color("#fff");
      }
  }

  graphicPostsCommentsReactionsORIGINAL() {
    // Chart code goes in here
    // this.browserOnly(() => {
      am4core.useTheme(am4themes_animated);

      let chart  = am4core.create("chartdiv3", am4charts.XYChart);

      chart.paddingRight = 20;

      // Add data
      chart.data = this.postService.comparePostsCommentsReactions

      chart.legend = new am4charts.Legend();
      chart.legend.position = "right";


      // Create axes
      let categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = "name_company";
      categoryAxis.renderer.grid.template.opacity = 0;


      let valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
      valueAxis.min = 0;
      valueAxis.renderer.grid.template.opacity = 0;
      valueAxis.renderer.ticks.template.strokeOpacity = 0.5;
      valueAxis.renderer.ticks.template.stroke = am4core.color("#495C43");
      valueAxis.renderer.ticks.template.length = 10;
      valueAxis.renderer.line.strokeOpacity = 0.5;
      valueAxis.renderer.baseGrid.disabled = true;
      valueAxis.renderer.minGridDistance = 30;


      // Create categories
      createSeries("cant_posts", "cantidad de posts");
      createSeries("cant_comments", "cantidad de comentarios");
      createSeries("cant_reactions", "cantidad de reacciones");

      this.chartPosts = chart;

      function createSeries(field, name) {
        let series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.valueX = field;
        series.dataFields.categoryY = "name_company";
        series.stacked = true;
        series.name = name;
      
        let labelBullet = series.bullets.push(new am4charts.LabelBullet());
        labelBullet.locationX = 0.5;
        labelBullet.label.text = "{valueX}";
        labelBullet.label.fill = am4core.color("#fff");
      }
  }
  graphicPostsCommentsReactions() {
    // Chart code goes in here
    // this.browserOnly(() => {
      // Themes begin
      am4core.useTheme(am4themes_animated);
      // Themes end

      let chart = am4core.create("chartdiv3", am4charts.XYChart);
      chart.hiddenState.properties.opacity = 0; // this creates initial fade-in
      
      // Add data
      
      chart.data = this.postService.comparePostsCommentsReactions

      chart.colors.step = 2;

      chart.padding(30, 30, 10, 30);
      chart.legend = new am4charts.Legend();

      let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = "name_company";
      categoryAxis.renderer.grid.template.location = 0;

      let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis.min = 0;
      valueAxis.max = 100;
      valueAxis.strictMinMax = true;
      valueAxis.calculateTotals = true;
      valueAxis.renderer.minWidth = 50;


      let series1 = chart.series.push(new am4charts.ColumnSeries());
      series1.columns.template.width = am4core.percent(80);
      series1.columns.template.tooltipText =
        "{name}: {valueY.totalPercent.formatNumber('#.00')}% \n n = {valueY}"
      series1.name = "Publicaciones";
      series1.dataFields.categoryX = "name_company";
      series1.dataFields.valueY = "cant_posts";
      series1.dataFields.valueYShow = "totalPercent";
      series1.dataItems.template.locations.categoryX = 0.5;
      series1.stacked = false;
      series1.tooltip.pointerOrientation = "vertical";

      let bullet1 = series1.bullets.push(new am4charts.LabelBullet());
      bullet1.interactionsEnabled = false;
      bullet1.label.text = "{valueY}";
      bullet1.label.fill = am4core.color("#ffffff");
      bullet1.locationY = 0.5;

      let series2 = chart.series.push(new am4charts.ColumnSeries());
      series2.columns.template.width = am4core.percent(80);
      series2.columns.template.tooltipText =
        "{name}: {valueY.totalPercent.formatNumber('#.00')}% \n n = {valueY}";
      series2.name = "Comentarios";
      series2.dataFields.categoryX = "name_company";
      series2.dataFields.valueY = "cant_comments";
      series2.dataFields.valueYShow = "totalPercent";
      series2.dataItems.template.locations.categoryX = 0.5;
      series2.stacked = false;
      series2.tooltip.pointerOrientation = "vertical";

      let bullet2 = series2.bullets.push(new am4charts.LabelBullet());
      bullet2.interactionsEnabled = false;
      bullet2.label.text = "{valueY}";
      // bullet2.label.text = "{valueY.totalPercent.formatNumber('#.00')}%";
      bullet2.locationY = 0.5;
      bullet2.label.fill = am4core.color("#ffffff");

      let series3 = chart.series.push(new am4charts.ColumnSeries());
      series3.columns.template.width = am4core.percent(80);
      series3.columns.template.tooltipText =
        "{name}: {valueY.totalPercent.formatNumber('#.00')}% \n n = {valueY}";
      series3.name = "Reacciones";
      series3.dataFields.categoryX = "name_company";
      series3.dataFields.valueY = "cant_reactions";
      series3.dataFields.valueYShow = "totalPercent";
      series3.dataItems.template.locations.categoryX = 0.5;
      series3.stacked = false;
      series3.tooltip.pointerOrientation = "vertical";

      let bullet3 = series3.bullets.push(new am4charts.LabelBullet());
      bullet3.interactionsEnabled = false;
      bullet3.label.text = "{valueY}";
      bullet3.locationY = 0.5;
      bullet3.label.fill = am4core.color("#ffffff");

      
  }

  graphicReactionsTagsORIGINAL() {
    // Chart code goes in here
    // this.browserOnly(() => {
      am4core.useTheme(am4themes_animated);

      let chart  = am4core.create("chartdiv4", am4charts.XYChart);

      chart.paddingRight = 20;
      
      // Add data
      
      chart.data = this.postService.compareReactionsByTags

      chart.legend = new am4charts.Legend();
      chart.legend.position = "right";


      // Create axes
      let categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = "name_company";
      categoryAxis.renderer.grid.template.opacity = 0;


      let valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
      valueAxis.min = 0;
      valueAxis.renderer.grid.template.opacity = 0;
      valueAxis.renderer.ticks.template.strokeOpacity = 0.5;
      valueAxis.renderer.ticks.template.stroke = am4core.color("#495C43");
      valueAxis.renderer.ticks.template.length = 10;
      valueAxis.renderer.line.strokeOpacity = 0.5;
      valueAxis.renderer.baseGrid.disabled = true;
      valueAxis.renderer.minGridDistance = 30;


      // Create categories

      createSeries("cant_reactions_inversiones", "Inversiones");
      createSeries("cant_reactions_pyme", "Pyme");
      createSeries("cant_reactions_pymeCharlas", "Pyme - Charlas");
      createSeries("cant_reactions_wholesale", "Wholesale");
      createSeries("cant_reactions_reputacion", "Reputación");
      createSeries("cant_reactions_mach", "Mach");
      createSeries("cant_reactions_convenios", "Convenios");
      createSeries("cant_reactions_marcaEmpleadora", "Marca Empleadora");

      this.chartReactionsTags = chart;

      function createSeries(field, name) {
        let series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.valueX = field;
        series.dataFields.categoryY = "name_company";
        series.stacked = true;
        series.name = name;
      
        let labelBullet = series.bullets.push(new am4charts.LabelBullet());
        labelBullet.locationX = 0.5;
        labelBullet.label.text = "{valueX}";
        labelBullet.label.fill = am4core.color("#fff");
      }
  }

  graphicReactionsTags() {
    // Chart code goes in here
    // this.browserOnly(() => {
      // Themes begin
      am4core.useTheme(am4themes_animated);
      // Themes end

      let chart = am4core.create("chartdiv4", am4charts.XYChart);
      chart.hiddenState.properties.opacity = 0; // this creates initial fade-in
      
      // Add data
      
      chart.data = this.postService.compareReactionsByTags

      chart.colors.step = 2;

      chart.padding(30, 30, 10, 30);
      chart.legend = new am4charts.Legend();

      let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = "name_company";
      categoryAxis.renderer.grid.template.location = 0;

      let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis.min = 0;
      valueAxis.max = 100;
      valueAxis.strictMinMax = true;
      valueAxis.calculateTotals = true;
      valueAxis.renderer.minWidth = 50;


      let series1 = chart.series.push(new am4charts.ColumnSeries());
      series1.columns.template.width = am4core.percent(80);
      series1.columns.template.tooltipText =
        "{name}: {valueY.totalPercent.formatNumber('#.00')}% \n n = {valueY}"
      series1.name = "Inversiones";
      series1.dataFields.categoryX = "name_company";
      series1.dataFields.valueY = "cant_reactions_inversiones";
      series1.dataFields.valueYShow = "totalPercent";
      series1.dataItems.template.locations.categoryX = 0.5;
      series1.stacked = false;
      series1.tooltip.pointerOrientation = "vertical";

      let bullet1 = series1.bullets.push(new am4charts.LabelBullet());
      bullet1.interactionsEnabled = false;
      bullet1.label.text = "{valueY}";
      bullet1.label.fill = am4core.color("#ffffff");
      bullet1.locationY = 0.5;

      let series2 = chart.series.push(new am4charts.ColumnSeries());
      series2.columns.template.width = am4core.percent(80);
      series2.columns.template.tooltipText =
        "{name}: {valueY.totalPercent.formatNumber('#.00')}% \n n = {valueY}";
      series2.name = "Pyme";
      series2.dataFields.categoryX = "name_company";
      series2.dataFields.valueY = "cant_reactions_pyme";
      series2.dataFields.valueYShow = "totalPercent";
      series2.dataItems.template.locations.categoryX = 0.5;
      series2.stacked = false;
      series2.tooltip.pointerOrientation = "vertical";

      let bullet2 = series2.bullets.push(new am4charts.LabelBullet());
      bullet2.interactionsEnabled = false;
      bullet2.label.text = "{valueY}";
      // bullet2.label.text = "{valueY.totalPercent.formatNumber('#.00')}%";
      bullet2.locationY = 0.5;
      bullet2.label.fill = am4core.color("#ffffff");

      let series3 = chart.series.push(new am4charts.ColumnSeries());
      series3.columns.template.width = am4core.percent(80);
      series3.columns.template.tooltipText =
        "{name}: {valueY.totalPercent.formatNumber('#.00')}% \n n = {valueY}";
      series3.name = "Pyme - Charlas";
      series3.dataFields.categoryX = "name_company";
      series3.dataFields.valueY = "cant_reactions_pymeCharlas";
      series3.dataFields.valueYShow = "totalPercent";
      series3.dataItems.template.locations.categoryX = 0.5;
      series3.stacked = false;
      series3.tooltip.pointerOrientation = "vertical";

      let bullet3 = series3.bullets.push(new am4charts.LabelBullet());
      bullet3.interactionsEnabled = false;
      bullet3.label.text = "{valueY}";
      bullet3.locationY = 0.5;
      bullet3.label.fill = am4core.color("#ffffff");

      let series4 = chart.series.push(new am4charts.ColumnSeries());
      series4.columns.template.width = am4core.percent(80);
      series4.columns.template.tooltipText =
        "{name}: {valueY.totalPercent.formatNumber('#.00')}% \n n = {valueY}";
      series4.name = "Wholesale";
      series4.dataFields.categoryX = "name_company";
      series4.dataFields.valueY = "cant_reactions_wholesale";
      series4.dataFields.valueYShow = "totalPercent";
      series4.dataItems.template.locations.categoryX = 0.5;
      series4.stacked = false;
      series4.tooltip.pointerOrientation = "vertical";

      let bullet4 = series4.bullets.push(new am4charts.LabelBullet());
      bullet4.interactionsEnabled = false;
      bullet4.label.text = "{valueY}";
      bullet4.locationY = 0.5;
      bullet4.label.fill = am4core.color("#ffffff");

      let series5 = chart.series.push(new am4charts.ColumnSeries());
      series5.columns.template.width = am4core.percent(80);
      series5.columns.template.tooltipText =
        "{name}: {valueY.totalPercent.formatNumber('#.00')}% \n n = {valueY}";
      series5.name = "Reputación";
      series5.dataFields.categoryX = "name_company";
      series5.dataFields.valueY = "cant_reactions_reputacion";
      series5.dataFields.valueYShow = "totalPercent";
      series5.dataItems.template.locations.categoryX = 0.5;
      series5.stacked = false;
      series5.tooltip.pointerOrientation = "vertical";

      let bullet5 = series5.bullets.push(new am4charts.LabelBullet());
      bullet5.interactionsEnabled = false;
      bullet5.label.text = "{valueY}";
      bullet5.locationY = 0.5;
      bullet5.label.fill = am4core.color("#ffffff");

      let series6 = chart.series.push(new am4charts.ColumnSeries());
      series6.columns.template.width = am4core.percent(80);
      series6.columns.template.tooltipText =
        "{name}: {valueY.totalPercent.formatNumber('#.00')}% \n n = {valueY}";
      series6.name = "Mach";
      series6.dataFields.categoryX = "name_company";
      series6.dataFields.valueY = "cant_reactions_mach";
      series6.dataFields.valueYShow = "totalPercent";
      series6.dataItems.template.locations.categoryX = 0.5;
      series6.stacked = false;
      series6.tooltip.pointerOrientation = "vertical";

      let bullet6 = series6.bullets.push(new am4charts.LabelBullet());
      bullet6.interactionsEnabled = false;
      bullet6.label.text = "{valueY}";
      bullet6.locationY = 0.5;
      bullet6.label.fill = am4core.color("#ffffff");

      let series7 = chart.series.push(new am4charts.ColumnSeries());
      series7.columns.template.width = am4core.percent(80);
      series7.columns.template.tooltipText =
        "{name}: {valueY.totalPercent.formatNumber('#.00')}% \n n = {valueY}";
      series7.name = "Convenios";
      series7.dataFields.categoryX = "name_company";
      series7.dataFields.valueY = "cant_reactions_convenios";
      series7.dataFields.valueYShow = "totalPercent";
      series7.dataItems.template.locations.categoryX = 0.5;
      series7.stacked = false;
      series7.tooltip.pointerOrientation = "vertical";

      let bullet7 = series7.bullets.push(new am4charts.LabelBullet());
      bullet7.interactionsEnabled = false;
      bullet7.label.text = "{valueY}";
      bullet7.locationY = 0.5;
      bullet7.label.fill = am4core.color("#ffffff");

      let series8 = chart.series.push(new am4charts.ColumnSeries());
      series8.columns.template.width = am4core.percent(80);
      series8.columns.template.tooltipText =
        "{name}: {valueY.totalPercent.formatNumber('#.00')}% \n n = {valueY}";
      series8.name = "Marca Empleadora";
      series8.dataFields.categoryX = "name_company";
      series8.dataFields.valueY = "cant_reactions_marcaEmpleadora";
      series8.dataFields.valueYShow = "totalPercent";
      series8.dataItems.template.locations.categoryX = 0.5;
      series8.stacked = false;
      series8.tooltip.pointerOrientation = "vertical";

      let bullet8 = series8.bullets.push(new am4charts.LabelBullet());
      bullet8.interactionsEnabled = false;
      bullet8.label.text = "{valueY}";
      bullet8.locationY = 0.5;
      bullet8.label.fill = am4core.color("#ffffff");
  }

    

  
}
