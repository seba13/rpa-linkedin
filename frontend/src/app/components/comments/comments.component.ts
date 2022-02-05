import { Component, OnInit } from '@angular/core';
import { CommentService } from "../../services/comment.service";
import { UserService } from "../../services/user.service";
import { Date_ } from "../../models/date";


//csv exports
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit {

  public selectedDate : Date_ = {
    from : new Date,
    to : new Date
  }



  constructor(public commentService: CommentService, public userService: UserService) { }

  ngOnInit(): void {
    this.getPostsComments()
  }

  getComments(){
    this.commentService.getComments().subscribe(
      res => {
        this.commentService.comments = res
      },
      err => console.log(err)
    )
  }


  getPostsComments(){  
    this.commentService.id_postSubject$.subscribe(
      res=>{
        this.commentService.getPostsComments(res).subscribe(
          response => {
            this.commentService.comments = response
          },
          error=> console.log(error)
        )
      },
      err => console.log(err)
    )
  }

  getPostCommentsBetweenDates(){
    this.commentService.id_postSubject$.subscribe(
      res=>{
        this.commentService.getPostCommentsBetweenDates(res).subscribe(
          response => {
            console.log(response)
            this.commentService.comments = response
          },
          error=> console.log(error)
        )
      },
      err => console.log(err)
    )
  }

  sendUrl_user(url_user){
    this.userService.getUrl_user(url_user)
  }

  getCompanyComments(){
    this.commentService.id_companySubject$.subscribe(
      res=>{
        this.commentService.getCompanyComments(res).subscribe(
          response => {
            this.commentService.companyComments = response
          },
          error=> console.log(error)
        )
      },
      err => console.log(err)
    )
  }

  downloadCommentsCsv(){
    this.getCompanyReactions_csv(this.commentService.companyComments);
  }

  getCompanyReactions_csv(data: any){
      const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
      const header = Object.keys(data[0]);
      let csv = data.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
      csv.unshift(header.join(','));
      let csvArray = csv.join('\r\n');

      var blob = new Blob([csvArray], {type: 'text/csv' })
      FileSaver.saveAs(blob, "comments.csv");
  }

}
