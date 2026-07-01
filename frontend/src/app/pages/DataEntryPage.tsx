import { API_BASE } from '@/app/lib/apiBase';
import { useState, useEffect } from 'react';
import { provinces, presidentialCandidates, Candidate } from '../data/mockData';
import { candidatePhotos } from '../data/candidatePhotos';
import { Save, CheckCircle2, AlertCircle, Upload, X, FileText, Loader2, WifiOff, CloudUpload } from 'lucide-react';
import { dataEntryApi, DocumentPayload, getToken } from '../lib/api';
import { useOfflineQueue } from '../hooks/useOfflineQueue';

const BASE_URL = API_BASE;

type ElectionType = 'presidential' | 'parliament' | 'mayoral' | 'councillor' | '';

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'pdf';
}

export function DataEntryPage() {
  const [electionType, setElectionType] = useState<ElectionType>('');
  const [formData, setFormData] = useState({
    province: '',
    district: '',
    constituency: '',
    ward: '',
    pollingStation: '',
    registeredVoters: '',
    rejectedBallots: '',
    candidateVotes: {} as Record<string, string>,
  });

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionId, setSubmissionId] = useState('');
  const [alreadySubmitted, setAlreadySubmitted] = useState<{ submittedAt: string; status: string } | null>(null);
  const [error, setError] = useState('');
  const [uploadError, setUploadError] = useState('');

  const { enqueue, isOnline, pendingCount, syncQueue, syncing } = useOfflineQueue(BASE_URL);

  const currentProvince = provinces.find(p => p.id === formData.province);
  const currentDistrict = currentProvince?.districts.find(d => d.id === formData.district);
  const currentConstituency = currentDistrict?.constituencies.find(c => c.id === formData.constituency);
  const currentWard = currentConstituency?.wards.find(w => w.id === formData.ward);

  // Get candidates based on election type
  const getCandidates = (): Candidate[] => {
    switch (electionType) {
      case 'presidential':
        return presidentialCandidates;
      case 'parliament':
        return currentConstituency?.mpCandidates || [];
      case 'mayoral':
        return currentDistrict?.mayoralCandidates || [];
      case 'councillor':
        return currentWard?.councillorCandidates || [];
      default:
        return [];
    }
  };

  const candidates = getCandidates();

  // Reset candidate votes when election type or location changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      candidateVotes: candidates.reduce((acc, c) => ({ ...acc, [c.id]: '' }), {}),
    }));
  }, [electionType, formData.constituency, formData.district, formData.ward]);

  // Check if polling station already submitted when station is selected
  useEffect(() => {
    if (!formData.pollingStation || !electionType) { setAlreadySubmitted(null); return; }
    dataEntryApi.checkSubmission(formData.pollingStation, electionType)
      .then(res => {
        if (res.submitted) setAlreadySubmitted({ submittedAt: res.submittedAt!, status: res.status! });
        else setAlreadySubmitted(null);
      })
      .catch(() => setAlreadySubmitted(null));
  }, [formData.pollingStation, electionType]);

  // Auto-computed totals
  const totalCandidateVotes = Object.values(formData.candidateVotes).reduce(
    (sum, v) => sum + (parseInt(v as string) || 0), 0
  );
  const rejectedBallotsNum = parseInt(formData.rejectedBallots) || 0;
  const computedTotalVotes = totalCandidateVotes + rejectedBallotsNum;
  const registeredVotersNum = parseInt(formData.registeredVoters) || 0;
  const voterTurnoutPct = registeredVotersNum > 0
    ? (computedTotalVotes / registeredVotersNum) * 100
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (uploadedFiles.length === 0) {
      setError('You must upload at least one official signed vote sheet before submitting');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (registeredVotersNum > 0 && computedTotalVotes > registeredVotersNum) {
      setError('Total votes cast cannot exceed registered voters at this polling station');
      return;
    }

    setSubmitting(true);
    try {
      // Convert uploaded files to DocumentPayload (base64 already in preview)
      const documents: DocumentPayload[] = uploadedFiles.map(f => ({
        id: f.id,
        fileName: f.file.name,
        mimeType: f.file.type,
        sizeBytes: f.file.size,
        base64: f.preview,
        uploadedAt: new Date().toISOString(),
      }));

      const currentStation = currentWard?.pollingStations.find(s => s.id === formData.pollingStation);

      const payload = {
        electionType,
        provinceId: formData.province,
        districtId: formData.district,
        constituencyId: formData.constituency,
        wardId: formData.ward,
        pollingStationId: formData.pollingStation,
        pollingStationName: currentStation?.name,
        registeredVoters: registeredVotersNum,
        rejectedBallots: rejectedBallotsNum,
        candidateVotes: candidates.map(c => ({
          candidateId: c.id,
          votes: parseInt(formData.candidateVotes[c.id] ?? '0') || 0,
        })),
        documents,
        enteredBy: 'Polling Agent',
      };

      if (!isOnline) {
        // Queue for later sync when connectivity returns
        const queueId = enqueue('/data-entry/result', payload, getToken());
        setSubmissionId(queueId);
        setSubmitted(true);
        setAlreadySubmitted({ submittedAt: new Date().toISOString(), status: 'queued_offline' });
        return;
      }

      const res = await dataEntryApi.submitResult(payload as Parameters<typeof dataEntryApi.submitResult>[0]);

      setSubmissionId(res.submission.id);
      setSubmitted(true);
      setAlreadySubmitted({ submittedAt: res.submission.submittedAt, status: res.submission.status });
    } catch (err) {
      if (!isOnline) {
        setError('You are offline. Your results have been saved and will sync automatically when you reconnect.');
      } else {
        setError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  const updateCandidateVote = (candidateId: string, value: string) => {
    setFormData({
      ...formData,
      candidateVotes: {
        ...formData.candidateVotes,
        [candidateId]: value,
      },
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const files = e.target.files;
    if (!files) return;

    const maxSize = 10 * 1024 * 1024; // 10MB per file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

    Array.from(files).forEach((file) => {
      // Validate file size
      if (file.size > maxSize) {
        setUploadError(`File ${file.name} is too large. Maximum size is 10MB.`);
        return;
      }

      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        setUploadError(`File ${file.name} has an invalid format. Only JPG, PNG, and PDF are allowed.`);
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const newFile: UploadedFile = {
          id: `${Date.now()}-${Math.random()}`,
          file,
          preview: reader.result as string,
          type: file.type === 'application/pdf' ? 'pdf' : 'image',
        };

        setUploadedFiles((prev) => [...prev, newFile]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = '';
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Polling Agent Data Entry</h1>
          <p className="text-muted-foreground">
            Enter verified results from your polling station
          </p>
        </div>

        {/* Offline/pending queue banner */}
        {!isOnline && (
          <div className="bg-amber-50 border border-amber-400 rounded-lg px-4 py-3 mb-4 flex items-center gap-3">
            <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">You are offline</p>
              <p className="text-xs text-amber-700">Results will be saved locally and submitted automatically when you reconnect.</p>
            </div>
          </div>
        )}
        {isOnline && pendingCount > 0 && (
          <div className="bg-blue-50 border border-blue-400 rounded-lg px-4 py-3 mb-4 flex items-center gap-3">
            <CloudUpload className="w-4 h-4 text-blue-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-800">{pendingCount} offline submission{pendingCount !== 1 ? 's' : ''} pending sync</p>
              <p className="text-xs text-blue-700">Syncing automatically…</p>
            </div>
            <button
              onClick={syncQueue}
              disabled={syncing}
              className="text-xs px-3 py-1 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
            >
              {syncing ? 'Syncing…' : 'Sync Now'}
            </button>
          </div>
        )}

        {/* Already submitted notice */}
        {alreadySubmitted && !submitted && (
          <div className="bg-amber-50 border border-amber-400 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-800 mb-1">Results Already Submitted</h3>
                <p className="text-sm text-amber-700">
                  This polling station has already submitted {electionType} results on{' '}
                  {new Date(alreadySubmitted.submittedAt).toLocaleString('en-ZM')}. Status: <strong>{alreadySubmitted.status}</strong>.
                  Resubmitting will overwrite the previous entry.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6">
          {/* Election Type Selection */}
          <div className="mb-6 pb-6 border-b border-border">
            <h3 className="font-semibold text-foreground mb-4">Election Type</h3>
            <div className="max-w-md">
              <label className="block text-sm mb-2">Select Election Type *</label>
              <select
                required
                value={electionType}
                onChange={(e) => {
                  setElectionType(e.target.value as ElectionType);
                  setFormData({
                    province: '',
                    district: '',
                    constituency: '',
                    ward: '',
                    pollingStation: '',
                    registeredVoters: '',
                    rejectedBallots: '',
                    candidateVotes: {},
                  });
                }}
                className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">-- Select Election Type --</option>
                <option value="presidential">Presidential Candidate</option>
                <option value="parliament">National Assembly (MP)</option>
                <option value="mayoral">Mayoral & Council Chairperson</option>
                <option value="councillor">Ward Councillor</option>
              </select>
            </div>
          </div>

          {/* Location Selection - Only show if election type is selected */}
          {electionType && (
            <div className="mb-6">
              <h3 className="font-semibold text-foreground mb-4">Polling Station Location</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">Province *</label>
                <select
                  required
                  value={formData.province}
                  onChange={(e) => setFormData({
                    ...formData,
                    province: e.target.value,
                    district: '',
                    constituency: '',
                    ward: '',
                    pollingStation: '',
                  })}
                  className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select Province</option>
                  {provinces.map(province => (
                    <option key={province.id} value={province.id}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2">District *</label>
                <select
                  required
                  disabled={!formData.province}
                  value={formData.district}
                  onChange={(e) => setFormData({
                    ...formData,
                    district: e.target.value,
                    constituency: '',
                    ward: '',
                    pollingStation: '',
                  })}
                  className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                >
                  <option value="">Select District</option>
                  {currentProvince?.districts.map(district => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2">Constituency *</label>
                <select
                  required
                  disabled={!formData.district}
                  value={formData.constituency}
                  onChange={(e) => setFormData({
                    ...formData,
                    constituency: e.target.value,
                    ward: '',
                    pollingStation: '',
                  })}
                  className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                >
                  <option value="">Select Constituency</option>
                  {currentDistrict?.constituencies.map(constituency => (
                    <option key={constituency.id} value={constituency.id}>
                      {constituency.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2">Ward *</label>
                <select
                  required
                  disabled={!formData.constituency}
                  value={formData.ward}
                  onChange={(e) => setFormData({ ...formData, ward: e.target.value, pollingStation: '', registeredVoters: '' })}
                  className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                >
                  <option value="">Select Ward</option>
                  {currentConstituency?.wards.map(ward => (
                    <option key={ward.id} value={ward.id}>
                      {ward.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm mb-2">Polling Station *</label>
                <select
                  required
                  disabled={!formData.ward}
                  value={formData.pollingStation}
                  onChange={(e) => {
                    const stationId = e.target.value;
                    const station = currentWard?.pollingStations.find(s => s.id === stationId);
                    setFormData({
                      ...formData,
                      pollingStation: stationId,
                      registeredVoters: station ? String(station.registeredVoters) : '',
                    });
                  }}
                  className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                >
                  <option value="">Select Polling Station</option>
                  {currentWard?.pollingStations.map(station => (
                    <option key={station.id} value={station.id}>
                      {station.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          )}

          {/* Voting Statistics - Only show if election type is selected */}
          {electionType && (
            <div className="mb-6 pt-6 border-t border-border">
            <h3 className="font-semibold text-foreground mb-1">Voting Statistics</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Enter the number of rejected ballots only — Total Votes Cast and Voter Turnout are automatically calculated.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {/* Registered Voters — read-only */}
              <div>
                <label className="block text-sm mb-2">
                  Registered Voters
                  <span className="ml-2 text-xs text-muted-foreground font-normal">(pre-loaded from ECZ register)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={formData.registeredVoters ? Number(formData.registeredVoters).toLocaleString() : '—'}
                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground font-semibold cursor-default select-none"
                  />
                  {formData.registeredVoters && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#198754] font-semibold">✓ ECZ</span>
                  )}
                </div>
                {!formData.pollingStation && (
                  <p className="text-xs text-muted-foreground mt-1">Select a polling station to load voter count</p>
                )}
              </div>

              {/* Rejected Ballots — only manual entry */}
              <div>
                <label className="block text-sm mb-2">Rejected Ballots *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.rejectedBallots}
                  onChange={(e) => setFormData({ ...formData, rejectedBallots: e.target.value })}
                  className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Auto-computed: Total Votes Cast + Voter Turnout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#198754]/5 border border-[#198754]/30 rounded-lg p-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <span className="w-2 h-2 bg-[#198754] rounded-full inline-block"></span>
                  Total Votes Cast
                  <span className="text-[10px] bg-[#198754]/20 text-[#198754] px-1 rounded ml-1">Auto-calculated</span>
                </p>
                <p className="text-2xl font-bold text-foreground">{computedTotalVotes.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {totalCandidateVotes.toLocaleString()} candidate votes + {rejectedBallotsNum.toLocaleString()} rejected
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <span className="w-2 h-2 bg-[#198754] rounded-full inline-block"></span>
                  Voter Turnout
                  <span className="text-[10px] bg-[#198754]/20 text-[#198754] px-1 rounded ml-1">Auto-calculated</span>
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {registeredVotersNum > 0 ? `${voterTurnoutPct.toFixed(1)}%` : '—'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {registeredVotersNum > 0
                    ? `${computedTotalVotes.toLocaleString()} of ${registeredVotersNum.toLocaleString()} registered`
                    : 'Select a polling station to calculate'}
                </p>
              </div>
            </div>
            </div>
          )}

          {/* Candidate Votes - Only show if election type is selected and candidates are available */}
          {electionType && candidates.length > 0 && (
            <div className="mb-6 pt-6 border-t border-border">
              <h3 className="font-semibold text-foreground mb-4">
                {electionType === 'presidential' && 'Presidential Candidate Votes'}
                {electionType === 'parliament' && 'MP Candidate Votes'}
                {electionType === 'mayoral' && 'Mayoral Candidate Votes'}
                {electionType === 'councillor' && 'Councillor Candidate Votes'}
              </h3>
              <div className="space-y-3">
                {candidates.map(candidate => (
                <div key={candidate.id} className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg">
                  {candidatePhotos[candidate.id] ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0" style={{ border: `2px solid ${candidate.partyColor}` }}>
                      <img src={candidatePhotos[candidate.id]} alt={candidate.name} className="w-full h-full object-cover object-top" />
                    </div>
                  ) : (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0"
                      style={{ backgroundColor: candidate.partyColor }}
                    >
                      {candidate.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{candidate.name}</p>
                    <p className="text-sm text-muted-foreground">{candidate.party}</p>
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.candidateVotes[candidate.id] ?? ''}
                      onChange={(e) => updateCandidateVote(candidate.id, e.target.value)}
                      className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="0"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}

          {/* File Upload Section - Only show if election type is selected and candidates are available */}
          {electionType && candidates.length > 0 && (
            <div className="mb-6 pt-6 border-t border-border">
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                Upload Official Signed Vote Sheets
                <span className="text-xs bg-[#DC2626] text-white px-2 py-0.5 rounded">Required</span>
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                You must upload scanned copies or photos of the official ECZ signed result sheets.
                This is mandatory to ensure transparency and verification of the data entered above.
              </p>

              {/* Upload Button */}
              <div className="mb-4">
                <label className="flex items-center justify-center gap-2 px-4 py-3 bg-muted hover:bg-muted/80 border-2 border-dashed border-border rounded-lg cursor-pointer transition-colors">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-foreground">Click to upload or drag files here</span>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-muted-foreground mt-2">
                  Accepted formats: JPG, PNG, PDF (Max 10MB per file)
                </p>
              </div>

              {/* Upload Error */}
              {uploadError && (
                <div className="mb-4 bg-destructive/10 border border-destructive rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    <p className="text-sm text-destructive">{uploadError}</p>
                  </div>
                </div>
              )}

              {/* Uploaded Files Preview */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground">
                    Uploaded Files ({uploadedFiles.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {uploadedFiles.map((uploadedFile) => (
                      <div
                        key={uploadedFile.id}
                        className="relative bg-muted border border-border rounded-lg p-3"
                      >
                        <button
                          type="button"
                          onClick={() => removeFile(uploadedFile.id)}
                          className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors"
                          title="Remove file"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-start gap-3">
                          {uploadedFile.type === 'image' ? (
                            <div className="w-16 h-16 rounded overflow-hidden bg-muted-foreground/10 flex-shrink-0">
                              <img
                                src={uploadedFile.preview}
                                alt={uploadedFile.file.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded bg-[#DC2626]/10 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-8 h-8 text-[#DC2626]" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {uploadedFile.file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <div className="mt-1 flex items-center gap-1">
                              <div className="w-2 h-2 bg-[#198754] rounded-full"></div>
                              <span className="text-xs text-muted-foreground">Ready to submit</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Instructions */}
              {uploadedFiles.length === 0 && (
                <div className="bg-[#DC2626]/10 border-2 border-[#DC2626] rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#DC2626]" />
                    Required Documents - What to Upload
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside mb-3">
                    <li>Scanned or photographed copies of official ECZ result forms</li>
                    <li>Ensure all signatures and stamps are clearly visible</li>
                    <li>Upload front and back of forms if results are on both sides</li>
                    <li>Make sure document text is legible and not blurry</li>
                  </ul>
                  <p className="text-xs text-[#DC2626] font-semibold">
                    ⚠️ You cannot submit results without uploading official signed vote sheets
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Warning for parliament/mayoral/councillor if location not fully selected */}
          {electionType && electionType !== 'presidential' && candidates.length === 0 && (
            <div className="mb-6 bg-[#FFF3CD] border border-[#F59E0B] rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#F59E0B] mt-0.5" />
                <div>
                  <h4 className="font-semibold text-[#856404] mb-1">Location Required</h4>
                  <p className="text-sm text-[#856404]">
                    {electionType === 'parliament' && 'Please select Province, District, and Constituency to see MP candidates.'}
                    {electionType === 'mayoral' && 'Please select Province and District to see Mayoral candidates. Note: Only certain districts have mayoral elections.'}
                    {electionType === 'councillor' && 'Please select Province, District, Constituency, and Ward to see Councillor candidates.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-destructive/10 border border-destructive rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {submitted && (
            <div className="mb-4 bg-[#198754]/10 border border-[#198754] rounded-lg p-4">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#198754] mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-[#198754]">Results submitted and recorded successfully!</p>
                  {submissionId && <p className="text-xs text-[#198754] mt-1">Reference ID: {submissionId}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          {electionType && candidates.length > 0 && (
            <div>
              {/* File Upload Requirement Notice */}
              {uploadedFiles.length === 0 && (
                <div className="mb-4 bg-[#DC2626]/10 border-2 border-[#DC2626] rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-[#DC2626] mt-0.5" />
                    <div>
                      <p className="text-sm text-[#DC2626] font-semibold mb-1">
                        Official Signed Vote Sheets Required
                      </p>
                      <p className="text-xs text-[#DC2626]">
                        You must upload at least one scanned or photographed copy of the official ECZ signed
                        result sheets before you can submit. This is mandatory for transparency and verification.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="text-sm">
                  {uploadedFiles.length > 0 ? (
                    <span className="text-[#198754] flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      {uploadedFiles.length} document{uploadedFiles.length !== 1 ? 's' : ''} attached
                    </span>
                  ) : (
                    <span className="text-[#DC2626] flex items-center gap-1 font-semibold">
                      <AlertCircle className="w-4 h-4" />
                      No documents uploaded
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 bg-[#198754] text-white rounded-lg hover:bg-[#146644] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitted || submitting || uploadedFiles.length === 0}
                  title={uploadedFiles.length === 0 ? 'Please upload official signed vote sheets first' : ''}
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {submitting ? 'Submitting...' : 'Submit Results & Documents'}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Important Notes */}
        <div className="mt-6 bg-muted border border-border rounded-lg p-4">
          <h4 className="font-semibold text-foreground mb-2">Important Notes for Polling Agents</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>First select the type of election you are entering results for</li>
            <li>Enter votes per candidate and the number of rejected ballots only</li>
            <li><strong className="text-foreground">Total Votes Cast and Voter Turnout are automatically calculated</strong> — do not manually compute</li>
            <li><strong className="text-foreground">MANDATORY:</strong> Upload scanned/photographed copies of official signed vote sheets</li>
            <li>All entries and documents are timestamped and cannot be modified after submission</li>
            <li>Report any discrepancies to your constituency coordinator immediately</li>
          </ul>
        </div>

        {/* Document Upload Information */}
        <div className="mt-4 bg-card border-2 border-[#198754] rounded-lg p-4">
          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#198754]" />
            About Mandatory Document Uploads
          </h4>
          <p className="text-sm text-muted-foreground mb-2">
            Uploading official signed vote sheets is <strong>mandatory</strong> for all result submissions.
            This requirement ensures maximum transparency and allows for independent verification of all
            results entered. Every polling station must provide documentary evidence of their reported results.
          </p>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#198754] mt-0.5 flex-shrink-0" />
              <span>All uploaded documents are securely stored with timestamps</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#198754] mt-0.5 flex-shrink-0" />
              <span>Documents will be publicly available for verification and audit</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#198754] mt-0.5 flex-shrink-0" />
              <span>This ensures the integrity of Build One Zambia's election observation process</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { DataEntryPage as default };
