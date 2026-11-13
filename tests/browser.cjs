// Run against a local HTTP server: NODE_PATH=<playwright install> node tests/browser.cjs
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:8000';
const root = path.resolve(__dirname, '..');
function htmlFiles(dir) { return fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => ['.git','node_modules'].includes(e.name)?[]:e.isDirectory()?htmlFiles(path.join(dir,e.name)):e.name.endsWith('.html')?[path.relative(root,path.join(dir,e.name))]:[]); }
(async () => {
 const browser = await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']}:{})});
 try {
 const context = await browser.newContext({permissions:['clipboard-read','clipboard-write']});
 const page = await context.newPage();const errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
 for(const file of htmlFiles(root)){await page.goto(`${base}/${file}`);await page.waitForTimeout(30);}
 assert.deepEqual(errors,[], 'Every page must load without JS or HTTP errors');
 await page.goto(base+'/index.html');assert.equal(await page.locator('[data-module]').count(),9);
 await page.locator('.header-more').evaluate(e=>e.open=true);await page.locator('#themeToggle').click();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
 for(const file of fs.readdirSync(path.join(root,'modulos'))){await page.goto(base+'/modulos/'+file);await page.locator('[data-note]').last().fill('Minha anotação');await page.reload();assert.equal(await page.locator('[data-note]').last().inputValue(),'Minha anotação');await page.locator('button[onclick^="completeModule"]').click();}
 await page.goto(base+'/index.html');assert.equal(await page.locator('[data-done-count]').innerText(),'9');
 await page.goto(base+'/modulos/04-prompts.html');await page.locator('#contexto').fill('Cafeteria de bairro');await page.getByRole('button',{name:'Montar prompt',exact:true}).click();assert.match(await page.locator('#promptOutput').innerText(),/Cafeteria de bairro/);
 await page.goto(base+'/modulos/09-projeto.html');await page.locator('[data-project="problema"]').fill('Pedidos repetidos');await page.reload();assert.equal(await page.locator('[data-project="problema"]').inputValue(),'Pedidos repetidos');
 await page.goto(base+'/avaliacao-final.html');assert.equal(await page.locator('.assessment-item').count(),12);await page.locator('#assessmentButton').click();assert.match(await page.locator('#assessmentResult').innerText(),/Complete todas/);await page.locator('input[data-correct="1"]').evaluateAll(es=>es.forEach(e=>e.checked=true));await page.locator('#assessmentButton').click();assert.equal(await page.evaluate(()=>localStorage.getItem('ia_best_score')),'100');
 await page.goto(base+'/certificado.html');await page.locator('#certificateName').fill('Aluno Teste');await page.getByRole('button',{name:'Gerar certificado simbólico',exact:true}).click();assert.equal(await page.locator('#symbolicCertificate').isVisible(),true);assert.equal(await page.locator('[data-certificate-person]').innerText(),'Aluno Teste');
 await page.goto(base+'/meus-dados.html');await page.evaluate(()=>localStorage.setItem('ia_note_preserve','KEEP'));let backup=await page.evaluate(()=>getCourseData());
 page.on('dialog',d=>d.accept());
 for(const items of [[],null,{'ia_gemini_done':'{}'},{ia_final_score:'101'},{ia_assessment_categories:JSON.stringify({'<img src=x onerror=alert(1)>':{total:1,correct:1}})}]){await page.locator('#backupFile').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({version:22,items}))});await page.waitForTimeout(80);assert.equal(await page.evaluate(()=>localStorage.getItem('ia_note_preserve')),'KEEP');}
 const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Baixar backup JSON',exact:true}).click();const download=await downloadPromise;const downloaded=JSON.parse(fs.readFileSync(await download.path(),'utf8'));assert.equal(downloaded.items.ia_note_preserve,'KEEP');
 await page.evaluate(()=>{window.originalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='ia_note_failure')throw new DOMException('Full','QuotaExceededError');return window.originalSetItem.call(this,k,v)}});
 await page.locator('#backupFile').setInputFiles({name:'quota.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({version:22,items:{ia_note_preserve:'OVERWRITTEN',ia_note_failure:'test'}}))});await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>localStorage.getItem('ia_note_preserve')),'KEEP');await page.evaluate(()=>Storage.prototype.setItem=window.originalSetItem);
 await page.evaluate(()=>localStorage.setItem('ia_note_preserve','CHANGED'));await page.locator('#backupFile').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});await page.waitForTimeout(700);assert.equal(await page.evaluate(()=>localStorage.getItem('ia_note_preserve')),'KEEP');
 await page.evaluate(()=>{localStorage.setItem('ia_gemini_done',JSON.stringify(Array(9).fill('nonexistent')))});assert.equal(await page.evaluate(()=>certificateEligible()),false);
 await page.evaluate(()=>{localStorage.setItem('ia_gemini_done','{}')});assert.equal(await page.evaluate(()=>firstIncomplete()),'01-fundamentos');
 await page.goto(base+'/resultado-final.html');await page.evaluate(()=>{localStorage.setItem('ia_assessment_categories',JSON.stringify({'<img src=x onerror="window.injected=true">':{correct:1,total:1}}));initFinalResult()});assert.equal(await page.locator('#categoryPerformance img').count(),0);
 await page.goto(base+'/aula-zero.html');await page.locator('.copy').first().click();assert.match(await page.evaluate(()=>navigator.clipboard.readText()),/Inteligência Artificial Generativa/);
 await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{value:undefined,configurable:true});document.execCommand=()=>false});await page.locator('.copy').first().click();assert.match(await page.locator('.copy').first().innerText(),/Selecione/);
 await page.goto(base+'/fontes.html');await page.locator('.header-more').evaluate(e=>e.open=true);await page.locator('#textSizeToggle').click();assert.equal(await page.locator('html').getAttribute('data-text-size'),'large');
 await page.setViewportSize({width:390,height:844});for(const file of ['index.html','aula-zero.html','modulos/04-prompts.html','modulos/09-projeto.html','avaliacao-final.html','professor/index.html']){await page.goto(base+'/'+file);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Mobile overflow: ${file}`)}
 const blocked=await browser.newContext();await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError')}}));const bp=await blocked.newPage();let blockedErrors=[];bp.on('pageerror',e=>blockedErrors.push(e.message));await bp.goto(base+'/index.html');assert.deepEqual(blockedErrors,[]);await blocked.close();
 assert.deepEqual(errors,[]);console.log('PASS: all pages, 9 lessons, notes, project, assessment, certificate, backup validation/restore, injection protection, copy, preferences and mobile layouts.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
