// audio.js

// Background music
const bgMusic = new Audio('assets/audio/bg/Dj_Haus_Panda_Joakim_Karud.mp3');

bgMusic.loop = true;
bgMusic.volume = 0.4;

let musicOn = true;


function playMusic() {
  if (musicOn && bgMusic.paused) {
    bgMusic.play();
  }
}

function stopMusic() {
  bgMusic.pause();
  bgMusic.currentTime = 0;
}

function toggleMusic() {
  musicOn = !musicOn;
  bgMusic.volume = musicOn ? 0.4 : 0;
  return musicOn;
}

function isMusicOn() {
  return musicOn;
}







// --- Background SOUND EFFECTS ---

const bgMusic_SE1 = new Audio('assets/audio/bg_SE/rice_or_potatoes_boiling_in_water.mp3');

const bgMusic_SE2 = new Audio('assets/audio/bg_SE/cooking_porridge.mp3');

const bgMusic_SE3 = new Audio('assets/audio/bg_SE/egg_crack_into_hot_frying_pan.mp3');

const bgMusic_SE4 = new Audio('assets/audio/bg_SE/egg_fry_in_frying_pan.mp3');


let currentSEIndex = 0;
let seLooping = false;

function playSELoop() {
    if (!seLooping) return;
  
    const currentSE = bgSEArray[currentSEIndex];
    currentSE.currentTime = 0;
    currentSE.play();
  
    currentSE.onended = () => {
      currentSEIndex = (currentSEIndex + 1) % bgSEArray.length;
      playSELoop(); // recursively play the next SE
    };
  }
  
  function startSELoop() {
    if (!seLooping) {
      seLooping = true;
      currentSEIndex = 0;
      playSELoop();
    }
  }
  
  function stopSELoop() {
    seLooping = false;
    bgSEArray.forEach(se => {
      se.pause();
      se.currentTime = 0;
      se.onended = null;
    });
  }
  
  function isSELooping() {
    return seLooping;
  }


// --- UI SOUND EFFECTS ---

// const clickSound = new Audio('assets/audio/click.mp3'); 
// clickSound.volume = 0.6;

// function playClickSound() {
//   clickSound.currentTime = 0;
//   clickSound.play();
// }

// // You can add more effects:
// const dropSound = new Audio('assets/audio/drop.mp3');
// dropSound.volume = 0.6;

// function playDropSound() {
//   dropSound.currentTime = 0;
//   dropSound.play();
// }

const submitOrderSound = new Audio('assets/audio/SE/orderSubmit.mp3');
submitOrderSound.volume = 0.4;

// function playSubmitOrderSound() {
//     submitOrderSound.currentTime = 0;
//     submitOrderSound.play();

//     console.log("playSubmitOrderSound played");
// }

function playSubmitOrderSound() {
  const sfx = submitOrderSound.cloneNode(); // make a new sound each time
  sfx.volume = sfxVolume;
  sfx.play().catch((e) => {
    console.warn("submitOrderSound failed to play:", e);
  });

  console.log("playSubmitOrderSound played");
}



const timeUpSound = new Audio('assets/audio/SE/timeUp.mp3');
timeUpSound.volume = 0.4;

function playTimeUpSound() {
    timeUpSound.currentTime = 0;
    timeUpSound.play();
}




const uiClickSound = new Audio('assets/audio/SE/UIButtons.mp3');
uiClickSound.volume = 0.4;

function playUIClick() {
  const sfx = uiClickSound.cloneNode(); // make a new sound each time
  sfx.volume = sfxVolume;
  sfx.play().catch((e) => {
    console.warn("uiClickSound failed to play:", e);
  });

  console.log("uiClickSound played");
}



const bonusSound = new Audio('assets/audio/SE/bonus.mp3');
bonusSound.volume = 0.4;


function playBonusClick() {
  const sfx = bonusSound.cloneNode(); // make a new sound each time
  sfx.volume = sfxVolume;
  sfx.play().catch((e) => {
    console.warn("bonusSound failed to play:", e);
  });

  console.log("bonusSound played");
}


const bgSEArray = [submitOrderSound, timeUpSound, uiClickSound, bonusSound];


// ----------  Adjust Music Sound -----------------

let sfxVolume = 0.4;
bgSEArray.forEach(se => se.volume = sfxVolume);

// Handle volume changes
document.getElementById("music-volume").addEventListener("input", (e) => {
  bgMusic.volume = parseFloat(e.target.value);
});

document.getElementById("sfx-volume").addEventListener("input", (e) => {
  sfxVolume = parseFloat(e.target.value);

  console.log("sfxVolume: ", sfxVolume);
  bgSEArray.forEach(se => se.volume = sfxVolume);
});



// Export everything
export {
  playMusic,
  stopMusic,
  toggleMusic,
  isMusicOn,
  playUIClick,
  playBonusClick,
  playSubmitOrderSound,
  playTimeUpSound
};



