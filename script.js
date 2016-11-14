//S'applique à un élément du DOM, le Supprime du DOM
Node.prototype.remove = function(){
  var parent = this.parentNode;
  if(parent){
    parent.removeChild(this);
  }
}
// document.prototype.newEl = function(tag, classname, attributes=null){
//   var result = document.createElement(tag);
//   if(result){
//     result.className = classname;
//     for(current in attributes){
//       result.setAttribute(current, attributes[current]);
//     }
//   } else {
//     result = false;
//   }
//   return result;
// }
//
//

// Renvoi la position d'un élément
function getElementPosition(e, isCenter) {
    var left = 0;
    var top = 0;

    if (isCenter == true) {
        console.log("center")
        left = e.offsetWidth / 2;
        top = e.offsetWidth / 2;
    }

    /*Tant que l'on a un élément parent*/
    while (e.offsetParent != undefined && e.offsetParent != null) {
        /*On ajoute la position de l'élément parent*/
        left += e.offsetLeft + (e.clientLeft != null ? e.clientLeft : 0);
        top += e.offsetTop + (e.clientTop != null ? e.clientTop : 0);
        e = e.offsetParent;
    }

    return {
        x: left,
        y: top
    };
};


// Constructeur de bulle
function BubbleH(el, config){
  this.content = el.getAttribute("data-help");
  if(!this.content){
    return false;
  }
  this.elementTarget = {
    el: el,
    position : getElementPosition(el),
    width: el.offsetWidth,
    height: el.offsetHeight
  };
  this.setConfig(config);
  this.el = {};

  if(!this.direction){
    this.deductDirection();
  }
  this.generateHtml();
}

// Déduit l'endroit ou la bulle apparait par rapport à l'élément ciblé
BubbleH.prototype.deductDirection = function(){
  var width = document.body.offsetWidth;
  var diff = {
    left : this.elementTarget.position.x,
    right : width - this.elementTarget.position.x + this.elementTarget.width,
    top : this.elementTarget.position.y,
    bottom : this.elementTarget.position.y + this.elementTarget.height
  }

  var xDirection, yDirection, xDiff, yDiff;
  if(diff.left < diff.right){
    xDirection = "right";
    xDiff = diff.right - diff.left;
  } else {
    xDirection = "left";
    xDiff = diff.left - diff.right;
  }

  if(diff.top < diff.bottom){
    yDirection = "bottom";
    yDiff = diff.bottom - diff.top;
  } else {
    yDirection = "top";
    yDiff = diff.top - diff.bottom;
  }

  this.direction = xDirection;
}


// Génère le code HTML
BubbleH.prototype.generateHtml = function(){
  var helperBox = document.createElement("div");

  helperBox.id = "helperBox";
  helperBox.style.width = this.elementTarget.width+"px";
  helperBox.style.height = this.elementTarget.height+"px";
  helperBox.style.top = this.elementTarget.position.y+"px";
  helperBox.style.left = this.elementTarget.position.x+"px";
  helperBox.className += this.focusWay;
  this.el.box = helperBox;

  var BubbleH = document.createElement("dir");
  var cross = document.createElement("span");
  cross.className = "cross";
  BubbleH.appendChild(cross);
  BubbleH.id= "BubbleH";
  BubbleH.innerHTML = this.content;
  BubbleH.className = this.direction;


  switch(this.direction) {
    case "left" :
      BubbleH.style.top = this.elementTarget.position.y+(this.elementTarget.height/2)+"px";
      BubbleH.style.left = this.elementTarget.position.x-10+"px";
    break;
    case "right":
      BubbleH.style.top = this.elementTarget.position.y+(this.elementTarget.height/2)+"px";
      BubbleH.style.left = this.elementTarget.position.x + this.elementTarget.width+10+"px";
    break;
  }

  this.el.bubble = BubbleH;
}


// Gère la configuration de l'objet
BubbleH.prototype.setConfig = function(config={}){
  if(this.elementTarget.el.getAttribute("data-bubble-direction")){
    var bubbleDirection = this.elementTarget.el.getAttribute("data-bubble-direction");
    if(bubbleDirection == "top" || bubbleDirection == "bottom" || bubbleDirection == "left" || bubbleDirection == "right"){
      this.direction = bubbleDirection;
    }
  }
  if(config.direction){
    if(config.direction == "top" || config.direction == "bottom" || config.direction == "left" || config.direction == "right"){
      this.direction = config.direction;
    }
  }

  if(config.focusWay) {
    this.focusWay = config.focusWay;
  } else {
    this.focusWay = "";
  }
}


