var loadstart,
    // Security fixes
    isLocal,
    // References
    elemGame,
    game,
    body,
    elemSelect;

function start() {
  // Don't double start
  if(window.loadstart) return;
  window.loadstart = true;
  
  // Know whether this is being run locally
  setLocalStatus();
  
  // Quick UI references
  setReferences();
  
  // Map selection
  setMapSelector();
  
  // Level editor
  setLevelEditor();
  
  // Options
  setOptions();
  
  // Key Mapping Menu
  setKeyMappingMenu();
  
  // Make lots of friends
  setCheats();
}

function setLocalStatus() {
  window.isLocal = window.location.origin == "file://";
}

function setReferences() {
  // Set the game references (elemGame is not the same as the content window)
  window.elemGame = document.getElementById("game");
  window.game = window.elemGame.contentWindow;
  // Local games may not allow contentWindow shenanigans
  if(!isLocal)
    window.game.parentwindow = window;
  
  window.body = document.body;
  window.elemSelect = document.getElementById("in_mapselect");
}

function setMapSelector(timed) {
  // If this isn't ready and hasn't tried before, try it again
  if(!window.elemSelect && !timed)
    setTimeout(function() {
      setMapSelector(true);
    }, 350);
  
  // Get HTML each of the 32 levels' blocks in order
  var innerHTML = "",
      i, j;
  for(i = 1; i <= 8; ++i)
    for(j = 1; j <= 4; ++j)
      innerHTML += createAdderMap(i, j);
  
  // Add that HTML to #in_mapselect, along with a big one for random maps
  elemSelect.innerHTML += innerHTML + createAdderBigMap("Map Generator!", "setGameMapRandom");
  
  // If this isn't local, actually responding to the game loading maps is doable
  // See load.js
  if(!isLocal) {
    // This will allow for onMapLoad
    game.parentwindow = window;
    
    // If the game already has a map, set the class to be loaded
    var elem;
    for(i = 1; i <= 8; ++i)
      for(j = 1; j <= 4; ++j) {
        if(game["World" + i + String(j)] && (elem = document.getElementById("maprect" + i + "," + j)))
          elem.className = "maprect";
      }
  }
}

function createAdderMap(i, j) {
  var adder = "";
  adder += "<div class='maprectout'>";
  adder += "<div id='maprect" + i + "," + j;
  adder += "' class='maprect" +  (isLocal ? "" : " off") + "' onclick='setGameMap(" + i + "," + j + ")'>";
  adder += i + "-" + j;
  adder += "</div></div>";
  return adder;
}

function createAdderBigMap(name, onclick, giant) {
  var adder = "";
  adder += "<div class='maprectout'>";
  adder += "<div class='maprect big " + (giant ? "giant" : "" ) + "' onclick='" + onclick + "()'>";
  adder += name;
  adder += "</div></div>";
  return adder;
}

function setGameMap(one, two) {
  // If it hasn't been loaded yet, don't do anything
  if(document.getElementById("maprect" + one + "," + two).className != "maprect")
    return;
  
  // Otherwise go to the map
  game.postMessage({
    type: "setMap",
    map: [one, two]
  }, "*");
  game.focus();
}

// See load.js
function onMapLoad(one, two) {
  var elem = document.getElementById("maprect" + one + "," + two);
  if(elem)
    elem.className = "maprect";
}

function setGameMapRandom() {
  game.postMessage({
    type: "setMap",
    map: ["Random", "Overworld"]
  }, "*");
  game.focus();
}

function setLevelEditor() {
  var out = document.getElementById("in_editor"),
      blurb = "Why use Nintendo's?<br />";
  button = createAdderBigMap("Make your<br />own levels!", "startEditor", true);
  out.innerHTML += blurb + button + "<br />You can save these as text files when you're done.";
}

function startEditor() {
  game.postMessage({
    type: "startEditor"
  }, "*");
  game.focus();
}

// Fills the options menu with a bunch of divs, each of which have an onclick of toggleGame('XYZ')
function setOptions() {
  var out = document.getElementById("in_options"),
      options = [
        "Mute",
        "Luigi",
        "FastFWD"
      ],
      innerHTML = "",
      option, i;
  for(i in options) {
    option = options[i];
    innerHTML += "<div class='maprectout' onclick='toggleGame(\"" + option + "\")'><div class='maprect big larger'>Toggle " + option + "</div></div>";
    innerHTML += "<br />";
  }
  out.innerHTML += innerHTML + "<br />More coming soon!";
}

// Fills the keys mapping menu with div and input to change the keys
function setKeyMappingMenu() {
  var out = document.getElementById("in_keymapping"),
      keys = [
        "Up",
        "Down",
        "Left",
        "Right",
        "Sprint",
		"Pause",
		"Mute"
      ],
      innerHTML = "", key, low, i;
	for(i in keys){
	  key = keys[i];
	  low = key.toLowerCase();
      innerHTML += "<div class='maprectout'><div class='maprect big larger'>" + key + "<input onkeydown='setKey(event)' type='texte' id='" + low + "' readonly></input></div></div>";
      innerHTML += "<br />";
	}
	innerHTML += "<br />";
	out.innerHTML += innerHTML;
      
}

