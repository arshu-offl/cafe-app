'use client';
import {useState} from 'react';
export default function OwnerSetup() {
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  async function setup(){setBusy(true);try{const r=await fetch('/api/cafe?surface=admin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'setup'})});const d:any=await r.json();if(!r.ok)throw new Error(d.error);window.location.reload();}catch(e){setError(e instanceof Error?e.message:'Setup failed');setBusy(false);}}
  return <main><section className="staff-gate panel"><p className="eyebrow">OWNER SETUP</p><h1>Your café administration.</h1><p>Set up your owner account to configure payments, assign a manager, and view sales.</p>{error&&<p role="alert">{error}</p>}<button className="primary" disabled={busy} onClick={setup}>{busy?'Setting up…':'Set up café as owner'}</button><small>Complete owner setup while the site is private.</small></section></main>;
}
