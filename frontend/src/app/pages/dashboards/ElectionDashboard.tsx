import { useState, lazy, Suspense, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  LayoutDashboard, ClipboardList, UserCircle, Lock,
  Scale, AlertTriangle, BarChart2, LogOut, ChevronRight,
  Menu, X, Zap, Shield, CheckCircle2,
} from 'lucide-react';
import { clearToken } from '../../lib/api';

const DataEntryPage          = lazy(() => import('../DataEntryPage').then(m => ({ default: m.DataEntryPage })));
const ECZEntryPage           = lazy(() => import('../ECZEntryPage').then(m => ({ default: m.ECZEntryPage })));
const ECZComparisonDashboard = lazy(() => import('../../components/ECZComparisonDashboard').then(m => ({ default: m.ECZComparisonDashboard })));

function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="w-7 h-7 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );
}

type SectionKey = 'overview'|'data-entry'|'ecz-entry'|'comparison'|'discrepancy'|'personal-details'|'security';

interface RoleConfig {
  label: string; color: string; eczLevel: string;
  sections: SectionKey[]; canEnterPollingResults: boolean;
  comparisonTitle: string; eczEntryTitle: string;
}

const ROLE_CONFIGS: Record<string, RoleConfig> = {
  agent:                { label:'Polling Station Agent',  color:'#dc2626', eczLevel:'polling_station', canEnterPollingResults:true,  sections:['overview','data-entry','ecz-entry','comparison','personal-details','security'], comparisonTitle:'Your Results vs ECZ Results', eczEntryTitle:'ECZ Official Figures' },
  polling_agent:        { label:'Polling Station Agent',  color:'#dc2626', eczLevel:'polling_station', canEnterPollingResults:true,  sections:['overview','data-entry','ecz-entry','comparison','personal-details','security'], comparisonTitle:'Your Results vs ECZ Results', eczEntryTitle:'ECZ Official Figures' },
  election_agent:       { label:'Election Agent',         color:'#dc2626', eczLevel:'polling_station', canEnterPollingResults:true,  sections:['overview','data-entry','ecz-entry','comparison','personal-details','security'], comparisonTitle:'Your Results vs ECZ Results', eczEntryTitle:'ECZ Official Figures' },
  ward_manager:         { label:'Ward Manager',           color:'#16a34a', eczLevel:'ward',            canEnterPollingResults:false, sections:['overview','ecz-entry','comparison','discrepancy','personal-details','security'], comparisonTitle:'All Polling Station Results vs ECZ (Ward)', eczEntryTitle:'ECZ Announced Figures — Ward Level' },
  constituency_manager: { label:'Constituency Manager',   color:'#0ea5e9', eczLevel:'constituency',    canEnterPollingResults:false, sections:['overview','ecz-entry','comparison','discrepancy','personal-details','security'], comparisonTitle:'All Polling Station Results vs ECZ (Constituency)', eczEntryTitle:'ECZ Announced Figures — Constituency Level' },
  district_manager:     { label:'District Manager',       color:'#f59e0b', eczLevel:'district',        canEnterPollingResults:false, sections:['overview','ecz-entry','comparison','discrepancy','personal-details','security'], comparisonTitle:'All Polling Station Results vs ECZ (District)', eczEntryTitle:'ECZ Announced Figures — District Level' },
  provincial_manager:   { label:'Provincial Manager',     color:'#8b5cf6', eczLevel:'province',        canEnterPollingResults:false, sections:['overview','ecz-entry','comparison','discrepancy','personal-details','security'], comparisonTitle:'All Polling Station Results vs ECZ (Province)', eczEntryTitle:'ECZ Announced Figures — Province Level' },
  province_manager:     { label:'Provincial Manager',     color:'#8b5cf6', eczLevel:'province',        canEnterPollingResults:false, sections:['overview','ecz-entry','comparison','discrepancy','personal-details','security'], comparisonTitle:'All Polling Station Results vs ECZ (Province)', eczEntryTitle:'ECZ Announced Figures — Province Level' },
  national_manager:     { label:'National Manager',       color:'#0ea5e9', eczLevel:'national',        canEnterPollingResults:false, sections:['overview','ecz-entry','comparison','discrepancy','personal-details','security'], comparisonTitle:'All Results vs ECZ (National)', eczEntryTitle:'ECZ Announced Figures — National Level' },
  super_admin:          { label:'Super Administrator',    color:'#0ea5e9', eczLevel:'national',        canEnterPollingResults:false, sections:['overview','ecz-entry','comparison','discrepancy','personal-details','security'], comparisonTitle:'All Results vs ECZ (National)', eczEntryTitle:'ECZ Announced Figures — National Level' },
  admin:                { label:'Administrator',          color:'#0ea5e9', eczLevel:'national',        canEnterPollingResults:false, sections:['overview','ecz-entry','comparison','discrepancy','personal-details','security'], comparisonTitle:'All Results vs ECZ (National)', eczEntryTitle:'ECZ Announced Figures — National Level' },
  manager:              { label:'Manager',                color:'#0ea5e9', eczLevel:'national',        canEnterPollingResults:false, sections:['overview','ecz-entry','comparison','discrepancy','personal-details','security'], comparisonTitle:'All Results vs ECZ (National)', eczEntryTitle:'ECZ Announced Figures — National Level' },
};

