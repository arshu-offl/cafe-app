export const STORE_KEY='brew-bloom-static-v1';
const clone=value=>JSON.parse(JSON.stringify(value));
const categories=['Coffee','Coolers','Bites','Bakery'];
const statuses=['Received','Preparing','Ready','Completed','Cancelled'];
// This is a browser demo store, not an authentication or authorization boundary.
export function createDemoStore(seed,storage){
 function read(){const raw=storage.getItem(STORE_KEY);if(!raw)return {version:1,...clone(seed)};let state;try{state=JSON.parse(raw);}catch{throw Error('Saved demo data could not be read. Restore your browser data or clear this site’s storage.');}if(state.version!==1||!Array.isArray(state.items)||!Array.isArray(state.orders)||!state.settings)throw Error('Saved demo data has an unsupported format.');return state;}
 function write(state){try{storage.setItem(STORE_KEY,JSON.stringify(state));}catch{throw Error('Your browser could not save this change. Free some storage and try again.');}}
 function snapshot(surface){const state=read();return {...state,role:surface,orders:surface==='customer'?[]:surface==='manager'?state.orders.filter(o=>!['Completed','Cancelled'].includes(o.status)):state.orders};}
 function order(id){return read().orders.find(o=>o.id===id)||null;}
 function perform(surface,body){const state=read();const allowed={customer:['order'],manager:['item','status'],admin:['settings','status']};if(!allowed[surface]?.includes(body.action))throw Error('This action belongs to a different demo view.');
  if(body.action==='order'){
   const old=state.orders.find(o=>o.requestId===body.requestId);if(old)return {order:old,token:old.token};
   if(typeof body.requestId!=='string'||!/^[\w-]{20,80}$/.test(body.requestId))throw Error('Invalid order request.');
   if(typeof body.name!=='string'||!body.name.trim()||body.name.length>80||!['Dine-in','Takeaway'].includes(body.mode))throw Error('Enter your name and order type.');
   if(body.mode==='Dine-in'&&(!/^\d{1,3}$/.test(body.table)||Number(body.table)<1))throw Error('Enter a table number from 1 to 999.');
   if(!Array.isArray(body.items)||!body.items.length||body.items.length>40)throw Error('Add items to your basket.');
   const items=body.items.map(line=>{const item=state.items.find(i=>i.id===line.id);if(!item?.available||!Number.isInteger(line.qty)||line.qty<1||line.qty>20)throw Error('An item is unavailable or has an invalid quantity.');return {id:item.id,name:item.name,price:Math.round(item.price*100),qty:line.qty};});
   const subtotal=items.reduce((sum,i)=>sum+i.price*i.qty,0),tax=Math.round(subtotal*state.settings.taxRate/100),id=crypto.randomUUID(),token=crypto.randomUUID();
   const result={id,token,requestId:body.requestId,number:id.slice(0,6).toUpperCase(),created:Date.now(),name:body.name.trim(),mode:body.mode,table:body.mode==='Dine-in'?body.table:'',notes:String(body.notes||'').slice(0,500),items,subtotal,tax,taxRate:state.settings.taxRate,total:subtotal+tax,status:'Received',payment:'Unpaid',cafe:clone(state.settings)};
   state.orders.unshift(result);write(state);return {order:result,token};
  }
  if(body.action==='item'){const i=body.item;if(!i||typeof i.name!=='string'||!i.name.trim()||i.name.length>80||typeof i.description!=='string'||i.description.length>300||!Number.isFinite(i.price)||i.price<=0||i.price>100000||!categories.includes(i.category))throw Error('Check the item name, category and price.');if(i.image&&!/^https:\/\//.test(i.image))throw Error('Use an HTTPS image URL.');const item={id:i.id||crypto.randomUUID(),name:i.name.trim(),description:i.description,price:Math.round(i.price*100)/100,category:i.category,veg:!!i.veg,available:!!i.available,image:String(i.image||'').slice(0,2000),tag:String(i.tag||'').slice(0,30)};const index=state.items.findIndex(x=>x.id===item.id);if(index<0)state.items.push(item);else state.items[index]=item;}
  if(body.action==='status'){const o=state.orders.find(o=>o.id===body.id);if(!o)throw Error('Order not found.');if(body.status){if(!statuses.includes(body.status))throw Error('Invalid order status.');o.status=body.status;}if(body.payment){if(!['Unpaid','Paid'].includes(body.payment))throw Error('Invalid payment status.');o.payment=body.payment;}}
  if(body.action==='settings'){const s=body.settings;if(!s||typeof s.name!=='string'||!s.name.trim()||s.name.length>80||!Number.isFinite(s.taxRate)||s.taxRate<0||s.taxRate>30||s.upi&&!/^[\w.\-]{2,}@[\w.\-]{2,}$/.test(s.upi))throw Error('Check café name, UPI ID and tax rate.');state.settings={name:s.name.trim(),address:String(s.address||'').slice(0,300),upi:s.upi||'',taxRate:s.taxRate};}
  write(state);return {ok:true};
 }
 return {snapshot,order,perform,exportJSON:()=>JSON.stringify(read(),null,2)};
}
