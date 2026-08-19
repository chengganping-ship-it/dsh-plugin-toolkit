# Fetch the page source to find API endpoints
$inner = @'
(async function(){
  try {
    // Use the existing session to fetch the page
    var resp = await fetch("/users/u_cbe4bf124f8c/manage_gigs?wizard=1&tab=general", {credentials:"include"});
    var text = await resp.text();
    // Look for save endpoints
    var matches = text.match(/["']\/api\/v\d\/[^"']*gig[^"']*["']/gi);
    var match2 = text.match(/["'][^"']*save[^"']*gig[^"']*["']/gi);
    var match3 = text.match(/["'][^"']*create[^"']*gig[^"']*["']/gi);
    var csrfMatch = text.match(/csrf[_\-]token["']?\s*[:=]\s*["']([^"']+)["']/i);
    var aatMatch = text.match(/aatToken["']?\s*[:=]\s*["']([^"']+)["']/i);
    return JSON.stringify({
      apiMatches: matches ? matches.slice(0,10) : [],
      saveMatches: match2 ? match2.slice(0,5) : [],
      createMatches: match3 ? match3.slice(0,5) : [],
      csrf: csrfMatch ? csrfMatch[1].slice(0,30) : "none",
      aat: aatMatch ? aatMatch[1].slice(0,40) : "none",
      status: resp.status
    });
  } catch(e) {
    return JSON.stringify({error: e.message});
  }
})()
'@

$jsonObj = @{ action = "evaluate"; script = $inner }
$json = $jsonObj | ConvertTo-Json -Compress
paw browser-action $json
