$inner = @'
(async () => {
  const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
  const nativeInputSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  
  const textareas = document.querySelectorAll('textarea');
  const inputs = document.querySelectorAll('input');
  
  const hiddenMap = {};
  inputs.forEach(inp => {
    if (inp.type === 'hidden' && inp.name) {
      hiddenMap[inp.name] = inp;
    }
  });
  
  function taSet(el, val) {
    if (!el) return false;
    nativeSetter.call(el, val);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }
  
  function inputSet(el, val) {
    if (!el) return false;
    nativeInputSetter.call(el, val);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }
  
  const nameTas = Array.from(textareas).filter(t => t.placeholder && t.placeholder.includes('Name your package'));
  const descTas = Array.from(textareas).filter(t => t.placeholder && t.placeholder.includes('Describe the details'));
  
  const pkg1 = { name: 'ATS-Optimized Resume (Basic)', desc: '1 tailored resume with Job Description keyword gap analysis. Delivered as editable file.', price: '15', days: '2' };
  const pkg2 = { name: 'Resume + Cover Letter (Standard)', desc: '1 tailored resume + matching cover letter + LinkedIn profile optimization.', price: '35', days: '3' };
  const pkg3 = { name: 'Full Career Package (Premium)', desc: 'Resume + cover letter + LinkedIn + career coaching notes. Priority support & 3 revisions.', price: '75', days: '5' };
  
  const r1 = nameTas.length >= 3 && taSet(nameTas[0], pkg1.name) && taSet(nameTas[1], pkg2.name) && taSet(nameTas[2], pkg3.name);
  const r2 = descTas.length >= 3 && taSet(descTas[0], pkg1.desc) && taSet(descTas[1], pkg2.desc) && taSet(descTas[2], pkg3.desc);
  
  inputSet(hiddenMap['gig[packages][1][title]'], pkg1.name);
  inputSet(hiddenMap['gig[packages][1][description]'], pkg1.desc);
  inputSet(hiddenMap['gig[packages][1][price]'], pkg1.price);
  inputSet(hiddenMap['gig[packages][1][duration]'], pkg1.days);
  
  inputSet(hiddenMap['gig[packages][2][title]'], pkg2.name);
  inputSet(hiddenMap['gig[packages][2][description]'], pkg2.desc);
  inputSet(hiddenMap['gig[packages][2][price]'], pkg2.price);
  inputSet(hiddenMap['gig[packages][2][duration]'], pkg2.days);
  
  inputSet(hiddenMap['gig[packages][3][title]'], pkg3.name);
  inputSet(hiddenMap['gig[packages][3][description]'], pkg3.desc);
  inputSet(hiddenMap['gig[packages][3][price]'], pkg3.price);
  inputSet(hiddenMap['gig[packages][3][duration]'], pkg3.days);
  
  return JSON.stringify({
    nameTA: nameTas.length, descTA: descTas.length,
    pkg1: hiddenMap['gig[packages][1][title]'].value,
    price1: hiddenMap['gig[packages][1][price]'].value,
    dur1: hiddenMap['gig[packages][1][duration]'].value,
    pkg2: hiddenMap['gig[packages][2][title]'].value,
    price2: hiddenMap['gig[packages][2][price]'].value,
    pkg3: hiddenMap['gig[packages][3][title]'].value,
    price3: hiddenMap['gig[packages][3][price]'].value,
    hiddenCount: Object.keys(hiddenMap).length
  });
})()
'@

$jsonObj = @{ action = "evaluate"; script = $inner }
$json = $jsonObj | ConvertTo-Json -Compress
paw browser-action $json
