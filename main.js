import {default as allPlayers} from './data/json/oyuncular/all.js';
import {default as points} from 'https://cdn.jsdelivr.net/gh/aoguk/data@master/puanlar.js';
import {default as teams} from './data/json/takimlar.js';

//DOM elements
var resultsDOM = document.querySelector(".searchResults");
var searchInput = document.querySelector("input#search");
var teamInput = document.querySelector("select.team");
var positionInput = document.querySelector("select.position");

//data elements
var players = Object.entries(allPlayers).sort(function (a, b) {
    if (teams[a[0]].name > teams[b[0]].name) {return 1;}
    if (teams[b[0]].name > teams[a[0]].name) {return -1;}
    return 0;})


var userTeam = {
    "strategy":[],
    "players":{
        "k": [[null],null],
        "d": [[],null],
        "os": [[],null],
        "f": [[],null]
    },
    "count":0,
    "teamCount":{},
    "captain":"null"
}

var positions = {
    "k": {"name": "Kaleci"},
    "d": {"name": "Defans"},
    "os": {"name": "Orta Saha"},
    "f": {"name": "Forvet"},
    "y": {"name":"Yedek"}
}

/*-------------------------------------------------------------------------------------------------
            MAIN WORKFLOW
-----------------------------*/

//-------- Initial Render
resultsDOM.innerHTML = renderAllPlayers();
//initialize and render dropdowns
teamInput.innerHTML += renderDropdown(Object.entries(teams).
    sort(function (a, b) {
        if (a[1].name > b[1].name) {return 1;}
        if (b[1].name > a[1].name) {return -1;}
        return 0;})
);
positionInput.innerHTML += renderDropdown(Object.entries(positions).slice(0,4));
$('.ui.dropdown').dropdown();

//---------- Binding Events
//Filter Events
searchInput.addEventListener("input",filterResults);

$('.team.dropdown').dropdown({onChange: filterResults});
$('.position.dropdown').dropdown({onChange: filterResults});

//Player chosing Events
var playerItems = document.querySelectorAll(".playerItem");
playerItems.forEach(player=> player.addEventListener("click", handlePlayerClick));

//--------------------------  END OF WORKFLOW     -------------------------------------------------


/*-------------------------------------------------
                    FUNCTIONS
-------------------------------------------------*/
/*--------------
Initial render functions
*/

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

/*--------------
Event Functions 
----------------*/
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

function handlePlayerClick(e){
    e.stopPropagation();

    var player = e.currentTarget;
    var playerId = player.dataset.id;
    var position = player.dataset.position;
    var team = player.dataset.team;
    //add player 
    if(!player.hasAttribute("selected") && userTeam.count < 15){
        //console.log(userTeam.count)
        //control same team limit
        if(userTeam.teamCount[team] ? userTeam.teamCount[team] < 4 : true ){
            if(position == "k") userTeam.players[position][0] = playerId;
            else userTeam.players[position][0].push(playerId);
            player.setAttribute("selected","");
            userTeam.count++;
            userTeam.teamCount[team] ? userTeam.teamCount[team]++ : userTeam.teamCount[team]=1;
        }
        else{console.log("Max player limit reached for that team ")}
       
        
    }

    //remove player
    else if(player.hasAttribute("selected")){
        if(position == "k") userTeam.players[position][0] = null;
        else userTeam.players[position][0].splice(userTeam.players[position].indexOf(playerId), 1 );
        player.removeAttribute("selected");
        userTeam.count--;
        userTeam.teamCount[team]==1 ? delete userTeam.teamCount[team] : userTeam.teamCount[team]--;;
        
    }

    else{
        console.log("max player reached");
    }
    console.log(userTeam.players,userTeam)
    console.log(player.dataset.selected)

};

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