// Affiche l'élément, si un élément semblable existe, le supprime et l'affiche à la place
BubbleH.prototype.display = function(){
  var el1 = document.getElementById("helperBox");
  var el2 = document.getElementById("BubbleH");
  if(el1 || el2){
    el1.remove();
    el2.remove();
  }
  document.body.appendChild(this.el.box);
  document.body.appendChild(this.el.bubble);
}



InterfaceH = {

  //Initialisation des objet de stockages
  button: {},
  config: {
    bubble : {},
    interface: {}
  },

  // Renvoie les instance de Bubble et les stocke dans un tableau
  saveBubbles : function(){
    var bubbles = [];
    for(i=0; i<InterfaceH.items.length; i++){
      bubbles.push(new BubbleH(InterfaceH.items[i], InterfaceH.config.bubble));
    }
    InterfaceH.bubbles = bubbles;
  },

  //Réinitialie l'affichage des éléments
  hideHelpers:function(){
    document.getElementById("helperBox").remove();
    document.getElementById("BubbleH").remove();

    if(InterfaceH.guideTutorialEl) InterfaceH.guideTutorialEl.remove();

    InterfaceH.tutorialContainer.removeAttribute("data-helper-notice");
  },

  //////////////////////////////////
  // Quand le tutoriel est lancé  //
  //////////////////////////////////

  //Passe à l'élement suivant
  nextBubble:function(){
    InterfaceH.count++;
    if(InterfaceH.bubbles[InterfaceH.count]){
      InterfaceH.bubbles[InterfaceH.count].display();
      (function(){
        var rank = InterfaceH.count;
        InterfaceH.bubbles[rank].el.bubble.addEventListener("click", InterfaceH.nextBubble, false)
      })();
    } else {
      InterfaceH.stopTutorial();
    }
  },

  //Passe à l'élément précédent
  previousBubble:function(){
    InterfaceH.count--;
    if(InterfaceH.bubbles[InterfaceH.count]){
      InterfaceH.bubbles[InterfaceH.count].display();
    } else {
      document.removeEventListener("keydown", InterfaceH.startKeyPressEvent, false);
      InterfaceH.hideHelpers();
    }
  },

  displayGuide:function(){
    document.body.appendChild(InterfaceH.guideContainer);
  },

  hideGuide: function(){
    InterfaceH.guideContainer.remove();
  },

  ///////////////////////
  // Popin du tutoriel //
  ///////////////////////

  //Ferme le popin du tutoriel
  hideTutorialContainer:function(){
    InterfaceH.tutorialContainer.className = InterfaceH.tutorialContainer.className.replace("big", "small");
  },

  //Affiche le popin du tutoriel
  displayTutorialContainer:function(){
    InterfaceH.tutorialContainer.className = InterfaceH.tutorialContainer.className.replace("small", "big");
  },


  //Test pour l'évenement de défilement des bubble
  startKeyPressEvent:function(event){
    if(event.keyCode == 13 || event.keyCode == 32 || event.keyCode == 39 ){
      InterfaceH.nextBubble();
    } else if(event.keyCode == 37 || event.keyCode == 8){
      InterfaceH.previousBubble();
    }
  },

  /////////////////////////////
  //  Comportement Tutoriel  //
  /////////////////////////////

  //Lance le tutoriel
  launchTutorial: function(){
    InterfaceH.saveBubbles();
    InterfaceH.count = 0;
    InterfaceH.hideTutorialContainer();
    InterfaceH.bubbles[InterfaceH.count].display();
    (function(){
      var rank = InterfaceH.count;
      InterfaceH.bubbles[rank].el.bubble.addEventListener("click", InterfaceH.nextBubble, false)
    })();

    InterfaceH.tutorialContainer.setAttribute("data-helper-notice", "stoptutorial")

    InterfaceH.tutorialContainer.removeEventListener("click", InterfaceH.displayTutorialContainer, false);
    InterfaceH.tutorialContainer.addEventListener("click", InterfaceH.stopTutorial, false);

    if(InterfaceH.guideTutorialEl){
      console.log(InterfaceH.guideTutorialEl);
      document.body.appendChild(InterfaceH.guideTutorialEl);
    }

    document.addEventListener("keydown", InterfaceH.startKeyPressEvent, false)
  },

  //Arrete le tutoriel
  stopTutorial: function(){
    document.removeEventListener("keydown", InterfaceH.startKeyPressEvent, false);

    InterfaceH.tutorialContainer.removeEventListener("click", InterfaceH.stopTutorial, false);
    InterfaceH.tutorialContainer.addEventListener("click", InterfaceH.displayTutorialContainer, false);

    InterfaceH.hideHelpers();
  },

  /////////////////////////////
  //      Initialisation     //
  /////////////////////////////
  genTutoContainer:function(){
    var tutorialContainer = document.createElement("div");
    tutorialContainer.id = "tutorialContainer";
    tutorialContainer.className = "small";

    var tutorialActions = document.createElement("div");
    tutorialActions.id = "tutorialActions";

    var title = document.createElement("h2");
    title.innerHTML = "Besoin d'aide";

    var close = document.createElement("i");
    close.id = "closeTutorialActions";

    var startTutorial = document.createElement("a");
    startTutorial.href = "#";
    startTutorial.id= "help-launch-tutorial";
    startTutorial.className = "helper-button";
    startTutorial.innerHTML = "Commencer le tutoriel";

    var startHelp = document.createElement("a");
    startHelp.href = "#";
    startHelp.className = "helper-button";
    startHelp.innerHTML = "Consulter l'aide";

    tutorialActions.appendChild(title);
    tutorialActions.appendChild(close);
    tutorialActions.appendChild(startTutorial);
    tutorialActions.appendChild(startHelp);
    tutorialContainer.appendChild(tutorialActions);

    document.body.appendChild(tutorialContainer);
  },
  genGuide: function(){
    var guideContainer = document.createElement("div");
    var actionContainer = document.createElement("div");
    var guideDisplay = document.createElement("div");
    var next = document.createElement("span");
    var previous = document.createElement("span");
    var stop = document.createElement("span");

    guideContainer.className = "guideContainer visible";
    guideContainer.id = "tutorialManage";
    next.className = "guideNext fa fa-arrow-circle-o-right";
    previous.className = "guidePrevious fa fa-arrow-circle-o-left";
    stop.className = "guideStop fa fa-stop-circle";
    guideDisplay.className = "guideDisplay fa fa-chevron-up";
    actionContainer.className = "actionContainer";

    actionContainer.appendChild(previous);
    actionContainer.appendChild(next);
    actionContainer.appendChild(stop);

    guideContainer.appendChild(guideDisplay);
    guideContainer.appendChild(actionContainer);

    next.addEventListener("click", function(){
      InterfaceH.nextBubble();
    }, false)
    previous.addEventListener("click", function(){
      InterfaceH.previousBubble();
    }, false)
    stop.addEventListener("click", function(){
      InterfaceH.stopTutorial();
    }, false);
    guideDisplay.addEventListener("click", function(){
      if(guideContainer.className.match("visible")){
        guideContainer.className = guideContainer.className.replace("visible", "hidden");
      } else if(guideContainer.className.match("hidden")){
        guideContainer.className = guideContainer.className.replace("hidden", "visible");
      }
    }, false);

    InterfaceH.guideTutorialEl = guideContainer;
  },

  initEvents:function(){

    //Bouton de gestion
    InterfaceH.tutorialContainer.addEventListener("click", InterfaceH.displayTutorialContainer, false);

    //Bouton de lancement du tutoriel
    InterfaceH.button.launch.addEventListener("click", function(e){
      InterfaceH.launchTutorial();
      e.stopPropagation();
    }, false)

    //Bouton de fermeture du popin de tutoriel
    InterfaceH.closeTutorialActions.addEventListener("click", function(e){
      InterfaceH.hideTutorialContainer();
      e.stopPropagation();
    }, false);
  },


  init: function(config={}){
    //Trie les configurations passé entre l'objet BubbleH et InterfaceH
    if(config.focusWay == "border"){
      InterfaceH.config.bubble.focusWay = "border";
    }
    if(config.focusWay == "background"){
      InterfaceH.config.bubble.focusWay = "background";
    }
    if(config.tutorialGuide){
      InterfaceH.config.interface.tutorialGuide = true;
    }

    //Récupère les élements concerné
    InterfaceH.items = document.querySelectorAll("*[data-help]");


    InterfaceH.genTutoContainer();

    //Récupération des éléments nécéssaire au fonctionnement normal
    InterfaceH.button.launch = document.getElementById("help-launch-tutorial");
    InterfaceH.tutorialContainer = document.getElementById("tutorialContainer");
    InterfaceH.closeTutorialActions = document.getElementById("closeTutorialActions");

    if(config.tutorialGuide){
      InterfaceH.genGuide();
    }

    //Lance les évenements
    InterfaceH.initEvents()
  }
}
//Système d'alert
//EventListener pour activer aide sur un bouton
//Interface
