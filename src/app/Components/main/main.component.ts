import { ServicoService } from './../../services/servico.service';
import { Component, OnInit, Input, ɵConsole, ViewChild, Output } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2/src/sweetalert2.js'
import champions from 'src/assets/champion.json';
import spells from 'src/assets/summoner.json';
import { CountdownComponent, CountdownEvent } from 'ngx-countdown';
import { EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { timer } from 'rxjs';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent  {

  @ViewChild('countdown',{ static: false }) private counter: CountdownComponent;

  BASE_URL = 'https://br1.api.riotgames.com/lol/';
  SUM_URL ='summoner/v4/summoners/by-name/';
  SPEC_URL = 'spectator/v4/active-games/by-summoner/';
  API_KEY = '?api_key=RGAPI-66c0f58c-8ae9-4366-aa1a-d0380c2c9ae8';
  sumName = '';
  response : any;
  playerTeam : any;
  players : any = [];
  champImgs: any = [];
  champNames: any = [];
  spellsArray: any = [];
  gameStartTime: any;
  gameLenght: any;
  sumStatus: any = new Array(10).fill(0);
  timers: any = [];


  constructor(
    private servico: ServicoService,
    private route: ActivatedRoute,
    private router: Router
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
      }, Error =>{this.handleErrorSpec(Error), this.router.navigate(['/'])}, () => {this.teamBuild()});
    }, Error =>{ this.handleErrorSum(Error)});
  }

  teamBuild(){
    this.gameStartTime = this.response.gameStartTime;

    console.log("start = "+this.gameStartTime);

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
          this.champNames.push(champKeys[j].name);
        }
      }
      for(let k in spellKeys){
        let spellsInfo = {cd: '', img: '', name: '', niceName: ''};
        if(this.players[i].sum1 == spellKeys[k].key || this.players[i].sum2 == spellKeys[k].key){
          spellsInfo.cd = spellKeys[k].cooldownBurn;
          spellsInfo.img = spellKeys[k].image.full;
          spellsInfo.name = spellKeys[k].id;
          spellsInfo.niceName = spellKeys[k].name;
          this.spellsArray.push(spellsInfo);
        }
      }

    }
  }

  timeConversion(millis){
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return (seconds == "60" ? (minutes+1) + ":00" : minutes + ":" + (seconds < "10" ? "0" : "") + seconds);
  }


  handleEvent($event, i , champI): void{
    let time = {champ:'', spells:[]};
    let spellSpecifics = {name:'', math:''};
    let localTime = new Date()
    let gameTime = new Date(this.gameStartTime);
    let currentTime = localTime.getTime() - gameTime.getTime();


    time.champ = this.champNames[champI];
    spellSpecifics.name = this.spellsArray[i].niceName;
    spellSpecifics.math = this.timeConversion(currentTime + $event.left);
    time.spells.push(spellSpecifics);
    if(this.timers[champI]){
      this.timers[champI].spells.push(spellSpecifics);
    }else{
      this.timers[champI] = time;
    }

    if($event.left == 0){
      let index = 0;
      for(let s of this.timers[champI].spells){

        if(s.name == this.spellsArray[i].niceName){
          this.timers[champI].spells.splice(index,5);
        }
        index++;
      }
      this.sumStatus[i] = 0;
    }
    console.log(this.timers);
  }

  copySums(){
    let step = "";
    let done = "";
    for(let t in this.timers){
      step = this.timers[t].champ;
      for(let j in this.timers[t].spells){
        if(j == "0"){
          step = step + ' : ' + this.timers[t].spells[j].name + ' ' + this.timers[t].spells[j].math;
        }else{
          step = step + ' / ' + this.timers[t].spells[j].name + ' ' + this.timers[t].spells[j].math;
        }

      }
      done += step + '\n';
    }

    console.log(done);
    // MARACUTAIA LOCA DO CLIPBOARD
    const el = document.createElement('textarea');
    el.value = done;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }


  countVisibility(event){
    this.sumStatus[event.target.id] = 1;

  }


}
