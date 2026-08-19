# Step 1: Get form inputs
$innerScript = '(function(){var inputs=document.querySelectorAll("input");var results=[];for(var i=0;i<inputs.length;i++){var el=inputs[i];var rect=el.getBoundingClientRect();results.push({idx:i,type:el.type||"none",placeholder:el.placeholder||"",class:el.className.slice(0,60),x:Math.round(rect.x+rect.width/2),y:Math.round(rect.y+rect.height/2)});}return JSON.stringify(results);})()'

$jsonObj = @{ action = "evaluate"; script = $innerScript }
$json = $jsonObj | ConvertTo-Json -Compress
Write-Host "=== Getting form inputs ==="
paw browser-action $json
