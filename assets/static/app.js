!function(e){var t={};function n(i){if(t[i])return t[i].exports;var a=t[i]={i:i,l:!1,exports:{}};return e[i].call(a.exports,a,a.exports,n),a.l=!0,a.exports}n.m=e,n.c=t,n.d=function(e,t,i){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:i})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var i=Object.create(null);if(n.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var a in e)n.d(i,a,function(t){return e[t]}.bind(null,a));return i},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=2)}([function(e,t,n){},,function(e,t,n){"use strict";n.r(t);const i=(e,t)=>(t?e:document).querySelector(t||e),a=(e,t)=>Array.from((t?e:document).querySelectorAll(t||e)),r=e=>Math.floor(Math.random()*e.length),o=e=>e[r(e)],s={A:.0078,B:-.0625,C:-.0391,D:-.0625,E:-.0625,F:-.0625,G:-.0391,H:-.0625,I:-.0625,J:-.0313,K:-.0625,L:-.0625,M:-.0625,N:-.0625,O:-.0391,P:-.0625,Q:-.0391,R:-.0625,S:-.0156,U:-.0547,V:-.0156,W:-.0078,Z:-.0625},l={YlGn:["#addd8e","#89cc7d","#65bb6d","#41ab5d"],GnBu:["#7bccc4","#4eb3d3","#2b8cbe","#0868ac"],BuPu:["#8c96c6","#8c6bb1","#88419d","#810f7c"],PuRd:["#e7298a","#ce1256","#980043","#67001f"],RdPu:["#f768a1","#dd3497","#ae017e","#7a0177"],YlOrRd:["#feb24c","#fd8d3c","#fc4e2a","#e31a1c"]},c={...l,...{Pu:["#807dba","#7160ab","#62439d","#54278f"],Bu:["#4292c6","#2e7cb8","#1b66aa","#08519c"],Gn:["#41ab5d","#2b964c","#15813c","#006d2c"],Or:["#f16913","#d8580d","#bf4708","#a63603"],Rd:["#fb6a4a","#ef3b2c","#cb181d","#a50f15"]},...{red:["#f00"],green:["#0c0"],blue:["#00f"],black:["#000"],white:["#fff"]},get random(){return(e=>e[o(Object.keys(e))])(l)}},d=e=>{let t=new Uint8ClampedArray(3);return"#"===e[0]&&(e=e.slice(1)),6===e.length?(t[0]=parseInt(e.slice(0,2),16),t[1]=parseInt(e.slice(2,4),16),t[2]=parseInt(e.slice(4),16)):(t[0]=17*parseInt(e[0],16),t[1]=17*parseInt(e[1],16),t[2]=17*parseInt(e[2],16)),t},h=e=>"#"+Array.from(e).map(e=>((e,t,n)=>e.length<n?new Array(n-e.length+1).join(t)+e:e)(e.toString(16),0,2)).join(""),u=(e,t,n)=>{let i=new Array(n);e=Array.from(d(e));const a=[(t=d(t))[0]-e[0],t[1]-e[1],t[2]-e[2]],r=(e,t,i)=>{let r=Math.floor(t+(e+1)*a[i]/n).toString(16);return r.length<2?"0"+r:r};for(let t=0;t<i.length;t++)i[t]="#"+e.map(r.bind(void 0,t)).join("");return i},f=e=>(Math.max(...e)+Math.min(...e))/510,g=(e,t,n=.5)=>e.map((e,i)=>e+(t[i]-e)*n),m=e=>{const{width:t,height:n,color_fcn:i,cell_size:a,variance:r}={width:600,height:400,color_fcn:([e,t])=>"#000",cell_size:75,variance:.75,...e},o=((e,t,n,i,a,r,o)=>{for(var s=e+n,l=t+i,c=.5*a,d=2*r,h=-r,u=[],f=-n;f<s;f+=a)for(var g=-i;g<l;g+=a){var m=f+c+(o()*d+h),p=g+c+(o()*d+h);u.push([Math.floor(m),Math.floor(p)])}return u})(t,n,(Math.floor((t+4*a)/a)*a-t)/2,(Math.floor((n+4*a)/a)*a-n)/2,a,a*r/2,Math.random),s=Delaunator.from(o).triangles;let l=[];for(let e=0;e<s.length;e+=3){const t=[o[s[e]],o[s[e+1]],o[s[e+2]]],n=i([(t[0][0]+t[1][0]+t[2][0])/3,(t[0][1]+t[1][1]+t[2][1])/3]);l.push([n,t])}return l};var p={listeners:[],addListener(e){this.listeners.push(e)},run(){const e=this.listeners.slice();let t,n=window.innerWidth;window.addEventListener("resize",i=>{window.innerWidth!==n&&(clearTimeout(t),t=setTimeout(()=>{for(const t of e)t(i)},Math.abs(window.innerWidth-n)>100?0:100),n=window.innerWidth)}),delete this.listeners,delete this.addListener,delete this.run}};const y=window.trianglify=((e,t,n=!1,a=32)=>{let o,l=i(e,".text-wrap"),c=l.parentNode,d=l.textContent,h="mask-"+e.getAttribute("id"),{width:f,height:g}=l.getBoundingClientRect(),p=document.createElement("canvas"),y=p.getContext("2d"),w=[],b=0,v=m({width:f,height:g,cell_size:a,variance:.69});const x=`<span class="trianglify-text" style="width:${f+2}px;height:${g+2}px">\n  <svg class="trianglify-svg" xmlns="http://www.w3.org/2000/svg">\n    <defs>\n      <mask id="${h}" x="0" y="0" width="100%" height="100%">\n        <rect x="0" y="0" width="100%" height="100%"></rect>\n        <text x="0" y="0" dy=".95em">${((e,t)=>{const n="http://www.w3.org/2000/svg";let i,a=e.split(/\s/),r=[],o=Math.ceil(t.getBoundingClientRect().width),l=parseInt(window.getComputedStyle(t,null).fontSize)>72,c=[],d=.95,h=document.createElementNS(n,"svg"),u=document.createElementNS(n,"text"),f=document.createElementNS(n,"tspan");for(f.setAttributeNS(n,"x",0),f.setAttributeNS(n,"y",0),u.appendChild(f),h.appendChild(u),t.appendChild(h);i=a.shift();)r.push(i),f.textContent=r.join(" "),f.getComputedTextLength()>o&&(r.pop(),c.push(`<tspan x="0" y="0" dx="${l&&s[r[0][0]]||0}em" dy="${d}em">${r.join(" ")}</tspan>`),r=[i],d+=1);return c.push(`<tspan x="0" y="0" dx="${l&&s[r[0][0]]||0}em" dy="${d}em">${r.join(" ")}</tspan>`),t.removeChild(h),c.join("")})(d,l)}</text>\n      </mask>\n    </defs>\n    <rect x="0" y="0" width="100%" height="100%" fill="white" mask="url(#${h})"/>\n</span>\n<span class="trianglify-ghost-text">${d}</span>`,L=e=>{let t=o;o=e,v=v.map(e=>[r(o),e[1]]),w=new Array(v.length);for(const[e,[i,a]]of v.entries())n&&t?setTimeout(()=>{w[e]=[0,u(t[i],o[i],16),a]},Math.floor(690*Math.exp(-4*(Math.random()-1)**2)/Math.PI)):(y.fillStyle=y.strokeStyle=o[i],y.beginPath(),y.moveTo(...a[0]),y.lineTo(...a[1]),y.lineTo(...a[2]),y.fill(),y.stroke()),n&&Math.random()<.1&&setTimeout(()=>{const t=r(o);w[e]=[0,u(o[i],o[t],75),a],v[e][0]=t},500)};if(y.lineWidth=.001,e.style.position="relative",e.style.height=g+2+"px",e.style.width=f+2+"px",e.classList.add("trianglify-rendered"),p.width=f,p.height=g,p.className="trianglify-canvas",L(t),c.removeChild(l),c.insertAdjacentHTML("beforeend",x),c.appendChild(p),n){const e=t=>{for(const[e,t]of w.entries()){if(!t)continue;const[n,i,a]=t;y.fillStyle=y.strokeStyle=i[n],y.beginPath(),y.moveTo(...a[0]),y.lineTo(...a[1]),y.lineTo(...a[2]),y.fill(),y.stroke(),n+1<i.length?w[e][0]=n+1:delete w[e]}if(t-b>500){for(const[e,[t,n]]of v.entries())if(!w[e]&&Math.random()<.03){const i=r(o);w[e]=[0,u(o[t],o[i],75),n],v[e][0]=i}b=t}return requestAnimationFrame(e)};e(0)}return{canvas:p,changeColorSet:L}});let w,b,v=()=>{};window.addEventListener("load",()=>{if(i("#title.trianglify")){let e,t=i("#title.trianglify");w=t.dataset.clr||o(Object.keys(l)),e=c[w];const{canvas:n,changeColorSet:r}=y(t,e,!0);b=n,v=r;for(const t of a("#header .subtitle a"))t.style.color=e[2];t.dataset.hasOwnProperty("changeable")&&"false"!==t.dataset.changeable&&i(t,".clicky").addEventListener("click",t=>{t.preventDefault();const n=Object.keys(l);~n.indexOf(w)&&n.splice(n.indexOf(w),1),w=o(n),e=l[w];for(const t of a("#header .subtitle a"))t.style.color=e[2];v(e)}),t.classList.remove("trianglify")}for(const e of a(".trianglify"))y(e,c[e.dataset.clr||o(Object.keys(l))],e.dataset.hasOwnProperty("animate"),parseInt(e.dataset.cellSize)||void 0),e.classList.remove("trianglify")}),p.addListener(()=>{if(i("#title.trianglify-rendered")){let e=i("#title.trianglify-rendered .clicky")||i("#title.trianglify-rendered"),t=Array.prototype.slice.call(e.childNodes);for(const n of t)"trianglify-text"===n.className||"trianglify-canvas"===n.className?e.removeChild(n):"trianglify-ghost-text"===n.className&&(n.className="text-wrap");e.parentNode.setAttribute("style","");const{canvas:n,changeColorSet:a}=y(e.parentNode,c[w],!0);b=n,v=a}});n(0);{let e=i("#title:not(.trianglify)");e&&(e.style.textIndent=s[e.textContent[0]]+"em")}if(i("#toggle-theme").addEventListener("click",function(e){e.preventDefault();let t,n=localStorage.getItem("theme")||"light";t="dark"===n?"light":"dark",this.textContent=`Switch to ${n} mode`,document.documentElement.dataset.theme=t,localStorage.setItem("theme",t)}),"dark"===localStorage.getItem("theme")&&(i("#toggle-theme").textContent="Switch to light mode"),i(".site-header__menu-toggler")){let e=i("body").classList,t=i(".site-header__menu");i(".site-header__menu-toggler").addEventListener("click",function(n){n.preventDefault(),i(".site-header__menu-background").style.transform=e.contains("menu-open")?"scale(0)":`scale(${2*Math.sqrt(window.innerHeight*window.innerHeight+window.innerWidth*window.innerWidth)/5})`,e.contains("menu-open")?(e.remove("menu-open"),i("html").classList.remove("menu-open"),t.setAttribute("aria-hidden",!0),a(t,"a").forEach(e=>e.setAttribute("tabindex","-1")),this.setAttribute("aria-label","Open menu")):(e.add("menu-open"),i("html").classList.add("menu-open"),t.removeAttribute("aria-hidden"),a(t,"a").forEach(e=>e.removeAttribute("tabindex")),this.setAttribute("aria-label","Close menu"))})}if(i(".showcase")){for(const[e,t]of a(".showcase").entries()){const e=c[t.dataset.clr||"random"]||[t.dataset.clr],n=e.length>1?o(e):e[0],a=f(d(n))>.5?"#222":"#fff";let r=t.getBoundingClientRect();async function x(){const e=i(t,".showcase-canvas"),a=e.getContext("2d"),s=[[102,102,102],[119,119,119],[136,136,136],[153,153,153]].map(e=>h(g(d(n),e,.3))),l=m({width:r.width,height:r.height,color_fcn:()=>o(s)});e.width=r.width,e.height=r.height;for(const[e,t]of l)a.fillStyle=a.strokeStyle=e,a.beginPath(),a.moveTo(...t[0]),a.lineTo(...t[1]),a.lineTo(...t[2]),a.fill(),a.stroke()}if(t.style.setProperty("--bg-color",n),t.style.setProperty("--fg-color",a),t.style.height=r.height+"px",t.classList.add("loaded"),x(),location.hash.slice(1)===t.id){const e=()=>{location.hash="null",history.replaceState({},"",location.pathname),document.removeEventListener("click",e)};document.addEventListener("click",e)}p.addListener(()=>{const e=i(".showcase-more").classList.contains("hidden");e&&i(".showcase-more").classList.remove("hidden"),t.style.height="auto",t.classList.remove("loaded"),r=t.getBoundingClientRect(),t.classList.add("loaded"),t.style.height=r.height+"px",e&&i(".showcase-more").classList.add("hidden"),x()})}i(".showcase-show-more").addEventListener("click",e=>{e.preventDefault(),i(".showcase-more").classList.remove("hidden"),i(".showcase-show-more").classList.add("hidden")}),i(".showcase-show-less").addEventListener("click",e=>{e.preventDefault(),i(".showcase-more").classList.add("hidden"),i(".showcase-show-more").classList.remove("hidden")}),i(".showcase-more").classList.add("hidden")}if(i(".image-carousel"))for(const e of a(".image-carousel")){const t=a(e,"picture").map(e=>e.dataset.id);let n=t.indexOf(e.dataset.start);const r=a=>{n=a,e.dataset.start=t[a],i(e,".image-carousel-current").setAttribute("aria-hidden",!0),i(e,".image-carousel-current").classList.remove("image-carousel-current"),i(e,`[data-id="${t[a]}"]`).classList.add("image-carousel-current"),i(e,".image-carousel-current").removeAttribute("aria-hidden"),i(e,".image-carousel-container").style.transform=`translateX(-${a*e.getBoundingClientRect().width}px)`,i(e,".image-carousel-pagination-current").textContent=a+1,i(e,".image-carousel-lightbox img").src=i(e,".image-carousel-current img").src};for(const t of a(e,"picture img"))t.style.width=e.getBoundingClientRect().width-10+"px";if(i(e,".image-carousel-controls")){const a=i(e,".image-carousel-prev"),o=i(e,".image-carousel-next");a.addEventListener("click",e=>{e.preventDefault(),r((n-1+t.length)%t.length)}),o.addEventListener("click",e=>{e.preventDefault(),r((n+1)%t.length)})}i(e,".image-carousel-container").addEventListener("click",()=>{i(".image-carousel-lightbox").classList.remove("hidden")}),i(e,".image-carousel-lightbox").addEventListener("click",()=>{i(".image-carousel-lightbox").classList.add("hidden")}),r(n),p.addListener(()=>{for(const t of a(e,"picture img"))t.style.width=e.getBoundingClientRect().width-10+"px";r(n)})}p.run()}]);