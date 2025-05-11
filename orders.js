import { clearSandwich, undoLastLayer } from './script.js';
import { startTimer, resetTimer } from './timer.js';


const popup = document.getElementById('order-popup');
const popupText = document.getElementById('order-text');
const popupButtons = document.getElementById('order-buttons');

const orderInfo = {
  order1: "1x Tomato, 2x Ham, Extra Mayo",
  order2: "Bread, Cheese, Egg, Ketchup",
  order3: "Avocado & Salmon Deluxe",
};

let currentFocused = null;
let order_changing = false;
let inGame = false;


let totalCoins = 0;
let ordersCompleted = 0;


// debugging 
function logOrderStyle(orderEl) {
    const style = getComputedStyle(orderEl);
    console.log(`Order ID: ${orderEl.id}`);
    console.log(`Top: ${style.top}`);
    console.log(`Left: ${style.left}`);
    console.log(`Width: ${style.width}`);
    console.log(`Height: ${style.height}`);
    console.log(`Opacity: ${style.opacity}`);
    console.log(`Position: ${style.position}`);
    console.log(`Z-index: ${style.zIndex}`);
  }
  


function showPopup(orderEl, text, showButtons) {
    if(!inGame) return;

    const rect = orderEl.getBoundingClientRect();

    popupText.innerHTML = showButtons 
    ? `${text}<br><span class="popup-hint pinned">(Click the order to unpin)</span>`
    : `${text}<br><span class="popup-hint">(Click to pin this order)</span>`;  

    popup.style.top = `${rect.top * 1.2 + window.scrollY}px`;
    popup.style.left = `${rect.left * 1.2 + window.scrollX}px`;
    popup.style.width = `${rect.width * 0.7}px`;
    popup.style.height = `${rect.height * 0.7}px`;
    popup.classList.add('visible');
    popup.classList.remove('hidden');

    if (showButtons) {
      popupButtons.classList.remove('hidden');
    } else {
      popupButtons.classList.add('hidden');
    }
  }

function hidePopup() {
    if(!inGame) return;

    popup.classList.remove('visible');
    popup.classList.add('hidden');
    popupButtons.classList.add('hidden');
}


function submitOrder(orderEl) {
    hidePopup();
    let points = calculateCoins();
    clearSandwich();

    //unfocus the old order
    currentFocused = null;
    popup.style.pointerEvents = 'none'; // avoid flikering

    showGainPopup(points);
    ordersCompleted += 1;

    console.log("Here");
}




function getRandomOrderText() {
    const options = [
      "1x Tomato, 2x Ham, Extra Mayo",
      "Bread, Cheese, Egg, Ketchup",
      "Avocado & Salmon Deluxe",
      "Lettuce, Onion, Egg",
      "Cheese Blast with Ketchup",
    ];
    return options[Math.floor(Math.random() * options.length)];
}


function fadeInOrder(orderEl){
    orderEl.classList.remove('order-fade-out');
    orderEl.classList.add('order-fade-in');
} 

function fadeOutOrder(orderEl, callback){
    order_changing = true;
    orderEl.classList.remove('order-fade-in');
    orderEl.classList.add('order-fade-out');

    setTimeout(() => {
        if (callback) callback();
        order_changing = false;
    }, 1000);
} 


function cancelOrder(orderEl) {
    hidePopup();
    //clearSandwich();

    //unfocus the old order
    currentFocused = null;
    popup.style.pointerEvents = 'none'; // avoid flikering

}



function createNewOrder(orderEl) {
    console.log("orderEl: ", orderEl);

    orderInfo[orderEl.id] = getRandomOrderText(); 
    popupText.textContent = orderInfo[orderEl.id];

    hidePopup();
}




