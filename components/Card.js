import Link from 'next/link'
import { pub } from '../lib/supabase'
export default function Card({ p, onDelete }) {
  return (<div className="card"><Link href={`/photo/${p.id}`}><img src={pub(p.path)} alt={p.title} /><span className="tag">{p.category}</span>
    <div className="ov"><b>{p.title}</b><small>{p.profiles?.full_name}</small><em>👁 {p.views} · ♥ {p.likes?.[0]?.count ?? 0} · ⬇ {p.downloads}</em></div></Link>
    {onDelete && <button className="del" onClick={() => onDelete(p)}>Delete</button>}</div>)
}
