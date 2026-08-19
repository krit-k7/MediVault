"use client"

import { Calendar, Clock, Video, Wallet } from "lucide-react";

export default function AppointmentsPage() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="font-serif text-3xl text-parchment">Telemedicine Appointments</h1>
          <p className="text-muted mt-1 font-light">Book and manage secure smart-contract based consultations.</p>
        </div>
        <button className="btn-gold">
          Book New Consultation
        </button>
      </div>

      <div className="space-y-6">
        <h2 className="font-serif text-xl text-parchment mb-4">Upcoming Consultations</h2>

        <div className="panel overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-gold" />
          <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-6 md:items-center justify-between">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/30 flex flex-col items-center justify-center shrink-0 text-gold-soft">
                <span className="text-xs font-bold uppercase tracking-wider">Oct</span>
                <span className="text-2xl font-extrabold leading-none mt-1">28</span>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-serif text-xl text-parchment">Dr. Sarah Smith</h3>
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-success/10 text-success border border-success/40">Confirmed</span>
                </div>
                <p className="text-muted font-medium">Cardiology Follow-up</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-muted">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> 10:00 AM - 10:30 AM
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Wallet className="w-4 h-4" /> Escrow Locked: 0.05 ETH
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button className="flex items-center justify-center gap-2 btn-gold w-full sm:w-auto">
                <Video className="w-5 h-5" />
                Join Call
              </button>
              <button className="flex items-center justify-center gap-2 btn-outline w-full sm:w-auto">
                Reschedule
              </button>
            </div>
          </div>
        </div>

        <h2 className="font-serif text-xl text-parchment mt-14 mb-4">Past Consultations</h2>

        <div className="panel p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl border border-line-strong flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6 text-muted" />
            </div>
            <div>
              <h3 className="font-bold text-parchment">Dr. Mike Adams</h3>
              <p className="text-sm text-muted">General Practice • Sep 12, 2026</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-charcoal-light text-muted border border-line-strong">
            Completed (0.03 ETH Released)
          </span>
        </div>

      </div>
    </div>
  );
}
