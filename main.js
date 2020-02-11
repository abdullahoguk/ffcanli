import {default as allPlayers} from './data/json/oyuncular/all.js';
import {default as points} from 'https://cdn.jsdelivr.net/gh/aoguk/data@master/puanlar.js';
import {default as teams} from './data/json/takimlar.js';

//DOM elements
var userTeamDOM=document.querySelector(".userTeam");
var positionContainers = userTeamDOM.querySelectorAll(".positionContainer")

var resultsDOM = document.querySelector(".searchResults");
//var searchInput = document.querySelector("input#search");
//var teamInput = document.querySelector("select.team");
//var positionInput = document.querySelector("select.position");
var infoBar = document.querySelector(".infoBar");
var playerSelectMenu = document.querySelector(".ui.modal.playerSelectMenu");
var playerSelectMenuHeader = playerSelectMenu.querySelector("div.header");
var teamSelectMenu = playerSelectMenu.querySelector(".team.content.menu");
var teamPlayerSelectMenu = playerSelectMenu.querySelector(".players.content.menu");



//data elements

var players = allPlayers;

/*Object.entries(allPlayers).sort(function (a, b) {
    if (teams[a[0]].name > teams[b[0]].name) {return 1;}
    if (teams[b[0]].name > teams[a[0]].name) {return -1;}
    return 0;})
    */
//sort teams
//var teams = teams;


var userTeam = {
    "strategy":{"k":1, "d":4,"os":4, "f":2, "y":4},
    "players":{
        "k": [],
        "d": [],
        "os": [],
        "f": [],
        "y": []
    },
    "count":0,
    "teamCount":{},
    "captain":"null",
    "new":true
}

var positions = {
    "k": {"name": "Kaleci", "color":{"base":"#21ba45", "dark":"#1eab3f","fade":"#7dd892", "bg":"#b5f2c3"}},
    "d": {"name": "Defans", "color":{"base":"#2185d0", "dark":"#1e7abf","fade":"#7db5df", "bg":"#b5d8f3"}},
    "os": {"name": "Orta Saha", "color":{"base":"#6435c9", "dark":"#5c30b9","fade":"#a288da", "bg":"#cbbbed"}},
    "f": {"name": "Forvet", "color":{"base":"#a5673f", "dark":"#985e3a","fade":"#caa68f", "bg":"#e7cfc1"}},
    "y": {"name":"Yedek", "color":{"base":"#1a1a1a", "dark":"#1a1a1a","fade":"#b9b9b9", "bg":"#d4d4d4"}}
}

/*-------------------------------------------------------------------------------------------------
            MAIN WORKFLOW
-----------------------------*/

//-------- Initial Render
//resultsDOM.innerHTML = renderAllPlayers();
initUserTeam();
initTeamSelectMenu();
/*
//initialize and render dropdowns
teamInput.innerHTML += renderDropdown(Object.entries(teams).
    sort(function (a, b) {
        if (a[1].name > b[1].name) {return 1;}
        if (b[1].name > a[1].name) {return -1;}
        return 0;})
);
positionInput.innerHTML += renderDropdown(Object.entries(positions).slice(0,4));
$('.ui.dropdown').dropdown();
*/
//---------- Binding Events
//Filter Events
//searchInput.addEventListener("input",filterResults);

//$('.team.dropdown').dropdown({onChange: filterResults});
//$('.position.dropdown').dropdown({onChange: filterResults});

//Player chosing Events
userTeamDOM.querySelectorAll(".player").forEach((player)=>player.addEventListener("click", handlePlayerClick));

//--------------------------  END OF WORKFLOW     -------------------------------------------------


/*-------------------------------------------------
                    FUNCTIONS
-------------------------------------------------*/
/*--------------
Initial render functions
*/
/*
function renderAllPlayers(){
    var resultHTML= ""; 

    players.forEach(function (team){
        var teamName=team[0];
        var teamPlayers = Object.entries(team[1]);

        teamPlayers.forEach(function(player){
            var [id,team,name,position,point] = [player[0], teamName, player[1].name, player[1].pozisyon, points[player[0]]];
            point = (point == null) ? 0 : points;
            
            resultHTML+=createResultItem(id,team,name,position,point);
        })
    })
    return resultHTML;
}



function renderDropdown(arr){
    var resultHTML= "";
    arr.forEach(function(el){
        var [value,name]=[el[0],el[1].name];
        resultHTML+=createDropdownItem(value,name);
    })
    return resultHTML;
}
*/
/*--------------
Event Functions 
----------------*/
//user team player in main screen
function handlePlayerClick(e){
    e.stopPropagation();

    var player = e.currentTarget;
    var yedek = player.classList.contains("yedek")|| false;
    

    if(player.classList.contains("empty")){
        
        //console.log("aaaaaaaa");
        
        openMenu(player.dataset.position, player.dataset.index, yedek);
        

    }
    /*
    
    //removeplayer
if(position == "k") userTeam.players[position][0] = null;
            else userTeam.players[position][0].splice(userTeam.players[position].indexOf(playerId), 1 );
            player.removeAttribute("selected");
            userTeam.count--;
            userTeam.teamCount[team]==1 ? delete userTeam.teamCount[team] : userTeam.teamCount[team]--;; 
    
    console.log(userTeam.players,userTeam)
    console.log(player.dataset.selected)
*/
};

