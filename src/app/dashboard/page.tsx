"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useStellar } from "@/context/StellarContext";
import { useRouter } from "next/navigation";
import { useContractEvents, type ContractEvent, createRecordUploadedEvent, createRewardEarnedEvent } from "@/hooks/useContractEvents";
import { sendXLM } from "@/components/Freighter";
import {
  CircleDot,
  Menu,
  X,
  LayoutGrid,
  FolderOpen,
  UploadCloud,
  Stethoscope,
  Wallet as WalletIcon,
  KeyRound,
  Eye,
  Trash2,
  Rocket,
} from "lucide-react";

// Types
type Record = {
  id: number;
  name: string;
  type: string;
  date: string;
  doctor: string;
  notes: string;
  hash: string;
  uploaded: string;
};

type Doctor = {
  id: number;
  addr: string;
  name: string;
  spec: string;
  granted: string;
};

type LogEntry = {
  action: "GRANTED" | "REVOKED";
  doctorName: string;
  doctorAddr: string;
  time: string;
};

export default function Dashboard() {
  const { address, isConnected, disconnect } = useStellar();
  const router = useRouter();

  // Redirect if not connected
  useEffect(() => {
    if (!address) {
      router.push("/");
    }
  }, [address, router]);

  const [activeTab, setActiveTab] = useState("overview");
  const [records, setRecords] = useState<Record[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [accessLog, setAccessLog] = useState<LogEntry[]>([]);
  const [activities, setActivities] = useState<{ msg: string; time: string; dot: string }[]>([
    { msg: "Welcome to <strong>MediVault</strong>. Your secure medical record vault.", time: "Just now", dot: "gold" }
  ]);

  // Modal state
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);

  // Stats
  const totalRecords = records.length;
  const activeDoctors = doctors.length;
  const lastUpload = records.length > 0
    ? new Date(records[records.length - 1].uploaded).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    : "—";

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Form states
  const [uploadForm, setUploadForm] = useState({ name: "", type: "Lab Report", date: "", doctor: "", notes: "", file: null as File | null });
  const [grantForm, setGrantForm] = useState({ addr: "", name: "", spec: "" });

  // Activity management
  const addActivity = (msg: string, dot = "") => {
    setActivities(prev => [{ msg, time: new Date().toLocaleTimeString(), dot }, ...prev]);
  };

  // Real-time contract event listener
  const handleContractEvent = useCallback((event: ContractEvent) => {
    switch (event.type) {
      case 'RECORD_UPLOADED':
        setActivities(prev => [{ msg: `New record uploaded: <strong>${event.data.recordName}</strong>`, time: new Date().toLocaleTimeString(), dot: "gold" }, ...prev]);
        break;
      case 'ACCESS_GRANTED':
        setActivities(prev => [{ msg: `Access granted to <strong>${event.data.doctorName}</strong>`, time: new Date().toLocaleTimeString(), dot: "gold" }, ...prev]);
        break;
      case 'ACCESS_REVOKED':
        setActivities(prev => [{ msg: `Access revoked from <strong>${event.data.doctorName}</strong>`, time: new Date().toLocaleTimeString(), dot: "danger" }, ...prev]);
        break;
      case 'REWARD_EARNED':
        setActivities(prev => [{ msg: `<span class="text-gold-soft font-bold">REWARD:</span> Earned <strong>${event.data.amount} MRT</strong> for ${event.data.reason}`, time: new Date().toLocaleTimeString(), dot: "gold" }, ...prev]);
        break;
      default:
        break;
    }
  }, []);

  useContractEvents(handleContractEvent);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.name || !uploadForm.date || !uploadForm.file) return;

    const btn = e.currentTarget.querySelector('button[type="submit"]') as HTMLButtonElement;
    const originalText = btn.textContent;
    btn.textContent = "Uploading to local storage...";
    btn.disabled = true;

    try {
      let recordHash = "";

      // Try Pinata upload if JWT is available
      const pinataJwt = process.env.NEXT_PUBLIC_PINATA_JWT;
      if (pinataJwt && uploadForm.file) {
        btn.textContent = "Pinning to IPFS...";
        const formData = new FormData();
        formData.append("file", uploadForm.file);

        const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
          method: "POST",
          headers: { Authorization: `Bearer ${pinataJwt}` },
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          recordHash = data.IpfsHash;
        } else {
          console.error("Pinata error:", await res.text());
          recordHash = URL.createObjectURL(uploadForm.file); // Fallback
        }
      } else {
        recordHash = URL.createObjectURL(uploadForm.file);
      }

      const newRecord: Record = {
        id: Date.now(),
        name: uploadForm.name,
        type: uploadForm.type,
        date: uploadForm.date,
        doctor: uploadForm.doctor || "Self-uploaded",
        notes: uploadForm.notes,
        hash: recordHash,
        uploaded: new Date().toISOString()
      };

      setRecords([...records, newRecord]);

      // Emit events (simulating chain events)
      handleContractEvent(createRecordUploadedEvent(uploadForm.name, uploadForm.type));
      setTimeout(() => {
        handleContractEvent(createRewardEarnedEvent(50, "data sovereignty contribution"));
      }, 1000);

      setUploadForm({ name: "", type: "Lab Report", date: "", doctor: "", notes: "", file: null });
      setActiveTab("records");
    } catch (error: any) {
      console.error(error);
      addActivity(`Failed to upload: <strong>${error.message || "Unknown error"}</strong>`, "danger");
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  };

  const handleGrant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantForm.addr || !grantForm.name) return;

    const newDoc: Doctor = {
      id: Date.now(),
      addr: grantForm.addr,
      name: grantForm.name,
      spec: grantForm.spec || "General Practice",
      granted: new Date().toISOString()
    };

    setDoctors([...doctors, newDoc]);
    setAccessLog([{ action: "GRANTED", doctorName: grantForm.name, doctorAddr: grantForm.addr, time: new Date().toISOString() }, ...accessLog]);
    addActivity(`Access granted to <strong>${grantForm.name}</strong>`, "gold");
    setGrantForm({ addr: "", name: "", spec: "" });
  };

  const revokeAccess = (id: number) => {
    const doc = doctors.find(d => d.id === id);
    if (!doc) return;
    setDoctors(doctors.filter(d => d.id !== id));
    setAccessLog([{ action: "REVOKED", doctorName: doc.name, doctorAddr: doc.addr, time: new Date().toISOString() }, ...accessLog]);
    addActivity(`Access revoked from <strong>${doc.name}</strong>`, "danger");
  };

  const deleteRecord = (id: number) => {
    const rec = records.find(r => r.id === id);
    if (!rec) return;
    setRecords(records.filter(r => r.id !== id));
    addActivity(`Record <strong>"${rec.name}"</strong> deleted`, "danger");
  };

  const shortAddr = address ? `${address.slice(0, 6)}...${address.slice(-6)}` : "Not Connected";

  return (
    <div className="flex flex-col min-h-screen bg-obsidian text-parchment">
      {/* TOPBAR */}
      <nav className="sticky top-0 z-[100] bg-obsidian/95 backdrop-blur-md flex items-center justify-between px-6 md:px-10 h-16 border-b border-line">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-gold-soft transition-transform hover:scale-110 active:scale-95"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2.5">
            <CircleDot className="w-5 h-5 text-gold" strokeWidth={1.5} />
            <span className="font-mono-plex text-[14px] tracking-[3px] text-parchment">MEDIVAULT</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="hidden sm:flex font-mono-plex text-[11px] font-medium tracking-[2px] uppercase text-muted items-center hover:text-gold-soft transition-colors">← Home</Link>
          <span className="flex items-center gap-2 font-mono-plex text-[11px] tracking-[1.5px] bg-charcoal border border-line-strong text-gold-soft px-4 md:px-5 py-[8px] rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-blink shadow-[0_0_8px_#2DD4A8]" />
            {shortAddr}
          </span>
        </div>
      </nav>

      <div className="grid md:grid-cols-[280px_1fr] flex-grow relative">
        {/* SIDEBAR */}
        <aside className={`bg-obsidian-soft flex flex-col border-r border-line h-[calc(100vh-64px)] fixed md:sticky top-16 left-0 z-50 w-[280px] md:w-auto transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} custom-scrollbar overflow-y-auto`}>
          <div className="p-8 pb-0">
            <div className="font-serif text-[26px] text-parchment">Dashboard</div>
          </div>
          <div className="m-6 mt-8 panel !bg-charcoal p-5">
            <div className="font-mono-plex text-[9px] tracking-[3px] uppercase text-muted mb-1.5">Connected Wallet</div>
            <div className="font-mono-plex text-[11px] text-parchment flex items-center gap-2 truncate">
              <span className="w-2 h-2 bg-gold rounded-full animate-blink shadow-[0_0_8px_#2DD4A8]" />
              {shortAddr}
            </div>
          </div>
          <nav className="mt-6 flex-grow">
            <div className="font-mono-plex text-[9px] tracking-[4px] uppercase text-muted-dim px-8 mb-3">Navigation</div>
            <NavItem label="Overview" Icon={LayoutGrid} active={activeTab === "overview"} onClick={() => { setActiveTab("overview"); setIsMobileMenuOpen(false); }} />
            <NavItem label="My Records" Icon={FolderOpen} active={activeTab === "records"} onClick={() => { setActiveTab("records"); setIsMobileMenuOpen(false); }} />
            <NavItem label="Upload" Icon={UploadCloud} active={activeTab === "upload"} onClick={() => { setActiveTab("upload"); setIsMobileMenuOpen(false); }} />
            <NavItem label="Doctors" Icon={Stethoscope} active={activeTab === "doctors"} onClick={() => { setActiveTab("doctors"); setIsMobileMenuOpen(false); }} />
            <NavItem label="Wallet" Icon={WalletIcon} active={activeTab === "wallet"} onClick={() => { setActiveTab("wallet"); setIsMobileMenuOpen(false); }} />
            <NavItem label="Access Log" Icon={KeyRound} active={activeTab === "access"} onClick={() => { setActiveTab("access"); setIsMobileMenuOpen(false); }} />
          </nav>
          <div className="p-6 border-t border-line mt-auto">
            <button
              onClick={() => { disconnect(); router.push("/"); }}
              className="w-full font-mono-plex text-[10px] font-semibold tracking-[2px] uppercase text-muted border border-line-strong rounded-lg p-3 hover:text-danger hover:border-danger/50 transition-all"
            >
              Disconnect Wallet
            </button>
          </div>
        </aside>

        {/* MOBILE OVERLAY */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-obsidian/70 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* MAIN */}
        <main className="dash-main overflow-y-auto h-[calc(100vh-64px)] custom-scrollbar">
          <div className="bg-obsidian-soft border-b border-line px-6 md:px-12 py-6 flex items-center justify-between">
            <div className="font-serif text-[26px] md:text-[32px] text-parchment capitalize">{activeTab}</div>
            <div className="hidden sm:block font-mono-plex text-[11px] text-muted tracking-widest">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
          </div>

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div className="animate-in fade-in slide-in-from-bottom-5 duration-500">
              <div className="grid grid-cols-2 md:grid-cols-4 border-b border-line">
                <StatTile label="Total Records" val={totalRecords.toString()} change="↑ All time" />
                <StatTile label="Doctors With Access" val={activeDoctors.toString()} change="Active grants" />
                <StatTile label="Files on IPFS" val={totalRecords.toString()} change="↑ Pinned" />
                <StatTile label="Last Upload" val={lastUpload} change="Timestamp" isDate />
              </div>
              <div className="p-8 md:p-12 border-b border-line">
                <div className="flex items-center justify-between mb-8">
                  <div className="font-serif text-[24px] text-parchment">Recent Records</div>
                  <button onClick={() => setActiveTab("upload")} className="btn-gold !py-3 !px-5 !text-[10px]">+ Add Record</button>
                </div>
                {records.length === 0 ? <EmptyState Icon={FolderOpen} title="No Records Yet" sub="Upload your first medical record to get started" /> : (
                  <div className="space-y-0">
                    {[...records].reverse().slice(0, 5).map((r, i) => (
                      <RecordRow key={r.id} index={i + 1} record={r} onView={() => setSelectedRecord(r)} onDelete={() => deleteRecord(r.id)} />
                    ))}
                  </div>
                )}
              </div>
              <div className="p-8 md:p-12 bg-obsidian-soft">
                <div className="font-serif text-[24px] text-parchment mb-6">Activity Feed</div>
                <div className="space-y-0">
                  {activities.map((a, i) => (
                    <div key={i} className="flex gap-4 py-4 border-b border-line last:border-0 items-start">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${a.dot === 'gold' ? 'bg-gold shadow-[0_0_8px_#2DD4A8]' : a.dot === 'danger' ? 'bg-danger' : 'bg-muted-dim'}`} />
                      <div>
                        <div className="text-xs leading-relaxed text-muted font-light" dangerouslySetInnerHTML={{ __html: a.msg }} />
                        <div className="font-mono-plex text-[9px] text-muted-dim tracking-wider mt-1">{a.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* RECORDS */}
          {activeTab === "records" && (
            <div className="p-8 md:p-12 animate-in fade-in duration-500">
              <div className="flex items-center justify-between mb-8">
                <div className="font-serif text-[24px] text-parchment">All Records</div>
                <button onClick={() => setActiveTab("upload")} className="btn-gold !py-3 !px-5 !text-[10px]">+ Upload New</button>
              </div>
              {records.length === 0 ? <EmptyState Icon={FolderOpen} title="No Records Found" sub="Your uploaded records will appear here" /> : (
                <div className="space-y-0">
                  {[...records].reverse().map((r, i) => (
                    <RecordRow key={r.id} index={i + 1} record={r} onView={() => setSelectedRecord(r)} onDelete={() => deleteRecord(r.id)} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* UPLOAD */}
          {activeTab === "upload" && (
            <div className="p-8 md:p-12 animate-in slide-in-from-bottom-10 duration-500">
              <div className="font-serif text-[24px] text-parchment mb-8">Upload Medical Record</div>
              <div
                className="border border-dashed border-line-strong rounded-2xl p-16 text-center cursor-pointer transition-all hover:border-gold/50 hover:bg-gold/[0.03] mb-8"
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <UploadCloud className="w-10 h-10 mx-auto mb-4 text-gold-soft" strokeWidth={1.25} />
                <div className="font-serif text-[22px] text-parchment mb-2">Upload / Drop File</div>
                <div className="font-mono-plex text-[11px] text-muted tracking-wider mb-8">PDF, JPG, PNG up to 50MB</div>
                <input type="file" id="file-input" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setUploadForm({ ...uploadForm, file, name: file.name.replace(/\.[^/.]+$/, "") });
                  }
                }} />
                <button className="btn-outline">Choose File</button>
              </div>

              {uploadForm.file && (
                <form
                  onSubmit={handleUpload}
                  className="border-t border-line pt-8 animate-in fade-in duration-300"
                >
                  <div className="font-mono-plex text-[11px] text-muted tracking-wider mb-8 flex items-center gap-2">📎 {uploadForm.file.name} ({(uploadForm.file.size / 1024).toFixed(1)} KB)</div>
                  <div className="grid grid-cols-2 gap-5 mb-5 md:mb-5">
                    <FormField
                      label="Record Name"
                      value={uploadForm.name}
                      onChange={(v) => setUploadForm({ ...uploadForm, name: v })}
                      placeholder="e.g. Blood Test Results"
                      required
                    />
                    <div className="flex flex-col gap-2">
                      <label className="font-mono-plex text-[9px] tracking-[3px] uppercase text-muted">Record Type</label>
                      <select
                        className="font-manrope text-sm bg-obsidian-soft border border-line-strong rounded-lg p-3 outline-none focus:border-gold transition-all text-parchment"
                        value={uploadForm.type}
                        onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
                      >
                        <option>Lab Report</option>
                        <option>Imaging</option>
                        <option>Prescription</option>
                        <option>Vaccination</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-5 mb-5">
                    <FormField
                      label="Date"
                      type="date"
                      value={uploadForm.date}
                      onChange={(v) => setUploadForm({ ...uploadForm, date: v })}
                      required
                    />
                    <FormField label="Doctor / Facility" value={uploadForm.doctor} onChange={(v) => setUploadForm({ ...uploadForm, doctor: v })} placeholder="e.g. City General Hospital" />
                  </div>
                  <FormField label="Notes (optional)" value={uploadForm.notes} onChange={(v) => setUploadForm({ ...uploadForm, notes: v })} placeholder="Any additional info" />
                  <button
                    type="submit"
                    className="btn-gold mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Rocket className="w-4 h-4" />
                    Upload to IPFS & Chain
                  </button>
                </form>
              )}
            </div>
          )}

          {/* DOCTORS */}
          {activeTab === "doctors" && (
            <div className="animate-in fade-in duration-500">
              <div className="p-8 md:p-12 pb-0">
                <div className="font-serif text-[24px] text-parchment mb-8">Grant Doctor Access</div>
                <form onSubmit={handleGrant} className="grid grid-cols-1 md:grid-cols-2 gap-10 border-b border-line pb-12">
                  <div className="space-y-5">
                    <FormField label="Doctor Wallet Address" value={grantForm.addr} onChange={(v) => setGrantForm({ ...grantForm, addr: v })} placeholder="0x..." />
                    <FormField label="Doctor Name" value={grantForm.name} onChange={(v) => setGrantForm({ ...grantForm, name: v })} placeholder="Dr. Jane Smith" />
                  </div>
                  <div className="space-y-5 flex flex-col">
                    <FormField label="Specialisation" value={grantForm.spec} onChange={(v) => setGrantForm({ ...grantForm, spec: v })} placeholder="e.g. Cardiologist" />
                    <button type="submit" className="btn-gold mt-auto">Grant Access →</button>
                  </div>
                </form>
              </div>
              <div className="p-8 md:p-12 bg-obsidian-soft min-h-[400px]">
                <div className="font-serif text-[24px] text-parchment mb-8">Authorised Doctors</div>
                {doctors.length === 0 ? <EmptyState Icon={Stethoscope} title="No Doctors Authorised" sub="Grant access to your first doctor above" /> : (
                  <div className="grid md:grid-cols-3 gap-5">
                    {doctors.map(d => (
                      <div key={d.id} className="panel p-8 relative group hover:border-gold/40 transition-all duration-300">
                        <button onClick={() => revokeAccess(d.id)} className="absolute top-4 right-4 text-[9px] font-mono-plex tracking-wider uppercase text-muted border border-line-strong rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-all hover:bg-danger/10 hover:text-danger hover:border-danger/50">Revoke</button>
                        <div className="w-12 h-12 rounded-lg border border-line-strong flex items-center justify-center mb-4 transition-all group-hover:border-gold/50 group-hover:bg-gold/10">
                          <Stethoscope className="w-5 h-5 text-gold-soft" strokeWidth={1.5} />
                        </div>
                        <div className="font-serif text-lg text-parchment">{d.name}</div>
                        <div className="font-mono-plex text-[10px] tracking-wider text-gold-soft uppercase mb-3">{d.spec}</div>
                        <div className="font-mono-plex text-[9px] text-muted truncate">{d.addr}</div>
                        <div className="mt-3 text-[9px] font-mono-plex text-success font-semibold uppercase tracking-widest">● Access Active</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ACCESS LOG */}
          {activeTab === "access" && (
            <div className="p-8 md:p-12 animate-in fade-in duration-500">
              <div className="font-serif text-[24px] text-parchment mb-8">Access Log</div>
              {accessLog.length === 0 ? <EmptyState Icon={KeyRound} title="No Access Events" sub="Access grants and revocations will appear here" /> : (
                <div className="space-y-0">
                  {accessLog.map((log, i) => (
                    <div key={i} className="grid grid-cols-[40px_1fr_auto] gap-5 items-center py-5 border-b border-line">
                      <div className="font-mono-plex text-xs text-muted-dim font-semibold">{(i + 1).toString().padStart(2, '0')}</div>
                      <div>
                        <div className="font-bold text-sm text-parchment uppercase tracking-wider">{log.doctorName}</div>
                        <div className="font-mono-plex text-[10px] text-muted tracking-wider">{log.doctorAddr} · {new Date(log.time).toLocaleString()}</div>
                      </div>
                      <div className={`font-mono-plex text-[9px] font-bold tracking-widest px-3 py-1 rounded border ${log.action === 'GRANTED' ? 'bg-success/10 text-success border-success/40' : 'bg-danger/10 text-danger border-danger/40'}`}>
                        {log.action}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* WALLET */}
          {activeTab === "wallet" && (
            <div className="p-8 md:p-12 animate-in fade-in duration-500">
              <div className="font-serif text-[24px] text-parchment mb-8">Stellar Wallet</div>
              <WalletPanel />
            </div>
          )}
        </main>
      </div>

      {/* MODAL */}
      {selectedRecord && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-obsidian/85 backdrop-blur-sm p-4 animate-in fade-in duration-300" onClick={() => setSelectedRecord(null)}>
          <div className="panel w-full max-w-[560px] max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom-10 duration-300" onClick={e => e.stopPropagation()}>
            <div className="bg-obsidian-soft border-b border-line p-6 px-8 flex items-center justify-between rounded-t-2xl">
              <div className="font-serif text-[22px] text-gold-soft">Record Detail</div>
              <button onClick={() => setSelectedRecord(null)} className="text-muted hover:text-gold-soft transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 md:p-10 space-y-5">
              {['Imaging', 'Lab Report'].includes(selectedRecord.type) && (
                <div className="mb-8 border border-line-strong rounded-lg p-2 bg-obsidian-soft">
                  <img
                    src={selectedRecord.hash.startsWith('blob:') ? selectedRecord.hash : `https://ipfs.io/ipfs/${selectedRecord.hash}`}
                    alt="Record Detail"
                    className="w-full h-auto rounded-md"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>
              )}
              <ModalField label="Name" val={selectedRecord.name} />
              <ModalField label="Type" val={selectedRecord.type} />
              <ModalField label="Date" val={selectedRecord.date} />
              <ModalField label="Doctor / Facility" val={selectedRecord.doctor} />
              <ModalField label="IPFS Hash" val={selectedRecord.hash} isMono />
              <ModalField label="Uploaded" val={new Date(selectedRecord.uploaded).toLocaleString()} />
              <ModalField label="Notes" val={selectedRecord.notes || "—"} />
              <div className="pt-8 border-t border-line mt-8">
                {selectedRecord.hash.startsWith('blob:') ? (
                  <span className="font-mono-plex text-[10px] tracking-[2px] uppercase text-gold-soft">Dev Mode: Local Upload</span>
                ) : (
                  <a href={`https://ipfs.io/ipfs/${selectedRecord.hash}`} target="_blank" className="font-mono-plex text-[10px] tracking-[2px] uppercase text-gold-soft border-b border-gold-soft/50 hover:text-gold hover:border-gold transition-all">View on IPFS ↗</a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-components
function NavItem({ label, Icon, active, onClick }: { label: string; Icon: React.ElementType; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 py-4 px-8 font-medium text-sm transition-all border-l-2 ${active ? 'text-gold-soft border-gold bg-gold/5' : 'text-muted border-transparent hover:bg-white/[0.03] hover:text-parchment'}`}
    >
      <span className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.03] shrink-0 ${active ? 'bg-gold/15' : ''}`}>
        <Icon className="w-4 h-4" strokeWidth={1.5} />
      </span>
      {label}
    </button>
  );
}

function StatTile({ label, val, change, isDate = false }: { label: string; val: string; change: string; isDate?: boolean }) {
  return (
    <div className="p-8 md:p-10 border-r border-line last:border-0 hover:bg-charcoal group transition-all duration-300">
      <div className="font-mono-plex text-[9px] tracking-[3px] uppercase text-muted mb-4">{label}</div>
      <div className={`font-serif leading-none text-parchment transition-colors group-hover:text-gold-soft ${isDate ? 'text-2xl mt-3' : 'text-[44px]'}`}>{val}</div>
      <div className="font-mono-plex text-[10px] text-muted-dim mt-2">{change}</div>
    </div>
  );
}

function RecordRow({ index, record, onView, onDelete }: { index: number; record: Record; onView: () => void; onDelete: () => void }) {
  const typeStyles: { [k: string]: string } = {
    'Lab Report': 'bg-gold/5 text-gold-soft border-gold/40',
    'Imaging': 'bg-danger/5 text-danger border-danger/40',
    'Prescription': 'bg-success/5 text-success border-success/40',
    'Vaccination': 'bg-blue-400/5 text-blue-300 border-blue-400/40',
    'Other': 'bg-charcoal-light text-muted border-line-strong'
  };
  return (
    <div className="grid grid-cols-[40px_1fr_auto_auto] gap-5 items-center py-5 border-b border-line last:border-0 hover:bg-charcoal-light group relative transition-all rounded-lg px-2">
      <div className="font-mono-plex text-xs text-muted-dim font-semibold">{index.toString().padStart(2, '0')}</div>
      <div>
        <div className="font-bold text-sm text-parchment group-hover:text-gold-soft transition-colors">{record.name}</div>
        <div className="font-mono-plex text-[10px] text-muted tracking-wider mt-0.5">{record.doctor} · {record.date} · {record.hash.slice(0, 10)}...</div>
      </div>
      <div className={`font-mono-plex text-[9px] font-bold tracking-widest px-3 py-1 rounded border hidden sm:block ${typeStyles[record.type] || typeStyles['Other']}`}>
        {record.type.toUpperCase()}
      </div>
      <div className="flex gap-2">
        <button onClick={onView} className="w-8 h-8 rounded-lg flex items-center justify-center border border-line-strong hover:bg-gold/10 hover:text-gold-soft hover:border-gold/50 transition-all text-muted">
          <Eye className="w-4 h-4" />
        </button>
        <button onClick={onDelete} className="w-8 h-8 rounded-lg flex items-center justify-center border border-line-strong hover:bg-danger/10 hover:text-danger hover:border-danger/50 transition-all text-muted">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, placeholder, type = "text", required = false }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-mono-plex text-[9px] tracking-[3px] uppercase text-muted">{label}</label>
      <input
        type={type}
        required={required}
        className="font-manrope text-sm bg-obsidian-soft border border-line-strong rounded-lg p-3 outline-none focus:border-gold transition-all text-parchment placeholder:text-muted-dim"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function ModalField({ label, val, isMono = false }: { label: string; val: string; isMono?: boolean }) {
  return (
    <div>
      <div className="font-mono-plex text-[9px] tracking-[3px] uppercase text-muted mb-1.5">{label}</div>
      <div className={`text-sm text-parchment break-all ${isMono ? 'font-mono-plex text-[13px]' : 'font-manrope'}`}>{val}</div>
    </div>
  );
}

function EmptyState({ Icon, title, sub }: { Icon: React.ElementType; title: string; sub: string }) {
  return (
    <div className="text-center py-20 animate-in fade-in duration-700">
      <Icon className="w-10 h-10 mx-auto mb-4 text-muted-dim" strokeWidth={1.25} />
      <div className="font-serif text-[26px] text-muted mb-2">{title}</div>
      <div className="font-mono-plex text-[11px] text-muted-dim tracking-widest">{sub}</div>
    </div>
  );
}

function WalletPanel() {
  const { balance } = useStellar();
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [txResult, setTxResult] = useState("");
  const [txHash, setTxHash] = useState("");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination || !amount) return alert("Please enter destination and amount.");
    try {
      setLoading(true);
      setTxResult("Sending...");
      setTxHash("");
      const res = await sendXLM(destination, amount);
      setTxResult("Transaction Successful!");
      setTxHash(res.hash);
    } catch (e: any) {
      setTxResult("Transaction Failed: " + (e.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl panel p-8 md:p-10">
      <div className="bg-gold/10 border border-gold/30 rounded-xl p-8 text-center mb-10">
        <div className="font-mono-plex text-[11px] tracking-[3px] uppercase text-muted mb-2">Available Balance</div>
        <div className="font-serif text-[52px] text-parchment leading-none">{balance} XLM</div>
      </div>

      <form onSubmit={handleSend} className="space-y-6">
        <FormField
          label="Destination Address"
          value={destination}
          onChange={setDestination}
          placeholder="G... (Stellar Public Key)"
          required
        />
        <FormField
          label="Amount (XLM)"
          type="number"
          value={amount}
          onChange={setAmount}
          placeholder="e.g. 10.5"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="btn-gold w-full disabled:opacity-50"
        >
          <Rocket className="w-4 h-4" />
          {loading ? "PROCESSING..." : "SEND XLM"}
        </button>
      </form>

      {txResult && (
        <div className={`mt-10 p-6 rounded-xl border ${txResult.includes("Successful") ? 'border-success/40 bg-success/5' : 'border-danger/40 bg-danger/5'}`}>
          <div className="font-serif text-[20px] text-parchment">{txResult}</div>
          {txHash && (
            <div className="mt-3">
              <div className="font-mono-plex text-[9px] text-muted mb-1 uppercase tracking-widest">Transaction Hash</div>
              <a href={`https://stellar.expert/explorer/testnet/tx/${txHash}`} target="_blank" className="font-mono-plex text-[11px] text-gold-soft border-b border-gold-soft/50 break-all hover:text-gold hover:border-gold transition-all">{txHash}</a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
