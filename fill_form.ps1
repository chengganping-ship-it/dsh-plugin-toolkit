$innerScript = '(function(){var inputs=document.querySelectorAll("input[type=text], input:not([type]), textarea");var results=[];for(var i=0;i<inputs.length;i++){var el=inputs[i];var rect=el.getBoundingClientRect();results.push({tag:el.tagName,type:el.type||"none",placeholder:el.placeholder||"",name:el.name||"",class:el.className.slice(0,50),x:Math.round(rect.x),y:Math.round(rect.y),w:Math.round(rect.width),h:Math.round(rect.height)});}return JSON.stringify(results);})()'

$jsonObj = @{ action = "evaluate"; script = $innerScript }
$json = $jsonObj | ConvertTo-Json -Compress
paw browser-action $json
