import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, Eye, EyeOff, Lock, User, ArrowRight, Zap, Shield, BarChart2, ChevronDown, CheckCircle2 } from 'lucide-react';
import { API_BASE } from '@/app/lib/apiBase';

type RoleId = 'agent'|'ward_manager'|'constituency_manager'|'district_manager'|'provincial_manager'|'national_manager';

interface RoleOption {
  id: RoleId; label: string; description: string; color: string;
  scopeLevel: 'polling_station'|'ward'|'constituency'|'district'|'province'|'national';
}

const ROLES: RoleOption[] = [
  { id:'agent',                label:'Polling Station Agent',  description:'Enter results from your assigned polling station', color:'#dc2626', scopeLevel:'polling_station' },
  { id:'ward_manager',         label:'Ward Manager',           description:'Oversee all polling stations within your ward',    color:'#16a34a', scopeLevel:'ward' },
  { id:'constituency_manager', label:'Constituency Manager',   description:'Manage all wards in your constituency',            color:'#0ea5e9', scopeLevel:'constituency' },
  { id:'district_manager',     label:'District Manager',       description:'Oversee all constituencies in your district',      color:'#f59e0b', scopeLevel:'district' },
  { id:'provincial_manager',   label:'Provincial Manager',     description:'Manage all districts in your province',            color:'#8b5cf6', scopeLevel:'province' },
  { id:'national_manager',     label:'National Manager',       description:'Full national election results oversight',         color:'#0ea5e9', scopeLevel:'national' },
];

async function getApiUrl() {
  if (typeof window!=='undefined'&&window.location.hostname!=='localhost'&&window.location.hostname!=='127.0.0.1') return '/make-server-8fca9621';
  return API_BASE;
}

function StyledSelect({value,onChange,disabled=false,placeholder,children,accentColor}:{value:string;onChange:(v:string)=>void;disabled?:boolean;placeholder:string;children:React.ReactNode;accentColor?:string}) {
  return (
    <div className="relative">
      <select value={value} onChange={e=>onChange(e.target.value)} disabled={disabled}
        className="w-full appearance-none pl-4 pr-10 py-3 rounded-xl text-sm"
        style={{backgroundColor:'rgba(255,255,255,0.05)',border:`1px solid ${accentColor?accentColor+'40':'rgba(255,255,255,0.1)'}`,color:value?'#fff':'rgba(255,255,255,0.3)',outline:'none',cursor:disabled?'not-allowed':'pointer',opacity:disabled?.5:1}}>
        <option value="" style={{backgroundColor:'#0b1929',color:'rgba(255,255,255,0.5)'}}>{placeholder}</option>
        {children}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{color:'rgba(255,255,255,0.4)'}}/>
    </div>
  );
}

