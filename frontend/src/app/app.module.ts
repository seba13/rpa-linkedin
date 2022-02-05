import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from "@angular/common/http";
import { FormsModule } from "@angular/forms";

import { AppComponent } from './app.component';
import { CompaniesComponent } from './components/companies/companies.component';
import { PostsComponent } from './components/posts/posts.component';
import { ReactionsComponent } from './components/reactions/reactions.component';
import { CommentsComponent } from './components/comments/comments.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatNativeDateModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { FollowersComponent } from './components/followers/followers.component';
import { UsersComponent } from './components/users/users.component';

import { ScrollingModule } from "@angular/cdk/scrolling";
import { ExtractionsComponent } from './components/extractions/extractions.component';

//Routes
import { app_routing } from "./app.routes";
import { HomeComponent } from './components/home/home.component';
import { AccountsComponent } from './components/accounts/accounts.component'


@NgModule({
  declarations: [
    AppComponent,
    CompaniesComponent,
    PostsComponent,
    ReactionsComponent,
    CommentsComponent,
    FollowersComponent,
    UsersComponent,
    ExtractionsComponent,
    HomeComponent,
    AccountsComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    ScrollingModule,
    app_routing
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
