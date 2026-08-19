$innerScript = '(function(){var iframes=document.querySelectorAll("iframe");var results=[];for(var i=0;i<iframes.length;i++){var rect=iframes[i].getBoundingClientRect();if(rect.width>100 && rect.height>50){results.push({title:iframes[i].title||"none",x:Math.round(rect.x),y:Math.round(rect.y),w:Math.round(rect.width),h:Math.round(rect.height)});}}return JSON.stringify(results,null,2);})()'

$jsonObj = @{ action = "evaluate"; script = $innerScript }
$json = $jsonObj | ConvertTo-Json -Compress
paw browser-action $json