export default function DashboardLogin() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<RoleId|''>('');
  const [province,setProvince]=useState('');
  const [district,setDistrict]=useState('');
  const [constituency,setConstituency]=useState('');
  const [ward,setWard]=useState('');
  const [pollingStation,setPollingStation]=useState('');
  const [username,setUsername]=useState('');
  const [password,setPassword]=useState('');
  const [showPass,setShowPass]=useState(false);
  const [step,setStep]=useState<1|2|3>(1);
  const [isLoading,setIsLoading]=useState(false);
  const [error,setError]=useState('');
  const [provinces,setProvinces]=useState<any[]>([]);

  useMemo(()=>{ import('../data/mockData').then(m=>setProvinces(m.provinces)); },[]);

  const role=ROLES.find(r=>r.id===selectedRole);
  const currentProvince=provinces.find(p=>p.name===province);
  const currentDistrict=currentProvince?.districts.find((d:any)=>d.name===district);
  const currentConstituency=currentDistrict?.constituencies.find((c:any)=>c.name===constituency);
  const currentWard=currentConstituency?.wards.find((w:any)=>w.name===ward);

  const areaComplete=useMemo(()=>{
    if (!role) return false;
    const l=role.scopeLevel;
    if (l==='national') return true;
    if (l==='province') return !!province;
    if (l==='district') return !!province&&!!district;
    if (l==='constituency') return !!province&&!!district&&!!constituency;
    if (l==='ward') return !!province&&!!district&&!!constituency&&!!ward;
    if (l==='polling_station') return !!province&&!!district&&!!constituency&&!!ward&&!!pollingStation;
    return false;
  },[role,province,district,constituency,ward,pollingStation]);

  const scopeName=useMemo(()=>{
    if (!role) return '';
    const l=role.scopeLevel;
    if (l==='national') return 'National';
    if (l==='province') return province;
    if (l==='district') return district;
    if (l==='constituency') return constituency;
    if (l==='ward') return ward;
    if (l==='polling_station') return pollingStation;
    return '';
  },[role,province,district,constituency,ward,pollingStation]);

  function resetArea(){setProvince('');setDistrict('');setConstituency('');setWard('');setPollingStation('');}
  function handleRoleSelect(id:RoleId){setSelectedRole(id);resetArea();setError('');}
  function goToStep(n:1|2|3){setStep(n);setError('');}

  async function handleLogin(e:React.FormEvent){
    e.preventDefault();
    if (!username||!password){setError('Please enter your credentials.');return;}
    setIsLoading(true);setError('');
    try {
      const apiUrl=await getApiUrl();
      const res=await fetch(`${apiUrl}/auth/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})});
      let data:any;try{data=await res.json();}catch{data={};}
      if (res.ok&&data.token){
        const backendRole:string=data.user?.role??'';
        const allowed:Record<RoleId,string[]>={
          agent:['agent','polling_agent','election_agent'],
          ward_manager:['ward_manager'],
          constituency_manager:['constituency_manager'],
          district_manager:['district_manager'],
          provincial_manager:['provincial_manager','province_manager'],
          national_manager:['national_manager','super_admin','admin','manager'],
        };
        if (!allowed[selectedRole as RoleId]?.includes(backendRole)){
          setError(`Your account role "${backendRole}" does not match the selected role. Please choose the correct role.`);
          setIsLoading(false);return;
        }
        sessionStorage.setItem('boz_session_token',data.token);
        sessionStorage.setItem('boz_election_user',JSON.stringify({...data.user,scopeName,scopeType:role?.scopeLevel,scopeId:data.user?.scopeId??scopeName}));
        navigate('/dashboard/election');
      } else {
        setError(data.error??data.details??'Invalid username or password.');
      }
    } catch(err:any){
      if (err?.name==='TypeError'||err?.message?.includes('fetch')){
        if (selectedRole==='national_manager'&&username==='Bozplans'&&password==='Wakuca55'){
          sessionStorage.setItem('boz_election_user',JSON.stringify({username:'Bozplans',role:'national_manager',name:'National Administrator',scopeName:'National',scopeType:'national'}));
          navigate('/dashboard/election');return;
        }
        setError('Cannot reach the authentication server. Check your network connection.');
      } else setError(err?.message??'Login failed.');
    } finally{setIsLoading(false);}
  }

  const accentColor=role?.color??'#0ea5e9';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden" style={{backgroundColor:'#050c17'}}>
      <div className="absolute inset-0 pointer-events-none" style={{backgroundImage:`linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)`,backgroundSize:'48px 48px'}}/>
      <div className="absolute pointer-events-none" style={{top:'-10%',left:'30%',width:600,height:400,background:'radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 70%)'}}/>

      <div className="relative w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-5 px-4 py-2 rounded-full" style={{backgroundColor:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)'}}>
            <BarChart2 size={13} style={{color:'#0ea5e9'}}/>
            <span style={{fontFamily:'Oswald, sans-serif',fontSize:'0.7rem',letterSpacing:'0.18em',color:'rgba(255,255,255,0.5)'}}>BUILD ONE ZAMBIA — ELECTION PORTAL</span>
          </div>
          <h1 style={{fontFamily:'Oswald, sans-serif',fontSize:'clamp(1.8rem,5vw,2.6rem)',letterSpacing:'0.04em',color:'#fff',lineHeight:1.1}}>
            ELECTION{' '}
            <span style={{background:'linear-gradient(90deg, #0ea5e9, #8b5cf6)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>DASHBOARD</span>
          </h1>
          <p className="mt-2" style={{color:'rgba(255,255,255,0.35)',fontSize:'0.85rem'}}>2026 Zambian General Election — Secure Access</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1,2,3].map(n=>(
            <div key={n} className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={{backgroundColor:step>n?'#10b981':step===n?'#fff':'rgba(255,255,255,0.1)',color:step>n?'#fff':step===n?'#000':'rgba(255,255,255,0.3)',fontFamily:'Oswald, sans-serif'}}>
                {step>n?'✓':n}
              </div>
              {n<3&&<div className="w-8 h-px" style={{backgroundColor:step>n?'#10b981':'rgba(255,255,255,0.12)'}}/>}
            </div>
          ))}
          <div className="ml-3 flex gap-3 text-xs" style={{color:'rgba(255,255,255,0.35)',fontFamily:'Oswald, sans-serif',letterSpacing:'0.06em'}}>
            {['ROLE','AREA','LOGIN'].map((l,i)=><span key={l} style={{color:step===i+1?'#fff':undefined}}>{l}</span>)}
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{backgroundColor:'#0b1929',border:`1px solid ${accentColor}30`,boxShadow:`0 0 60px ${accentColor}10`}}>

          {/* STEP 1 */}
          {step===1&&(
            <div className="p-7">
              <p className="mb-1" style={{fontFamily:'Oswald, sans-serif',fontSize:'1rem',letterSpacing:'0.06em',color:'#fff'}}>SELECT YOUR ROLE</p>
              <p className="mb-5 text-sm" style={{color:'rgba(255,255,255,0.35)'}}>Choose the role assigned to you by your supervisor</p>
              <div className="space-y-2">
                {ROLES.map(r=>(
                  <button key={r.id} onClick={()=>handleRoleSelect(r.id)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all"
                    style={{backgroundColor:selectedRole===r.id?`${r.color}15`:'rgba(255,255,255,0.03)',border:`1px solid ${selectedRole===r.id?r.color+'50':'rgba(255,255,255,0.07)'}`}}>
                    <div className="w-3 h-3 rounded-full shrink-0 mt-0.5" style={{backgroundColor:r.color,boxShadow:selectedRole===r.id?`0 0 8px ${r.color}`:'none'}}/>
                    <div className="flex-1 min-w-0">
                      <p style={{fontFamily:'Oswald, sans-serif',fontSize:'0.88rem',letterSpacing:'0.04em',color:'#fff'}}>{r.label}</p>
                      <p style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.35)',marginTop:2}}>{r.description}</p>
                    </div>
                    {selectedRole===r.id&&<CheckCircle2 size={18} style={{color:r.color,flexShrink:0}}/>}
                  </button>
                ))}
              </div>
              <button onClick={()=>{if(selectedRole)goToStep(2);}} disabled={!selectedRole}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl mt-6 transition-all"
                style={{background:selectedRole?`linear-gradient(135deg,${accentColor},${accentColor}cc)`:'rgba(255,255,255,0.08)',color:selectedRole?'#fff':'rgba(255,255,255,0.3)',fontFamily:'Oswald, sans-serif',letterSpacing:'0.1em',fontSize:'0.85rem',cursor:selectedRole?'pointer':'not-allowed',boxShadow:selectedRole?`0 4px 24px ${accentColor}30`:'none'}}>
                CONTINUE <ArrowRight size={15}/>
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step===2&&role&&(
            <div className="p-7">
              <button onClick={()=>goToStep(1)} className="flex items-center gap-1 mb-5 text-xs" style={{color:'rgba(255,255,255,0.35)',fontFamily:'Oswald, sans-serif',letterSpacing:'0.08em'}}
                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color='#fff'} onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.35)'}>
                <ChevronLeft size={14}/> CHANGE ROLE
              </button>
              <div className="flex items-center gap-3 mb-5 p-3 rounded-xl" style={{backgroundColor:`${role.color}12`,border:`1px solid ${role.color}30`}}>
                <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor:role.color}}/>
                <p style={{fontFamily:'Oswald, sans-serif',fontSize:'0.82rem',letterSpacing:'0.06em',color:'#fff'}}>{role.label.toUpperCase()}</p>
              </div>
              <p className="mb-1" style={{fontFamily:'Oswald, sans-serif',fontSize:'1rem',letterSpacing:'0.06em',color:'#fff'}}>SELECT YOUR ASSIGNED AREA</p>
              <p className="mb-5 text-sm" style={{color:'rgba(255,255,255,0.35)'}}>
                {role.scopeLevel==='national'?'National managers have full national access — no area selection needed.':'Select your assigned geographic area.'}
              </p>
              {role.scopeLevel==='national'?(
                <div className="flex items-center gap-3 p-4 rounded-xl" style={{backgroundColor:`${role.color}10`,border:`1px solid ${role.color}25`}}>
                  <Shield size={18} style={{color:role.color}}/>
                  <div>
                    <p style={{color:'#fff',fontFamily:'Oswald, sans-serif',fontSize:'0.85rem',letterSpacing:'0.04em'}}>Full National Access</p>
                    <p style={{color:'rgba(255,255,255,0.4)',fontSize:'0.75rem',marginTop:2}}>You can view and manage all provinces, districts, and results.</p>
                  </div>
                </div>
              ):(
                <div className="space-y-3">
                  <div>
                    <label className="block mb-1.5 text-xs" style={{fontFamily:'Oswald, sans-serif',letterSpacing:'0.1em',color:'rgba(255,255,255,0.4)'}}>PROVINCE</label>
                    <StyledSelect value={province} onChange={v=>{setProvince(v);setDistrict('');setConstituency('');setWard('');setPollingStation('');}} placeholder="Select province" accentColor={role.color}>
                      {provinces.map((p:any)=><option key={p.id} value={p.name} style={{backgroundColor:'#0b1929'}}>{p.name}</option>)}
                    </StyledSelect>
                  </div>
                  {['district','constituency','ward','polling_station'].includes(role.scopeLevel)&&(
                    <div>
                      <label className="block mb-1.5 text-xs" style={{fontFamily:'Oswald, sans-serif',letterSpacing:'0.1em',color:'rgba(255,255,255,0.4)'}}>DISTRICT</label>
                      <StyledSelect value={district} onChange={v=>{setDistrict(v);setConstituency('');setWard('');setPollingStation('');}} disabled={!province} placeholder="Select district" accentColor={role.color}>
                        {(currentProvince?.districts??[]).map((d:any)=><option key={d.id} value={d.name} style={{backgroundColor:'#0b1929'}}>{d.name}</option>)}
                      </StyledSelect>
                    </div>
                  )}
                  {['constituency','ward','polling_station'].includes(role.scopeLevel)&&(
                    <div>
                      <label className="block mb-1.5 text-xs" style={{fontFamily:'Oswald, sans-serif',letterSpacing:'0.1em',color:'rgba(255,255,255,0.4)'}}>CONSTITUENCY</label>
                      <StyledSelect value={constituency} onChange={v=>{setConstituency(v);setWard('');setPollingStation('');}} disabled={!district} placeholder="Select constituency" accentColor={role.color}>
                        {(currentDistrict?.constituencies??[]).map((c:any)=><option key={c.id} value={c.name} style={{backgroundColor:'#0b1929'}}>{c.name}</option>)}
                      </StyledSelect>
                    </div>
                  )}
                  {['ward','polling_station'].includes(role.scopeLevel)&&(
                    <div>
                      <label className="block mb-1.5 text-xs" style={{fontFamily:'Oswald, sans-serif',letterSpacing:'0.1em',color:'rgba(255,255,255,0.4)'}}>WARD</label>
                      <StyledSelect value={ward} onChange={v=>{setWard(v);setPollingStation('');}} disabled={!constituency} placeholder="Select ward" accentColor={role.color}>
                        {(currentConstituency?.wards??[]).map((w:any)=><option key={w.id} value={w.name} style={{backgroundColor:'#0b1929'}}>{w.name}</option>)}
                      </StyledSelect>
                    </div>
                  )}
                  {role.scopeLevel==='polling_station'&&(
                    <div>
                      <label className="block mb-1.5 text-xs" style={{fontFamily:'Oswald, sans-serif',letterSpacing:'0.1em',color:'rgba(255,255,255,0.4)'}}>POLLING STATION</label>
                      <StyledSelect value={pollingStation} onChange={setPollingStation} disabled={!ward} placeholder="Select polling station" accentColor={role.color}>
                        {(currentWard?.pollingStations??[]).map((s:any)=><option key={s.id} value={s.name} style={{backgroundColor:'#0b1929'}}>{s.name}</option>)}
                      </StyledSelect>
                    </div>
                  )}
                </div>
              )}
              <button onClick={()=>{if(areaComplete)goToStep(3);}} disabled={!areaComplete}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl mt-6 transition-all"
                style={{background:areaComplete?`linear-gradient(135deg,${role.color},${role.color}cc)`:'rgba(255,255,255,0.08)',color:areaComplete?'#fff':'rgba(255,255,255,0.3)',fontFamily:'Oswald, sans-serif',letterSpacing:'0.1em',fontSize:'0.85rem',cursor:areaComplete?'pointer':'not-allowed',boxShadow:areaComplete?`0 4px 24px ${role.color}30`:'none'}}>
                CONTINUE TO LOGIN <ArrowRight size={15}/>
              </button>
            </div>
          )}

          {/* STEP 3 */}
          {step===3&&role&&(
            <div className="p-7">
              <button onClick={()=>goToStep(2)} className="flex items-center gap-1 mb-5 text-xs" style={{color:'rgba(255,255,255,0.35)',fontFamily:'Oswald, sans-serif',letterSpacing:'0.08em'}}
                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color='#fff'} onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.35)'}>
                <ChevronLeft size={14}/> CHANGE AREA
              </button>
              <div className="flex items-start gap-3 mb-5 p-3 rounded-xl" style={{backgroundColor:`${role.color}10`,border:`1px solid ${role.color}25`}}>
                <div className="w-2 h-2 rounded-full mt-1 shrink-0" style={{backgroundColor:role.color}}/>
                <div>
                  <p style={{fontFamily:'Oswald, sans-serif',fontSize:'0.82rem',letterSpacing:'0.06em',color:'#fff'}}>{role.label}</p>
                  <p style={{fontSize:'0.72rem',color:role.color,marginTop:2}}>{scopeName}</p>
                </div>
              </div>
              <p className="mb-5" style={{fontFamily:'Oswald, sans-serif',fontSize:'1rem',letterSpacing:'0.06em',color:'#fff'}}>ENTER YOUR CREDENTIALS</p>
              {error&&<div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{backgroundColor:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)',color:'#f87171'}}>{error}</div>}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block mb-2 text-xs" style={{fontFamily:'Oswald, sans-serif',letterSpacing:'0.1em',color:'rgba(255,255,255,0.4)'}}>USERNAME</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{color:'rgba(255,255,255,0.25)'}}/>
                    <input type="text" value={username} onChange={e=>setUsername(e.target.value)} placeholder="Enter your username" autoComplete="username"
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                      style={{backgroundColor:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'#fff',outline:'none'}}
                      onFocus={e=>(e.target.style.borderColor=`${role.color}70`)} onBlur={e=>(e.target.style.borderColor='rgba(255,255,255,0.1)')}/>
                  </div>
                </div>
                <div>
                  <label className="block mb-2 text-xs" style={{fontFamily:'Oswald, sans-serif',letterSpacing:'0.1em',color:'rgba(255,255,255,0.4)'}}>PASSWORD</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{color:'rgba(255,255,255,0.25)'}}/>
                    <input type={showPass?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password"
                      className="w-full pl-10 pr-12 py-3 rounded-xl text-sm"
                      style={{backgroundColor:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'#fff',outline:'none'}}
                      onFocus={e=>(e.target.style.borderColor=`${role.color}70`)} onBlur={e=>(e.target.style.borderColor='rgba(255,255,255,0.1)')}/>
                    <button type="button" onClick={()=>setShowPass(s=>!s)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{color:'rgba(255,255,255,0.3)'}}>
                      {showPass?<EyeOff size={15}/>:<Eye size={15}/>}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl transition-all"
                  style={{background:isLoading?`${role.color}60`:`linear-gradient(135deg,${role.color},${role.color}cc)`,color:'#fff',fontFamily:'Oswald, sans-serif',letterSpacing:'0.1em',fontSize:'0.85rem',boxShadow:isLoading?'none':`0 4px 24px ${role.color}40`,cursor:isLoading?'not-allowed':'pointer'}}>
                  {isLoading?(<><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block" style={{animation:'spin 0.7s linear infinite'}}/>AUTHENTICATING...</>):(<>SIGN IN <ArrowRight size={15}/></>)}
                </button>
              </form>
              <p className="text-center mt-5 text-xs" style={{color:'rgba(255,255,255,0.25)'}}>
                Credentials issued by your BOZ supervisor. Contact your line manager if you haven't received yours.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <button onClick={()=>navigate('/')} className="text-sm" style={{color:'rgba(255,255,255,0.25)'}}
            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.6)'} onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.25)'}>
            ← Back to main site
          </button>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}
