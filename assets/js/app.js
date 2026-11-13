const courseStorage=new Proxy({}, {
 get(_target,key){if(key==='getItem')return name=>{try{return window.localStorage.getItem(name)}catch(e){return null}};
 if(key==='setItem')return(name,value)=>{try{window.localStorage.setItem(name,String(value));return true}catch(e){storageWarning();return false}};
 if(key==='removeItem')return name=>{try{window.localStorage.removeItem(name)}catch(e){storageWarning()}};},
 ownKeys(){try{return Object.keys(window.localStorage)}catch(e){return[]}},
 getOwnPropertyDescriptor(){return {enumerable:true,configurable:true}}
});
function storageWarning(){const show=()=>{if(document.getElementById('storageWarning'))return;const el=document.createElement('p');el.id='storageWarning';el.className='notice';el.setAttribute('role','alert');el.textContent='Não foi possível salvar neste navegador. Verifique o espaço disponível e a permissão de armazenamento antes de continuar.';document.body.prepend(el)};if(document.body)show();else document.addEventListener('DOMContentLoaded',show,{once:true});}
function escapeHTML(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function savedScore(key){const raw=courseStorage.getItem(key);return raw!==null&&/^(100|[0-9]{1,2})$/.test(raw)?Number(raw):0;}
const MODULES=['01-fundamentos','02-ia-generativa','03-ia-negocios','04-prompts','05-refinamento','06-produtividade','07-processos','08-seguranca','09-projeto'];
function getDone(){try{const value=JSON.parse(courseStorage.getItem('ia_gemini_done')||'[]');return Array.isArray(value)?[...new Set(value.filter(id=>MODULES.includes(id)))]:[]}catch(e){return[]}}
function saveDone(a){if(!Array.isArray(a))return;if(!courseStorage.setItem('ia_gemini_done',JSON.stringify([...new Set(a.filter(id=>MODULES.includes(id)))])))return false;updateProgress();return true}
function completeModule(id){const a=getDone();if(!a.includes(id))a.push(id);if(!saveDone(a))return;updateDashboard();document.querySelectorAll(`[data-module="${id}"]`).forEach(el=>el.classList.add('done'));const msg=document.getElementById('completeMsg');if(msg){msg.textContent='Aula marcada como concluída. Seu progresso foi salvo neste navegador.';msg.style.display='block'};if(typeof enhanceCompletionButtons==='function')enhanceCompletionButtons();if(typeof announce==='function')announce('Aula marcada como concluída. Progresso salvo neste navegador.')}
function updateProgress(){const done=getDone();const pct=Math.round(done.length/MODULES.length*100);document.querySelectorAll('.progressbar>span').forEach(s=>s.style.width=pct+'%');document.querySelectorAll('[data-progress-label]').forEach(e=>e.textContent=pct+'%');document.querySelectorAll('[data-module]').forEach(el=>{if(done.includes(el.dataset.module))el.classList.add('done')})}
function answer(btn,correct,feedbackOk,feedbackNo){const box=btn.closest('.quiz');if(box.dataset.answered==='1')return;box.dataset.answered='1';box.querySelectorAll('.option').forEach(o=>o.disabled=true);btn.classList.add(correct?'correct':'wrong');const f=box.querySelector('.feedback');f.classList.add('show',correct?'ok':'no');f.innerHTML=correct?'✅ '+feedbackOk:'💡 '+feedbackNo;if(typeof announce==='function')announce(correct?'Resposta correta.':'Resposta registrada. Leia o feedback.')}
async function copyPrompt(btn){
 const pre=btn.closest('.prompt');if(!pre)return;
 const text=[...pre.childNodes].filter(n=>!(n.nodeType===1&&n.classList.contains('copy'))).map(n=>n.textContent).join('').trim();
 const old=btn.textContent;
 try{if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(text);else{const area=document.createElement('textarea');area.value=text;area.style.position='fixed';area.style.opacity='0';document.body.append(area);area.select();let ok;try{ok=document.execCommand('copy')}finally{area.remove();btn.focus()}if(!ok)throw new Error('copy-failed')}btn.textContent='Copiado!';announce('Prompt copiado para a área de transferência.');}
 catch(e){btn.textContent='Selecione e copie o texto';announce('Não foi possível copiar automaticamente. Selecione e copie o texto.');}
 setTimeout(()=>btn.textContent=old,2400);
}
function buildPrompt(){const ids=['contexto','objetivo','instrucao','restricoes','formato'];const labels=['Contexto','Objetivo','Instrução','Restrições','Formato de saída'];const parts=ids.map((id,i)=>{const v=(document.getElementById(id)?.value||'').trim();return v?labels[i]+':\n'+v:''}).filter(Boolean);const out=document.getElementById('promptOutput');if(out)out.textContent=parts.join('\n\n')||'Preencha os campos acima para montar o prompt.'}
function initNotes(){document.querySelectorAll('[data-note]').forEach(el=>{const key='ia_note_'+el.dataset.note;el.value=courseStorage.getItem(key)||'';el.addEventListener('input',()=>{if(!courseStorage.setItem(key,el.value))return;const s=el.parentElement.querySelector('.note-status');if(s){s.textContent='Salvo neste navegador.';clearTimeout(el._t);el._t=setTimeout(()=>s.textContent='',1600)}})})}
function initProject(){document.querySelectorAll('[data-project]').forEach(el=>{const key='ia_project_'+el.dataset.project;el.value=courseStorage.getItem(key)||'';el.addEventListener('input',()=>courseStorage.setItem(key,el.value))})}
function exportProject(){const fields=[['Problema','problema'],['Tarefa da IA','tarefa'],['Prompt final','prompt'],['Refinamentos','refino'],['Fluxo','fluxo'],['Riscos e limites','riscos']];let out='PROJETO INTEGRADOR — IA PARA EMPREENDEDORES\n\n';for(const [label,key] of fields){out+=label.toUpperCase()+'\n'+(courseStorage.getItem('ia_project_'+key)||'(não preenchido)')+'\n\n'}const blob=new Blob([out],{type:'text/plain;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='projeto-integrador-ia-empreendedores.txt';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
document.addEventListener('DOMContentLoaded',()=>{updateProgress();initNotes();initProject();updateDashboard();initFinalResult();initCertificatePage()});

function firstIncomplete(){const done=getDone();return MODULES.find(m=>!done.includes(m))||MODULES[MODULES.length-1]}
function moduleHref(id){const onModule=location.pathname.includes('/modulos/');return (onModule?'':'modulos/')+id+'.html'}
function updateDashboard(){const done=getDone(),pct=Math.round(done.length/MODULES.length*100);document.querySelectorAll('[data-done-count]').forEach(e=>e.textContent=done.length);document.querySelectorAll('[data-total-count]').forEach(e=>e.textContent=MODULES.length);document.querySelectorAll('.progress-ring').forEach(r=>{r.style.setProperty('--pct',pct);const s=r.querySelector('span');if(s)s.textContent=pct+'%'});const c=document.querySelector('[data-continue-course]');if(c){const id=firstIncomplete();c.href='modulos/'+id+'.html';c.textContent=done.length===MODULES.length?'Revisar projeto final →':'Continuar de onde parei →'}document.querySelectorAll('.module-card[data-module]').forEach(card=>{const t=card.querySelector('.tag');if(t&&done.includes(card.dataset.module))t.textContent='Concluído'})}
function resetCourseProgress(){if(!confirm('Deseja apagar o progresso, as anotações e o projeto salvos neste navegador?'))return;Object.keys(courseStorage).filter(k=>k.startsWith('ia_')).forEach(k=>courseStorage.removeItem(k));location.reload()}
function initFinalAssessment(){const wrap=document.querySelector('[data-final-assessment]');if(!wrap)return;const result=document.getElementById('assessmentResult');const btn=document.getElementById('assessmentButton');if(!btn)return;btn.addEventListener('click',()=>{const qs=[...wrap.querySelectorAll('.quiz')];let answered=0,correct=0;qs.forEach(q=>{const picked=q.querySelector('input[type=radio]:checked');if(picked){answered++;if(picked.dataset.correct==='1')correct++}});if(answered<qs.length){result.innerHTML='<strong>Complete todas as questões.</strong> Você respondeu '+answered+' de '+qs.length+'.';result.className='feedback show no';return}const pct=Math.round(correct/qs.length*100);courseStorage.setItem('ia_final_score',String(pct));let msg=pct>=80?'Excelente domínio dos conceitos fundamentais.':pct>=60?'Bom resultado. Revise os módulos em que teve dúvida.':'Vale revisar os conceitos principais antes de encerrar.';result.innerHTML='<div class="final-score">'+pct+'%</div><strong>'+correct+' de '+qs.length+' corretas.</strong><br>'+msg;result.className='score-box';});const saved=courseStorage.getItem('ia_final_score');if(saved&&result){result.innerHTML='<div class="small">Último resultado salvo</div><div class="final-score">'+escapeHTML(saved)+'%</div>';result.className='score-box'}}


function initOpportunityMap(){document.querySelectorAll('[data-opportunity]').forEach(el=>{const key='ia_opportunity_'+el.dataset.opportunity;el.value=courseStorage.getItem(key)||'';el.addEventListener('input',()=>{if(!courseStorage.setItem(key,el.value))return;const st=document.getElementById('opportunityStatus');if(st){st.textContent='Salvo neste navegador.';clearTimeout(el._oppTimer);el._oppTimer=setTimeout(()=>st.textContent='As alterações são salvas automaticamente neste navegador.',1600)}})})}
function exportOpportunityMap(){const fields=[['Área','area'],['Atividade ou processo','processo'],['Problema','problema'],['Frequência','frequencia'],['Tempo consumido','tempo'],['Resultado desejado','resultado'],['Papel da IA','papel'],['Validação humana','humano'],['Risco','risco'],['Tipo de informação','dados'],['Cuidados','cuidados'],['Menor teste seguro','teste'],['Critério de sucesso','criterio']];let out='MAPA DE OPORTUNIDADES DE IA\n\n';for(const [label,key] of fields)out+=label.toUpperCase()+'\n'+(courseStorage.getItem('ia_opportunity_'+key)||'(não preenchido)')+'\n\n';const blob=new Blob([out],{type:'text/plain;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='mapa-oportunidades-ia.txt';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
function clearOpportunityMap(){if(!confirm('Deseja limpar somente o Mapa de Oportunidades salvo neste navegador?'))return;Object.keys(courseStorage).filter(k=>k.startsWith('ia_opportunity_')).forEach(k=>courseStorage.removeItem(k));document.querySelectorAll('[data-opportunity]').forEach(el=>el.value='');const st=document.getElementById('opportunityStatus');if(st)st.textContent='Mapa limpo.'}
function randomChallenge(){const items=[...document.querySelectorAll('.challenge')];if(!items.length)return;const item=items[Math.floor(Math.random()*items.length)];item.scrollIntoView({behavior:'smooth',block:'center'});item.animate([{boxShadow:'0 0 0 0 rgba(26,115,232,0)'},{boxShadow:'0 0 0 7px rgba(26,115,232,.18)'},{boxShadow:'0 0 0 0 rgba(26,115,232,0)'}],{duration:1200})}
document.addEventListener('DOMContentLoaded',initOpportunityMap);


function countFilled(prefix,keys){return keys.filter(k=>(courseStorage.getItem(prefix+k)||'').trim()).length}
function initFinalResult(){
  const wrap=document.querySelector('[data-final-result]'); if(!wrap)return;
  const done=getDone(), pct=Math.round(done.length/MODULES.length*100), score=courseStorage.getItem('ia_final_score'), best=courseStorage.getItem('ia_best_score');
  const projectKeys=['problema','tarefa','prompt','refino','fluxo','riscos'];
  const mapKeys=['area','processo','problema','frequencia','tempo','resultado','papel','humano','risco','dados','cuidados','teste','criterio'];
  const set=(sel,val)=>document.querySelectorAll(sel).forEach(e=>e.textContent=val);
  set('[data-result-progress]',pct+'%');set('[data-result-modules]',done.length+' de '+MODULES.length);set('[data-result-score]',score?score+'%':'—');set('[data-result-best]',best?best+'%':'—');set('[data-result-project]',countFilled('ia_project_',projectKeys)+'/6');set('[data-result-map]',countFilled('ia_opportunity_',mapKeys)+'/13');
  const catsEl=document.getElementById('categoryPerformance'), catsRaw=courseStorage.getItem('ia_assessment_categories');
  if(catsEl&&catsRaw){try{const cats=JSON.parse(catsRaw);catsEl.innerHTML=Object.entries(cats).sort().map(([cat,v])=>{const cp=Number.isFinite(v.correct/v.total)?Math.max(0,Math.min(100,Math.round(v.correct/v.total*100))):0;return `<div class="category-row"><div><strong>${escapeHTML(cat)}</strong><span>${escapeHTML(v.correct)}/${escapeHTML(v.total)}</span></div><div class="category-bar"><span style="width:${cp}%"></span></div><strong>${cp}%</strong></div>`}).join('')}catch(e){}}
  const rec=document.getElementById('resultRecommendations'); if(rec){let items=[];if(done.length<MODULES.length)items.push(`Conclua os ${MODULES.length-done.length} módulo(s) restante(s).`);if(!score)items.push('Realize a autoavaliação final.');else if(Number(score)<70)items.push('Revise os temas com menor pontuação e faça uma nova tentativa.');if(countFilled('ia_project_',projectKeys)<6)items.push('Complete os campos essenciais do Projeto Integrador.');if(countFilled('ia_opportunity_',mapKeys)<8)items.push('Use o Mapa de Oportunidades para aplicar o curso ao seu próprio contexto.');if(!items.length)items.push('Trilha concluída. Revise seu projeto e gere o certificado simbólico se desejar.');rec.innerHTML='<ul>'+items.map(i=>'<li>'+i+'</li>').join('')+'</ul>'}
}
function certificateEligible(){const score=Math.max(savedScore('ia_best_score'),savedScore('ia_final_score'));return getDone().length===MODULES.length&&score>=70}
function initCertificatePage(){
  const status=document.getElementById('certificateEligibility'); if(!status)return;
  const done=getDone().length, score=Math.max(savedScore('ia_best_score'),savedScore('ia_final_score')), ok=certificateEligible();
  status.className='eligibility '+(ok?'eligible':'not-eligible');status.innerHTML=ok?`✅ Critério interno atendido: ${done}/9 módulos e melhor pontuação de ${score}% na autoavaliação.`:`Ainda falta cumprir: ${done}/9 módulos concluídos e ${score||'—'}% na autoavaliação. É necessário 9/9 e pelo menos 70%.`;
  const name=document.querySelector('[data-certificate-name]');if(name)name.value=courseStorage.getItem('ia_certificate_name')||'';
}
function generateSymbolicCertificate(){
  if(!certificateEligible()){alert('Conclua os 9 módulos e obtenha pelo menos 70% na autoavaliação final para gerar o certificado simbólico.');return}
  const input=document.querySelector('[data-certificate-name]'), name=(input?.value||'').trim();if(!name){alert('Digite o nome que deve aparecer no certificado.');input?.focus();return}
  courseStorage.setItem('ia_certificate_name',name);const cert=document.getElementById('symbolicCertificate'), actions=document.getElementById('certificatePrintActions');document.querySelectorAll('[data-certificate-person]').forEach(e=>e.textContent=name);document.querySelectorAll('[data-certificate-score]').forEach(e=>e.textContent=(courseStorage.getItem('ia_best_score')||courseStorage.getItem('ia_final_score')||'—')+'%');document.querySelectorAll('[data-certificate-date]').forEach(e=>e.textContent=new Intl.DateTimeFormat('pt-BR',{dateStyle:'long'}).format(new Date()));if(cert)cert.hidden=false;if(actions)actions.hidden=false;cert?.scrollIntoView({behavior:'smooth',block:'start'})
}

/* ===== V6: preferências, busca, backup e encerramento ===== */
function announce(message){let r=document.getElementById('courseLiveRegion');if(!r){r=document.createElement('div');r.id='courseLiveRegion';r.className='live-region';r.setAttribute('aria-live','polite');r.setAttribute('aria-atomic','true');document.body.appendChild(r)}r.textContent='';setTimeout(()=>r.textContent=message,20)}
function applyPreferences(){const theme=courseStorage.getItem('ia_theme')||'light',size=courseStorage.getItem('ia_text_size')||'normal';document.documentElement.dataset.theme=theme;document.documentElement.dataset.textSize=size;document.documentElement.style.colorScheme=theme==='dark'?'dark':'light'}
function toggleTheme(){const next=(document.documentElement.dataset.theme||'light')==='dark'?'light':'dark';courseStorage.setItem('ia_theme',next);applyPreferences();updateAccessTools();announce(next==='dark'?'Modo escuro ativado.':'Modo claro ativado.')}
function cycleTextSize(){const sizes=['normal','large','xlarge'];const cur=courseStorage.getItem('ia_text_size')||'normal';const next=sizes[(sizes.indexOf(cur)+1)%sizes.length];courseStorage.setItem('ia_text_size',next);applyPreferences();updateAccessTools();announce(next==='normal'?'Tamanho de texto padrão.':next==='large'?'Texto ampliado.':'Texto extra ampliado.')}
function rootPrefix(){return location.pathname.includes('/modulos/')?'../':''}
function updateAccessTools(){const themeBtn=document.getElementById('themeToggle'),textBtn=document.getElementById('textSizeToggle');if(themeBtn){const dark=(document.documentElement.dataset.theme||'light')==='dark';themeBtn.textContent=dark?'☀':'☾';themeBtn.setAttribute('aria-label',dark?'Ativar modo claro':'Ativar modo escuro');themeBtn.title=dark?'Modo claro':'Modo escuro'}if(textBtn){const size=document.documentElement.dataset.textSize||'normal';textBtn.textContent=size==='normal'?'A+':size==='large'?'A++':'A';textBtn.setAttribute('aria-label','Alterar tamanho do texto');textBtn.title='Alterar tamanho do texto'}}
function injectAccessTools(){updateAccessTools(); /* v10 clean: controles dentro do menu Ajustes */ }
function enhanceCompletionButtons(){const done=getDone();document.querySelectorAll('button[onclick^="completeModule("]').forEach(btn=>{const m=btn.getAttribute('onclick').match(/completeModule\('([^']+)'\)/);if(m&&done.includes(m[1])){btn.textContent='Módulo concluído ✓';btn.classList.add('btn-outline');btn.setAttribute('aria-label','Este módulo já está marcado como concluído')}})}
function currentModuleIndex(){const file=(location.pathname.split('/').pop()||'').replace('.html','');return MODULES.indexOf(file)}
function initKeyboardNavigation(){const i=currentModuleIndex();if(i<0)return;document.addEventListener('keydown',e=>{if(!e.altKey||!['ArrowLeft','ArrowRight'].includes(e.key))return;const t=e.target?.tagName;if(['INPUT','TEXTAREA','SELECT'].includes(t))return;const j=i+(e.key==='ArrowRight'?1:-1);if(j>=0&&j<MODULES.length){e.preventDefault();location.href=moduleHref(MODULES[j])}})}

const COURSE_INDEX=[
 {type:'Aula Zero',title:'Aprenda a conversar com a IA',desc:'Laboratório guiado com experimentos, prompts e arquivos fictícios.',url:'aula-zero.html',terms:'aula zero laboratório arquivos fictícios experimentos gemini'},
 {type:'Módulo 01',title:'Fundamentos de IA',desc:'Conceitos básicos de Inteligência Artificial, exemplos cotidianos e validação humana.',url:'modulos/01-fundamentos.html',terms:'ia inteligencia artificial validação contexto cotidiano'},
 {type:'Módulo 02',title:'IA Generativa e Gemini',desc:'Diferença entre IA tradicional e generativa, possibilidades e limites do Gemini.',url:'modulos/02-ia-generativa.html',terms:'gemini ia generativa texto imagem geração multimodal'},
 {type:'Módulo 03',title:'IA nos negócios',desc:'Aplicações em marketing, vendas, atendimento, gestão e produtividade.',url:'modulos/03-ia-negocios.html',terms:'marketing vendas atendimento gestão produtividade negócios'},
 {type:'Módulo 04',title:'Prompts na prática',desc:'Método C.O.I.R.F., estrutura de prompts e construtor interativo.',url:'modulos/04-prompts.html',terms:'prompt contexto objetivo instrução restrição formato coirf'},
 {type:'Módulo 05',title:'Refinamento e validação',desc:'Como revisar, comparar e validar respostas produzidas por IA.',url:'modulos/05-refinamento.html',terms:'refinamento validação checagem alucinação fonte comparação'},
 {type:'Aula 6',title:'Organize informações com o Gemini',desc:'Uso do Gemini com arquivos, pesquisa, Canvas e recursos conectados.',url:'modulos/06-produtividade.html',terms:'arquivos pdf planilha canvas deep research pesquisa workspace produtividade'},
 {type:'Módulo 07',title:'Processos e automação',desc:'Processos, workflows, gatilhos, ações e papel da IA em automações.',url:'modulos/07-processos.html',terms:'processo workflow gatilho ação automação integração'},
 {type:'Módulo 08',title:'Segurança, privacidade e ética',desc:'Dados pessoais, informações confidenciais, risco e supervisão humana.',url:'modulos/08-seguranca.html',terms:'segurança privacidade ética dados pessoais lgpd risco humano'},
 {type:'Módulo 09',title:'Projeto Integrador',desc:'Aplicação completa dos conceitos no caso Café Horizonte.',url:'modulos/09-projeto.html',terms:'projeto integrador café horizonte problema solução prompt fluxo'},
 {type:'Recurso',title:'Biblioteca de prompts',desc:'Modelos reutilizáveis para situações empresariais.',url:'biblioteca-prompts.html',terms:'prompts modelos marketing vendas atendimento análise'},
 {type:'Recurso',title:'Laboratório de desafios',desc:'Dez cenários empresariais para praticar decisões e prompts.',url:'desafios-praticos.html',terms:'desafios prática cenários empresas'},
 {type:'Recurso',title:'Mapa de oportunidades',desc:'Ferramenta para analisar valor, risco e teste de uma oportunidade de IA.',url:'mapa-oportunidades.html',terms:'oportunidade valor risco teste processo mapa'},
 {type:'Recurso',title:'Glossário',desc:'Definições rápidas dos principais termos do curso.',url:'glossario.html',terms:'glossário conceitos termos definições'},
 {type:'Encerramento',title:'Autoavaliação final',desc:'Avaliação dinâmica com questões sorteadas e desempenho por tema.',url:'avaliacao-final.html',terms:'avaliação teste questões pontuação'},
 {type:'Encerramento',title:'Desempenho final',desc:'Painel consolidado de progresso e recomendações.',url:'resultado-final.html',terms:'resultado desempenho pontuação progresso'},
 {type:'Encerramento',title:'Conclusão do curso',desc:'Síntese das competências desenvolvidas e próximos passos.',url:'conclusao.html',terms:'conclusão competências próximos passos aperfeiçoamento'},
 {type:'Suporte',title:'Meus dados do curso',desc:'Exportar ou importar progresso, anotações e respostas deste navegador.',url:'meus-dados.html',terms:'backup exportar importar dados progresso anotações'},
 {type:'Suporte',title:'Fontes e recursos',desc:'Referências e documentação utilizadas no material.',url:'fontes.html',terms:'fontes referências documentação'},
 {type:'Recurso',title:'Mapa visual',desc:'Fluxos e mapas mentais dos principais conceitos do curso.',url:'mapa-visual.html',terms:'visual mapa fluxos coirf processo segurança revisão'},
 {type:'Recurso',title:'Revisão rápida',desc:'Nove conceitos essenciais, erros comuns e checklist final de domínio.',url:'revisao.html',terms:'revisão resumo conceitos erros checklist fundamentos'}
];
function normalizeText(s){return (s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
function initCourseSearch(){const input=document.querySelector('[data-course-search]'),out=document.getElementById('courseSearchResults'),count=document.getElementById('courseSearchCount');if(!input||!out)return;const render=()=>{const q=normalizeText(input.value.trim());const words=q.split(/\s+/).filter(Boolean);const results=COURSE_INDEX.filter(x=>{const hay=normalizeText([x.type,x.title,x.desc,x.terms].join(' '));return words.every(w=>hay.includes(w))});if(count)count.textContent=q?`${results.length} resultado(s)`:`${COURSE_INDEX.length} itens disponíveis`;out.innerHTML=results.length?results.map(x=>`<a class="search-result" href="${x.url}"><div class="search-meta">${x.type}</div><h3>${x.title}</h3><p>${x.desc}</p></a>`).join(''):`<div class="empty-state"><strong>Nenhum resultado.</strong><br>Tente termos como “prompt”, “marketing”, “segurança”, “automação” ou “arquivos”.</div>`};input.addEventListener('input',render);render();input.focus()}
function getCourseData(){const data={version:22,exportedAt:new Date().toISOString(),items:{}};Object.keys(courseStorage).filter(k=>k.startsWith('ia_')).sort().forEach(k=>data.items[k]=courseStorage.getItem(k));return data}
function updateDataSummary(){const el=document.getElementById('dataSummary');if(!el)return;const keys=Object.keys(courseStorage).filter(k=>k.startsWith('ia_'));const notes=keys.filter(k=>k.startsWith('ia_note_')).length,project=keys.filter(k=>k.startsWith('ia_project_')).length,map=keys.filter(k=>k.startsWith('ia_opportunity_')).length;el.innerHTML=`<strong>${keys.length}</strong> registros locais • ${getDone().length}/9 módulos • ${notes} anotação(ões) • ${project}/6 campos do projeto • ${map}/13 campos do mapa.`}
function exportCourseData(){const blob=new Blob([JSON.stringify(getCourseData(),null,2)],{type:'application/json;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='backup-ia-empreendedores.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);announce('Backup do curso exportado.')}
function validateCourseBackup(data){
 if(!data||![10,22].includes(data.version)||!data.items||Array.isArray(data.items)||typeof data.items!=='object')throw new Error('Formato inválido');
 const items={};
 for(const [key,value] of Object.entries(data.items)){
  if(!/^ia_[a-zA-Z0-9_-]+$/.test(key)||typeof value!=='string'||value.length>200000)throw new Error('Registro inválido');
  if(key==='ia_gemini_done'){const ids=JSON.parse(value);if(!Array.isArray(ids)||new Set(ids).size!==ids.length||ids.some(id=>!MODULES.includes(id)))throw new Error('Progresso inválido');}
  else if(['ia_final_score','ia_best_score'].includes(key)){if(!/^(100|[0-9]{1,2})$/.test(value))throw new Error('Pontuação inválida');}
  else if(key==='ia_assessment_categories'){const cats=JSON.parse(value);if(!cats||Array.isArray(cats)||typeof cats!=='object')throw new Error('Categorias inválidas');for(const [cat,v] of Object.entries(cats)){if(!['Fundamentos','Prompts','IA Generativa','Validação','Segurança','Processos','Produtividade','Negócios','Projeto'].includes(cat)||!v||!Number.isInteger(v.total)||!Number.isInteger(v.correct)||v.total<1||v.total>12||v.correct<0||v.correct>v.total)throw new Error('Categoria inválida');}}
  else if(key==='ia_assessment_selection'){const ids=JSON.parse(value);if(!Array.isArray(ids)||ids.length!==12||new Set(ids).size!==12||ids.some(id=>!/^q(0[1-9]|[12][0-9]|30)$/.test(id)))throw new Error('Questões inválidas');}
  else if(key==='ia_theme'){if(!['light','dark'].includes(value))throw new Error('Tema inválido');}
  else if(key==='ia_text_size'){if(!['normal','large','xlarge'].includes(value))throw new Error('Tamanho inválido');}
  else if(key==='ia_assessment_date'){if(!Number.isFinite(Date.parse(value)))throw new Error('Data inválida');}
  else if(key==='ia_certificate_name'){}
  else if(!/^ia_(note|project|opportunity|applied)_[a-zA-Z0-9_-]+$/.test(key))throw new Error('Registro desconhecido');
  items[key]=value;
 }
 return items;
}
function importCourseData(input){
 const file=input.files?.[0];if(!file)return;
 if(file.size>5000000){alert('O backup excede o limite de 5 MB.');input.value='';return;}
 const reader=new FileReader();reader.onerror=()=>{alert('Não foi possível ler o arquivo.');input.value='';};
 reader.onload=()=>{try{
  const items=validateCourseBackup(JSON.parse(reader.result));
  if(!confirm('Importar este backup substituirá os dados do curso existentes neste navegador. Continuar?'))return;
  const previous=getCourseData().items;
  try{for(const [k,v] of Object.entries(items))if(!courseStorage.setItem(k,v))throw new Error('Falha ao salvar');Object.keys(courseStorage).filter(k=>k.startsWith('ia_')&&!(k in items)).forEach(k=>courseStorage.removeItem(k));}
  catch(error){Object.keys(courseStorage).filter(k=>k.startsWith('ia_')&&!(k in previous)).forEach(k=>courseStorage.removeItem(k));for(const [k,v] of Object.entries(previous))courseStorage.setItem(k,v);throw error;}
  announce('Backup importado com sucesso.');setTimeout(()=>location.reload(),400);
 }catch(e){alert('Não foi possível importar o arquivo. Os dados existentes foram preservados. Use um backup JSON válido exportado por este curso.');}finally{input.value='';}};
 reader.readAsText(file);
}
function initConclusion(){const wrap=document.querySelector('[data-conclusion]');if(!wrap)return;const done=getDone(),score=Math.max(savedScore('ia_best_score'),savedScore('ia_final_score'));document.querySelectorAll('[data-conclusion-modules]').forEach(e=>e.textContent=`${done.length}/9`);document.querySelectorAll('[data-conclusion-score]').forEach(e=>e.textContent=score?`${score}%`:'—');document.querySelectorAll('[data-competency-module]').forEach(e=>{const id=e.dataset.competencyModule;if(done.includes(id))e.classList.add('done')});const status=document.getElementById('conclusionStatus');if(status){if(done.length===9&&score>=70)status.innerHTML='<strong>Trilha concluída.</strong> Você completou os módulos e atingiu o critério interno da autoavaliação. Revise seu projeto, gere o certificado simbólico e siga para o aperfeiçoamento.';else status.innerHTML=`<strong>Continue sua jornada.</strong> Você concluiu ${done.length}/9 módulos${score?` e sua melhor pontuação foi ${score}%`:''}. Use esta página como mapa de revisão.`}}
function injectProgramStrip(){ /* v10 clean: topo institucional disponível apenas na ficha do curso */ }
function enhanceInstitutionalHome(){ /* v10 clean: página inicial tem uma só apresentação */ }
function initV7(){applyPreferences();injectProgramStrip();injectAccessTools();enhanceCompletionButtons();initKeyboardNavigation();initCourseSearch();updateDataSummary();initConclusion();enhanceInstitutionalHome()}

applyPreferences();
document.addEventListener('DOMContentLoaded',initV7);

/* v10 — modo foco opcional e preservação das anotações existentes */
function toggleFocusMode(btn){const enabled=document.body.classList.toggle('focus-mode');btn.setAttribute('aria-pressed',String(enabled));btn.textContent=enabled?'⤡ Mostrar navegação':'⤢ Leitura sem distrações'}
document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.clean-notes').forEach(d=>{const ta=d.querySelector('textarea[data-note]');if(ta?.value?.trim())d.open=true});
  updateAccessTools();
  document.querySelectorAll('.clean-lesson-card').forEach(card=>{
    if(getDone().includes(card.dataset.module)){
      const t=card.querySelector('.clean-state');if(t)t.textContent='✓ Concluída';
    }
  });
});


// V12: autoavaliação prática. O resultado é formativo e não substitui validação humana.
function checkAppliedAnswer(button){
  const question=button.closest('.applied-decision');
  if(!question || question.dataset.answered==='true')return;
  const correct=button.dataset.answer==='true';
  const feedback=question.querySelector('.applied-feedback');
  question.querySelectorAll('.applied-option').forEach(b=>b.classList.remove('bad'));
  button.classList.add(correct?'good':'bad');
  if(feedback){feedback.textContent=(correct?'✅ Correto. ':'💡 Revise: ')+(button.dataset.explanation||'');}
  if(correct){question.dataset.answered='true';question.querySelectorAll('.applied-option').forEach(b=>b.disabled=true);}
  if(typeof announce==='function')announce(correct?'Decisão correta.':'Leia a explicação e tente outra alternativa.');
}
function initAppliedChecklists(){
  document.querySelectorAll('[data-applied-module]').forEach(section=>{
    const checks=[...section.querySelectorAll('input[data-applied-check]')];
    const update=()=>{
      const done=checks.filter(el=>el.checked).length;
      const p=section.querySelector('.applied-check-count');
      if(p)p.textContent=`${done} de ${checks.length} critérios conferidos.`;
    };
    checks.forEach(check=>{
      const key='ia_applied_'+check.dataset.appliedCheck;
      try{check.checked=courseStorage.getItem(key)==='1'}catch(_e){}
      check.addEventListener('change',()=>{
        try{courseStorage.setItem(key,check.checked?'1':'0')}catch(_e){}
        update();
      });
    });
    update();
  });
}
document.addEventListener('DOMContentLoaded',initAppliedChecklists);

;(function(){function run(){document.querySelectorAll('.quiz').forEach(function(q){var fb=q.querySelector('.feedback');var bs=[].slice.call(q.querySelectorAll(':scope > button.option'));if(bs.length<2||!fb)return;for(var i=bs.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=bs[i];bs[i]=bs[j];bs[j]=t}bs.forEach(function(b){q.insertBefore(b,fb)})})}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run()})();

;(function(){var m=location.pathname.match(/modulos\/(\d\d)-/);if(m)document.body.setAttribute('data-aula',String(parseInt(m[1],10)));if(!m)return;var b=document.createElement('div');b.id='readbar';document.body.appendChild(b);function u(){var h=document.documentElement,t=h.scrollHeight-h.clientHeight;b.style.width=(t>0?h.scrollTop/t*100:0)+'%'}addEventListener('scroll',u,{passive:true});u()})();

;(function(){if(!/modulos\//.test(location.pathname))return;function id(el,n){if(el&&!el.id)el.id=n;return el&&el.id}
var hs=[].slice.call(document.querySelectorAll('h2')),g=hs.find(function(h){return /Entenda o exemplo/.test(h.textContent)}),
L=[['Entenda',g&&id(g.closest('section'),'entenda')],['Pratique',id(document.querySelector('.pratica-tag')&&document.querySelector('.pratica-tag').closest('section'),'pratique')],['Confira',id(document.getElementById('revisar'),'revisar')],['Aprofunde',id(document.querySelector('details.aprofunde'),'aprofunde')],['Concluir',id(document.getElementById('finalizar'),'finalizar')]].filter(function(x){return x[1]});
if(L.length<3)return;var n=document.createElement('nav');n.className='mini-nav';n.setAttribute('aria-label','Nesta aula');n.innerHTML=L.map(function(x){return '<a href="#'+x[1]+'">'+x[0]+'</a>'}).join('');
var h=document.querySelector('.clean-module-hero'),a=h&&h.parentNode;if(!a)return;var after=document.querySelector('.learning-path,.clean-flow,.lesson-flow')||h;after.parentNode.insertBefore(n,after.nextSibling);
var as=[].slice.call(n.querySelectorAll('a'));function u(){var y=innerHeight*.35,cur=null;as.forEach(function(l){var e=document.getElementById(l.getAttribute('href').slice(1));if(e&&e.getBoundingClientRect().top<y)cur=l});as.forEach(function(l){l.classList.toggle('on',l===cur)})}addEventListener('scroll',u,{passive:true});u()})();