function calculateCoins() {
    const sandwich = document.querySelector('sandwich');
    const layers = Array.from(sandwich.children);

    // Example scoring logic: 10 pts per layer, 5 pts bonus for sauces
    let score = 0;
    layers.forEach(layer => {
        const tag = layer.tagName.toLowerCase();
        if (tag === "mayo" || tag === "ketchup") {
            score += 5;
        } else {
            score += 10;
        }
    });

    totalCoins += score;
    updatePointsDisplay();

    return score;
}


function updatePointsDisplay() {
    document.getElementById('points-counter').textContent = `Coins: ${totalCoins}`;
}


function showGainPopup(points) {
    const popup = document.getElementById("gain-popup");
    popup.textContent = `${points} Coins Gained!`;
    popup.classList.remove("hidden");
    popup.classList.add("show");
  
    setTimeout(() => {
      popup.classList.remove("show");
    }, 1200);
  
    setTimeout(() => {
      popup.classList.add("hidden");
    }, 1700);
}



function showGameOverPopup(score, orders) {
    const popup = document.getElementById("game-over-popup");
    document.getElementById("orders-completed-text").textContent = `Orders Completed: ${orders}`;
    document.getElementById("total-points-text").textContent = `Total Coins: ${totalCoins}`;
    popup.classList.remove("hidden");
}



function getGameStats() {
    return {
      totalCoins,
      ordersCompleted
    };
}

function onTimeout(score, orders) {
    showGameOverPopup(score, orders);
}


function resetGame() {
    hidePopup();
    currentFocused = null;

    totalCoins = 0;
    ordersCompleted = 0;
  
    clearSandwich();

    popup.style.pointerEvents = 'none'; // avoid flikering
  
    document.getElementById("game-over-popup").classList.add("hidden");

    document.getElementById("points-counter").textContent = "Coins: 0";
  
    resetTimer(); // From timer.js
    if(inGame) startTimer("game-timer", getGameStats, onTimeout);
  
    document.querySelectorAll(".orders").forEach(createNewOrder);
}




document.querySelectorAll('.orders').forEach(order => {
    console.log("order: ", order);
    const id = order.id;

    order.addEventListener('mouseenter', (e) => {
        if (currentFocused) return;
        if (order_changing) return;
        showPopup(order, orderInfo[id], false);
    });

    order.addEventListener('mouseleave', () => {
        if (currentFocused) return;
        if (order_changing) return;
        hidePopup();
    });


    // Click: toggle focus
    order.addEventListener('click', () => {
        if (order_changing) return; 

        if (currentFocused === order) {
            // Unfocus
            currentFocused = null;
            popup.style.pointerEvents = 'none'; // avoid flikering
            hidePopup();
            return;
        }
      
        // Focused mode
        currentFocused = order;
        popup.style.pointerEvents = 'auto'; //enable the buttons
        showPopup(order, orderInfo[id], true);
    });

    
});



document.getElementById('submit-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    let temp = currentFocused;
    if (currentFocused) {
      submitOrder(currentFocused);

      fadeOutOrder(temp, () => {
        createNewOrder(temp);
        fadeInOrder(temp);
      });
    }

  });
  


document.getElementById('cancel-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    let temp = currentFocused;
    if (currentFocused) {
        cancelOrder(currentFocused);

        fadeOutOrder(temp, () => {
            createNewOrder(temp);
            fadeInOrder(temp);
        });
    }
});
  


document.getElementById('undo-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    undoLastLayer();
});


document.getElementById("popup-ok-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    const popup = document.getElementById("game-over-popup");
    popup.classList.add("hidden");
    inGame = false;
    resetGame();
});
  

document.getElementById("popup-restart-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    inGame = true;
    resetGame();
});


document.getElementById("newGame-btn").addEventListener("click", () => {
    inGame = true;
    resetGame();
});



document.body.classList.add("game-blocked");

document.getElementById("start-button").addEventListener("click", (e) => {
    e.stopPropagation();
    document.getElementById("start-screen").style.display = "none";

    document.body.classList.remove("game-blocked");
    
    inGame = true;
    resetGame();
});