(function() {
  var all = document.querySelectorAll('input');
  var filled = {};
  for (var i = 0; i < all.length; i++) {
    var el = all[i];
    var p = el.placeholder;
    var l = (el.closest('div')?.querySelector('label')?.innerText || '').substring(0, 30);
    
    if (p === '121000497' && !filled.routing) {
      el.value = '031100209';
      el.dispatchEvent(new Event('input', {bubbles: true}));
      filled.routing = true;
    } else if (p === '1234567890' && !filled.account) {
      el.value = '70588910002548736';
      el.dispatchEvent(new Event('input', {bubbles: true}));
      filled.account = true;
    } else if (p === '1234567890' && filled.account && !filled.confirm) {
      el.value = '70588910002548736';
      el.dispatchEvent(new Event('input', {bubbles: true}));
      filled.confirm = true;
    } else if (p === '••••') {
      el.value = '1234';
      el.dispatchEvent(new Event('input', {bubbles: true}));
      filled.ssn = true;
    } else if (l.indexOf('First name') >= 0 && !filled.fname) {
      el.value = 'Ganping';
      el.dispatchEvent(new Event('input', {bubbles: true}));
      filled.fname = true;
    } else if (l.indexOf('Last name') >= 0 && !filled.lname) {
      el.value = 'Cheng';
      el.dispatchEvent(new Event('input', {bubbles: true}));
      filled.lname = true;
    } else if (l.indexOf('Address') >= 0 && !filled.addr) {
      el.value = '1234 Innovation Drive';
      el.dispatchEvent(new Event('input', {bubbles: true}));
      filled.addr = true;
    } else if (l.indexOf('City') >= 0 && !filled.city) {
      el.value = 'San Francisco';
      el.dispatchEvent(new Event('input', {bubbles: true}));
      filled.city = true;
    } else if (l.indexOf('Postal') >= 0 && !filled.zip) {
      el.value = '94105';
      el.dispatchEvent(new Event('input', {bubbles: true}));
      filled.zip = true;
    } else if (l.indexOf('Pay to') >= 0 && !filled.payto) {
      el.value = 'Ganping Cheng';
      el.dispatchEvent(new Event('input', {bubbles: true}));
      filled.payto = true;
    } else if (el.type === 'tel' && !filled.phone) {
      el.value = '4155551234';
      el.dispatchEvent(new Event('input', {bubbles: true}));
      filled.phone = true;
    }
  }
  return JSON.stringify(filled);
})();
