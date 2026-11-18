import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Activity, ChevronUp, RefreshCw } from 'lucide-react';

/** Consulta e exibe as cotas reportadas pelo CLI sem bloquear as outras telas. */
type QuotaBucket = { name: string; remainingPercent: number; resetTime?: string };
type CliUsage = { provider: string; available: boolean; message: string; groups: { name: string; buckets: QuotaBucket[] }[] };
type Props = { program: string; ready: boolean; refreshKey: number };

function resetLabel(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : `Renova ${new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date)}`;
}

export default function CliQuota({ program, ready, refreshKey }: Props) {
  const [usage, setUsage] = useState<CliUsage | null>(null);
  const [error, setError] = useState('');
  const [tick, setTick] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setTick(value => value + 1), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => { setUsage(null); setError(''); }, [program]);

  useEffect(() => {
    if (!ready) return;
    let current = true;
    invoke<CliUsage>('get_cli_usage', { program }).then(result => {
      if (current) { setUsage(result); setError(''); }
    }).catch(cause => { if (current) setError(String(cause)); });
    return () => { current = false; };
  }, [program, ready, refreshKey, tick]);

  const minimum = usage?.available ? Math.min(...usage.groups.flatMap(group => group.buckets.map(bucket => bucket.remainingPercent))) : null;
  const open = hovered || pinned;

  return <div className="quota-compact" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setHovered(false); }}>
    <button className="quota-trigger" type="button" aria-label="Ver limites da IA" aria-expanded={open} onClick={() => setPinned(value => !value)}><Activity size={16}/><span>Limites da IA</span>{minimum !== null && Number.isFinite(minimum) && <strong title="Menor percentual restante">{minimum}%</strong>}<ChevronUp size={14} className={open ? '' : 'quota-chevron-closed'}/></button>
    {open && <section className="quota-popover" aria-label="Detalhes dos limites da IA">
      <div className="quota-heading"><strong>Limites da IA</strong><button type="button" aria-label="Atualizar limites" title="Atualizar limites" onClick={() => setTick(value => value + 1)}><RefreshCw size={14}/></button></div>
      {usage?.available && usage.groups.map(group => <div className="quota-group" key={group.name}><h3>{group.name}</h3>{group.buckets.map(bucket => <div className="quota-bucket" key={bucket.name}><div><span>{bucket.name.replace(' Limit Remaining', '')}</span><strong>{bucket.remainingPercent}%</strong></div><div className="quota-track"><span style={{ width: `${bucket.remainingPercent}%` }} className={bucket.remainingPercent < 20 ? 'low' : ''}/></div><small>{resetLabel(bucket.resetTime)}</small></div>)}</div>)}
      {usage && !usage.available && <p>{usage.message}</p>}
      {error && <p className="quota-error" role="alert">{error}</p>}
      {(usage || error) && <small className="quota-foot">{usage?.available ? 'Dados do agy · atualização automática' : 'Sem estimativa de saldo da conta'}</small>}
    </section>}
  </div>;
}
