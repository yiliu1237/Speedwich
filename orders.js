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

export function scoreSandwich(ingredients, sandwich) {
    console.log(ingredients);
  
    const requiredItems = [
      ...ingredients.proteins,
      ...ingredients.vegetables,
      ...ingredients.sauces,
      ...(ingredients.cheese ? ["cheese"] : []),
      ...(ingredients.onion ? ["onion"] : []),
    ];
  
    const totalScore = (requiredItems.length + 2) * 2; // +2 for breads


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

  
    // +2 per correct item used (cap to number required)
    [...new Set(requiredItems)].forEach(item => {
        const requiredCount = requiredItems.filter(i => i === item).length;
        const usedCount = counts[item] || 0;
      
        score += 2 * Math.min(requiredCount, usedCount);
    });

  
    // -10 per missing required item
    requiredItems.forEach(item => {
      if (!counts[item]) score -= 10;
    });


    if (ingredients.cheese === false && counts["cheese"]) {
        score -= 10;
    }

    if (ingredients.onion === false && counts["onion"]) {
        score -= 10;
    }

  
    if (valid_sandwich) {
        score += 2 * 2; //for breads
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
            "Almost there - a couple things missing.",
            "Off by a few ingredients."
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
  
  
  