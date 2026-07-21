import { ShieldCheck, Radio } from 'lucide-react';

export type ResultStage = 'provisional' | 'official';

interface ResultsStatusBarProps {
  /** Short label for what this page is showing, e.g. "Presidential", "Parliament" */
  title: string;
  stage: ResultStage;
  onStageChange: (stage: ResultStage) => void;
}

// Sits at the very top of every results page (Dashboard, Presidential,
// Parliament, Mayoral, Councillor) — mirrors the "Provisional / Official"
// toggle from the reference dashboard.
//
// NOTE: there is currently one live results feed. Until ECZ-certified
// figures are wired in separately, "Official Results" shows the same
// underlying numbers as "Provisional", labelled honestly as not yet
// certified rather than faking a second data set.
export function ResultsStatusBar({ title, stage, onStageChange }: ResultsStatusBarProps) {
  const now = new Date();
  const updatedLabel = now.toLocaleString('en-ZM', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="mb-6 rounded-2xl overflow-hidden border-2 border-border bg-gradient-to-br from-card via-card to-card/80 shadow-lg">
      <div className="px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Zambia</span>
            <span className="text-sm font-bold text-foreground">Elections 2026</span>
            <span className="text-xs text-muted-foreground">· {title}</span>
          </div>
          {stage === 'provisional' ? (
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5" style={{ color: '#198754' }} />
              <span className="font-semibold text-foreground">Provisional Results</span>
              — Last updated {updatedLabel}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#F59E0B' }} />
              <span className="font-semibold text-foreground">Official Results (ECZ Certified)</span>
              — not yet certified; showing latest available figures
            </p>
          )}
        </div>

        {/* Toggle */}
        <div className="inline-flex rounded-full border border-border bg-muted p-1 self-start md:self-auto">
          <button
            onClick={() => onStageChange('provisional')}
            className="px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-colors"
            style={{
              background: stage === 'provisional' ? '#ffffff' : 'transparent',
              color: stage === 'provisional' ? '#111827' : 'var(--muted-foreground)',
              boxShadow: stage === 'provisional' ? '0 1px 4px rgba(0,0,0,0.15)' : 'none',
            }}
          >
            PROVISIONAL RESULTS
          </button>
          <button
            onClick={() => onStageChange('official')}
            className="px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-colors"
            style={{
              background: stage === 'official' ? '#ffffff' : 'transparent',
              color: stage === 'official' ? '#111827' : 'var(--muted-foreground)',
              boxShadow: stage === 'official' ? '0 1px 4px rgba(0,0,0,0.15)' : 'none',
            }}
          >
            OFFICIAL RESULTS
          </button>
        </div>
      </div>
    </div>
  );
}
