import { Component, Input, OnInit } from '@angular/core';
import { PostService } from "../../services/post.service";
import { ReactionService } from "../../services/reactions.service";
import { CommentService } from "../../services/comment.service";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Date_ } from "../../models/date";
import { Tag } from "../../models/tag";

//csv exports
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.css']
})
export class PostsComponent implements OnInit {

  public selectedDate : Date_ = {
    from : new Date,
    to : new Date
  }

  @Input() id_post: String

  constructor(
    public postService: PostService, 
    public reactionService: ReactionService, 
    public commentService: CommentService, 
    public modalService: NgbModal) { }

  ngOnInit(): void {
  }

  getPosts(){
    this.postService.getPosts().subscribe(
      res => {
        this.postService.posts = res
      },
      err => console.log(err)
    )
  }

  sendIdPostReaction(_id: Number){
    this.reactionService.clearCompanyReactions()
    this.reactionService.getIdPost(_id)
    this.reactionService.getPostsReactions(_id).subscribe(
      res=>{
        this.reactionService.reactions = res
      },
      err => console.log(err)
    )
  }

  sendIdPostComment(_id: Number){
    this.commentService.clearComments()
    this.commentService.getIdPost(_id)
  }

  getCompanyPosts(){
    this.postService.id_companySubject$.subscribe(
      res=>{
        this.postService.getCompanyPosts(res).subscribe(
          response => {
            this.postService.posts = response
          },
          error=> console.log(error)
        )
      },
      err => console.log(err)
    )
  }

  getTags(){
    this.postService.getTags().subscribe(
      res=>{
        this.postService.tags = res
      },
      err=>{
        console.log(err)
      }
    )
  }

  openVerticallyCentered(content, post) {
    this.getTags()
    this.postService.selectedPost = post
    this.modalService.open(content, { centered: true, scrollable: true });
  }

  save(id_tag: number, tag: string){
    let Tag_ : Tag = {
      id_tag: id_tag,
      tag: tag
    } 
    this.updatePost(this.postService.selectedPost.id_post,Tag_)
  }
  updatePost(id_post: number, tag: Tag){
    this.postService.updatePost(this.postService.selectedPost.id_post,tag).subscribe(
      res=>{
        console.log(res)
        this.getCompanyPostsBetweenDates(this.postService.selectedPost.idCompany, this.postService.selectedDate)
      },
      err=>{
        console.log(err)
      }
    )
  }

  getCompanyPostsBetweenDates(id_company: number, dates: Date_){
    this.postService.getCompanyPostsBetweenDates(id_company, dates).subscribe(
      res=>{
        this.postService.posts = res
      },
      err =>{
        console.log(err)
      }
    )
  }
  
  downloadReaction(){
    this.downloadFile(this.reactionService.reactionsBetweenDates, 'reactions')
  }
  
  downloadComments(){
    this.downloadFile(this.commentService.commentsBetweenDates, 'comments')
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
