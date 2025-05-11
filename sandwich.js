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
let order_start = false;

let layerStack = [];
let inGame = true;


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


export function undoLastLayer() {
  if (!inGame) return;

  if (layerStack.length === 0) return;

  const last = layerStack.pop();    // get the most recently added layer

  const tageName = last.tagName.toLowerCase();
  const thickness = ingredientThicknessMap[tageName] || 0;

  last.remove();                  

  stackHeight -= thickness;        // adjust stack height
}



export function changeGameState(state){
  inGame = state;
}


export function getCurrentSandwich() {
  const layers = Array.from(document.querySelector("sandwich").children);
  return layers.map(layer => layer.tagName.toLowerCase());
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

