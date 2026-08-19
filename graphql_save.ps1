# Try to use Fiverr's internal GraphQL API to save gig data
$saveMutation = @'
(async function(){
  try {
    // Get CSRF token from cookies or page
    var csrfMatch = document.cookie.match(/csrf_token=([^;]+)/);
    var csrf = csrfMatch ? csrfMatch[1] : "";
    
    // Try GraphQL endpoint
    var response = await fetch("/api/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Csrf-Token": csrf,
        "Accept": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        query: "mutation { createGig(input: {}) { id } }",
        variables: {}
      })
    });
    var text = await response.text();
    return JSON.stringify({status: response.status, body: text.slice(0,200), csrf: csrf});
  } catch(e) {
    return JSON.stringify({error: e.message});
  }
})()
'@

$jsonObj = @{ action = "evaluate"; script = $saveMutation }
$json = $jsonObj | ConvertTo-Json -Compress
paw browser-action $json
