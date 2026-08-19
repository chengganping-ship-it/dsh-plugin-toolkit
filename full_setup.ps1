function Invoke-BrowserJS($js) {
    $escaped = $js -replace '"', '\"'
    $json = '{"action":"evaluate","script":"' + $escaped + '"}'
    return (paw browser-action $json 2>&1) | Out-String
}

# Step 1: Title
$r = Invoke-BrowserJS "(function(){var ta=document.querySelector('textarea.gig-title-textarea');if(!ta)return'no ta';ta.focus();var ns=Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value').set;ns.call(ta,'write ATS optimized resumes with JD keyword gap');ta.dispatchEvent(new Event('input',{bubbles:true}));return'title:'+ta.value})()"
Write-Host "STEP1: $r"
Start-Sleep -Seconds 1

# Step 2: Category click
$r = Invoke-BrowserJS "(function(){var c=document.querySelectorAll('.category-selector__control');if(!c[0])return'no cat';c[0].dispatchEvent(new MouseEvent('mousedown',{bubbles:true}));c[0].dispatchEvent(new MouseEvent('mouseup',{bubbles:true}));c[0].click();return'cat clicked'})()"
Write-Host "STEP2: $r"
Start-Sleep -Seconds 2

# Step 3: Select Writing & Translation
$r = Invoke-BrowserJS "(function(){var spans=document.querySelectorAll('[class*=category-selector__menu] span.cat-name');for(i=0;i<spans.length;i++){if(spans[i].textContent.trim()==='Writing & Translation'){spans[i].click();return'clicked Writing'}}return'not found'})()"
Write-Host "STEP3: $r"
Start-Sleep -Seconds 2

# Step 4: Open subcategory
$r = Invoke-BrowserJS "(function(){var c=document.querySelectorAll('.category-selector__control,.subcategory-selector__control');var sc=c[1];if(!sc)return'no sub';var r=sc.getBoundingClientRect();sc.dispatchEvent(new MouseEvent('mousedown',{bubbles:true,clientX:r.x+30,clientY:r.y+15}));sc.dispatchEvent(new MouseEvent('mouseup',{bubbles:true,clientX:r.x+30,clientY:r.y+15}));sc.click();return'sub clicked'})()"
Write-Host "STEP4: $r"
Start-Sleep -Seconds 2

# Step 5: Select Resume Writing
$r = Invoke-BrowserJS "(function(){var spans=document.querySelectorAll('[class*=category-selector__menu] span.cat-name');for(i=0;i<spans.length;i++){if(spans[i].textContent.trim()==='Resume Writing'){spans[i].click();return'clicked Resume'}}return'not found'})()"
Write-Host "STEP5: $r"
Start-Sleep -Seconds 2

# Step 6: Verify
$r = Invoke-BrowserJS "(function(){var ta=document.querySelector('textarea.gig-title-textarea');var cat=document.querySelectorAll('.category-selector__control,.subcategory-selector__control');return JSON.stringify({title:ta?ta.value:'',cat:cat.length>0?cat[0].textContent:'',sub:cat.length>1?cat[1].textContent:''})})()"
Write-Host "VERIFY: $r"
