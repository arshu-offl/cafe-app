import {notFound, redirect} from 'next/navigation';
import Cafe from '../cafe-client';
import OwnerSetup from './setup';
import {cafeContext} from '../cafe-access';
import {chatGPTSignInPath} from '../chatgpt-auth';
import {roleHome} from '../access-policy';
export const dynamic = 'force-dynamic';
export default async function AdminPage() {
  const context = await cafeContext();
  if (!context.user) redirect(chatGPTSignInPath('/admin'));
  if (!context.owner) return <OwnerSetup/>;
  if (context.role === 'customer') notFound();
  if (context.role !== 'admin') redirect(roleHome(context.role));
  return <Cafe surface="admin"/>;
}
