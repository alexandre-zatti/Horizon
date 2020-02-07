import { Router } from '@angular/router';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  sumName = '';

  constructor(
    private router: Router
  ) {}

  changeRoute(sumName){
    this.router.navigate(['/main/'+sumName]);
  }


}
