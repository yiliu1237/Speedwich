const proteins = ["ham", "salmon", "egg"];
const vegetables = ["tomato", "lettuce", "avocado"];
const sauces = ["mayo", "ketchup"];
const optionals = ["cheese", "onion"];

const comboTemplates = {
  combo1: {
    proteins: 2,
    vegetables: 2,
    sauces: 1,
    extraBread: false,
    optionalCheese: true,
    optionalOnion: true
  },
  combo2: {
    proteins: 1,
    vegetables: 2,
    sauces: 1,
    extraBread: false,
    optionalCheese: true,
    optionalOnion: true
  },
  combo3: {
    proteins: 4,
    vegetables: 4,
    sauces: 2,
    extraBread: true,
    optionalCheese: true,
    optionalOnion: true
  }
};

// Utility to select N distinct types and generate 1–2 slices of each
function generateIngredientsWithCounts(pool, typeCount, sliceRange = [1, 4]) {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selectedTypes = shuffled.slice(0, typeCount);
  const result = [];

  selectedTypes.forEach(type => {
    const num = Math.floor(Math.random() * (sliceRange[1] - sliceRange[0] + 1)) + sliceRange[0];
    for (let i = 0; i < num; i++) {
      result.push(type);
    }
  });

  return result;
}


export function generateOrder() {
    const comboKeys = Object.keys(comboTemplates);
    const randomKey = comboKeys[Math.floor(Math.random() * comboKeys.length)];
    const template = comboTemplates[randomKey];
  
    let selected = {
      proteins: generateIngredientsWithCounts(proteins, template.proteins, [1, 4]),
      vegetables: generateIngredientsWithCounts(vegetables, template.vegetables, [1, 4]),
      sauces: generateIngredientsWithCounts(sauces, template.sauces, [1, 1]),  // 1 per sauce
      bread: template.extraBread ? ["bread"] : [],
    };
  
    if (template.optionalCheese && Math.random() < 0.5){
        selected.cheese = true;
    }
    else{
        selected.cheese = false;
    }

    if (template.optionalOnion && Math.random() < 0.5){
        selected.onion = true;
    }
    else{
        selected.onion = false;
    }
  
    return {
      ingredients: selected,
      text: formatStructuredOrder({ ingredients: selected })
    };
  }
  

function formatStructuredOrder(order) {
  const countItems = (arr) => {
    const counts = {};
    arr.forEach(item => counts[item] = (counts[item] || 0) + 1);
    return Object.entries(counts)
      .map(([name, count]) => count > 1 ? `${capitalize(name)} x${count}` : capitalize(name));
  };

  const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);

  const { proteins, vegetables, sauces, cheese, onion } = order.ingredients;
  const dislikes = order.dislikes || [];

  let parts = [
    ...countItems(proteins),
    ...countItems(vegetables),
    ...countItems(sauces),
  ];

  ["cheese", "onion"].forEach(opt => {
    const present = order.ingredients[opt];
    parts.push(present ? capitalize(opt) : `No ${capitalize(opt)}`);
  });

  if (dislikes.length > 0) {
    dislikes.forEach(item => {
      parts.push(`No ${capitalize(item)}`);
    });
  }

  return parts.join(", ");
}



// protein, tomato, lettuce (from bot to top)
export function checkBLTClassic(recentLayers) {
  const proteins = ["ham", "salmon", "egg"];
  for (let i = 0; i < recentLayers.length - 2; i++) {
    if (proteins.includes(recentLayers[i]) &&
    recentLayers[i + 1] === "tomato" &&
    recentLayers[i + 2] === "lettuce") {
      return true;
    }
  }
  return false;
}



export function checkMeatyMelt(recentLayers) {
  for (let i = 0; i < recentLayers.length - 2; i++) {
    if (recentLayers[i] === "cheese" &&
        ["ham", "salmon"].includes(recentLayers[i + 1]) &&
        recentLayers[i + 2] === "cheese") {
      return true;
    }
  }
  return false;
}


export function checkGardenFresh(recentLayers) {
  const needed = ["lettuce", "tomato", "avocado"];
  return needed.every(ingredient => recentLayers.includes(ingredient));
}



export function checkTomatomanic(recentLayers) {
  const threeInARow = recentLayers.slice(-3).filter(i => i === "tomato").length === 3;
  const fourInARow = recentLayers.slice(-4).filter(i => i === "tomato").length === 4;
  return threeInARow && !fourInARow;
}


export function checkGreenOverload(recentLayers) {
  const threeInARow = recentLayers.slice(-3).filter(i => i === "avocado").length === 3;
  const fourInARow = recentLayers.slice(-4).filter(i => i === "avocado").length === 4;
  return threeInARow && !fourInARow;
}


