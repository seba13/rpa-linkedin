import { Component, OnInit } from '@angular/core';
import { FollowerService } from "../../services/follower.service";
import { PostService } from "../../services/post.service";
@Component({
  selector: 'app-followers',
  templateUrl: './followers.component.html',
  styleUrls: ['./followers.component.css']
})
export class FollowersComponent implements OnInit {

  constructor(public followerService: FollowerService, public postService: PostService) { }

  ngOnInit(): void {
    this.getCompanyFollowersBetweenDates()
  }

  getCompanyFollowersBetweenDates(){
    this.postService.id_companySubject$.subscribe(
      res=>{
        this.followerService.getCompanyFollowersBetweenDates(res).subscribe(
          response => {
            console.log(response)
            this.followerService.followers = response
          },
          error=> console.log(error)
        )
      },
      err => console.log(err)
    )
  }

}
