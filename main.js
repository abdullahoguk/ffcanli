import {default as teams} from './data/json/takimlar.js';
var points;
var allPlayers;
var players;
var players2 = {};

//DOM elements
var userTeamDOM=document.querySelector(".userTeam");
var positionContainers = userTeamDOM.querySelectorAll(".positionContainer")

var infoBar = document.querySelector(".infoBar");
var playerSelectMenu = document.querySelector(".ui.modal.playerSelectMenu");
var playerSelectMenuHeader = playerSelectMenu.querySelector("div.header");
var teamSelectMenu = playerSelectMenu.querySelector(".team.content.menu");
var teamPlayerSelectMenu = playerSelectMenu.querySelector(".players.content.menu");
var strategyDropdown = document.querySelector("select.strategy");
var updatedTeamCheckbox = document.querySelector("input.updatedTeam");
var calcButton = document.querySelector("button.calc");
var pointDOM = document.querySelector(".totalPoint .value");
//data elements



/*Object.entries(allPlayers).sort(function (a, b) {
    if (teams[a[0]].name > teams[b[0]].name) {return 1;}
    if (teams[b[0]].name > teams[a[0]].name) {return -1;}
    return 0;})
    */
var negative = [undefined, null, 0, false];

var userTeam = {
    "strategy":"442",
    "players":{
        "k": [null],
        "d": [null,null,null,null],
        "os": [null,null,null,null],
        "f": [null,null],
        "y": [null,null,null,null]
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

var strategies = {
    "442":{"k":1, "d":4, "os":4, "f":2, "y":4 },
    "451":{"k":1, "d":4, "os":5, "f":1, "y":4 },
    "433":{"k":1, "d":4, "os":3, "f":3, "y":4 },
    "532":{"k":1, "d":5, "os":3, "f":2, "y":4 },
    "541":{"k":1, "d":5, "os":4, "f":1, "y":4 },
    "343":{"k":1, "d":3, "os":4, "f":3, "y":4 },
    "352":{"k":1, "d":3, "os":5, "f":2, "y":4 }
}

/*-------------------------------------------------------------------------------------------------
            MAIN WORKFLOW
-----------------------------*/
main();

async function main() {
    //load points
    await loadJSONAsync("https://raw.githubusercontent.com/aoguk/data/master/puanlar.json"+ "?" + Math.random())
        .then(data => {points = data;}).catch(reason => console.log(`JSON okunurken hata: points ${reason.message}`));
    //load allplayers
    await loadJSONAsync("https://raw.githubusercontent.com/aoguk/data/master/all.json"+ "?" + Math.random())
        .then(data => {allPlayers = data;}).catch(reason => console.log(`JSON okunurken hata: allplayers ${reason.message}`));

players = await allPlayers;
//without team

Object.values(players).forEach(function(team){
    Object.entries(team).forEach(function(player){
        players2[player[0]] = player[1];
    })    
})

    //-------- Initial Render
    await initUserTeam();
    initStrategyDropdown();
    
    initTeamSelectMenu();

    //Player chosing Events
    //userTeamDOM.querySelectorAll(".player").forEach((player)=>player.addEventListener("click", handlePlayerClick));
    //close and reset modal when user press back button when url has futbolcusec hash
    window.addEventListener("hashchange", function(e) {
        if(e.oldURL.split("#")[1]=="futbolcusec"){
            closeMenu();
            resetModalMenu();
        }
    });

    //fix modal touch scroll bug 
    $('.ui.modal').on('touchmove', function(event) {
        event.stopImmediatePropagation();
    });

    strategyDropdown.addEventListener("change", changeStrategy);
    updatedTeamCheckbox.addEventListener("change", changeNew);

    calcButton.addEventListener("click", function(e){pointDOM.innerHTML = calc();})
}
//--------------------------  END OF WORKFLOW     -------------------------------------------------



/*-------------------------------------------------
                    FUNCTIONS
-------------------------------------------------*/
/*--------------
Initial render functions
*/


/*--------------
Event Functions 
----------------*/
function changeStrategy(e){
    e.stopPropagation();
    var strategy = e.currentTarget.value;
    userTeam.strategy = strategy;
    var strategyDetail = strategies[strategy];
    var count = 0;
    var teamCount = {};
    var team = Object.keys(userTeam.players);
    var selectedPlayersArray = [];

    team.forEach(function(position){
        //set size of positon arrays according to new strategy
        userTeam.players[position].length = strategyDetail[position];
        var players = userTeam.players[position];
        //count selected players and team limit for that positon array
        players.forEach(function(player){
            if(![undefined, null].includes(player)){
                count++;
                teamCount[team] ? teamCount[team]++ : teamCount[team]=1;
                selectedPlayersArray.push(player);
            }
        })
    })
    if(selectedPlayersArray.length ==! count) console.error("taktik değiştirirken hata");
    //remove captain if player removed
    if(!selectedPlayersArray.includes(userTeam.captain)) userTeam.captain=null;
    
    //set new player count and team limit
    userTeam.count = count;
    userTeam.teamCount = teamCount;
    saveUserTeam()
    loadUserTeam();
}

function changeNew(e){
    var value = e.currentTarget.checked;
    userTeam.new = value;
    saveUserTeam();
}

//user team player in main screen event
function handlePlayerClick(e){
    e.stopPropagation();

    var player = e.currentTarget;
    var yedek = player.classList.contains("yedek")|| false;
    if(player.classList.contains("empty")){
        openMenu(player.dataset.position, player.dataset.index, yedek);
    }
};

//Teams in first menu in modal event
function handleMenuTeamClick(e) {
    var element = e.currentTarget;
    var team = element.dataset.team
    openPlayerMenu(team)
}

//players in second menu in modal event
function handleMenuPlayerClick(e) {
    var element = e.currentTarget;
    var success="";
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
        saveUserTeam()
        closeMenu();
        resetModalMenu();
    }
}

//User Team player operations events
function deletePlayer(e){
    //start propagating to hack switch player
    if(e.currentTarget.classList.contains("delete")) e.stopPropagation();
    var player = e.currentTarget.closest(".full.player");
    var position = player.dataset.position;
    var index = Number(player.dataset.index);
    var parent = player.classList.contains("yedek") ? "y" : position;

    var id = (player.dataset.id == userTeam.players[parent][index]) ? player.dataset.id : null;
    var team = (player.dataset.team == players[player.dataset.team][id]["team"]) ? player.dataset.team : null;

    var furtherCheck = ((player == document.querySelector(`.positionContainer.${parent} .player[data-index="${index}"]`)))
    if(furtherCheck){
        //delete user info and associated info from userTeam data
        userTeam.players[parent][index] = null;
        userTeam.count--;
        userTeam.teamCount[team]--;
        if(userTeam.captain==id) userTeam.captain=null;

        //hide dropdown before deleting from dom to prevent semantic ui transition errors
        $(player).children(".ui.dropdown").dropdown('hide');

        //empty content of user player item
        player.innerHTML=` 
        <span class="name">Futbolcu Seç...</span>
        <div class="detail">
            <i class="plus icon"></i>
        </div>`
        
        //remove/change selected player related attributes/classses
        player.removeAttribute("data-id","data-team");
        //add empty class
        player.classList.add("empty");
        player.classList.remove("full");
        player.classList.remove("captain");

        saveUserTeam();
        return true;
    }
}

function changePlayer(e){
    deletePlayer(e);
}

function makeCaptain(e){
    var player = e.currentTarget.closest(".full.player");
    var id = player.dataset.id;
    //add captain id to user team data object
    userTeam.captain = id;
    //remove classes of previous captains
    document.querySelectorAll(".positionContainer .player.captain").forEach(player => player.classList.remove("captain"))
    //add captain class to current captain
    player.classList.add("captain");
    saveUserTeam();
}

function saveUserTeam(){
    localStorage.setItem('userTeam', JSON.stringify(userTeam));
}

function calc(){
    var pos = ["k", "d", "os", "f", "y"];

    var captain = !negative.includes(userTeam.captain) ? userTeam.captain:null  ;
    var captainPositon = !negative.includes(captain) ? players2[captain]["pozisyon"]:"y";
    var captainPoint = 0;

    var includedPlayers = [];
    var yedek = [...userTeam.players.y];
    var total= 0;
    
    
    for(var i=0;i<4;i++){
        //console.log(userTeam.players[pos[i]])
        userTeam.players[pos[i]].forEach(function(player){
            //check yedek
            var point = getPoint(player);
            if(point < getPoint(yedek[i])){
                point = getPoint(yedek[i]);
                //eğer kaptansa değişen captanı ata
                if((captainPositon == pos[i]) && (player==captain)){
                    captain = yedek[i];
                }
                // add to included players and switch and increment total
                includedPlayers.push(yedek[i]);
                yedek[i] = player;
                total += point;
            }
            else{
                includedPlayers.push(player);
                total += point;
            }
        })
    }

    //check total and finalize
 includedPlayers.reduce((tot,curr) => {return Number(tot) + getPoint(curr)},0)

    if(total == (includedPlayers.reduce((tot,curr) => {return Number(tot) + getPoint(curr)},0) ) ){
        captainPoint = getPoint(captain);
        var isNew = userTeam.new ? 5 : 0;
        total += captainPoint + isNew;
        return total
    }
    else {console.error("yedekler ve asiller arası puan hesaplama hatası")}
    

}

//Initializing Functions
function initStrategyDropdown(){
    var values = Object.keys(strategies);
    values.forEach(function(item){
        var value = item;
        var name = value.split("").join(" ");
        strategyDropdown.appendChild(createDropdownItem(value, name));
    })
}

//strategy dropdownını ata
//load user teamı calıştır
function initUserTeam(){
    // check local data and assign to userTeam if found, set to default if not
    if(![null,undefined].includes(localStorage.getItem("userTeam"))){
        userTeam = JSON.parse(localStorage.getItem('userTeam'));
    }
    strategyDropdown.value = userTeam.strategy;
    updatedTeamCheckbox.checked = userTeam.new;
loadUserTeam();
}

//objedeki her mevki arrayini arayüzdekiyle kontrol et ona göre doldur
function loadUserTeam(){
    var strategy = strategies[userTeam.strategy]
    positionContainers.forEach(function(pos){
        pos.querySelector(".players").innerHTML="";

        var positionID=pos.dataset.position
        var count = strategy[positionID];
        var name = positions[positionID].name;
        var yedek = (positionID == "y") || false;
        pos.querySelector(".name").innerHTML=name;
        //render players specified limit in strategy
        [...Array(count)].forEach(function(_,i){
            //if current container is yedek put positon
            var position = positionID == "y" ? Object.keys(positions)[i] : positionID;
            var playerID  = userTeam.players[positionID][i];
            var player = players2[playerID];

            if([undefined, null].includes(playerID)){
                pos.querySelector(".players").appendChild(createUserPlayerItem("empty", i, position, yedek));
            }
            else {
                pos.querySelector(".players").appendChild(createUserPlayerItem("full", i, position, yedek, playerID, player.name, player.team, points[playerID]));
            }
            
        })        
    })
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
    location.hash= "#futbolcusec";
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
    playerSelectMenuHeader.innerHTML="Takım..."
    $('.ui.modal.playerSelectMenu')
        .modal({onHide : resetModalMenu, duration:200})
        .modal('show');
}

function openPlayerMenu(team){
    teamPlayerSelectMenu.dataset.team=team;
    var position=teamPlayerSelectMenu.dataset.position;
    var userTeamIndex=teamPlayerSelectMenu.dataset.index;
    playerSelectMenuHeader.innerHTML=`Futbolcu... 
    <a class="ui medium label ${position}">${teams[team].name}
        <div class="detail">${userTeam.teamCount[team]||0}/4</div>
        <div class="detail">${positions[position].name}</div>
    </a>`
    teamSelectMenu.classList.add("hidden");
    teamPlayerSelectMenu.classList.remove("hidden");
    //list players
    var listablePlayers = Object.entries(players[team]).filter(function (player){return player[1].pozisyon==position})
    listablePlayers.forEach(function(player){
        var [id,{team,name,pozisyon:position}]=player;
        var element = createMenuPlayerItem(id,name,position,team);
        element.dataset.selectedposition=position;
        element.dataset.selectindex = userTeamIndex;
        teamPlayerSelectMenu.appendChild(element);
    })
};

function resetModalMenu(){
    history.pushState("", document.title, window.location.pathname + window.location.search);
    teamPlayerSelectMenu.innerHTML="";
    teamPlayerSelectMenu.removeAttribute("data-position");
    teamPlayerSelectMenu.removeAttribute("data-team");
    teamPlayerSelectMenu.removeAttribute("data-index");
    teamPlayerSelectMenu.removeAttribute("yedek");
}

function selectPlayer(id, team, position, index){
    index = Number(index);
    //class of position container that lists user team player of that position
    var parent = teamPlayerSelectMenu.hasAttribute("yedek") ? "y" :  position;
    var element = document.querySelector(`.positionContainer.${parent} .player[data-index="${index}"]`)
    //change/add player in data user team data object (position array, total selected players, same team limit)
    userTeam.players[parent][index] = id;
    userTeam.count++;
    userTeam.teamCount[team] ? userTeam.teamCount[team]++ : userTeam.teamCount[team]=1;
        
    //add data attributes to ui team player item
    element.dataset.id = id;
    element.dataset.team = team;
    
    var name = players[team][id]["name"];
    element.querySelector(".name").innerHTML = ` ${name} `;

    element.querySelector(".detail").innerHTML = `${points[id] == null ? "0" : points[id]}`

    //add team of selected player to left of player item
    var teamDetail = document.createElement("div");
    teamDetail.classList.add("team");
    teamDetail.innerHTML=team;
    element.prepend(teamDetail);

    //add dropdown button for player operations
    var operations = document.createElement("div");
    operations.classList.add(..."ui icon top left pointing dropdown button mini detail teamPlayerOperations".split(" "));
    operations.innerHTML=
    `<i class="ellipsis vertical icon"></i>
    <div class="menu">
        <div class="header"> ${players[team][id].name}</div>
        <div class="item change"><i class="exchange icon"></i> Değiştir</div>
        <div class="item captain ${parent=="y" ? "disabled":""}"><i class="user secret icon"></i> Kaptan Yap</div>
        <div class="item delete"><i class="trash alternate icon"></i> Sil</div>
    </div>`

    element.appendChild(operations);
    $(element).children(".ui.dropdown").dropdown();
    //bind events of dropdown items
    var deleteButton = element.querySelector(".item.delete");
    deleteButton.addEventListener("click", deletePlayer);

    var changeButton = element.querySelector(".item.change");
    changeButton.addEventListener("click", changePlayer);

    var captainButton = element.querySelector(".item.captain");
    captainButton.addEventListener("click", makeCaptain);

    //remove empty class add full class
    element.classList.remove("empty");
    element.classList.add("full");
    return true;
}

/*-------------------------------
HTML Content Generating Functions
--------------------------------*/
function createDropdownItem(value, name){
    var element = document.createElement("option");
    element.setAttribute("value", value);
    element.innerHTML = name;
    return element
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
    var element;
    if(type=="empty"){
        var html = `<a class="player ${type} ${yedek} ${position} ui image label large" data-index="${index}" data-position="${position}">
        <span class="name">Futbolcu Seç...</span>
        <div class="detail">
            <i class="plus icon"></i>
        </div>
        </a>`
        element = $(html)[0];
    }
    else if(type=="full"){
        var captain = userTeam.captain == id ? "captain" : "";
        var html = `<a class="player ${type} ${yedek} ${captain} ${position} ui image label large" 
        data-index="${index}" data-position="${position}"  data-id="${id}" data-team="${team}" >
        <span class="name">${name}</span>
        <div class="detail">
            ${points[id] == null ? "0" : points[id]}
        </div>
        </a>`
        element = $(html)[0];

        //add team of selected player to left of player item
        var teamDetail = document.createElement("div");
        teamDetail.classList.add("team");
        teamDetail.innerHTML=team;
        element.prepend(teamDetail);

        //add dropdown button for player operations
        var operations = document.createElement("div");
        operations.classList.add(..."ui icon top left pointing dropdown button mini detail teamPlayerOperations".split(" "));
        operations.innerHTML=
        `<i class="ellipsis vertical icon"></i>
        <div class="menu">
            <div class="header"> ${players[team][id].name}</div>
            <div class="item change"><i class="exchange icon"></i> Değiştir</div>
            <div class="item captain ${yedek=="yedek" ? "disabled":""}"><i class="user secret icon"></i> Kaptan Yap</div>
            <div class="item delete"><i class="trash alternate icon"></i> Sil</div>
        </div>`

        element.appendChild(operations);
        $(element).children(".ui.dropdown").dropdown();
        //bind events of dropdown items
        var deleteButton = element.querySelector(".item.delete");
        deleteButton.addEventListener("click", deletePlayer);

        var changeButton = element.querySelector(".item.change");
        changeButton.addEventListener("click", changePlayer);

        var captainButton = element.querySelector(".item.captain");
        captainButton.addEventListener("click", makeCaptain);
    }

    else{
        console.error("Invalid type of user team player Item")
    }
    element.addEventListener("click", handlePlayerClick);
    return element
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



/* Misc Functions */
async function loadJSONAsync(url) {
    let response = await fetch(url);
    let data = await response.json();
    return data;
}


function getPoint(id){
    return negative.includes(points[id]) ? 0 : Number(points[id]);
}