function handleMenuTeamClick(e) {
    var element = e.currentTarget;
    var team = element.dataset.team
    openPlayerMenu(team)
}

function handleMenuPlayerClick(e) {
    var element = e.currentTarget;
    var success="";
    //console.log(element);
    var {id, team, position, selectedposition, selectindex} = element.dataset;
    if(selectedposition==position){
        if(!element.hasAttribute("selected") && userTeam.count < 15){
            //control same team limit
            if(!userTeam.teamCount[team] || userTeam.teamCount[team] < 4 ){
                //select player
                success = selectPlayer(id, team, position, selectindex);
            }
            else{displayInfo("Aynı takımdan en fazla 4 oyuncu seçebilirsin")}  
        }
        else if(element.hasAttribute("selected")){displayInfo("Bu oyuncu zaten kadronda...")}
        else{displayInfo("Takımın oluşturuldu. Boş yer yok");}
    }
    else{displayInfo("secilen mevki ile sectiğiniz oyuncu uyuşmuyor");}

    
    if(success){
        closeMenu();
        resetModalMenu();
    }
}

//Initializing Functions
function initUserTeam(){
    //do for each position container
    positionContainers.forEach(function(pos){
        var positionID=pos.dataset.position
        var count = userTeam.strategy[positionID];
        var name = positions[positionID].name;
        var yedek = (positionID=="y") || false;
        pos.querySelector(".name").innerHTML=name;
        //render players specified limit in strategy
        [...Array(count)].forEach(function(_,i){
            //if current container is yedek put positon
            var position = positionID == "y" ? Object.keys(positions)[i] : positionID;
            pos.querySelector(".players").innerHTML+= createUserPlayerItem("empty", i, position, yedek);
        })        
    })
}

function loadUserTeam(){

}

function initTeamSelectMenu(){
    var menu = playerSelectMenu.querySelector(".content.team");
    
    var teamsArray = Object.entries(teams).
    sort(function (a, b) {
        if (a[1].name > b[1].name) {return 1;}
        if (b[1].name > a[1].name) {return -1;}
        return 0;});

    teamsArray.forEach(function(team){menu.appendChild(createMenuTeamItem(team[1]));})
}

//Helper functions
function openMenu(position, index, yedek){
    
    teamPlayerSelectMenu.dataset.position=position;
    teamPlayerSelectMenu.dataset.index=index;
    if(yedek) teamPlayerSelectMenu.setAttribute("yedek","");
    openTeamMenu();
}

function closeMenu(){
    $('.ui.modal.playerSelectMenu').modal('hide');
}

function openTeamMenu(position){
    
    teamSelectMenu.classList.remove("hidden");
    teamPlayerSelectMenu.classList.add("hidden");
    playerSelectMenuHeader.innerHTML="Takım Seç..."
    //console.log(playerSelectMenuHeader)
    $('.ui.modal.playerSelectMenu')
        .modal({onHide : resetModalMenu})
        .modal('setting', 'transition', 'fade up')
        .modal('show');
       
}

function openPlayerMenu(team){
    teamPlayerSelectMenu.dataset.team=team;
    var position=teamPlayerSelectMenu.dataset.position;
    var userTeamIndex=teamPlayerSelectMenu.dataset.index;
    playerSelectMenuHeader.innerHTML=`Oyuncu Seç... 
    <a class="ui large label ${position}">${teams[team].name}
        <div class="detail">${userTeam.teamCount[team]||0}/4</div>
        <div class="detail">${positions[position].name}</div>
    </a>`
    teamSelectMenu.classList.add("hidden");
    teamPlayerSelectMenu.classList.remove("hidden");
    //list players
    var listablePlayers = Object.entries(players[team]).filter(function (player){return player[1].pozisyon==position})
    //console.log( Object.entries(players[team]))
    listablePlayers.forEach(function(player){
        var [id,{team,name,pozisyon:position}]=player;
        var element = createMenuPlayerItem(id,name,position,team);
        element.dataset.selectedposition=position;
        element.dataset.selectindex = userTeamIndex;
        teamPlayerSelectMenu.appendChild(element);
    })
};

