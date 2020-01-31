import {default as allPlayers} from './data/json/oyuncular/all.js';
import {default as points} from 'https://cdn.jsdelivr.net/gh/aoguk/data@master/puanlar.js';
import {default as teams} from './data/json/takimlar.js';

//DOM elements
var resultsDOM = document.querySelector(".searchResults");
var searchInput = document.querySelector("input#search");
var teamInput = document.querySelector("select.team");
var positionInput = document.querySelector("select.position");

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
    "k": {"name": "Kaleci"},
    "d": {"name": "Defans"},
    "os": {"name": "Orta Saha"},
    "f": {"name": "Forvet"},
    "y": {"name":"Yedek"}
}

/*------------------------------
            MAIN WORKFLOW
-----------------------------*/

//Inıtial Render
resultsDOM.innerHTML = renderAllPlayers();
//initialize dropdowns
teamInput.innerHTML += renderDropdown(Object.entries(teams));
positionInput.innerHTML += renderDropdown(Object.entries(positions).slice(0,4));
$('.ui.dropdown').dropdown();



//Render Functions
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


/*-----------------------------------
                Event Listeners 
------------------------------------*/
searchInput.addEventListener("input",filterResults);

function filterResults(){
    var re = new RegExp(searchInput.value,"gi");
    var list = document.querySelectorAll(".searchResults > .playerItem");
    var teamFilter = $('.team.dropdown').dropdown("get value");
    var positionFilter = $('.position.dropdown').dropdown("get value");
    list.forEach(function(player){
        if( re.test(player.dataset.name) &&
            (teamFilter.includes(player.dataset.team)|| teamFilter.length == 0) &&
            (positionFilter.includes(player.dataset.position)|| positionFilter.length == 0)
         ){
            if(player.classList.contains("hidden")){ player.classList.remove("hidden")};
        }
        else{
            if(!player.classList.contains("hidden")){ player.classList.add("hidden")};
        }
    })
}

$('.team.dropdown').dropdown({onChange: filterResults});
$('.position.dropdown').dropdown({onChange: filterResults});

/*-----------------------------------
                Helper Functions
------------------------------------*/
function createResultItem(id, team, name, position, point){
    return `
    <div class="playerItem" data-id=${id} data-team=${team} data-position=${position} data-name=${name}>
        <span class="team">${team.toUpperCase()}</span>
        <span class="name">${name}</span>
        <span class="position">${positions[position].name}</span>
        <span class="point">${point}</span>
    </div>`
}

function createDropdownItem(val,name){
    return `<option value=${val}>${name}</option>`
}
