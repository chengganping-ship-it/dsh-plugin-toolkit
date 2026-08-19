(function() {
    var pxdivs = document.querySelectorAll('div');
    var removed = [];
    for (var i = 0; i < pxdivs.length; i++) {
        var d = pxdivs[i];
        var id = d.id || '';
        var cls = d.className || '';
        if (id.indexOf('px') !== -1 || cls.indexOf('px') !== -1 || cls.indexOf('captcha') !== -1) {
            removed.push(d.tagName + '#' + d.id + '.' + d.className.substring(0,50));
            d.parentNode.removeChild(d);
        }
    }
    return removed.length > 0 ? 'removed: ' + removed.join('; ') : 'no px divs';
})()
