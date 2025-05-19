const SUPABASE_URL = "https://vcrwwvqloyhinixnawdn.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjcnd3dnFsb3loaW5peG5hd2RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2MzQ1OTMsImV4cCI6MjA2MzIxMDU5M30.hk30dpz8s8Y_Wrgu6nRXesQTCVT_MVkTSOmwdMF8Na0";  
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);



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


function getOrGenerateName() {
    let name = localStorage.getItem("player_name");
    if (!name) {
      const adjectives = ["Cool", "Hungry", "Greedy", "Fast", "Sleepy"];
      const animals = ["Penguin", "Gull", "Toast", "Hamster", "Cucumber"];
      name = adjectives[Math.floor(Math.random() * adjectives.length)] +
             animals[Math.floor(Math.random() * animals.length)];
      localStorage.setItem("player_name", name);
    }
    return name;
}



async function submitScore(player_name, newScore, newNumOrders) {
    // Fetch existing score for this player
    const { data: existing, error: fetchError } = await supabase
      .from('scores')
      .select('id, score')
      .eq('player_name', player_name)
      .single(); // assuming 1 row per player
  
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error("Fetch error:", fetchError.message);
      return;
    }
  
    if (!existing) {
      const { error: insertError } = await supabase
        .from('scores')
        .insert([{ player_name, score: newScore, num_orders: newNumOrders }]);
  
      if (insertError) {
        console.error("Insert error:", insertError.message);
      } else {
        console.log("New score submitted!");
      }
  
    } else if (newScore > existing.score) {
      const { error: updateError } = await supabase
        .from('scores')
        .update({ score: newScore, num_orders: newNumOrders })
        .eq('id', existing.id);
  
      if (updateError) {
        console.error("Update error:", updateError.message);
      } else {
        console.log("Score updated!");
      }
  
    } else {
      console.log("Not updating - submitted score is lower.");
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

export { submitScore, getOrGenerateName, fetchTopScores };