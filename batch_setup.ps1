# Helper to run JS in the browser
function Run-JS($js) {
    $escaped = $js -replace '"', '\"'
    $cmd = '{"action":"evaluate","script":"' + $escaped + '"}'
    paw browser-action $cmd
}

# Step 1: Fill title
Run-JS "(function(){var ta=document.querySelector('textarea.gig-title-textarea');if(ta){ta.focus();var ns=Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value').set;ns.call(ta,'write ATS optimized resumes with JD keyword gap');var ie=document.createEvent('HTMLEvents');ie.initEvent('input',true,true);ta.dispatchEvent(ie);ta.dispatchEvent(new Event('change',{bubbles:true}));return 'title set: '+ta.value;}return 'no textarea';})()"
Start-Sleep -2

# Step 2: Open category dropdown
Run-JS "(function(){var controls=document.querySelectorAll('.category-selector__control');if(controls.length<1)return 'no category control';controls[0].dispatchEvent(new MouseEvent('mousedown',{bubbles:true,cancelable:true,view:window}));controls[0].dispatchEvent(new MouseEvent('mouseup',{bubbles:true,cancelable:true,view:window}));controls[0].dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));return 'clicked category';})()"
Start-Sleep -2

# Step 3: Click "Writing & Translation" option
Run-JS "(function(){var menu=document.querySelector('[class*=category-selector__menu]');if(!menu)return 'no menu';var spans=menu.querySelectorAll('span.cat-name');for(i=0;i<spans.length;i++){if(spans[i].textContent.trim()==='Writing & Translation'){spans[i].dispatchEvent(new MouseEvent('mousedown',{bubbles:true}));spans[i].dispatchEvent(new MouseEvent('mouseup',{bubbles:true}));spans[i].dispatchEvent(new MouseEvent('click',{bubbles:true}));return 'clicked Writing';}}return 'not found';})()"
Start-Sleep -2

# Step 4: Open subcategory dropdown
Run-JS "(function(){var controls=document.querySelectorAll('.category-selector__control, .subcategory-selector__control');var subControl=controls[1];if(!subControl)return 'no sub control';var r=subControl.getBoundingClientRect();subControl.dispatchEvent(new MouseEvent('mousedown',{bubbles:true,cancelable:true,view:window,clientX:r.x+50,clientY:r.y+20}));subControl.dispatchEvent(new MouseEvent('mouseup',{bubbles:true,cancelable:true,view:window,clientX:r.x+50,clientY:r.y+20}));subControl.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window,clientX:r.x+50,clientY:r.y+20}));return 'clicked subcategory';})()"
Start-Sleep -2

# Step 5: Click "Resume Writing" option
Run-JS "(function(){var menus=document.querySelectorAll('[class*=category-selector__menu]');var found=false;for(m=0;m<menus.length;m++){var opts=menus[m].querySelectorAll('.cat-name');for(i=0;i<opts.length;i++){if(opts[i].textContent.trim()==='Resume Writing'){opts[i].dispatchEvent(new MouseEvent('mousedown',{bubbles:true}));opts[i].dispatchEvent(new MouseEvent('mouseup',{bubbles:true}));opts[i].dispatchEvent(new MouseEvent('click',{bubbles:true}));found=true;break}}if(found)break}return found?'clicked Resume Writing':'not found';})()"
Start-Sleep -2

# Step 6: Set tags
Run-JS "(function(){var input=document.querySelector('.react-tags__search-input input');if(!input)return 'no tag input';input.focus();var ns=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;ns.call(input,'ats resume');input.dispatchEvent(new Event('input',{bubbles:true}));return 'typed: '+input.value;})()"
Start-Sleep -1
Run-JS "(function(){var input=document.querySelector('.react-tags__search-input input');if(!input)return 'no input';input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',keyCode:13,bubbles:true}));input.dispatchEvent(new KeyboardEvent('keypress',{key:'Enter',keyCode:13,bubbles:true}));input.dispatchEvent(new KeyboardEvent('keyup',{key:'Enter',keyCode:13,bubbles:true}));return 'pressed Enter, value: '+input.value;})()"
Start-Sleep -2

# Step 7: Handle English checkbox
Run-JS "(function(){var cb=document.querySelector('input[name=language][value=en], [id*=language-en], [data-testid*=en]');if(!cb)return 'no EN checkbox checked';return 'lang: '+(cb.checked?'checked':'unchecked');})()"

# Step 8: Save via API
Run-JS "(function(){var saveBtn=document.querySelector('button Save, [class*=save]');return saveBtn?saveBtn.outerHTML:'no button';})()"

Write-Host "=== BATCH DONE ==="
