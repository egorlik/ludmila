/* Эффекты из прототипа: полоса прокрутки, курсор, «магнитные» кнопки, лёгкий сдвиг фото за мышью */
(function(){var d=document,fine=matchMedia('(pointer:fine)').matches,rm=matchMedia('(prefers-reduced-motion:reduce)').matches,p=d.getElementById('prog');
function pr(){var h=d.documentElement.scrollHeight-innerHeight;p.style.width=(h>0?scrollY/h*100:0)+'%'}addEventListener('scroll',pr,{passive:true});pr();
if(!fine||rm)return;
var c=d.getElementById('cur'),cx=0,cy=0,tx=0,ty=0,a=d.getElementById('arch');
addEventListener('mousemove',function(e){tx=e.clientX;ty=e.clientY;c.style.opacity=1;if(a){a.style.setProperty('--mx',((e.clientX/innerWidth-.5)*-22)+'px');a.style.setProperty('--my',((e.clientY/innerHeight-.5)*-22)+'px')}});
(function f(){cx+=(tx-cx)*.18;cy+=(ty-cy)*.18;c.style.transform='translate('+cx+'px,'+cy+'px)';requestAnimationFrame(f)})();
d.addEventListener('mouseover',function(e){if(e.target.closest('a,button,.rc,.ck,.wi'))c.classList.add('big')});
d.addEventListener('mouseout',function(e){if(e.target.closest('a,button,.rc,.ck,.wi'))c.classList.remove('big')});
d.querySelectorAll('.mag').forEach(function(m){m.addEventListener('mousemove',function(e){var b=m.getBoundingClientRect();m.style.transform='translate('+((e.clientX-b.left-b.width/2)*.28)+'px,'+((e.clientY-b.top-b.height/2)*.4)+'px)'});m.addEventListener('mouseleave',function(){m.style.transform=''})});
})();

