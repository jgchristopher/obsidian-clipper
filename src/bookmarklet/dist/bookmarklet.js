(()=>{var n,o,e;n=encodeURIComponent("~WithComment~"),o=encodeURIComponent("~VaultNameFiller~"),e=encodeURIComponent("~NotePath~"),function(t,c,a){if("true"===n)!function(n,t,c){var a=window.prompt("Add you comment...");a&&(a=encodeURIComponent(a));var i="obsidian://obsidian-clipper?vault=".concat(o,"&notePath=").concat(e,"&url=").concat(encodeURIComponent(n),"&title=").concat(encodeURIComponent(t),"&format=html&highlightdata=").concat(encodeURIComponent(c),"&comment=").concat(a);console.log(a),document.location.href=i}(t,c,a);else{var i="obsidian://obsidian-clipper?vault=".concat(o,"&notePath=").concat(e,"&url=").concat(encodeURIComponent(t),"&title=").concat(encodeURIComponent(c),"&format=html&highlightdata=").concat(encodeURIComponent(a));document.location.href=i}}(document.URL,document.title,function(){var n="";if(void 0!==window.getSelection){var o=window.getSelection();if(o&&o.rangeCount){for(var e=document.createElement("div"),t=0,c=o.rangeCount;t<c;++t)e.appendChild(o.getRangeAt(t).cloneContents());n=e.innerHTML}}return n}())})();