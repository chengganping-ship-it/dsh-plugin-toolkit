$js = '(function(){var iframes=document.querySelectorAll("iframe");var results=[];for(var i=0;i<iframes.length;i++){var rect=iframes[i].getBoundingClientRect();if(rect.width>100 && rect.height>50){results.push({title:iframes[i].title||"none",x:Math.round(rect.x),y:Math.round(rect.y),w:Math.round(rect.width),h:Math.round(rect.height)});}}return JSON.stringify(results,null,2);})()'

# Escape for JSON
$escaped = $js -replace '\\', '\\\\' -replace '"', '\"' -replace "`n", '\n' -replace "`r", '\r' -replace "`t", '\t'
$json = "{ `"action`": `"evaluate`", `"script`": `"$escaped`" }"
Write-Host "JSON: $json"
paw browser-action $json
