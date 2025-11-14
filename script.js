/* Main JS for Nizzu's Interactive Journey (vanilla JS) */
const qs = s => document.querySelector(s);
const qsa = s => document.querySelectorAll(s);

function loadSample(){ try{ return JSON.parse(document.getElementById('sampleData').textContent); }catch(e){ console.error(e); return null } }
const DATA = loadSample();

/* RENDERERS */
function renderTimeline(items){ const root = qs('#timelineContainer'); root.innerHTML=''; items.forEach(it=>{ const el = document.createElement('article'); el.className='timeline-item'; el.setAttribute('data-aos','fade-up'); el.innerHTML = `<div class="meta"><div class="year">${it.year}</div><div class="icon">${it.icon||''}</div></div><h3>${it.title}</h3><p class="muted">${it.desc}</p>`; root.appendChild(el); }); }

function renderProjects(list){ const root = qs('#projectsGrid'); root.innerHTML=''; list.forEach(p=>{ const c = document.createElement('div'); c.className='project-card'; c.setAttribute('data-aos','zoom-in'); c.innerHTML = `<div class="project-thumb">${p.img? '<img src="'+p.img+'" alt="'+p.title+'">':'<div style="opacity:.7">Preview</div>'}</div><div class="project-title">${p.title}</div><div class="muted">${p.desc}</div><div class="project-actions"><a href="${p.link||'#'}" class="neon-btn" target="_blank">View Project</a></div>`; root.appendChild(c); }); }

function renderAchievements(list){ const root = qs('#achievementsGrid'); root.innerHTML=''; list.forEach(a=>{ const el = document.createElement('div'); el.className='achievement'; el.setAttribute('data-aos','fade-up'); el.innerHTML = `<div style="font-size:1.6rem">${a.emoji||'🏅'}</div><div><div style="font-weight:600">${a.title}</div><div class="muted">${a.desc}</div></div>`; root.appendChild(el); }); }

function renderSkills(skills){ const keys = Object.keys(skills||{}); const list = qs('#skillsList'); list.innerHTML=''; keys.forEach(k=>{ const val = skills[k]; const row = document.createElement('div'); row.className='skill-line'; row.innerHTML = `<div>${k}</div><div style="display:flex;gap:8px;align-items:center"><div class="skill-bar"><i style="width:${val}%"></i></div><div style="width:36px;text-align:right">${val}%</div></div>`; list.appendChild(row); }); drawSkillsCanvas(skills); }

/* Simple neon bar chart using canvas */
function drawSkillsCanvas(skills){ const canvas = qs('#skillsChart'); if(!canvas) return; const ctx = canvas.getContext('2d'); const keys = Object.keys(skills||{}); ctx.clearRect(0,0,canvas.width,canvas.height); ctx.font='18px Poppins, sans-serif'; ctx.textBaseline='middle'; const barH = 28; let y = 40; keys.forEach(k=>{ ctx.fillStyle='rgba(180,240,255,0.95)'; ctx.fillText(k, 22, y+barH/2); // bg
  ctx.fillStyle='rgba(255,255,255,0.03)'; ctx.fillRect(180, y, 380, barH); // fill
  const val = skills[k]; const grd = ctx.createLinearGradient(180,0,560,0); grd.addColorStop(0,'rgba(94,240,255,0.95)'); grd.addColorStop(1,'rgba(156,124,255,0.95)'); ctx.fillStyle = grd; ctx.fillRect(180, y, Math.round(380*(val/100)), barH); y += barH + 22; }); }

/* Apply data to UI */
function applyData(obj){ if(!obj) return; if(obj.timeline) renderTimeline(obj.timeline); if(obj.projects) renderProjects(obj.projects); if(obj.skills) renderSkills(obj.skills); if(obj.achievements) renderAchievements(obj.achievements); if(obj.contact){ qs('#linkedin').href = obj.contact.linkedin||'#'; qs('#github').href = obj.contact.github||'#'; qs('#email').href = 'mailto:'+(obj.contact.email||''); } }

