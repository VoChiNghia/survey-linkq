import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import {LocationStrategy, HashLocationStrategy} from '@angular/common';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet,RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [
    {provide: LocationStrategy, useClass: HashLocationStrategy}]
})
export class AppComponent {
  title = 'survey';
}
