import menu from '../data/menu.json';
import settings from '../data/settings.json';
export type Item = {id:string;name:string;description:string;price:number;category:string;veg:boolean;available:boolean;image:string;tag?:string};
export const categories=['All items','Coffee','Coolers','Bites','Bakery'];
export const initialItems:Item[]=menu;
export const defaultSettings=settings;
export const money=(value:number)=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:2}).format(value/100);
