import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';


const SUPABASE_URL = "https://vcrwwvqloyhinixnawdn.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjcnd3dnFsb3loaW5peG5hd2RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2MzQ1OTMsImV4cCI6MjA2MzIxMDU5M30.hk30dpz8s8Y_Wrgu6nRXesQTCVT_MVkTSOmwdMF8Na0";  
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);


let rename_status = false;

function getPlayerName() {
    let name = localStorage.getItem("player_name");
    if (!name) {
      name = prompt("Enter your name:");
      if (name) {
        localStorage.setItem("player_name", name);
      }
    }
    return name;
}




async function renamePlayerInDatabase(newName) {
  if (!newName) {
    console.warn("New name is empty.");
    return;
  }

  const player_id = localStorage.getItem("player_id");
  const oldName = localStorage.getItem("player_name");

  if (!oldName || !player_id) {
    console.warn("Missing old name or player_id in localStorage.");
    return;
  }

  // Check if the new name already exists
  const { data: existing, error: checkError } = await supabase
    .from('scores')
    .select('id, player_name')
    .eq('player_name', newName)
    .maybeSingle();

  if (checkError) {
    console.error("Error checking for name conflict:", checkError.message);
    return;
  }

  if (existing) {
    alert("This name is already taken. Please choose another one.");
    return;
  }

  // Perform the update
  const { data: updateResult, error: updateError } = await supabase
    .from('scores')
    .update({ player_name: newName })
    .eq('player_id', player_id)
    .select();

  if (updateError) {
    console.error("Rename failed:", updateError.message);
  } else {
    console.log("Rename result:", updateResult);
    localStorage.setItem("player_name", newName);
    localStorage.setItem("is_random", "false");
    console.log("Rename succeeded.");
  }
}





function getOrGenerateName() { 

  console.log("getOrGenerateName!");

  const adjectives = ["Cool", "Hungry", "Greedy", "Fast", "Sleepy"];
  const animals = ["Penguin", "Gull", "Toast", "Hamster", "Cucumber"];
  const newName = adjectives[Math.floor(Math.random() * adjectives.length)] +
                  animals[Math.floor(Math.random() * animals.length)];

  if (rename_status) {
    // overwrite name but keep player_id
    localStorage.setItem("player_name", newName);
    localStorage.setItem("is_random", "true");
    return newName;
  }

  let name = localStorage.getItem("player_name");

  if (!name) {
    // first-time generation
    localStorage.setItem("player_name", newName);
    localStorage.setItem("is_random", "true");

    // Generate a hidden player_id if not already there
    if (!localStorage.getItem("player_id")) {
      localStorage.setItem("player_id", crypto.randomUUID());
    }

    return newName;
  }

  return name;
}




async function submitScore(player_name, newScore, newNumOrders) {
  const isRandom = localStorage.getItem("is_random") === "true";
  let player_id = localStorage.getItem("player_id");

  // Ensure player_id exists
  if (!player_id) {
    player_id = crypto.randomUUID();
    localStorage.setItem("player_id", player_id);
  }

  // If we just renamed the player, skip resaving
  if (rename_status) {
    rename_status = false;
    return;
  }

  // Try to find the existing player row by player_id first
  let existing, fetchError;

  const result = await supabase
    .from('scores')
    .select('id, score, player_id') 
    .eq('player_id', player_id)
    .limit(1)
    .single();

  existing = result.data;
  fetchError = result.error;

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error("Fetch error:", fetchError.message);
    return;
  }

  if (!existing) {
    // No existing row found — insert a new one
    const { error: insertError } = await supabase
      .from('scores')
      .insert([{
        player_id,
        player_name,
        score: newScore,
        num_orders: newNumOrders
      }]);

    if (insertError) {
      console.error("Insert error:", insertError.message);
    } else {
      console.log("New player score submitted.");
    }

  } else if (newScore > existing.score) {
    // Update score if new one is higher
    const { error: updateError } = await supabase
      .from('scores')
      .update({ score: newScore, num_orders: newNumOrders, player_name }) // keep name in sync
      .eq('id', existing.id);

    if (updateError) {
      console.error("Update error:", updateError.message);
    } else {
      console.log("Player score updated.");
    }

  } else {
    console.log("Score not updated — lower than existing.");
  }
}




async function fetchTopScores(limit = 10) {
    const { data, error } = await supabase
      .from('scores')
      .select('player_name, score')  
      .order('score', { ascending: false })
      .limit(limit);
  
    if (error) {
      console.error("Fetch error:", error.message);
      return [];
    }
  
    return data;
  }


function setRenameStatus(status){
  rename_status = status;
}

export { supabase, submitScore, getOrGenerateName, fetchTopScores, setRenameStatus, renamePlayerInDatabase };