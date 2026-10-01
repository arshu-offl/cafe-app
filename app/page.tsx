import {redirect} from 'next/navigation';
import Cafe from './cafe-client';
import {cafeContext} from './cafe-access';
import {roleHome} from './access-policy';
export const dynamic='force-dynamic';
export default async function CustomerPage(){
 const {role}=await cafeContext();
 if(role!=='customer')redirect(roleHome(role));
 return <Cafe surface="customer"/>;
}
