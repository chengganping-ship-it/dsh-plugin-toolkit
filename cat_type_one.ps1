$js = "(function(){var i=document.activeElement;if(i&&i.tagName==='INPUT'){var s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;s.call(i,'Writing');i.dispatchEvent(new Event('input',{bubbles:true}));return 'typed:'+i.value;}return 'no input';})()"
$cmd = '{"action":"evaluate","script":"' + $js.Replace('"','\"') + '"}'
paw browser-action $cmd
