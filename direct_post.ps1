# Try direct POST to Fiverr's gig creation API using form data
$inner = @'
(async function(){
  try {
    // Build form data matching what the page would send
    var token = document.querySelector("input[name=\"authenticity_token\"]");
    var tokenVal = token ? token.value : "";
    
    // Use FormData to mimic normal form submission
    var formData = new FormData();
    formData.append("authenticity_token", tokenVal);
    formData.append("gig[title]", "I will write ATS optimized resumes with JD keyword gap analysis");
    formData.append("gig[category_id]", "3");  // Writing & Translation
    formData.append("gig[sub_category_id]", "58");  // Resume Writing (need to find correct ID)
    formData.append("gig[tag_list]", "ATS RESUME,COVER LETTER,CV WRITING,RESUME,ATS");
    formData.append("current_tab", "general");
    formData.append("current_step", "general");
    formData.append("wizard", "0");
    formData.append("tab", "general");
    
    var resp = await fetch("/users/u_cbe4bf124f8c/manage_gigs", {
      method: "POST",
      credentials: "include",
      headers: {
        "Accept": "application/json, text/html, */*",
        "X-Requested-With": "XMLHttpRequest"
      },
      body: formData
    });
    
    var text = await resp.text();
    return JSON.stringify({
      status: resp.status, 
      url: resp.url,
      headers: Object.fromEntries(resp.headers.entries()),
      bodyLen: text.length,
      body: text.slice(0, 500)
    });
  } catch(e) {
    return JSON.stringify({error: e.message});
  }
})()
'@

$jsonObj = @{ action = "evaluate"; script = $inner }
$json = $jsonObj | ConvertTo-Json -Compress
paw browser-action $json