/* Dragon follows scroll */
function dragonFollow(){ const dragon = qs('#dragon'); if(!dragon) return; window.addEventListener('scroll', ()=>{ const sc = window.scrollY / (document.body.scrollHeight - window.innerHeight || 1); const top = 12 + sc * 60; dragon.style.top = top + 'vh'; dragon.style.transform = `translateX(${Math.sin(sc*Math.PI*2)*12}px) rotate(${sc*30-15}deg)`; }, {passive:true}); }

/* Particles background */
function makeParticles(){ const el = qs('#particles-bg'); const canvas = document.createElement('canvas'); canvas.style.width='100%'; canvas.style.height='100%'; canvas.width = innerWidth; canvas.height = innerHeight; el.appendChild(canvas); const ctx = canvas.getContext('2d'); let particles = []; function init(){ particles = Array.from({length: (window.innerWidth>1000?80:40)}, ()=>({x:Math.random()*canvas.width,y:Math.random()*canvas.height,r:Math.random()*1.6+0.4, vx:(Math.random()-0.5)*0.4, vy:(Math.random()-0.5)*0.4})); } function step(){ ctx.clearRect(0,0,canvas.width,canvas.height); particles.forEach(p=>{ p.x += p.vx; p.y += p.vy; if(p.x<0)p.x=canvas.width; if(p.x>canvas.width)p.x=0; if(p.y<0)p.y=canvas.height; if(p.y>canvas.height)p.y=0; ctx.beginPath(); ctx.fillStyle='rgba(94,240,255,0.06)'; ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill(); }); requestAnimationFrame(step); } function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; } window.addEventListener('resize', resize); init(); step(); }


/* Admin panel logic (hidden mode) */
function makeAdmin(){ const admin = qs('#adminPanel'); const editor = qs('#adminEditor'); const toggle = qs('#adminToggle'); const close = qs('#closeAdmin'); const exportBtn = qs('#exportJSON'); const importBtn = qs('#importBtn'); const importFile = qs('#importFile');

  function show(){ admin.classList.remove('hidden'); admin.setAttribute('aria-hidden','false'); editor.value = JSON.stringify(DATA, null, 2); editor.focus(); }
  function hide(){ admin.classList.add('hidden'); admin.setAttribute('aria-hidden','true'); }

  toggle.addEventListener('click', (e)=>{ if(!e.altKey){ alert('Admin is hidden — press the Admin button while holding ALT to open.'); return } show(); });
  close.addEventListener('click', hide);

  exportBtn.addEventListener('click', ()=>{ const blob = new Blob([editor.value], {type:'application/json'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'nizzu_data_export.json'; a.click(); URL.revokeObjectURL(url); });

  importBtn.addEventListener('click', ()=> importFile.click());
  importFile.addEventListener('change', (e)=>{ const f = e.target.files[0]; if(!f) return; const r = new FileReader(); r.onload = ()=>{ try{ const obj = JSON.parse(r.result); editor.value = JSON.stringify(obj, null, 2); applyData(obj); alert('Imported and applied.'); }catch(err){ alert('Invalid JSON file'); } }; r.readAsText(f); });

  let applyTimeout = null;
  editor.addEventListener('input', ()=>{ if(applyTimeout) clearTimeout(applyTimeout); applyTimeout = setTimeout(()=>{ try{ const obj = JSON.parse(editor.value); applyData(obj); }catch(e){} }, 600); });
}

/* Contact send simulation */
function wireContact(){ qs('#sendBtn').addEventListener('click', ()=>{ const msg = qs('#messageInput').value.trim(); if(!msg){ alert('Write a message first'); return } qs('#messageInput').value=''; qs('#sendBtn').textContent='Sent!'; setTimeout(()=>qs('#sendBtn').textContent='Send Message',1200); }); }

/* Initialize everything */
(function init(){ if(!DATA) return; applyData(DATA); dragonFollow(); makeParticles(); makeAdmin(); wireContact(); if('scrollBehavior' in document.documentElement.style){ document.documentElement.style.scrollBehavior = 'smooth' } })();

