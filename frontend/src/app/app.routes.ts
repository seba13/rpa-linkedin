import { Component } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "./components/home/home.component";
import { ExtractionsComponent } from "./components/extractions/extractions.component";
import { AccountsComponent } from "./components/accounts/accounts.component";

const app_routes : Routes = [
    {path: 'home', component: HomeComponent},
    {path: 'extractions', component: ExtractionsComponent},
    {path: 'accounts', component: AccountsComponent},
    {path: '**', pathMatch: 'full', redirectTo: 'home'}
];

export const app_routing = RouterModule.forRoot(app_routes)