import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class ServicoService {

  constructor(
    private http: HttpClient,
  ) { }


  getSummoner(URL){
    return this.http.get(URL);
  }

  getSpec(URL){
    return this.http.get(URL);
  }


}
