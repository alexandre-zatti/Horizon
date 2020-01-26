import { HomeComponent } from './home/home.component';
import { MainComponent } from './Components/main/main.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
{
  path: '',
  component: HomeComponent
},
{
  path: 'main/:sumName',
  component: MainComponent
}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
