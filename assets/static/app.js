!function(e){var t={};function n(o){if(t[o])return t[o].exports;var r=t[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,n),r.l=!0,r.exports}n.m=e,n.c=t,n.d=function(e,t,o){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(o,r,function(t){return e[t]}.bind(null,r));return o},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=2)}([function(e,t,n){},,function(e,t,n){"use strict";n.r(t);const o=(e,t)=>(t?e:document).querySelector(t||e),r=(e,t)=>Array.from((t?e:document).querySelectorAll(t||e)),a=e=>Math.floor(Math.random()*e.length),i=e=>e[a(e)],l={YlGn:["#addd8e","#89cc7d","#65bb6d","#41ab5d"],GnBu:["#7bccc4","#4eb3d3","#2b8cbe","#0868ac"],BuPu:["#8c96c6","#8c6bb1","#88419d","#810f7c"],PuRd:["#e7298a","#ce1256","#980043","#67001f"],RdPu:["#f768a1","#dd3497","#ae017e","#7a0177"],YlOrRd:["#feb24c","#fd8d3c","#fc4e2a","#e31a1c"]},s={Pu:["#807dba","#7160ab","#62439d","#54278f"],Bu:["#4292c6","#2e7cb8","#1b66aa","#08519c"],Gn:["#41ab5d","#2b964c","#15813c","#006d2c"],Or:["#f16913","#d8580d","#bf4708","#a63603"],Rd:["#fb6a4a","#ef3b2c","#cb181d","#a50f15"]},c={...l,...s,...{red:["#f00"],green:["#0c0"],blue:["#00f"],black:["#000"],white:["#fff"]},get random(){return(e=>e[i(Object.keys(e))])(l)}},d=e=>{let t=new Uint8ClampedArray(3);return"#"===e[0]&&(e=e.slice(1)),6===e.length?(t[0]=parseInt(e.slice(0,2),16),t[1]=parseInt(e.slice(2,4),16),t[2]=parseInt(e.slice(4),16)):(t[0]=17*parseInt(e[0],16),t[1]=17*parseInt(e[1],16),t[2]=17*parseInt(e[2],16)),t},h=e=>"#"+Array.from(e).map(e=>((e,t,n)=>e.length<n?new Array(n-e.length+1).join(t)+e:e)(e.toString(16),0,2)).join(""),f=(e,t,n)=>{let o=new Array(n);e=Array.from(d(e));const r=[(t=d(t))[0]-e[0],t[1]-e[1],t[2]-e[2]],a=(e,t,o)=>{let a=Math.floor(t+(e+1)*r[o]/n).toString(16);return a.length<2?"0"+a:a};for(let t=0;t<o.length;t++)o[t]="#"+e.map(a.bind(void 0,t)).join("");return o},g=e=>(Math.max(...e)+Math.min(...e))/510,u=(e,t,n=.5)=>e.map((e,o)=>e+(t[o]-e)*n),m=e=>{const{width:t,height:n,color_fcn:o,cell_size:r,variance:a}={width:600,height:400,color_fcn:([e,t])=>"#000",cell_size:75,variance:.75,...e},i=((e,t,n,o,r,a,i)=>{for(var l=e+n,s=t+o,c=.5*r,d=2*a,h=-a,f=[],g=-n;g<l;g+=r)for(var u=-o;u<s;u+=r){var m=g+c+(i()*d+h),p=u+c+(i()*d+h);f.push([Math.floor(m),Math.floor(p)])}return f})(t,n,(Math.floor((t+4*r)/r)*r-t)/2,(Math.floor((n+4*r)/r)*r-n)/2,r,r*a/2,Math.random),l=Delaunator.from(i).triangles;let s=[];for(let e=0;e<l.length;e+=3){const t=[i[l[e]],i[l[e+1]],i[l[e+2]]],n=o([(t[0][0]+t[1][0]+t[2][0])/3,(t[0][1]+t[1][1]+t[2][1])/3]);s.push([n,t])}return s},p=window.trianglify=((e,t,n=!1,r=32)=>{let i,l=o(e,".text-wrap"),s=l.parentNode,c=l.textContent,d="mask-"+e.getAttribute("id"),{width:h,height:g}=l.getBoundingClientRect(),u=document.createElement("canvas"),p=u.getContext("2d"),y=[],w=0,b=m({width:h,height:g,cell_size:r,variance:.69});const v=`<span class="trianglify-text" style="width:${h+2}px;height:${g+2}px">\n  <svg class="trianglify-svg" xmlns="http://www.w3.org/2000/svg">\n    <defs>\n      <mask id="${d}" x="0" y="0" width="100%" height="100%">\n        <rect x="0" y="0" width="100%" height="100%"></rect>\n        <text x="0" y="0" dy=".95em">${((e,t)=>{const n="http://www.w3.org/2000/svg",o={A:-.0078,B:.0625,C:.0391,D:.0625,E:.0625,F:.0625,G:.0391,H:.0625,I:.0625,J:.0313,K:.0625,L:.0625,M:.0625,N:.0625,O:.0391,P:.0625,Q:.0391,R:.0625,S:.0156,U:.0547,V:.0156,W:.0078,Z:.0625};let r,a=e.split(/\s/),i=[],l=Math.ceil(t.getBoundingClientRect().width),s=parseInt(window.getComputedStyle(t,null).fontSize)>72,c=[],d=.95,h=document.createElementNS(n,"svg"),f=document.createElementNS(n,"text"),g=document.createElementNS(n,"tspan");for(g.setAttributeNS(n,"x",0),g.setAttributeNS(n,"y",0),f.appendChild(g),h.appendChild(f),t.appendChild(h);r=a.shift();)i.push(r),g.textContent=i.join(" "),g.getComputedTextLength()>l&&(i.pop(),c.push(`<tspan x="0" y="0" dx="${s&&-o[i[0][0]]||0}em" dy="${d}em">${i.join(" ")}</tspan>`),i=[r],d+=1);return c.push(`<tspan x="0" y="0" dx="${s&&-o[i[0][0]]||0}em" dy="${d}em">${i.join(" ")}</tspan>`),t.removeChild(h),c.join("")})(c,l)}</text>\n      </mask>\n    </defs>\n    <rect x="0" y="0" width="100%" height="100%" fill="white" mask="url(#${d})"/>\n</span>\n<span class="trianglify-ghost-text">${c}</span>`,x=e=>{i=e,b=b.map(e=>[a(i),e[1]]),y=new Array(b.length);for(const[e,[t,o]]of b.entries())if(p.fillStyle=p.strokeStyle=i[t],p.beginPath(),p.moveTo(...o[0]),p.lineTo(...o[1]),p.lineTo(...o[2]),p.fill(),p.stroke(),n&&Math.random()<.1){const n=a(i);y[e]=[0,f(i[t],i[n],75),o],b[e][0]=n}};if(p.lineWidth=.001,e.style.position="relative",e.style.height=g+2+"px",e.style.width=h+2+"px",e.classList.add("trianglify-rendered"),u.width=h,u.height=g,u.className="trianglify-canvas",x(t),s.removeChild(l),s.insertAdjacentHTML("beforeend",v),s.appendChild(u),n){const e=t=>{for(const[e,t]of y.entries()){if(!t)continue;const[n,o,r]=t;p.fillStyle=p.strokeStyle=o[n],p.beginPath(),p.moveTo(...r[0]),p.lineTo(...r[1]),p.lineTo(...r[2]),p.fill(),p.stroke(),n+1<o.length?y[e][0]=n+1:delete y[e]}if(t-w>500){for(const[e,[t,n]]of b.entries())if(!y[e]&&Math.random()<.03){const o=a(i);y[e]=[0,f(i[t],i[o],75),n],b[e][0]=o}w=t}return requestAnimationFrame(e)};e(0)}return{canvas:u,changeColorSet:x}}),y=()=>{const e=o("#site-header__bar"),t=e.getContext("2d");let n;const r=()=>{const r=o("#site-header").getBoundingClientRect().width,i=[s.Or[1],s.Rd[1],s.Pu[1],s.Bu[1],s.Gn[1]].map(d);e.width=r,n=m({width:r,height:e.height,cell_size:15,color_fcn:([e])=>h(((e,t=40)=>e.map(e=>e+t*(Math.random()-.5)))(((e,t=.035,n=.5)=>{let o=0,r=0,a=0,i=0,l=1/(e.length-1),s=0;for(let o of e)i+=Math.exp(-(n-s)*(n-s)/(2*t))/Math.sqrt(2*Math.PI*t),s+=l;s=0;for(let c of e){let e=Math.exp(-(n-s)*(n-s)/(2*t))/Math.sqrt(2*Math.PI*t);s+=l,o+=c[0]*e/i,r+=c[1]*e/i,a+=c[2]*e/i}return new Uint8ClampedArray([o,r,a])})(i,.015,e/r),50)),variance:1}),a(),t.lineWidth=1.51},a=()=>{for(const[e,o]of n)t.fillStyle=t.strokeStyle=e,t.beginPath(),t.moveTo(...o[0]),t.lineTo(...o[1]),t.lineTo(...o[2]),t.fill(),t.stroke()};return r(),{init:r,changeBarColors:e=>{for(const[,o]of n)t.fillStyle=t.strokeStyle=i(e),t.globalAlpha=.2*Math.random()+.8,t.beginPath(),t.moveTo(...o[0]),t.lineTo(...o[1]),t.lineTo(...o[2]),t.fill(),t.stroke();t.globalAlpha=1},resetBarColors:a}};let w,b,v,x;window.addEventListener("load",()=>{if(o("#title.trianglify")){let e,t=o("#title.trianglify");w=t.dataset.clr||i(Object.keys(l)),e=c[w];const{canvas:n,changeColorSet:a}=p(t,e,!0);b=n,v=a;for(const t of r("#header .subtitle a"))t.style.color=e[2],t.classList.contains("resume-link")&&(t.style.color=e[3]);t.dataset.hasOwnProperty("changeable")&&"false"!==t.dataset.changeable&&(t.onclick=(()=>{const t=Object.keys(l);~t.indexOf(w)&&t.splice(t.indexOf(w),1),w=i(t),v(e=l[w]);for(const t of r("#header .subtitle a"))t.style.color=e[2],t.classList.contains("resume-link")&&(t.style.color=e[3])})),t.classList.remove("trianglify")}for(const e of r(".trianglify"))p(e,c[e.dataset.clr||i(Object.keys(l))]),e.classList.remove("trianglify");if(o("#site-header__bar")){const{init:e,changeBarColors:t,resetBarColors:n}=y();for(const e of r("#site-header dt a"))e.addEventListener("mouseover",()=>{t(c[e.parentNode.dataset.clr].slice(0,3))}),e.addEventListener("mouseout",()=>{n()});x=e}});let S,C=window.innerWidth;window.addEventListener("resize",()=>{window.innerWidth!==C&&(clearTimeout(S),S=setTimeout(()=>{if(o("#title.trianglify")){let e=o("#title.trianglify"),t=Array.prototype.slice.call(e.childNodes);for(const n of t)"trianglify-text"===n.className||"trianglify-canvas"===n.className?e.removeChild(n):"trianglify-ghost-text"===n.className&&(n.className="text-wrap");e.setAttribute("style","");const{canvas:n,changeColorSet:r}=p(e,c[w],!0);b=n,v=r}x()},Math.abs(window.innerWidth-C)>100?0:100),C=window.innerWidth)});n(0);if(o("#toggle-theme").addEventListener("click",function(e){e.preventDefault();let t,n=localStorage.getItem("theme")||"light";t="dark"===n?"light":"dark",this.textContent=`Switch to ${n} mode`,document.documentElement.dataset.theme=t,localStorage.setItem("theme",t)}),"dark"===localStorage.getItem("theme")&&(o("#toggle-theme").textContent="Switch to light mode"),o(".showcase")){for(const[e,t]of r(".showcase").entries()){const e=c[t.dataset.clr||"random"]||[t.dataset.clr],n=e.length>1?i(e):e[0],r=g(d(n))>.5?"#222":"#fff",a=t.getBoundingClientRect();async function k(){const e=o(t,".showcase-canvas"),r=e.getContext("2d"),l=[[102,102,102],[119,119,119],[136,136,136],[153,153,153]].map(e=>h(u(d(n),e,.3))),s=m({width:a.width,height:a.height,color_fcn:()=>i(l)});e.width=a.width,e.height=a.height;for(const[e,t]of s)r.fillStyle=r.strokeStyle=e,r.beginPath(),r.moveTo(...t[0]),r.lineTo(...t[1]),r.lineTo(...t[2]),r.fill(),r.stroke()}t.style.setProperty("--bg-color",n),t.style.setProperty("--fg-color",r),t.style.height=a.height+"px",t.classList.add("loaded"),k()}o(".showcase-show-more").addEventListener("click",e=>{e.preventDefault(),o(".showcase-more").classList.remove("hidden"),o(".showcase-show-more").classList.add("hidden")}),o(".showcase-show-less").addEventListener("click",e=>{e.preventDefault(),o(".showcase-more").classList.add("hidden"),o(".showcase-show-more").classList.remove("hidden")}),o(".showcase-more").classList.add("hidden")}}]);