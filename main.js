console.log("🔥 main.js is running!");
import { clearSandwich, undoLastLayer, changeGameState, getCurrentSandwich, resetExtraScore } from './sandwich.js';
import { startTimer, resetTimer, stopTimer } from './timer.js';
import { generateOrder, scoreSandwich} from './orders.js';


const popup = document.getElementById('order-popup');
const popupText = document.getElementById('order-text');
const popupButtons = document.getElementById('order-buttons');

const orderDescription = {
  order1: "1x Tomato, 2x Ham, Extra Mayo",
  order2: "Bread, Cheese, Egg, Ketchup",
  order3: "Avocado & Salmon Deluxe",
};

const orderInfo = {};

let currentFocused = null;

let order_changing = false;
let inGame = false;


let totalCoins = 0;
let ordersCompleted = 0;
let pause_game = false;


let free_play_mode = false;

let game_started = false;


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
    ? `${text}<br><span class="popup-hint pinned" style="color: brown;">(Click the order to unpin. Scroll down to deliver or cancel.)</span>`
    : `${text}<br><span class="popup-hint" style="color: gray;">(Click to pin this order)</span>`;  

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

    const order = orderInfo[orderEl.id]; 
    const sandwich = getCurrentSandwich();

    const score = scoreSandwich(order, sandwich).score;
    const feedback = scoreSandwich(order, sandwich).feedback;


    totalCoins += score;
    updatePointsDisplay();

    clearSandwich();
    resetExtraScore();

    //unfocus the old order
    currentFocused = null;
    popup.style.pointerEvents = 'none'; // avoid flikering

    showGainPopup(score, feedback);
    
    if (score > 0) {
        ordersCompleted += 1;
    }
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
    const order = generateOrder();
    orderDescription[orderEl.id] = order.text;
    orderInfo[orderEl.id] = order.ingredients;
    popupText.textContent = order.text;
  
    hidePopup();
}
  


function updatePointsDisplay() {
    document.getElementById('points-counter').textContent = `Coins: ${totalCoins}`;
}


function showGainPopup(points, feedback) {
    const popup = document.getElementById("gain-popup");
    popup.innerHTML = `
      <div style="text-align: center;">
        ${points} Coins Gained!<br><br>${feedback}
      </div>
    `;
    popup.style.background = `linear-gradient(to right, #ff9a5c, #f55128)`;
    popup.style.webkitBackgroundClip = "text";
    popup.style.webkitTextFillColor = "transparent";
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


// The reset Game doesn't mean to restart the game
function resetGame() {
    hidePopup();
    currentFocused = null;

    totalCoins = 0;
    ordersCompleted = 0;
  
    clearSandwich();
    resetExtraScore();

    popup.style.pointerEvents = 'none'; // avoid flikering
  
    document.getElementById("game-over-popup").classList.add("hidden");

    document.getElementById("points-counter").textContent = "Coins: 0";
  
    resetTimer(); // From timer.js
    if(inGame) startTimer("game-timer", getGameStats, onTimeout);

    document.getElementById("pause-btn").textContent = "Pause";
    pause_game = false;

  
    document.querySelectorAll(".orders").forEach(createNewOrder);

    changeGameState(inGame || free_play_mode);
}




document.querySelectorAll('.orders').forEach(order => {
    const id = order.id;

    order.addEventListener('mouseenter', (e) => {
        if (currentFocused) return;
        if (order_changing) return;

        const scrollWrapper = document.getElementById("order-scroll-wrapper");
        scrollWrapper.scrollTop = 0;
        console.log("scrollWrapper.scrollTop", scrollWrapper.scrollTop);

        showPopup(order, orderDescription[id], false);
    });

    order.addEventListener('mouseleave', () => {
        if (currentFocused) return;
        if (order_changing) return;
        hidePopup();
    });


    // Click: toggle focus
    order.addEventListener('click', () => {
        if (order_changing) return; 

        const scrollWrapper = document.getElementById("order-scroll-wrapper");
        scrollWrapper.scrollTop = 0;
        console.log("scrollWrapper.scrollTop", scrollWrapper.scrollTop);

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
        showPopup(order, orderDescription[id], true);
    });
});



document.getElementById('submit-btn').addEventListener('click', (e) => {
    if (!inGame) return;

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
    if (!inGame) return;

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
    const needRemoveBonusPts = undoLastLayer();

    if(needRemoveBonusPts){
      
    }
});


document.getElementById("popup-ok-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    hidePopup();

    const popup = document.getElementById("game-over-popup");
    popup.classList.add("hidden");
    inGame = false;
    resetGame();

    free_play_mode = true;
    changeGameState(free_play_mode);
});
  

document.getElementById("popup-restart-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    inGame = true;
    resetGame();

    free_play_mode = false;
});


document.getElementById("newGame-btn").addEventListener("click", () => {
    inGame = true;
    free_play_mode = false;

    changeGameState(inGame);
    resetGame();

});


document.getElementById("pause-btn").addEventListener("click", () => {
    if (free_play_mode) return; 

    if (!pause_game) {
      pause_game = true;
      inGame = false;

      stopTimer();
      changeGameState(inGame);
  
      document.getElementById("pause-btn").textContent = "Resume";
      return;
    }
  
    pause_game = false;
    inGame = true;
    changeGameState(inGame);

    settingsMenu.classList.remove('show');  // hide the menu
  
    startTimer("game-timer", getGameStats, onTimeout);
    document.getElementById("pause-btn").textContent = "Pause";
  });
  



document.getElementById("rules-btn").addEventListener("click", (e) => {
  e.stopPropagation();
  document.getElementById("rules-screen").classList.remove("hidden");
});
  
  



document.body.classList.add("game-blocked");

document.getElementById("start-button").addEventListener("click", (e) => {
    e.stopPropagation();
    game_started = true;
    document.getElementById("start-screen").style.display = "none";

    document.body.classList.remove("game-blocked");

    inGame = true;
    changeGameState(inGame);
    resetGame();

    free_play_mode = false;
});


document.getElementById("rule-button").addEventListener("click", (e) => {
  e.stopPropagation();
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("rules-screen").classList.remove("hidden");
});


document.getElementById("rule-back-button").addEventListener("click", (e) => {
  e.stopPropagation();

  if(game_started){
    document.getElementById("rules-screen").classList.add("hidden");
    return;
  }

  document.getElementById("start-screen").style.display = "block";
  document.getElementById("rules-screen").classList.add("hidden");
});




const settingsButton = document.getElementById('settings-button');
const settingsMenu = document.getElementById('settings-menu');

console.log("settingsButton: ", settingsButton);
console.log("settingsMenu: ", settingsMenu);

settingsButton.addEventListener('click', () => {
  console.log("setting is clicked");
  settingsMenu.classList.toggle('show');
  settingsMenu.classList.remove('hidden'); 
});


const settingsMenuButtons = document.querySelectorAll('#settings-menu button');

settingsMenuButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.id !== 'pause-btn') {
      settingsMenu.classList.remove('show');  // hide the menu
    }
  });
});

window.addEventListener('resize', () => {
    if (currentFocused) {
      showPopup(currentFocused, orderDescription[currentFocused.id], true);
    }
});