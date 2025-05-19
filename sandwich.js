import {checkBLTClassic, checkMeatyMelt, checkGardenFresh, checkTomatomanic, 
  checkGreenOverload, checkSlipperyStack} from './orders.js';

import {getPoints, addPoints, updatePointsDisplay, resetPoints} from './coins.js';


import {  playBonusClick } from './audio.js';



let stackHeight = 0;
let animationIndex = 0;
let base_X_pos = 0;


const sauceOpacity = {"mayo": 0.9, "ketchup": 0.85};

const ingredientThicknessMap = {
  bread: 10,
  cheese: 6,
  tomato: 3,
  ham: 5,
  salmon: 10,
  avocado: 3,
  onion: 6,
  egg: 10,
  lettuce: 5,
  mayo: 0,
  ketchup: 0
};


let hover_sandwich = false;

let layerStack = [];
let inGame = true;


let extra_score = 0;
let bonusHistory = [];


function addIngredient(tag) {
  const sandwich = document.querySelector('sandwich');
  const thickness = ingredientThicknessMap[tag] || 0;

  const newTop = -stackHeight;
  const nextTop = -stackHeight - thickness;

  // console.log(newTop, tag);

  let animationName = `animate${animationIndex}`;
  let keyframes = `
    @keyframes ${animationName} {
      93% {
        top: ${newTop + 5}px;
      }
      100% {
        top: ${nextTop}px;
      }
    }
  `;

  // Setup base container
  let el = document.createElement(tag);

  if (tag === "mayo" || tag === "ketchup"){
    animationName = `fadeIn${animationIndex}`;
    keyframes = `
      @keyframes ${animationName} {
        from { opacity: 0; }
        to { opacity: ${sauceOpacity[tag]}; }
      }
    `;
  } 
  
  const styleTag = document.createElement('style');
  styleTag.innerHTML = keyframes;
  document.head.appendChild(styleTag);

  // Apply outer styles
  el.style.position = 'absolute';
  el.style.top = '-2000px';
  el.style.left = `${base_X_pos + (Math.random() * 10 - 5)}px`;
  el.style.zIndex = 1000 + animationIndex;
  el.style.animation = `${animationName} 1s ease-out forwards`;

  if (tag === 'salmon') {
    for (let i = 0; i < 3; i++) {
      const line = document.createElement('div');
      line.classList.add('line');
      el.appendChild(line);
    }
  }

  if (tag === "mayo" || tag === "ketchup"){
    el.style.top = `${nextTop}px`;
    el.style.animation = `${animationName} 2s ease-out forwards`;
  } 

  sandwich.appendChild(el);
  layerStack.push(el);   // Save reference to undo later
  
  stackHeight += thickness;
  animationIndex++;
}


export function clearSandwich() {
  const sandwich = document.querySelector('sandwich');
  sandwich.innerHTML = ''; // remove all ingredients
  stackHeight = 0; // reset height for next sandwich
  animationIndex = 0;
}



function showExtraPoints(points, type) {
  const popup = document.getElementById("gain-popup");

  let prompt = "";
  let colors = [];

  if (type === "BLTClassic") {
    prompt = "Classic Layers!";
    colors = ["#ff9a5c", "#f55128"];
  } else if (type === "GardenFresh") {
    prompt = "Garden Fresh!";
    colors = ["#a8e063", "#56ab2f"];
  } else if (type === "MeatyMelt") {
    prompt = "Meaty Melt!";
    colors = ["#b24525", "#e67e22"];
  } else if (type === "Tomatomanic") {
    prompt = "Tomatomanic!";
    colors = ["#ff4e50", "#f9d423"];
  } else if (type === "GreenOverload") {
    prompt = "Green Overload!";
    colors = ["#11998e", "#38ef7d"];
  } else if (type === "Slippery") {
    prompt = "Slippery Stack!";
    colors = ["#ffb84d", "#ffffb3"];
  } else {
    console.log("Type doesn't exist.");
    return;
  }

  popup.innerHTML = `${prompt}<br>+${points} Coins!`;
  popup.style.background = `linear-gradient(to right, ${colors[0]}, ${colors[1]})`;
  popup.style.webkitBackgroundClip = "text";
  popup.style.webkitTextFillColor = "transparent";

  // Do NOT change `color`, `innerHTML`, or clip/text-fill settings - CSS already does it
  popup.classList.remove("hidden");
  popup.classList.add("show");

  setTimeout(() => {
    popup.classList.remove("show");
  }, 1200);

  setTimeout(() => {
    popup.classList.add("hidden");
  }, 1700);
}




export function undoLastLayer() {
  if (!inGame) return;

  if (layerStack.length === 0){
    return;
  }

  const last = layerStack.pop();    // get the most recently added layer

  const tageName = last.tagName.toLowerCase();
  const thickness = ingredientThicknessMap[tageName] || 0;

  last.remove();                  

  stackHeight -= thickness;        // adjust stack height


  // Check if a bonus was attached to this layer
  const lastIndex = layerStack.length; // After pop, this is the removed layer's index

  let removedPts = 0;

  // Remove bonuses that were associated with that top layer
  bonusHistory = bonusHistory.filter(bonus => {
    if (bonus.index === lastIndex) {
      extra_score -= bonus.points;

      console.log("bonus.points: ", bonus.points);
      removedPts = bonus.points;
      console.log(`Undo bonus: -${bonus.points}pts for ${bonus.type}`);
      return false; // remove this bonus from history
    }
    return true;
  });


  console.log("final removedPts: ", removedPts);

  return removedPts;
}