interface NavItem { key: SectionKey; label: string; icon: React.ReactNode; group: string }
const ALL_NAV: NavItem[] = [
  { key:'overview',         label:'Overview',             icon:<LayoutDashboard size={16}/>, group:'MAIN' },
  { key:'data-entry',       label:'Data Entry',           icon:<ClipboardList size={16}/>,   group:'ELECTION' },
  { key:'ecz-entry',        label:'ECZ Official Figures', icon:<Scale size={16}/>,           group:'ELECTION' },
  { key:'comparison',       label:'Results vs ECZ',       icon:<BarChart2 size={16}/>,       group:'ELECTION' },
  { key:'discrepancy',      label:'Discrepancy Notices',  icon:<AlertTriangle size={16}/>,   group:'ELECTION' },
  { key:'personal-details', label:'Personal Details',     icon:<UserCircle size={16}/>,      group:'PROFILE' },
  { key:'security',         label:'Security Settings',    icon:<Lock size={16}/>,            group:'PROFILE' },
];

const SIDEBAR_BG='#07111f', TOPBAR_BG='#0b1929', CARD_BG='#0f1f33', BORDER='rgba(255,255,255,0.07)';

function Field({label,value}:{label:string;value:string}) {
  return (
    <div>
      <p className="text-xs mb-1" style={{color:'rgba(255,255,255,0.35)',fontFamily:'Oswald, sans-serif',letterSpacing:'0.09em'}}>{label}</p>
      <p style={{color:'rgba(255,255,255,0.85)',fontSize:'0.88rem'}}>{value||'—'}</p>
    </div>
  );
}
function Card({title,children}:{title?:string;children:React.ReactNode}) {
  return (
    <div className="rounded-2xl p-5" style={{backgroundColor:CARD_BG,border:`1px solid ${BORDER}`}}>
      {title&&<p className="mb-4 text-xs" style={{fontFamily:'Oswald, sans-serif',letterSpacing:'0.12em',color:'rgba(255,255,255,0.4)'}}>{title.toUpperCase()}</p>}
      {children}
    </div>
  );
}
function Stat({label,value,color}:{label:string;value:string|number;color:string}) {
  return (
    <div className="rounded-2xl p-4 text-center" style={{backgroundColor:CARD_BG,border:`1px solid ${color}25`}}>
      <p style={{color,fontSize:'1.8rem',fontFamily:'Oswald, sans-serif',lineHeight:1}}>{value}</p>
      <p style={{color:'rgba(255,255,255,0.4)',fontSize:'0.7rem',marginTop:6}}>{label}</p>
    </div>
  );
}
function RestrictedNotice({notAllowed}:{notAllowed:string[]}) {
  if (!notAllowed.length) return null;
  return (
    <div className="mt-4 flex items-start gap-3 px-4 py-3 rounded-xl" style={{backgroundColor:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.2)'}}>
      <Shield size={15} style={{color:'#f59e0b',marginTop:2,flexShrink:0}}/>
      <p style={{color:'rgba(255,255,255,0.5)',fontSize:'0.78rem',lineHeight:1.5}}>
        <span style={{color:'#f59e0b',fontFamily:'Oswald, sans-serif',letterSpacing:'0.06em'}}>RESTRICTED: </span>
        This role is not permitted to enter results at {notAllowed.join(', ')} level{notAllowed.length>1?'s':''}.
      </p>
    </div>
  );
}

function getRestrictedLevels(role: string): string[] {
  const levels: string[] = [];
  const all = ['ward_manager','constituency_manager','district_manager','provincial_manager','province_manager','national_manager','super_admin','admin','manager'];
  if (all.includes(role)) levels.push('polling station');
  const skip1 = ['constituency_manager','district_manager','provincial_manager','province_manager','national_manager','super_admin','admin','manager'];
  if (skip1.includes(role)) levels.push('ward');
  const skip2 = ['district_manager','provincial_manager','province_manager','national_manager','super_admin','admin','manager'];
  if (skip2.includes(role)) levels.push('constituency');
  const skip3 = ['provincial_manager','province_manager','national_manager','super_admin','admin','manager'];
  if (skip3.includes(role)) levels.push('district');
  const skip4 = ['national_manager','super_admin','admin','manager'];
  if (skip4.includes(role)) levels.push('province');
  return levels;
}

export default function ElectionDashboard() {
  const navigate = useNavigate();
  const [active, setActive] = useState<SectionKey>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pwFields, setPwFields] = useState({current:'',next:'',confirm:''});
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState('');
  const [editing, setEditing] = useState(false);

  const rawUser = sessionStorage.getItem('boz_election_user');
  const user = rawUser ? JSON.parse(rawUser) : null;

  useEffect(() => { if (!user) navigate('/dashboard-login', {replace:true}); }, []);
  if (!user) return null;

  const role = (user.role ?? 'agent') as string;
  const conf = ROLE_CONFIGS[role] ?? ROLE_CONFIGS['agent'];
  const allowed = new Set(conf.sections);

  const [profile, setProfile] = useState({
    name: user.name ?? user.username ?? '',
    username: user.username ?? '',
    email: user.email ?? '',
    phone: user.phone ?? '',
    scopeName: user.scopeName ?? user.pollingStationName ?? 'Not assigned',
    scopeType: user.scopeType ?? conf.eczLevel,
  });

  const groupMap: Record<string, NavItem[]> = {};
  for (const item of ALL_NAV) {
    if (!allowed.has(item.key)) continue;
    if (!groupMap[item.group]) groupMap[item.group] = [];
    groupMap[item.group].push(item);
  }
  const navGroups = Object.entries(groupMap);

  function handleLogout() {
    clearToken();
    sessionStorage.removeItem('boz_election_user');
    sessionStorage.removeItem('boz_session_token');
    navigate('/dashboard-login');
  }
  function handleNav(key: SectionKey) { setActive(key); setSidebarOpen(false); }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (pwFields.next !== pwFields.confirm) { setPwMsg('New passwords do not match.'); return; }
    if (pwFields.next.length < 8) { setPwMsg('Password must be at least 8 characters.'); return; }
    setPwSaving(true); setPwMsg('');
    try {
      const token = sessionStorage.getItem('boz_session_token');
      const res = await fetch('/make-server-8fca9621/security/change-password', {
        method: 'POST',
        headers: {'Content-Type':'application/json', ...(token?{Authorization:`Bearer ${token}`}:{})},
        body: JSON.stringify({newPassword: pwFields.next}),
      });
      const data = await res.json();
      if (res.ok && data.success) { setPwMsg('✓ Password updated successfully.'); setPwFields({current:'',next:'',confirm:''}); }
      else setPwMsg(data.error ?? 'Failed to update password.');
    } catch { setPwMsg('Network error. Please try again.'); }
    finally { setPwSaving(false); }
  }

  function renderSection() {
    switch (active) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="rounded-2xl p-6" style={{background:`linear-gradient(135deg, ${conf.color}18, ${conf.color}06)`,border:`1px solid ${conf.color}30`}}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{background:conf.color}}>
                  {(profile.name||profile.username).charAt(0).toUpperCase()||'U'}
                </div>
                <div>
                  <h2 style={{fontFamily:'Oswald, sans-serif',fontSize:'1.4rem',letterSpacing:'0.04em',color:'#fff'}}>
                    Welcome, {profile.name||profile.username}
                  </h2>
                  <p style={{color:'rgba(255,255,255,0.4)',fontSize:'0.82rem'}}>
                    {conf.label} · {profile.scopeName} · 2026 Zambian General Election
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Stat label="Role" value={conf.label.split(' ')[0]} color={conf.color}/>
              <Stat label="Area" value={profile.scopeName.split(' ').slice(0,2).join(' ')||'—'} color={conf.color}/>
              <Stat label="ECZ Level" value={conf.eczLevel.charAt(0).toUpperCase()+conf.eczLevel.slice(1)} color={conf.color}/>
              <Stat label="Status" value="Active" color="#10b981"/>
            </div>
            <div>
              <p className="mb-3 text-xs" style={{fontFamily:'Oswald, sans-serif',letterSpacing:'0.1em',color:'rgba(255,255,255,0.35)'}}>QUICK ACCESS</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ALL_NAV.filter(n=>allowed.has(n.key)&&n.key!=='overview').map(n=>(
                  <button key={n.key} onClick={()=>handleNav(n.key)}
                    className="flex items-center gap-3 p-4 rounded-2xl text-left w-full transition-all"
                    style={{backgroundColor:CARD_BG,border:`1px solid ${BORDER}`}}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor=`${conf.color}50`}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor=BORDER}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{background:`${conf.color}18`,color:conf.color}}>{n.icon}</div>
                    <span style={{color:'#fff',fontSize:'0.88rem',fontFamily:'Oswald, sans-serif',letterSpacing:'0.04em'}}>{n.label}</span>
                    <ChevronRight size={15} className="ml-auto" style={{color:'rgba(255,255,255,0.3)'}}/>
                  </button>
                ))}
              </div>
            </div>
            {!conf.canEnterPollingResults && <RestrictedNotice notAllowed={getRestrictedLevels(role)}/>}
          </div>
        );

      case 'data-entry':
        if (!conf.canEnterPollingResults) return (
          <Card title="Access Restricted">
            <div className="flex flex-col items-center py-10 gap-3 text-center">
              <Shield size={36} style={{color:'#f59e0b'}}/>
              <p style={{color:'#fff',fontFamily:'Oswald, sans-serif',fontSize:'1.1rem'}}>Not Permitted</p>
              <p style={{color:'rgba(255,255,255,0.45)',fontSize:'0.85rem',maxWidth:380}}>
                As a {conf.label}, you are not authorised to enter polling station results.
                Only assigned polling station agents may enter results at station level.
              </p>
            </div>
          </Card>
        );
        return (
          <div>
            <div className="mb-5">
              <h2 style={{fontFamily:'Oswald, sans-serif',fontSize:'1.4rem',letterSpacing:'0.04em',color:'#fff'}}>Data Entry — Polling Station Results</h2>
              <p style={{color:'rgba(255,255,255,0.38)',fontSize:'0.82rem',marginTop:4}}>
                Enter the official vote counts for your assigned polling station: <strong style={{color:conf.color}}>{profile.scopeName}</strong>
              </p>
            </div>
            <Suspense fallback={<SectionLoader/>}><DataEntryPage/></Suspense>
          </div>
        );

      case 'ecz-entry':
        return (
          <div>
            <div className="mb-5">
              <h2 style={{fontFamily:'Oswald, sans-serif',fontSize:'1.4rem',letterSpacing:'0.04em',color:'#fff'}}>{conf.eczEntryTitle}</h2>
              <p style={{color:'rgba(255,255,255,0.38)',fontSize:'0.82rem',marginTop:4,maxWidth:600}}>
                Enter the figures officially announced by the Electoral Commission of Zambia (ECZ) at each level.
                These will be compared against agent-captured polling station data to identify any discrepancies.
              </p>
              {profile.scopeName&&(
                <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full" style={{backgroundColor:`${conf.color}15`,border:`1px solid ${conf.color}30`}}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor:conf.color}}/>
                  <span style={{color:conf.color,fontSize:'0.75rem',fontFamily:'Oswald, sans-serif',letterSpacing:'0.08em'}}>{profile.scopeName.toUpperCase()}</span>
                </div>
              )}
            </div>
            <Suspense fallback={<SectionLoader/>}><ECZEntryPage/></Suspense>
          </div>
        );

      case 'comparison':
        return (
          <div>
            <div className="mb-5">
              <h2 style={{fontFamily:'Oswald, sans-serif',fontSize:'1.4rem',letterSpacing:'0.04em',color:'#fff'}}>{conf.comparisonTitle}</h2>
              <p style={{color:'rgba(255,255,255,0.38)',fontSize:'0.82rem',marginTop:4}}>
                Side-by-side comparison of agent-submitted results vs ECZ officially announced figures. Discrepancies are automatically flagged.
              </p>
            </div>
            <Suspense fallback={<SectionLoader/>}><ECZComparisonDashboard/></Suspense>
          </div>
        );

      case 'discrepancy':
        return (
          <div>
            <div className="mb-5">
              <h2 style={{fontFamily:'Oswald, sans-serif',fontSize:'1.4rem',letterSpacing:'0.04em',color:'#fff'}}>Discrepancy Notices</h2>
              <p style={{color:'rgba(255,255,255,0.38)',fontSize:'0.82rem',marginTop:4}}>
                Automatic alerts raised when agent-submitted data does not match ECZ announced figures.
              </p>
            </div>
            <Card title="Active Discrepancy Alerts">
              <div className="flex flex-col items-center py-10 gap-3 text-center">
                <CheckCircle2 size={36} style={{color:'#10b981'}}/>
                <p style={{color:'#fff',fontFamily:'Oswald, sans-serif',fontSize:'1rem'}}>No discrepancies detected</p>
                <p style={{color:'rgba(255,255,255,0.4)',fontSize:'0.82rem',maxWidth:400}}>
                  Discrepancy notices appear here automatically when BOZ agent results differ from ECZ official figures.
                  Ensure ECZ figures are entered to enable comparison.
                </p>
              </div>
            </Card>
            <RestrictedNotice notAllowed={getRestrictedLevels(role)}/>
          </div>
        );

      case 'personal-details':
        return (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 style={{fontFamily:'Oswald, sans-serif',fontSize:'1.4rem',letterSpacing:'0.04em',color:'#fff'}}>Personal Details</h2>
              <button onClick={()=>setEditing(e=>!e)} className="px-4 py-2 rounded-xl text-sm"
                style={{background:editing?'#10b981':conf.color,color:'#fff',fontFamily:'Oswald, sans-serif',letterSpacing:'0.06em'}}>
                {editing?'DONE':'EDIT'}
              </button>
            </div>
            <Card title="Profile Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {(['name','username','email','phone','scopeName','scopeType'] as const).map(key=>{
                  const labels:{[k:string]:string}={name:'FULL NAME',username:'USERNAME',email:'EMAIL',phone:'PHONE',scopeName:'ASSIGNED AREA',scopeType:'AREA TYPE'};
                  return editing&&!['username','scopeName','scopeType'].includes(key)?(
                    <div key={key}>
                      <label className="block text-xs mb-1" style={{color:'rgba(255,255,255,0.35)',fontFamily:'Oswald, sans-serif',letterSpacing:'0.1em'}}>{labels[key]}</label>
                      <input className="w-full px-3 py-2.5 rounded-xl text-sm" value={profile[key]}
                        onChange={e=>setProfile(p=>({...p,[key]:e.target.value}))}
                        style={{backgroundColor:'rgba(255,255,255,0.06)',border:`1px solid ${conf.color}40`,color:'#fff',outline:'none'}}/>
                    </div>
                  ):<Field key={key} label={labels[key]} value={profile[key]}/>;
                })}
              </div>
              <div className="mt-4 pt-4" style={{borderTop:`1px solid ${BORDER}`}}>
                <Field label="ROLE" value={conf.label}/>
              </div>
            </Card>
          </div>
        );

      case 'security':
        return (
          <div>
            <h2 className="mb-5" style={{fontFamily:'Oswald, sans-serif',fontSize:'1.4rem',letterSpacing:'0.04em',color:'#fff'}}>Security Settings</h2>
            <Card title="Change Password">
              <form onSubmit={handlePasswordChange} className="max-w-md space-y-4">
                {[{f:'current',l:'CURRENT PASSWORD'},{f:'next',l:'NEW PASSWORD'},{f:'confirm',l:'CONFIRM NEW PASSWORD'}].map(({f,l})=>(
                  <div key={f}>
                    <label className="block text-xs mb-1" style={{color:'rgba(255,255,255,0.35)',fontFamily:'Oswald, sans-serif',letterSpacing:'0.1em'}}>{l}</label>
                    <input type="password" placeholder="••••••••"
                      value={pwFields[f as keyof typeof pwFields]}
                      onChange={e=>setPwFields(p=>({...p,[f]:e.target.value}))}
                      className="w-full px-3 py-2.5 rounded-xl text-sm"
                      style={{backgroundColor:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'#fff',outline:'none'}}/>
                  </div>
                ))}
                {pwMsg&&<p className="text-sm" style={{color:pwMsg.startsWith('✓')?'#10b981':'#f87171'}}>{pwMsg}</p>}
                <button type="submit" disabled={pwSaving} className="px-5 py-2.5 rounded-xl text-sm"
                  style={{background:pwSaving?`${conf.color}60`:conf.color,color:'#fff',fontFamily:'Oswald, sans-serif',letterSpacing:'0.06em',cursor:pwSaving?'not-allowed':'pointer'}}>
                  {pwSaving?'UPDATING...':'UPDATE PASSWORD'}
                </button>
              </form>
            </Card>
          </div>
        );
      default: return null;
    }
  }

  const SidebarContent = (
    <aside className="flex flex-col h-full" style={{width:260,backgroundColor:SIDEBAR_BG,borderRight:`1px solid ${BORDER}`}}>
      <div className="px-5 pt-6 pb-5" style={{borderBottom:`1px solid ${BORDER}`}}>
        <div className="flex items-center gap-2 mb-1">
          <Zap size={14} style={{color:conf.color}}/>
          <span style={{fontFamily:'Oswald, sans-serif',fontSize:'0.65rem',letterSpacing:'0.2em',color:'rgba(255,255,255,0.4)'}}>BUILD ONE ZAMBIA</span>
        </div>
        <p style={{fontFamily:'Oswald, sans-serif',fontSize:'0.8rem',letterSpacing:'0.1em',color:'#fff'}}>Election Dashboard</p>
      </div>
      <div className="mx-3 mt-4 p-3 rounded-xl" style={{backgroundColor:`${conf.color}12`,border:`1px solid ${conf.color}25`}}>
        <p style={{color:'#fff',fontFamily:'Oswald, sans-serif',fontSize:'0.82rem',letterSpacing:'0.04em'}}>{profile.name||profile.username}</p>
        <p style={{color:conf.color,fontSize:'0.7rem',marginTop:2,fontFamily:'Oswald, sans-serif',letterSpacing:'0.06em'}}>{conf.label.toUpperCase()}</p>
        <p style={{color:'rgba(255,255,255,0.35)',fontSize:'0.68rem',marginTop:1}}>{profile.scopeName}</p>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navGroups.map(([group,items])=>(
          <div key={group}>
            <p className="px-2 mb-1.5 text-xs" style={{fontFamily:'Oswald, sans-serif',letterSpacing:'0.14em',color:'rgba(255,255,255,0.25)'}}>{group}</p>
            {items.map(item=>{
              const isActive=active===item.key;
              return (
                <button key={item.key} onClick={()=>handleNav(item.key)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-left transition-all"
                  style={{backgroundColor:isActive?`${conf.color}20`:'transparent',border:`1px solid ${isActive?conf.color+'35':'transparent'}`,color:isActive?'#fff':'rgba(255,255,255,0.45)'}}>
                  <span style={{color:isActive?conf.color:'rgba(255,255,255,0.3)'}}>{item.icon}</span>
                  <span style={{fontFamily:'Oswald, sans-serif',fontSize:'0.8rem',letterSpacing:'0.05em'}}>{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="p-3" style={{borderTop:`1px solid ${BORDER}`}}>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
          style={{color:'rgba(255,255,255,0.4)'}}
          onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color='#ef4444'}
          onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.4)'}>
          <LogOut size={16}/>
          <span style={{fontFamily:'Oswald, sans-serif',fontSize:'0.8rem',letterSpacing:'0.06em'}}>SIGN OUT</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{backgroundColor:'#070f1c'}}>
      {sidebarOpen&&(
        <div className="fixed inset-0 z-40 lg:hidden" style={{backgroundColor:'rgba(0,0,0,0.65)',backdropFilter:'blur(4px)'}}
          onClick={()=>setSidebarOpen(false)}/>
      )}
      <div className="hidden lg:flex flex-col flex-shrink-0" style={{width:260}}>{SidebarContent}</div>
      <div className={`fixed top-0 left-0 h-full z-50 lg:hidden flex flex-col transition-transform duration-300 ${sidebarOpen?'translate-x-0':'-translate-x-full'}`} style={{width:260}}>
        {SidebarContent}
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-5 py-3 shrink-0"
          style={{backgroundColor:TOPBAR_BG,borderBottom:`1px solid ${BORDER}`,height:60}}>
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-1.5 rounded-lg" onClick={()=>setSidebarOpen(o=>!o)} style={{color:'rgba(255,255,255,0.6)'}}>
              {sidebarOpen?<X size={20}/>:<Menu size={20}/>}
            </button>
            <div>
              <p style={{fontFamily:'Oswald, sans-serif',fontSize:'0.85rem',letterSpacing:'0.06em',color:'#fff'}}>
                {ALL_NAV.find(n=>n.key===active)?.label??'Overview'}
              </p>
              <p style={{fontSize:'0.7rem',color:'rgba(255,255,255,0.35)'}}>{conf.label} · {profile.scopeName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{backgroundColor:`${conf.color}15`,border:`1px solid ${conf.color}30`}}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{backgroundColor:conf.color}}/>
              <span style={{color:conf.color,fontSize:'0.68rem',fontFamily:'Oswald, sans-serif',letterSpacing:'0.1em'}}>{conf.label.toUpperCase()}</span>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-lg transition-all"
              style={{color:'rgba(255,255,255,0.4)'}} title="Sign Out"
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color='#ef4444'}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.4)'}>
              <LogOut size={18}/>
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-5 sm:p-6">{renderSection()}</main>
      </div>
    </div>
  );
}
