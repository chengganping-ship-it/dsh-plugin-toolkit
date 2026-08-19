function Invoke-BrowserJS($js) {
    $escaped = $js -replace '"', '\"'
    $json = '{"action":"evaluate","script":"' + $escaped + '"}'
    return (paw browser-action $json 2>&1) | Out-String
}

# Find and click the visible placeholder
$js = "(function(){var ph=document.querySelector('.category-selector__placeholder');if(!ph)return 'no placeholder';var r=ph.getBoundingClientRect();ph.click();return 'clicked placeholder at '+Math.round(r.x)+','+Math.round(r.y)})()"
$r = Invoke-BrowserJS $js
Write-Host "Placeholder click: $r"

Start-Sleep -Seconds 2

# Check for options
$js2 = "(function(){var spans=document.querySelectorAll('span.cat-name');return 'count: '+spans.length})()"
$r = Invoke-BrowserJS $js2
Write-Host "Cat-name: $r"

# If not found, try another selector for menu items
$js3 = "(function(){var menu=document.querySelector('[class*=selector__menu]');if(!menu||menu.offsetHeight===0)return 'no menu visible';var items=menu.querySelectorAll('*');var texts=[];for(i=0;i<items.length;i++){if(items[i].children.length===0&&items[i].textContent.trim())texts.push(items[i].textContent.trim().substring(0,30))}return JSON.stringify(texts.slice(0,15))})()"
$r = Invoke-BrowserJS $js3
Write-Host "Menu items: $r"
