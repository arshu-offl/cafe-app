export type Item = {id:string;name:string;description:string;price:number;category:string;veg:boolean;available:boolean;image:string;tag?:string};
export const categories=['All items','Coffee','Coolers','Bites','Bakery'];
export const initialItems:Item[]=[
 {id:'latte',name:'Signature latte',description:'Double espresso, silky milk & a little everyday magic.',price:180,category:'Coffee',veg:true,available:true,image:'',tag:'Bestseller'},
 {id:'cappuccino',name:'Classic cappuccino',description:'Rich espresso beneath a cloud of velvety foam.',price:160,category:'Coffee',veg:true,available:true,image:''},
 {id:'coldbrew',name:'Vanilla cold brew',description:'Slow-steeped for 18 hours. Smooth from the first sip.',price:210,category:'Coolers',veg:true,available:true,image:'',tag:'House favourite'},
 {id:'croissant',name:'Butter croissant',description:'Golden, flaky layers. Baked fresh every morning.',price:140,category:'Bakery',veg:true,available:true,image:''},
 {id:'sandwich',name:'Pesto grilled sandwich',description:'Basil pesto, tomato & mozzarella on sourdough.',price:260,category:'Bites',veg:true,available:true,image:'',tag:'Freshly made'},
 {id:'chicken',name:'Chicken melt',description:'Grilled chicken, melted cheddar & house sauce.',price:290,category:'Bites',veg:false,available:true,image:''},
 {id:'brownie',name:'Chocolate brownie',description:'Fudgy Belgian chocolate with a delicate crisp top.',price:150,category:'Bakery',veg:true,available:true,image:''},
 {id:'lemon',name:'Mint lime cooler',description:'Fresh lime, crushed mint & sparkling water.',price:150,category:'Coolers',veg:true,available:true,image:''}
];
export const defaultSettings={name:'Brew & Bloom',upi:'',address:'',managerEmail:'',taxRate:0};
export const money=(value:number)=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:2}).format(value/100);
