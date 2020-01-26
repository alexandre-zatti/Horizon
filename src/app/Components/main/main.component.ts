import { ServicoService } from './../../services/servico.service';
import { Component, OnInit, Input, ɵConsole, ViewChild, Output } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import champions from 'src/assets/champion.json';
import spells from 'src/assets/summoner.json';
import { CountdownComponent, CountdownEvent } from 'ngx-countdown';
import { EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent  {

  @ViewChild('cd', { static: false }) private countdown: CountdownComponent;
  countEmitter : EventEmitter<CountdownEvent> = new EventEmitter<CountdownEvent>();

  BASE_URL = 'https://br1.api.riotgames.com/lol/';
  SUM_URL ='summoner/v4/summoners/by-name/';
  SPEC_URL = 'spectator/v4/active-games/by-summoner/';
  API_KEY = '?api_key=RGAPI-45014070-0b78-436c-bac9-56cc3b64dc3d';
  sumName = '';
  response : any;
  playerTeam : any;
  players : any = [];
  champImgs: any = [];
  spellsArray: any = [];
  sumStatus: any = new Array(10).fill(0);

  constructor(
    private servico: ServicoService,
    private route: ActivatedRoute
  ){
    this.route.params.subscribe(params =>{
      this.sumName = params['sumName'];
    });
    this.showInfo();
  }




  handleErrorSum(error : HttpErrorResponse){
    Swal.fire({
      title: 'Invocador Não Encontrado',
      text: 'Escreveu o nome errado?',
      icon: 'warning',
      confirmButtonText: 'OK'
    })
  }

  handleErrorSpec(error : HttpErrorResponse){
    Swal.fire({
      title: 'Partida Não Encontrada',
      text: 'O invocador em questão não encontra-se em uma partida',
      icon: 'warning',
      confirmButtonText: 'OK'
    })
  }

  showInfo(){
    let FULL_URL = this.BASE_URL + this.SUM_URL + this.sumName + this.API_KEY; //Forma primeira URL para buscar summoner ID
    this.servico.getSummoner(FULL_URL).subscribe(Response =>{
     this.response = Response;
      FULL_URL = this.BASE_URL + this.SPEC_URL + this.response['id'] + this.API_KEY;
      this.servico.getSpec(FULL_URL).subscribe(Response =>{
        this.response = Response;
      }, Error =>{this.handleErrorSpec(Error)}, () => {this.teamBuild()});
    }, Error =>{ this.handleErrorSum(Error)});
  }

  teamBuild(){

    for(let i in this.response.participants){
      if(this.response.participants[i].summonerName.toLowerCase() == this.sumName.toLowerCase()){
        this.playerTeam = this.response.participants[i].teamId;
      }
    }
    for(let i in this.response.participants){
      let player = {champ : '', sum1 : '',sum2 : '',}

      if(this.response.participants[i].teamId != this.playerTeam){
        player.champ = this.response.participants[i].championId;
        player.sum1 = this.response.participants[i].spell1Id;
        player.sum2 = this.response.participants[i].spell2Id;
        this.players.push(player);
      }

    }

    let champData = champions.data;
    let spellData = spells.data;
    let champKeys : any = Object.values(champData);
    let spellKeys : any = Object.values(spellData);

    for(let i in this.players){
      for(let j in champKeys){
        if(this.players[i].champ == champKeys[j].key){
          this.champImgs.push(champKeys[j].image.full);
        }
      }
      for(let k in spellKeys){
        let spellsInfo = {cd: '', img: '', name: ''};
        if(this.players[i].sum1 == spellKeys[k].key || this.players[i].sum2 == spellKeys[k].key){
          spellsInfo.cd = spellKeys[k].cooldownBurn;
          spellsInfo.img = spellKeys[k].image.full;
          spellsInfo.name = spellKeys[k].id;
          this.spellsArray.push(spellsInfo);
        }
      }

    }
  }

  handleEvent($event, i): void{
    if($event.left == 0){
      this.sumStatus[i] = 0;
    }
  }


  countVisibility(event){
    this.sumStatus[event.target.id] = 1;
  }


}
