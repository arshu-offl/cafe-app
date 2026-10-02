import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const base='http://127.0.0.1:5173';
// These fixtures use only the project's local D1; original role records are restored.
function sql(command){const r=spawnSync(process.execPath,['--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js','d1','execute','DB','--local','--config','dist/server/wrangler.json','--persist-to','.wrangler/state','--command',command,'--json'],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout)[0].results;}
const quote=value=>"'"+String(value).replaceAll("'","''")+"'";
function setRecord(id,data){sql(`INSERT INTO records(id,kind,data) VALUES(${quote(id)},${quote(id)},${quote(JSON.stringify(data))}) ON CONFLICT(id) DO UPDATE SET data=excluded.data`);}
async function call(surface='customer',body,cookie=''){const r=await fetch(base+'/api/cafe?surface='+surface,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(cookie?{cookie}:{})},...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,data:await r.json(),cache:r.headers.get('Cache-Control')};}
async function page(path,cookie=''){const r=await fetch(base+path,{redirect:'manual',headers:cookie?{cookie}:{}});return {status:r.status,location:r.headers.get('location'),html:await r.text()};}
const original=sql("SELECT id,kind,data FROM records WHERE id IN ('owner','settings')");
let testOrderId;
try{
 setRecord('owner',{id:'local_seedy'});setRecord('settings',{name:'Brew & Bloom',upi:'',address:'',taxRate:0,managerEmail:''});
 const guest=await call();assert.equal(guest.status,200);assert.equal(guest.data.role,'customer');assert.deepEqual(guest.data.orders,[]);assert.ok(!('managerEmail' in guest.data.settings));assert.match(guest.cache,/no-store/);
 assert.equal((await call('manager')).status,403);assert.equal((await call('admin')).status,403);
 assert.equal((await call('customer',{action:'item',item:{}})).status,403);
 assert.equal((await call('admin',{action:'setup'})).status,401);
 for(const path of ['/manager','/admin']){const p=await page(path);assert.equal(p.status,307);assert.ok(p.location.includes('signin-with-chatgpt'));assert.ok(!p.html.includes('The daily brew.'));assert.ok(!p.html.includes('Behind the counter.'));}
 const home=await page('/');assert.equal(home.status,200);assert.ok(!home.html.includes('>Manager<'));assert.ok(!home.html.includes('>Dashboard<'));
 const payload={action:'order',requestId:crypto.randomUUID(),name:'Local role test',mode:'Dine-in',table:'7',items:[{id:'latte',qty:2}],total:1};
 const created=await call('customer',payload);assert.equal(created.status,200);testOrderId=created.data.order.id;assert.equal(created.data.order.total,36000);
 assert.equal((await call('customer',payload)).data.order.id,testOrderId);
 assert.equal((await call('customer',{...payload,requestId:crypto.randomUUID(),items:[{id:'latte',qty:-1}]})).status,400);
 assert.equal((await fetch(base+'/api/cafe?order='+testOrderId)).status,404);
 assert.equal((await fetch(base+'/api/cafe?order='+testOrderId+'&token='+created.data.token)).status,200);
 const login=await fetch(base+'/signin-with-chatgpt?return_to=/admin',{redirect:'manual'});const cookie=login.headers.getSetCookie().map(v=>v.split(';')[0]).join('; ');assert.ok(cookie);
 const admin=await call('admin',undefined,cookie);assert.equal(admin.data.role,'admin');assert.equal(admin.data.items.length,0);
 assert.equal((await call('customer',undefined,cookie)).status,403);assert.equal((await call('manager',undefined,cookie)).status,403);
 assert.equal((await call('admin',payload,cookie)).status,403);assert.equal((await call('admin',{action:'item',item:{}},cookie)).status,403);
 for(const path of ['/','/manager'])assert.equal((await page(path,cookie)).location,'/admin');
 const adminPage=await page('/admin',cookie);assert.equal(adminPage.status,200);assert.ok(adminPage.html.includes('The daily brew.'));assert.ok(!adminPage.html.includes('Open basket'));assert.ok(!adminPage.html.includes('Add menu item'));
 // The same local mock identity is reassigned only in the isolated local fixture.
 setRecord('owner',{id:'local_test_owner'});setRecord('settings',{name:'Brew & Bloom',upi:'',address:'',taxRate:0,managerEmail:'seedy@sites.test'});
 const manager=await call('manager',undefined,cookie);assert.equal(manager.data.role,'manager');assert.ok(!('managerEmail' in manager.data.settings));assert.ok(manager.data.orders.every(o=>!['Completed','Cancelled'].includes(o.status)));
 assert.equal((await call('customer',undefined,cookie)).status,403);assert.equal((await call('admin',undefined,cookie)).status,403);
 assert.equal((await call('manager',payload,cookie)).status,403);assert.equal((await call('manager',{action:'settings',settings:{}},cookie)).status,403);
 for(const path of ['/','/admin'])assert.equal((await page(path,cookie)).location,'/manager');
 const managerPage=await page('/manager',cookie);assert.equal(managerPage.status,200);assert.ok(managerPage.html.includes('Behind the counter.'));assert.ok(!managerPage.html.includes('Open basket'));assert.ok(!managerPage.html.includes('Report period'));
 const item={id:'role-test-item',name:'Role test item',description:'Temporary verification fixture',category:'Coffee',price:99.99,veg:true,available:false,image:''};
 assert.equal((await call('manager',{action:'item',item},cookie)).status,200);
 assert.equal((await call('customer',{...payload,requestId:crypto.randomUUID(),items:[{id:item.id,qty:1}]})).status,400);
 assert.equal((await call('manager',{action:'status',id:testOrderId,payment:'Paid',status:'Completed'},cookie)).status,200);
 assert.ok(!(await call('manager',undefined,cookie)).data.orders.some(o=>o.id===testOrderId));
 setRecord('settings',{name:'Brew & Bloom',upi:'',address:'',taxRate:0,managerEmail:''});
 for(const path of ['/admin','/manager']){const p=await page(path,cookie);assert.equal(p.status,404);assert.ok(!p.html.includes('The daily brew.'));assert.ok(!p.html.includes('Behind the counter.'));}
 assert.equal((await call('manager',undefined,cookie)).status,403);
 console.log('PASS: isolated navigation, role redirects, customer and staff route protection, API role/action matrix, revoked access, no-store responses, server prices, retry deduplication, order privacy, manager menu/status updates and sold-out protection.');
}finally{
 for(const id of ['owner','settings']){const r=original.find(r=>r.id===id);if(r)sql(`INSERT INTO records(id,kind,data) VALUES(${quote(r.id)},${quote(r.kind)},${quote(r.data)}) ON CONFLICT(id) DO UPDATE SET data=excluded.data,kind=excluded.kind`);else sql(`DELETE FROM records WHERE id=${quote(id)}`);}
 sql("DELETE FROM records WHERE id='item:role-test-item'");if(testOrderId)sql(`DELETE FROM orders WHERE id=${quote(testOrderId)}`);
}
