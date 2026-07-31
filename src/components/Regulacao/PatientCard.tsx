import { useState } from 'react';
import apiClient from '../../services/apiClient';

export interface PdfImportRow {
  id: string;
  rawData: {
    ficha?: string;
    name?: string;
    cns_raw?: string;
    phone_raw?: string;
    birth_date_raw?: string;
    age?: number | string;
    procedure_name?: string;
    unidade_solicitante?: string;
    cid10?: string;
    scheduled_date_raw?: string;
    hora_raw?: string;
  };
  approved: boolean;
  error?: string | null;
}

function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function formatDateInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function formatCnsInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 15);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  if (digits.length <= 11) return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7, 11)} ${digits.slice(11)}`;
}

export function PatientCard({ importId, row, index, onChange }: {
  importId: string;
  row: PdfImportRow;
  index: number;
  onChange: (updated: PdfImportRow) => void;
}) {
  const [data, setData] = useState(row.rawData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function persist(nextData: typeof data, approvedState?: boolean) {
    setSaving(true);
    try {
      const isApproved = approvedState ?? row.approved;
      const res = await apiClient.patch(`/api/regulacao/imports/${importId}/rows/${row.id}`, {
        rawData: nextData,
        approved: isApproved
      });
      setError('');
      onChange(res.data);
    } catch {
      setError('Falha ao salvar alterações.');
    } finally {
      setSaving(false);
    }
  }

  function handleFieldChange(key: keyof typeof data, val: string) {
    let formattedVal = val;
    if (key === 'phone_raw') {
      formattedVal = formatPhoneInput(val);
    } else if (key === 'birth_date_raw' || key === 'scheduled_date_raw') {
      formattedVal = formatDateInput(val);
    } else if (key === 'cns_raw') {
      formattedVal = formatCnsInput(val);
    }
    setData((prev) => ({ ...prev, [key]: formattedVal }));
  }

  return (
    <div className={`bg-white border rounded-2xl p-5 transition-all shadow-sm ${
      row.approved ? 'border-emerald-500 ring-2 ring-emerald-500/10 bg-emerald-50/10' : 'border-slate-200'
    }`}>
      {/* Header do Card */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="font-semibold text-slate-800 text-sm flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
            {index}
          </span>
          <span className="truncate max-w-[220px] sm:max-w-xs">{data.name || 'Paciente sem Nome'}</span>
        </div>
        <button
          type="button"
          onClick={() => persist(data, !row.approved)}
          className={`text-xs font-bold rounded-xl px-4 py-2 transition-all cursor-pointer ${
            row.approved
              ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
              : 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200'
          }`}>
          {row.approved ? '✓ Aprovar' : 'Aprovar'}
        </button>
      </div>

      {/* Grid de Campos */}
      <div className="space-y-3 text-xs">
        {/* Nome Completo */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            👤 Nome Completo
          </label>
          <input
            type="text"
            value={data.name ?? ''}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            onBlur={() => persist(data)}
            placeholder="Nome completo do paciente"
            className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3 py-2 text-slate-800 font-medium focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>

        {/* CNS & Telefone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              # CNS
            </label>
            <input
              type="text"
              value={data.cns_raw ?? ''}
              onChange={(e) => handleFieldChange('cns_raw', e.target.value)}
              onBlur={() => persist(data)}
              placeholder="706 4021 3570 0014"
              className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3 py-2 text-slate-800 font-mono font-medium focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              📞 Telefone
            </label>
            <input
              type="text"
              value={data.phone_raw ?? ''}
              onChange={(e) => handleFieldChange('phone_raw', e.target.value)}
              onBlur={() => persist(data)}
              placeholder="(67) 99876-5432"
              className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3 py-2 text-slate-800 font-medium focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>
        </div>

        {/* Nascimento & Data Agendada */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              🎂 Data de Nascimento
            </label>
            <input
              type="text"
              value={data.birth_date_raw ?? ''}
              onChange={(e) => handleFieldChange('birth_date_raw', e.target.value)}
              onBlur={() => persist(data)}
              placeholder="DD/MM/AAAA"
              className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3 py-2 text-slate-800 font-medium focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              🗓️ Data Agendada
            </label>
            <input
              type="text"
              value={data.scheduled_date_raw ?? ''}
              onChange={(e) => handleFieldChange('scheduled_date_raw', e.target.value)}
              onBlur={() => persist(data)}
              placeholder="DD/MM/AAAA"
              className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3 py-2 text-slate-800 font-medium focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>
        </div>

        {/* Idade & Horário */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              📅 Idade
            </label>
            <input
              type="text"
              value={data.age ?? ''}
              onChange={(e) => handleFieldChange('age', e.target.value)}
              onBlur={() => persist(data)}
              placeholder="Ex: 54"
              className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3 py-2 text-slate-800 font-medium focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              ⏰ Horário
            </label>
            <input
              type="text"
              value={data.hora_raw ?? ''}
              onChange={(e) => handleFieldChange('hora_raw', e.target.value)}
              onBlur={() => persist(data)}
              placeholder="Ex: 08:30"
              className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3 py-2 text-slate-800 font-medium focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>
        </div>

        {/* Exame Solicita */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            📋 Exame Solicitado
          </label>
          <input
            type="text"
            value={data.procedure_name ?? ''}
            onChange={(e) => handleFieldChange('procedure_name', e.target.value)}
            onBlur={() => persist(data)}
            placeholder="Ex: Mamografia Bilateral de Rastreamento"
            className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3 py-2 text-slate-800 font-medium focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>

        {/* Unidade Solicitante */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            🏢 Unidade Solicitante
          </label>
          <input
            type="text"
            value={data.unidade_solicitante ?? ''}
            onChange={(e) => handleFieldChange('unidade_solicitante', e.target.value)}
            onBlur={() => persist(data)}
            placeholder="Ex: UBS Centro - Ponta Porã"
            className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3 py-2 text-slate-800 font-medium focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>
      </div>

      {row.error && <p className="text-xs text-rose-600 font-semibold mt-2">⚠️ {row.error}</p>}
      {error && <p className="text-xs text-rose-600 mt-2">{error}</p>}
      {saving && <p className="text-[10px] text-slate-400 mt-1">Salvando alterações...</p>}
    </div>
  );
}