function resetModalMenu(){
    teamPlayerSelectMenu.innerHTML="";
    teamPlayerSelectMenu.dataset.position="";
    teamPlayerSelectMenu.dataset.team="";
    teamPlayerSelectMenu.dataset.index="";
    teamPlayerSelectMenu.removeAttribute("yedek");
}


function selectPlayer(id, team, position, index){
    index = Number(index);
    var parent = teamPlayerSelectMenu.hasAttribute("yedek") ? "y" :  position;
    var element = document.querySelector(`.positionContainer.${parent} .player[data-index="${index}"]`)
    userTeam.players[parent][index] = id;
    
    userTeam.count++;
    userTeam.teamCount[team] ? userTeam.teamCount[team]++ : userTeam.teamCount[team]=1;
    console.log(element)
    element.querySelector(".name").innerHTML = `  ${players[team][id].name}  `;
    element.querySelector(".detail").innerHTML = `${points[id] == null ? "0" : points[id]}`

    var teamDetail = document.createElement("div");
    teamDetail.classList.add("team");
    teamDetail.innerHTML=team;
    element.prepend(teamDetail);
    //console.table(userTeam);
    /*
    var colors=document.createElement("div");
    colors.classList.add("colors");
    colors.innerHTML=`
    <span class="renk1" style="background-color:${teams[team].renk[0]}"></span>
    <span class="renk2" style="background-color:${teams[team].renk[1]}"></span>  `
    element.prepend(colors)
*/
var operations = document.createElement("div");
operations.classList.add(..."ui icon top left pointing dropdown detail teamPlayerOperations".split(" "));
operations.innerHTML=
`
<i class="ellipsis vertical icon"></i>
  <div class="menu">
    <div class="header"> ${players[team][id].name}</div>
    <div class="item"><i class="exchange icon"></i> Değiştir</div>
    <div class="item"><i class="user secret icon"></i> Kaptan Yap</div>
    <div class="item"><i class="trash alternate icon"></i> Sil</div>
  </div>
 `

element.appendChild(operations);
$(element).children(".ui.dropdown").dropdown();


    //remove empty class
    element.classList.remove("empty");
    element.classList.add("full");
    return true;
}



/*-------------------------------
HTML Content Generating Functions
--------------------------------*/
function createResultItem(id, team, name, position, point){
    return `
    <div class="neu playerItem" data-id=${id} data-team=${team} data-position=${position} data-name=${name}>
        <span class="team">${team.toUpperCase()}</span>
        <span class="name">${name}</span>
        <span class="position">${positions[position].name}</span>
        <span class="point">${point}</span>
    </div>`
}

function createDropdownItem(val,name){
    return `<option value=${val}>${name}</option>`
}

function displayInfo(info){
    infoBar.innerHTML=`<span class="infoText">${info}</span>`
    infoBar.classList.remove("hidden");
    $('.infoBar').transition('shake','.500ms');
    setTimeout(function(){
        infoBar.innerHTML="";
        infoBar.classList.add("hidden");
    },2000)
}

function createUserPlayerItem(type, index, position, yedek, id, name, team, point){
    var yedek = yedek ? "yedek": ""; 
    if(type=="empty"){
        return `<a class="player empty ${yedek} ${position} ui image label large" data-index="${index}" data-position="${position}">
        <span class="name">Futbolcu Seç...</span>
        <div class="detail">
            <i class="plus icon"></i>
        </div>
    </a>`
    }
    else if(type=="selected"){

    }

    else{
        console.error("Invalid type of user team player Item")
    }
}

function createMenuTeamItem(team){
    var element = document.createElement("a");
    element.classList.add("item");
    element.dataset.team=team.id;
    element.innerHTML=`
    <div class="colors">
        <span class="color1" style=background-color:${team.renk[0]}></span>
        <span class="color2" style=background-color:${team.renk[1]}></span>
    </div>
    ${team.name}`

    element.addEventListener("click",handleMenuTeamClick)
    return element;
}

function createMenuPlayerItem(id,name,position,team){
    var element = document.createElement("a");
    element.classList.add("item");
    element.dataset.id=id;
    element.dataset.team=team;
    element.dataset.position=position
    element.innerHTML=`${name} <a class="ui teal circular label">${points[id] == null ? "0" : points[id] }</a>`

    if(userTeam.players[position].includes(id)||userTeam.players["y"].includes(id)){
        element.setAttribute("selected","");
    }
    element.addEventListener("click",handleMenuPlayerClick)
return element; 
}

