import { Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { Error404Component } from './error-404/error-404.component';
import { AppComponent } from './app.component';
import { SurveyResultComponent } from './survey-result/survey-result.component';

export const routes: Routes = [
  {
    path: 'result',
    component: SurveyResultComponent,
    pathMatch: 'full',
  },
  {
    path: ':id-survey',
    component: HomePageComponent,
  },
  {
    path: ':id-survey/:mst',
    component: HomePageComponent,
  },
  {
    path: '',
    component: AppComponent,
    pathMatch: 'full',

  },
  
  // { path: '404-not-found', component: Error404Component},
  // { path: '**', redirectTo: '404-not-found' }
];
