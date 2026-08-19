function Invoke-BrowserJS($js) {
    $escaped = $js -replace '"', '\"'
    $json = '{"action":"evaluate","script":"' + $escaped + '"}'
    return (paw browser-action $json 2>&1) | Out-String
}

# Click category control
$r = Invoke-BrowserJS "(function(){var c=document.querySelector('.category-selector__control');c.dispatchEvent(new MouseEvent('mousedown',{bubbles:true}));c.click();return'clicked'})()"
Write-Host "Click: $r"

Start-Sleep -Seconds 2

# Check all visible menus
$jsCheck = "(function(){var m=document.querySelectorAll('[class*=menu]');var v=[];for(i=0;i<m.length;i++){var r=m[i].getBoundingClientRect();if(r.height>50)v.push({cls:m[i].className.substring(0,50),h:Math.round(r.height),y:Math.round(r.y),txt:m[i].textContent.replace(/\s+/g,' ').substring(0,80)})}return JSON.stringify(v)})()"
$r = Invoke-BrowserJS $jsCheck
Write-Host "Menus: $r"

# Specifically check for span.cat-name
$jsCheck2 = "(function(){var s=document.querySelectorAll('span.cat-name');return 'cat-name count: '+s.length})()"
$r = Invoke-BrowserJS $jsCheck2
Write-Host "CatName: $r"

# Check the entire body for anything with class 'cat-name'
$jsCheck3 = "(function(){var s=document.querySelectorAll('[class*=cat]');var c=[];for(i=0;i<s.length;i++){c.push(s[i].className.substring(0,40)+': '+s[i].textContent.substring(0,30))}return JSON.stringify(c.slice(0,15))})()"
$r = Invoke-BrowserJS $jsCheck3
Write-Host "Cat elements: $r"