export function changeGameState(state){
  inGame = state;
}


export function getCurrentSandwich() {
  const layers = Array.from(document.querySelector("sandwich").children);
  return layers.map(layer => layer.tagName.toLowerCase());
}


export function resetExtraScore() {
  extra_score = 0;
}



function getRecentLayers(n) {
  const current = getCurrentSandwich();
  return current.slice(-n);
}


function updateBasedOnBonusCombo(bonus_pts, bonus_type, stackLayer_index){
  playBonusClick();

  extra_score += bonus_pts;
  bonusHistory.push({ type: bonus_type, points: bonus_pts, index: stackLayer_index });
  showExtraPoints(bonus_pts, bonus_type);
  addPoints(bonus_pts);

  updatePointsDisplay(bonus_pts);
}



document.addEventListener('DOMContentLoaded', () => {

  document.addEventListener("click", (e) => {

    if(!inGame) return;

    if(hover_sandwich) return;

    const allUnderCursor = document.elementsFromPoint(e.clientX, e.clientY);
    const overlappingIngredients = allUnderCursor.filter(el =>
      el.classList.contains("bg-ingredient")
    );
  
    if (overlappingIngredients.length === 0) return;
  
    let closest = null;
    let closestDistance = Infinity;
  
    overlappingIngredients.forEach(el => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
  
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
  
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = el;
      }
    });

  
    if (closest) {
      const tag = closest.dataset.tag;
      addIngredient(tag);

      if(tag === "lettuce"){
        const recentLayers = getRecentLayers(3);
        console.log("recentLayers: ", recentLayers);
        if(checkBLTClassic(recentLayers)){
          updateBasedOnBonusCombo(5, "BLTClassic", layerStack.length - 1);
        }else if(checkGardenFresh(recentLayers)){
          updateBasedOnBonusCombo(5, "GardenFresh", layerStack.length - 1);
        }
      }else if(tag === "cheese"){
        const recentLayers = getRecentLayers(3);
        console.log("recentLayers: ", recentLayers);
        if(checkMeatyMelt(recentLayers)){
          updateBasedOnBonusCombo(3, "MeatyMelt", layerStack.length - 1);
        }
      }else if(tag === "tomato"){
        const recentLayers = getRecentLayers(4);
        if(checkTomatomanic(recentLayers)){
          updateBasedOnBonusCombo(3, "Tomatomanic", layerStack.length - 1);
        }
      }else if(tag === "avocado"){
        const recentLayers = getRecentLayers(4);
        if(checkGreenOverload(recentLayers)){
          updateBasedOnBonusCombo(3, "GreenOverload", layerStack.length - 1);
        }
      }else if(tag === "egg"){
        const recentLayers = getRecentLayers(2);
        if(checkSlipperyStack(recentLayers)){
          updateBasedOnBonusCombo(3, "Slippery", layerStack.length - 1);
        }
      }else if(tag === "mayo"){
        const recentLayers = getRecentLayers(2);
        if(checkSlipperyStack(recentLayers)){
          updateBasedOnBonusCombo(3, "Slippery", layerStack.length - 1);
        }
      }else if(tag === "ketchup"){
        const recentLayers = getRecentLayers(2);
        if(checkSlipperyStack(recentLayers)){
          updateBasedOnBonusCombo(3, "Slippery", layerStack.length - 1);
        }
      }
    }
  });



  const sandwich = document.querySelector("sandwich");

  sandwich.addEventListener("mouseenter", () => {
    hover_sandwich = true;

    const layers = Array.from(sandwich.children);
    if (layers.length === 0) return;

    let lift = 0

    layers.forEach((layer, index) => {
      const computedStyle = window.getComputedStyle(layer);
      const original = layer.dataset.originalTransform || computedStyle.transform || "none";

      // Save original only once
      if (!layer.dataset.originalTransform) {
        layer.dataset.originalTransform = original;
      }

      if(layer.tagName.toLowerCase() === "mayo" || layer.tagName.toLowerCase() === "ketchup"){
        lift -= 5; // how much to lift
      }
      else{
        lift -= 15; // how much to lift
      }

      layer.style.transition = "transform 0.5s ease";

      const rotation = lift * 0.08;

      // Prepend the translateY without modifying the rest
      layer.style.transform = `rotateX(${rotation}deg) translateY(${lift}px) ${layer.dataset.originalTransform}`;

    });
  });



  sandwich.addEventListener("mouseleave", () => {
    hover_sandwich = false;
    const layers = Array.from(sandwich.children);
    layers.forEach((layer) => {
      layer.style.transition = "transform 0.5s ease";
      layer.style.transform = layer.dataset.originalTransform || "";
    });
  });

  
});


export {extra_score};