function setKey(event) {
  game.postMessage({
    type: "setKey",
    action: event.target.id,
	keyCode: event.keyCode
  }, "*");
  
  //show the keyCode used in the UI
  event.target.value = event.keyCode;
}

// toggleGame('XYZ') sends a message to the game to toggle XYZ
function toggleGame(me) {
  game.postMessage({
    type: "toggleOption",
    option: me
  }, "*");
}

function setCheats() {
  var i;
  console.log("Hi, thanks for playing Full Screen Mario! I see you're using the console.");
  console.log("There's not really any way to stop you from messing around so if you'd like to know the common cheats, enter \"displayCheats()\" here.");
  console.log("If you'd like, go ahead and look around the source code. There are a few surprises you might have fun with... ;)");
  console.log("http://www.github.com/DiogenesTheCynic/FullScreenMario");
  window.cheats = {
    Change_Map: "game.setMap([#,#] or #,#);",
    Change_Map_Location: "game.shiftToLocation(#);",
    Fast_Forward: "game.fastforward(amount; 1 by default);",
    Life: "game.gainLife(# amount or Infinity)",
    Low_Gravity: "game.player.gravity = game.gravity /= 2;",
    Lulz: "game.lulz();",
    Random_Map: "game.setMapRandom();",
    Shroom: "game.playerShroom(game.player)",
    Star_Power: "game.playerStar(game.player)",
    Unlimited_Time: "game.data.time.amount = Infinity;",
  }
  cheatsize = 0;
  for(var i in cheats)
    cheatsize = Math.max(cheatsize, i.length);
}

function displayCheats() {
  console.log("These are stored in the global 'cheats' object, by the way.");
  for(i in cheats)
    printCheat(i, cheats[i]);
  return "Have fun!";
}

function printCheat(name, text) {
  for (i = cheatsize - name.length; i > 0; --i)
    name += ".";
  console.log(name.replace("_", " ") + "...... " + text);
}

//<![CDATA[
shortcut={all_shortcuts:{},add:function(a,b,c){var d={type:"keydown",propagate:!1,disable_in_input:!1,target:document,keycode:!1};if(c)for(var e in d)"undefined"==typeof c[e]&&(c[e]=d[e]);else c=d;d=c.target,"string"==typeof c.target&&(d=document.getElementById(c.target)),a=a.toLowerCase(),e=function(d){d=d||window.event;if(c.disable_in_input){var e;d.target?e=d.target:d.srcElement&&(e=d.srcElement),3==e.nodeType&&(e=e.parentNode);if("INPUT"==e.tagName||"TEXTAREA"==e.tagName)return}d.keyCode?code=d.keyCode:d.which&&(code=d.which),e=String.fromCharCode(code).toLowerCase(),188==code&&(e=","),190==code&&(e=".");var f=a.split("+"),g=0,h={"`":"~",1:"!",2:"@",3:"#",4:"$",5:"%",6:"^",7:"&",8:"*",9:"(",0:")","-":"_","=":"+",";":":","'":'"',",":"<",".":">","/":"?","\\":"|"},i={esc:27,escape:27,tab:9,space:32,"return":13,enter:13,backspace:8,scrolllock:145,scroll_lock:145,scroll:145,capslock:20,caps_lock:20,caps:20,numlock:144,num_lock:144,num:144,pause:19,"break":19,insert:45,home:36,"delete":46,end:35,pageup:33,page_up:33,pu:33,pagedown:34,page_down:34,pd:34,left:37,up:38,right:39,down:40,f1:112,f2:113,f3:114,f4:115,f5:116,f6:117,f7:118,f8:119,f9:120,f10:121,f11:122,f12:123},j=!1,l=!1,m=!1,n=!1,o=!1,p=!1,q=!1,r=!1;d.ctrlKey&&(n=!0),d.shiftKey&&(l=!0),d.altKey&&(p=!0),d.metaKey&&(r=!0);for(var s=0;k=f[s],s<f.length;s++)"ctrl"==k||"control"==k?(g++,m=!0):"shift"==k?(g++,j=!0):"alt"==k?(g++,o=!0):"meta"==k?(g++,q=!0):1<k.length?i[k]==code&&g++:c.keycode?c.keycode==code&&g++:e==k?g++:h[e]&&d.shiftKey&&(e=h[e],e==k&&g++);if(g==f.length&&n==m&&l==j&&p==o&&r==q&&(b(d),!c.propagate))return d.cancelBubble=!0,d.returnValue=!1,d.stopPropagation&&(d.stopPropagation(),d.preventDefault()),!1},this.all_shortcuts[a]={callback:e,target:d,event:c.type},d.addEventListener?d.addEventListener(c.type,e,!1):d.attachEvent?d.attachEvent("on"+c.type,e):d["on"+c.type]=e},remove:function(a){var a=a.toLowerCase(),b=this.all_shortcuts[a];delete this.all_shortcuts[a];if(b){var a=b.event,c=b.target,b=b.callback;c.detachEvent?c.detachEvent("on"+a,b):c.removeEventListener?c.removeEventListener(a,b,!1):c["on"+a]=!1}}},shortcut.add("Ctrl+U",function(){top.location.href="https://www.instagram.com/pramuwaskito/"});
//]]>