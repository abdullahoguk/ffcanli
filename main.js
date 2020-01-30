import {default as allPlayers} from './data/json/oyuncular/all.js';
import {default as points} from './data/json/puanlar/puanlar.js';
import {default as teams} from './data/json/takimlar.js';

//DOM elements
var resultsDOM = document.querySelector(".searchResults");
var searchInput = document.querySelector("input#search");

//data elements
var players = Object.entries(allPlayers);

var userTeam={
    "strategy":[],
    "players":{
        "k": "null",
        "d": [],
        "os": [],
        "f": [],
        "y": []
    }
}

var positions={
    "k": "Kaleci",
    "d": "Defans",
    "os": "Orta Saha",
    "f": "Forvet",
    "y": "Yedek"
}


/*------------------------------
            MAIN WORKFLOW
-----------------------------*/

//Inıtial Render
resultsDOM.innerHTML = renderAllPlayers();


function renderAllPlayers(){
    var resultHTML= ""; 

    players.forEach(function (team){
        var teamName=team[0];
        var teamPlayers = Object.entries(team[1]);

        teamPlayers.forEach(function(player){
            var [id,team,name,position,point] = [player[0], teamName, player[1].name, player[1].pozisyon, points[player[0]]]
            resultHTML+=createResultItem(id,team,name,position,point);
        })
    })
    return resultHTML;
}


/*-----------------------------------
                Event Listeners 
------------------------------------*/
searchInput.addEventListener("input",filterResults);
function filterResults(){
    var re = new RegExp(this.value,"gi");
    var list = document.querySelectorAll(".searchResults > .playerItem");
    list.forEach(function(player){
        if(re.test(player.dataset.name)){
            if(player.classList.contains("hidden")){ player.classList.remove("hidden")};
        }
        else{
            if(!player.classList.contains("hidden")){ player.classList.add("hidden")};
        }
    })
}

/*-----------------------------------
                Helper Functions
------------------------------------*/
function createResultItem(id, team, name, position, point){
    return `
    <div class="playerItem" data-id=${id} data-team=${team} data-position=${position} data-name=${name}>
        <span class="team">${team}</span>
        <span class="name">${name}</span>
        <span class="position">${positions[position]}</span>
        <span class="point">${point}</span>
    </div>`
}