let stackHeight = 0;
let animationIndex = 0;
let base_X_pos = 0;


const sauceOpacity = {"mayo": 0.9, "ketchup": 0.85};


function addIngredient(tag, thickness) {
  const sandwich = document.querySelector('sandwich');

  const newTop = -stackHeight;
  const nextTop = -stackHeight - thickness;

  console.log(newTop, tag);

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

  stackHeight += thickness;
  animationIndex++;
}




document.addEventListener('DOMContentLoaded', () => {
  const ingredientMap = {
    '0': ['salmon', 10], 
    '1': ['bread', 10],
    '2': ['cheese', 10],
    '3': ['salad', 5],
    '4': ['tomato', 3],
    '5': ['ham', 5],
    '6': ['mayo', 0],
    '7': ['ketchup', 0],
    '8': ['egg', 10], 
    '9': ['avocado', 3], 
  };

  document.addEventListener('keydown', (event) => {
    const config = ingredientMap[event.key];
    if (!config) return;
    const [tag, thickness] = config;
    addIngredient(tag, thickness);
  });
});



const sandwich = document.querySelector("sandwich");

sandwich.addEventListener("mouseenter", () => {
  const layers = Array.from(sandwich.children);
  if (layers.length === 0) return;

  // const layer = layers[layers.length - 1]; // last layer (top of sandwich)

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


    console.log("Lifting: ", lift);

    layer.style.transition = "transform 0.5s ease";

    const rotation = lift * 0.08;
    // const rotation = Math.sign(lift) * Math.log(Math.abs(lift) + 1) * 2;

    // Prepend the translateY without modifying the rest
    layer.style.transform = `rotateX(${rotation}deg) translateY(${lift}px) ${layer.dataset.originalTransform}`;

  });
});



sandwich.addEventListener("mouseleave", () => {
  const layers = Array.from(sandwich.children);
  layers.forEach((layer) => {
    layer.style.transition = "transform 0.5s ease";
    layer.style.transform = layer.dataset.originalTransform || "";
  });
});



sandwich.addEventListener("mouseenter", () => {
  document.body.style.overflowY = "auto"; // enable scroll
});

sandwich.addEventListener("mouseleave", () => {
  document.body.style.overflowY = "hidden"; // lock again
});