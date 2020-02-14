import {default as allPlayers} from '../data/json/oyuncular/all.js';
import {default as teams} from '../data/json/takimlar.js';

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
var playerItems = document.querySelectorAll(".playerItem")
playerItems.forEach(player=> player.addEventListener("click", selectListItem))

function selectListItem(e){
    var el= e.currentTarget;
    document.querySelectorAll(".playerItem.selected").forEach(player=>player.classList.remove("selected"))
    el.classList.toggle("selected");
}


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
            var [id,team,name,position] = [player[0], teamName, player[1].name, player[1].pozisyon];
            resultHTML+=createResultItem(id,team,name,position);
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

/*-------------------------------
HTML Content Generating Functions
--------------------------------*/
function createResultItem(id, team, name, position){
    return `
    <div class="playerItem" data-id=${id} data-team=${team} data-position=${position} data-name=${name}>
    <span class="id">${id} </span>
        
        <span class="name">${name}</span>
        <span class="position">${position}</span>
        <span class="team">${team.toUpperCase()}</span>
    </div>`
}

function createDropdownItem(val,name){
    return `<option value=${val}>${name}</option>`
}