export function checkSlipperyStack(recentLayers) {
  const sauces = ["mayo", "ketchup"];
  for (let i = 0; i < recentLayers.length - 1; i++) {
    if (
      (recentLayers[i] === "egg" && sauces.includes(recentLayers[i + 1])) ||
      (sauces.includes(recentLayers[i]) && recentLayers[i + 1] === "egg")
    ) {
      return true;
    }
  }
  return false;
}


//At least 5 different non-bread ingredients
function checkRainbowLayer(stack) {
  const nonBread = stack.filter(i => i !== "bread");
  const unique = new Set(nonBread);
  return unique.size >= 5;
}




function checkSymmetryStack(stack) {
  for (let i = 0; i < Math.floor(stack.length / 2); i++) {
    if (stack[i] !== stack[stack.length - 1 - i]) {
      return false;
    }
  }
  return stack.length > 0;
}



function scoreIngredientMatch(requiredItems, sandwich) {
  // Exclude bread from the sandwich for fair comparison
  const usedElements = sandwich.filter(i => i !== "bread" && i !== "onion" && i !== "cheese");
  const requiredElements = requiredItems.filter(i => i !== "bread" && i !== "onion" && i !== "cheese");

  const usedCount = {};
  const requiredCount = {};

  // Count occurrences in both arrays
  usedElements.forEach(i => usedCount[i] = (usedCount[i] || 0) + 1);
  requiredElements.forEach(i => requiredCount[i] = (requiredCount[i] || 0) + 1);

  console.log("In match usedElements: ", usedElements);
  console.log("In match requiredElements: ", requiredElements);

  let score = 0;

  const allIngredients = new Set([...Object.keys(usedCount), ...Object.keys(requiredCount)]);

  for (const ing of allIngredients) {
    const used = usedCount[ing] || 0;
    const required = requiredCount[ing] || 0;

    const correct = Math.min(used, required);
    const missed = required - correct;
    const extra = used - correct;

    score += correct * 3;
    score -= missed * 5;
    score -= extra * 5;
  }


  console.log("match scores: ", score);

  return score;
}




export function scoreSandwich(ingredients, sandwich) {
    console.log(ingredients);
  
    const requiredItems = [
      ...ingredients.proteins,
      ...ingredients.vegetables,
      ...ingredients.sauces,
      ...(ingredients.cheese ? ["cheese"] : []),
      ...(ingredients.onion ? ["onion"] : []),
    ];
  
    const totalScore = (requiredItems.filter(i => i !== "onion" && i !== "cheese").length + 2) * 3; // +3 for breads


    let score = 0;
    let valid_sandwich = true;
    let text = "";
  
    // Check if it's a valid sandwich: bread on both ends
    const first = sandwich[0];
    const last = sandwich[sandwich.length - 1];
  
    if (first !== "bread" || last !== "bread") {
      valid_sandwich = false;
    }
  
    // Count ingredients in player's sandwich
    const counts = sandwich.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {});

    score += scoreIngredientMatch(requiredItems, sandwich);


    if (ingredients.cheese === false && counts["cheese"]) {
        score -= 5;
    }

    if (ingredients.onion === false && counts["onion"]) {
        score -= 5;
    }


    if(checkRainbowLayer(sandwich)){
      score += 5;
      console.log("Rainbow Layers");
    }

    if(checkSymmetryStack(sandwich)){
      score *= 2;
      console.log("Symmetric Layers");
    }

  
    if (valid_sandwich) {
      score += 3 * 2; //for breads
      const ratio = Math.min(1, score / totalScore);
  
      if (Math.abs(ratio - 1) < 0.001) {
        const options = [
            "This one's going on the menu photo.",
            "Stacked like a pro. Respect.",
            "Perfect build!"
        ];
        text = options[Math.floor(Math.random() * options.length)];

      } else if (ratio >= 0.8) {
        const options = [
            "Looks great! Just a tiny miss.",
            "Almost perfect.",
            "That's solid stacking. One small slip."
        ];
        text = options[Math.floor(Math.random() * options.length)];
      } else if (ratio >= 0.5) {
        const options = [
            "Almost there - a couple things were off.",
            "Something's missing... or maybe too much showed up to the party."
        ];
        text = options[Math.floor(Math.random() * options.length)];
      } else {
        const options = [
            "Was this... abstract sandwich art?",
            "Chef's note: maybe don't quit your day job.", 
            "A brave reinterpretation of the order."
        ];
        text = options[Math.floor(Math.random() * options.length)];
      } 
    } else{
        score = (score > 0) ? Math.floor(score / 2) : score;
        const options = [
            "No bread, no glory. Sandwich denied.",
            "Bread forgot you. So did the coins.",
            "Missing bread. Missing soul."
        ];
        text = options[Math.floor(Math.random() * options.length)];
    }


    console.log("total score: ", totalScore);
    console.log("score: ", Math.max(0, score));
  
    return {
      score: Math.max(0, score),
      feedback: text
    };
}
  
  
  