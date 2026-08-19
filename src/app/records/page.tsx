"use client"

import { FileText, FileCheck, ShieldAlert, HeartPulse } from "lucide-react";

export default function RecordsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Medical Records</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">View, manage, and share your encrypted health data.</p>
        </div>
        <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm">
          Upload New Record
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Categories</h3>
            <ul className="space-y-2">
              <li className="text-primary-600 dark:text-primary-400 font-medium bg-primary-50 dark:bg-primary-500/10 px-3 py-2 rounded-lg cursor-pointer">All Records (12)</li>
              <li className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-3 py-2 rounded-lg cursor-pointer transition-colors">Lab Reports (5)</li>
              <li className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-3 py-2 rounded-lg cursor-pointer transition-colors">Prescriptions (4)</li>
              <li className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-3 py-2 rounded-lg cursor-pointer transition-colors">Imaging (3)</li>
            </ul>
          </div>
        </div>
        
        <div className="lg:col-span-3 space-y-4">
          <RecordCard 
            title="Comprehensive Metabolic Panel"
            date="October 24, 2026"
            type="Lab Report"
            provider="City General Hospital"
            icon={<HeartPulse className="w-6 h-6 text-rose-500" />}
          />
          <RecordCard 
            title="Chest X-Ray Results"
            date="September 15, 2026"
            type="Imaging"
            provider="Dr. A. Smith Radiology"
            icon={<FileText className="w-6 h-6 text-blue-500" />}
          />
          <RecordCard 
            title="Amoxicillin Prescription"
            date="August 02, 2026"
            type="Prescription"
            provider="Dr. J. Doe"
            icon={<FileCheck className="w-6 h-6 text-emerald-500" />}
          />
          <RecordCard 
            title="Previous Immunization History"
            date="January 10, 2025"
            type="Clinical Note"
            provider="State Health Dept"
            icon={<ShieldAlert className="w-6 h-6 text-amber-500" />}
          />
        </div>
      </div>
    </div>
  );
}

function RecordCard({ title, date, type, provider, icon }: { title: string, date: string, type: string, provider: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between group cursor-pointer">
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{title}</h3>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mt-1">
            <span className="font-medium text-slate-700 dark:text-slate-300">{provider}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span>{date}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span className="bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-md text-xs">{type}</span>
          </div>
        </div>
      </div>
      <button className="text-sm font-medium border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors w-full sm:w-auto">
        Verify on IPFS
      </button>
    </div>
  );
}
