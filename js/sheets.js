/* Загрузка данных из Google Таблицы (идентификатор задаётся в js/config.js).
   Если таблица недоступна, сайт берёт последнюю сохранённую версию, а потом data.js.
   Диагностика: откройте сайт с добавкой ?debug=1 в адресе, внизу слева появится панель с ходом загрузки. */
(function(){
var RAW=(typeof SHEET_ID!=='undefined'?String(SHEET_ID):'').trim(),PUB=/\/d\/e\//.test(RAW),M=RAW.match(/\/d\/([\w-]+)/),ID=M?M[1]:RAW.replace(/[^\w-]/g,''),TIMEOUT=7000,DBG=/[?&]debug/.test(location.search)||/^(localhost|127\.0\.0\.1|\[::1\]|)$/.test(location.hostname),TABS={e:'События',t:'Тарифы',c:'Торты',g:'Галерея',r:'Отзывы'},box;
function dbg(t,bad){if(bad)console.warn(t);if(!DBG)return;if(!box){box=document.createElement('div');box.style.cssText='position:fixed;left:12px;bottom:12px;z-index:9999;max-width:min(560px,92vw);background:#111;color:#EDE6DA;border:1px solid #C9A96E;padding:12px 14px;font:12px/1.5 monospace;white-space:pre-wrap';document.body.appendChild(box)}var l=document.createElement('div');l.textContent=t;if(bad)l.style.color='#ff8a80';box.appendChild(l)}
function boot(){var l=['js/main.js','js/fx.js'];(function n(){if(!l.length)return;var s=document.createElement('script');s.src=l.shift();s.onload=s.onerror=n;document.head.appendChild(s)})()}
function csv(t){var r=[],w=[],f='',q=false,i,c;for(i=0;i<t.length;i++){c=t[i];if(q){if(c=='"'){if(t[i+1]=='"'){f+='"';i++}else q=false}else f+=c}else if(c=='"')q=true;else if(c==','){w.push(f);f=''}else if(c=='\n'||c=='\r'){if(c=='\r'&&t[i+1]=='\n')i++;w.push(f);r.push(w);w=[];f=''}else f+=c}if(f!==''||w.length){w.push(f);r.push(w)}return r}
function rows(a,need,name){if(!a)return null;var h=null,k;a=a.slice();
 for(k=0;k<Math.min(5,a.length);k++){var c=a[k].map(function(x){return String(x).trim().toLowerCase()});if(need.every(function(n){return c.indexOf(n)>-1})){h=c;a=a.slice(k+1);break}}
 if(!h){dbg('Вкладка «'+name+'»: не найдены заголовки колонок ('+need.join(', ')+'). Первую строку менять нельзя.',1);return null}
 return a.filter(function(r){return r.some(function(x){return String(x).trim()})}).map(function(r){var o={};h.forEach(function(k,j){o[k]=String(r[j]==null?'':r[j]).trim()});return o}).filter(function(o){return ['нет','0','false','no','скрыть'].indexOf((o['показывать']||'').toLowerCase())<0})}
function p2(x){return ('0'+x).slice(-2)}
function dt(s){var m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);if(m)return m[1]+'-'+p2(m[2])+'-'+p2(m[3]);m=s.match(/^(\d{1,2})[.\/](\d{1,2})[.\/](\d{4})/);return m?m[3]+'-'+p2(m[2])+'-'+p2(m[1]):s}
function tm(s){var m=s.match(/(\d{1,2}):(\d{2})/);return m?p2(m[1])+':'+m[2]:s}
function num(s,d){var n=parseInt(String(s).replace(/\D/g,''),10);return isNaN(n)?d:n}
function list(s){return s?s.split(/[;\n]/).map(function(x){return x.trim()}).filter(Boolean):[]}
function fix(u,dir){var m=u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]+)/);if(m)return 'https://drive.google.com/thumbnail?id='+m[1]+'&sz=w1600';return /^(https?:|\/|data:)/.test(u)||u.indexOf('/')>-1?u:dir+u}
function imgs(s){return list(s).map(function(u){return fix(u,'photos/')})}
function parse(T){var out={},e=rows(T.e,['название','дата'],'События'),t=rows(T.t,['событие','название тарифа','цена'],'Тарифы'),c=rows(T.c,['категория','название'],'Торты'),g=rows(T.g,['название','файл'],'Галерея'),r=rows(T.r,['текст'],'Отзывы');
 if(e){out.EVENTS=e.map(function(o){var s=num(o['мест всего'],0);return{type:o['тип']||'Мастер-класс',audience:o['для кого']||'',title:o['название'],desc:o['описание'],details:o['подробно']||o['описание'],date:dt(o['дата']),dateEnd:dt(o['дата окончания']||''),time:tm(o['время']||''),duration:o['длительность']||'',place:o['место']||'г. Бендеры',format:o['формат']||'Очно',price:o['цена'],seats:s,seatsLeft:o['осталось мест']===''||o['осталось мест']==null?s:num(o['осталось мест'],s),tg:o['ссылка на пост telegram']||'',photos:imgs(o['фото']),emoji:o['эмодзи']||'',ill:o['рисунок']||'cake',bg:o['цвет']||'#f6d9d6',includes:list(o['что входит']),program:list(o['программа']),tariffs:[]}});
  if(t)t.forEach(function(o){var ev=out.EVENTS.filter(function(x){return x.title.toLowerCase()===o['событие'].toLowerCase()})[0];if(ev)ev.tariffs.push({name:o['название тарифа'],duration:o['длительность']||'',price:o['цена'],desc:o['описание']||'',includes:list(o['что входит']),hit:o['метка']||''})});
  out.EVENTS.forEach(function(x){if(!x.tariffs.length)delete x.tariffs;else x.tariffs.forEach(function(y){if(!y.includes.length)delete y.includes;if(!y.hit)delete y.hit})})}
 if(c)out.CAKES=c.map(function(o){return{cat:o['категория']||'Торты',name:o['название'],short:o['кратко']||'',weight:o['вес']||'',price:o['цена']||'',emoji:o['эмодзи']||'',ill:o['рисунок']||'cake',bg:o['цвет']||'#f6d9d6',photos:imgs(o['фото']),taste:o['вкус']||'',ingredients:list(o['состав']),recipe:o['как делаю']||'',notice:o['примечание']||''}});
 if(g)out.GALLERY=g.map(function(o){var v=/видео|video/i.test(o['тип']||'');return{t:v?'video':'photo',cat:o['категория']||'Работы',title:o['название'],src:fix(o['файл'],v?'videos/':'photos/'),poster:o['обложка']?fix(o['обложка'],'photos/'):'',ill:o['рисунок']||'cake',bg:o['цвет']||'#F4C6CB'}});
 if(r)out.REVIEWS=r.map(function(o){return[o['текст'],o['автор']||'']});
 return out}
