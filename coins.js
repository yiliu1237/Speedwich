let totalPts = 0;

function addPoints(score) {
    totalPts += score;
}

function getPoints() {
    return totalPts;
}

function resetPoints(){
    totalPts = 0;
}


function updatePointsDisplay() {
    document.getElementById('points-counter').textContent = `Coins: ${totalPts}`;
}



export {getPoints, addPoints, updatePointsDisplay, resetPoints};