function apply(o){for(var k in o)window[k]=o[k]}
function cache(){try{return JSON.parse(localStorage.getItem('sheet-cache'))}catch(e){return null}}
window.SheetsLoader={parse:parse,csv:csv};
dbg('sheets.js версия 5 запущен');
if(!ID){dbg('SHEET_ID пуст (js/config.js): сайт использует data.js');boot();return}
dbg('SHEET_ID принят: '+ID.slice(0,8)+'…, длина '+ID.length+(RAW!==ID?' (из ссылки целиком)':''));
if(PUB){dbg('Это ссылка «Опубликовать в интернете» (/d/e/…). Нужна обычная ссылка из адресной строки таблицы: docs.google.com/spreadsheets/d/…/edit',1);boot();return}
if(ID.length<25)dbg('Идентификатор слишком короткий: скорее всего, вставлен не весь',1);
function U(n,o){return 'https://docs.google.com/spreadsheets/d/'+encodeURIComponent(ID)+'/gviz/tq?tqx=out:'+(o||'csv')+'&headers=1&sheet='+encodeURIComponent(n)}
function viaFetch(n){return fetch(U(n),{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.text()}).then(function(t){if(/^\s*<(!doctype|html)/i.test(t))throw new Error('вместо данных пришла страница входа Google: проверьте доступ «все, у кого есть ссылка»');return csv(t.replace(/^\uFEFF/,''))})}
function viaJsonp(n){return new Promise(function(res,rej){var cb='__gs'+Math.random().toString(36).slice(2),s=document.createElement('script'),t=setTimeout(function(){rej(new Error('таймаут'))},TIMEOUT);
 window[cb]=function(r){clearTimeout(t);try{if(r.status==='error')throw new Error((r.errors&&r.errors[0]&&(r.errors[0].detailed_message||r.errors[0].message))||'ошибка Google');var tb=r.table;res([tb.cols.map(function(c){return c.label||''})].concat(tb.rows.map(function(x){return(x.c||[]).map(function(c){return c?(c.f!=null?c.f:(c.v==null?'':String(c.v))):''})})))}catch(e){rej(e)}s.remove();delete window[cb]};
 s.onerror=function(){clearTimeout(t);rej(new Error('скрипт Google не загрузился'));s.remove()};s.src=U(n,'json;responseHandler:'+cb);document.head.appendChild(s)})}
function getTab(n){return viaFetch(n).then(function(a){dbg('«'+n+'»: получено строк '+a.length);return a},function(e){dbg('«'+n+'»: обычный запрос не удался ('+e.message+'), пробую запасной способ',1);return viaJsonp(n).then(function(a){dbg('«'+n+'»: запасной способ, строк '+a.length);return a},function(e2){dbg('«'+n+'»: ОШИБКА: '+e2.message,1);return null})})}
var done=false;function fin(src){if(done)return;done=true;dbg('Источник данных: '+src);boot()}
setTimeout(function(){if(done)return;var c=cache();if(c){apply(c);fin('сохранённая копия (таблица не ответила)')}else fin('data.js (таблица не ответила)')},TIMEOUT*2);
var keys=Object.keys(TABS);
Promise.all(keys.map(function(k){return getTab(TABS[k])})).then(function(a){var T={};keys.forEach(function(k,i){T[k]=a[i]});var o=parse(T);
 if(!Object.keys(o).length){var c=cache();dbg('Ни одна вкладка не прочитана: проверьте идентификатор, названия вкладок и доступ',1);if(c){apply(c);fin('сохранённая копия')}else fin('data.js');return}
 if(done)return;apply(o);try{localStorage.setItem('sheet-cache',JSON.stringify(o))}catch(e){}
 dbg('Загружено: '+Object.keys(o).map(function(k){return k+' '+o[k].length}).join(', '));fin('Google Таблица')
}).catch(function(e){dbg('Ошибка: '+e.message,1);fin('data.js')});
})();
