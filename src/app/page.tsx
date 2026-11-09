'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { RedCrossEmblem, SisaketEmblem } from '@/components/Emblems';
import { PrizePoolModal } from '@/components/PrizePoolModal';
import { LotteryState } from '@/lib/types';
import { SAMPLE_LOTTERY_STATE } from '@/lib/constants';
import {
  Maximize,
  Minimize,
  Search,
  Trophy,
  CheckCircle2,
  AlertCircle,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react';

export default function LotteryDisplayPage() {
  const [lottery, setLottery] = useState<LotteryState>(SAMPLE_LOTTERY_STATE);
  const [countdown, setCountdown] = useState(5);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [prizePoolOpen, setPrizePoolOpen] = useState(false);
  const [searchTicket, setSearchTicket] = useState('');
  const [searchResult, setSearchResult] = useState<{ found: boolean; prizeName?: string; item?: string } | null>(null);

  const prevSlotsRef = useRef<Record<string, (string | null)[]>>({});
  const [updatedSlots, setUpdatedSlots] = useState<Record<string, boolean>>({});

  // Gentle audio chime when a number appears
  const playChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.25); // A5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch {
      // AudioContext policy
    }
  }, [soundEnabled]);

  // Fetch lottery data from backend
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/lottery', { cache: 'no-store' });
      if (!res.ok) return;
      const json = await res.json();
      if (json.success && json.data) {
        const newData: LotteryState = json.data;

        // Detect newly entered slots
        const newUpdates: Record<string, boolean> = {};
        let hasNewNumber = false;

        newData.prizes.forEach((p) => {
          const oldSlots = prevSlotsRef.current[p.id] || [];
          p.slots.forEach((val, idx) => {
            const key = `${p.id}-${idx}`;
            if (val && val !== oldSlots[idx]) {
              newUpdates[key] = true;
              hasNewNumber = true;
            }
          });
          prevSlotsRef.current[p.id] = [...p.slots];
        });

        if (hasNewNumber) {
          playChime();
          setUpdatedSlots(newUpdates);
          setTimeout(() => setUpdatedSlots({}), 2000);
        }

        setLottery(newData);
      }
    } catch (err) {
      console.error('Data fetch error:', err);
    }
  }, [playChime]);

  // Polling every 5 seconds
  useEffect(() => {
    fetchData();

    const pollInterval = setInterval(() => {
      fetchData();
      setCountdown(5);
    }, 5000);

    const countInterval = setInterval(() => {
      setCountdown((c) => (c <= 1 ? 5 : c - 1));
    }, 1000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(countInterval);
    };
  }, [fetchData]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Ticket verification
  const handleCheckTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchTicket.trim().padStart(5, '0');
    if (clean.length < 3) return;

    for (const prize of lottery.prizes) {
      if (prize.digits === 3) {
        const target3 = clean.slice(-3);
        if (prize.slots.includes(target3)) {
          setSearchResult({
            found: true,
            prizeName: prize.title,
            item: prize.itemDescription,
          });
          return;
        }
      } else {
        if (prize.slots.includes(clean)) {
          setSearchResult({
            found: true,
            prizeName: prize.title,
            item: prize.itemDescription,
          });
          return;
        }
      }
    }

    setSearchResult({ found: false });
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-amber-100">
      {/* Civic Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Organization & Event */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 shrink-0">
              <SisaketEmblem className="w-10 h-10" />
              <RedCrossEmblem className="w-10 h-10" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900 leading-none">
                  {lottery.organization}
                </h1>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-medium">
                  {lottery.year}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {lottery.title}
              </p>
            </div>
          </div>

          {/* Status & Control Actions */}
          <div className="flex items-center space-x-2">
            {/* Live Indicator */}
            <div className="hidden sm:flex items-center space-x-2 text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700 font-medium">
              <span className={`w-2 h-2 rounded-full ${lottery.status === 'live' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              <span>{lottery.status === 'live' ? 'กำลังออกรางวัล' : lottery.status === 'completed' ? 'ออกรางวัลเสร็จสิ้น' : 'พักการออกรางวัล'}</span>
              <span className="text-slate-400 pl-1.5 border-l border-slate-200 font-mono text-[11px]">
                {countdown}s
              </span>
            </div>

            {/* Check ticket button */}
            <button
              onClick={() => {
                setSearchModalOpen(true);
                setSearchResult(null);
                setSearchTicket('');
              }}
              className="flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition"
              title="ตรวจผลสลาก"
            >
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">ตรวจสลาก</span>
            </button>

            {/* Prize pool modal button */}
            <button
              onClick={() => setPrizePoolOpen(true)}
              className="flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition"
              title="ดูรายการของรางวัลทั้งหมด"
            >
              <Trophy className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">รายการรางวัล</span>
            </button>

            {/* Sound toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
              title={soundEnabled ? 'ปิดเสียงแจ้งเตือน' : 'เปิดเสียงแจ้งเตือน'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
              title="โหมดเต็มจอสำหรับโปรเจกเตอร์"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area: Sequential Row by Row Prize Pool */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-4">
        {lottery.prizes.map((prize) => {
          const isFirstPrize = prize.id === 'p1';
          const isThreeDigits = prize.digits === 3;

          return (
            <section
              key={prize.id}
              className={`rounded-2xl border transition-all ${
                isFirstPrize
                  ? 'bg-amber-50/30 border-amber-300 shadow-xs'
                  : 'bg-white border-slate-200 shadow-xs'
              } p-4 sm:p-5`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Prize Info (Left Column) */}
                <div className="lg:w-80 shrink-0">
                  <div className="flex items-center space-x-2.5">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                        isFirstPrize
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {prize.badgeNumber}
                    </span>
                    <div>
                      <h2 className="text-base font-semibold text-slate-900 leading-tight">
                        {prize.title}
                      </h2>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="text-xs text-slate-500 font-medium">
                          {prize.quantity} รางวัล ({prize.digits} หลัก)
                        </span>
                        {prize.isAdjacent && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-200">
                            ข้างเคียงรางวัลที่ 1
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 pl-9.5 font-medium leading-relaxed">
                    {prize.itemDescription}
                  </p>
                </div>

                {/* Digit Slots (Right Column Grid) */}
                <div className="flex-1">
                  <div
                    className={`grid gap-2.5 ${
                      isThreeDigits
                        ? 'grid-cols-1 sm:grid-cols-2 max-w-xs'
                        : prize.slots.length === 2
                        ? 'grid-cols-2 max-w-lg'
                        : prize.slots.length <= 4
                        ? 'grid-cols-2 sm:grid-cols-4'
                        : prize.slots.length <= 5
                        ? 'grid-cols-2 sm:grid-cols-5'
                        : 'grid-cols-2 sm:grid-cols-5 xl:grid-cols-10'
                    }`}
                  >
                    {prize.slots.map((num, idx) => {
                      const isUpdated = updatedSlots[`${prize.id}-${idx}`];
                      return (
                        <div
                          key={idx}
                          className={`rounded-xl border transition-all flex flex-col items-center justify-center ${
                            isFirstPrize
                              ? 'py-4 sm:py-5 border-amber-300 bg-white shadow-xs'
                              : isThreeDigits
                              ? 'py-3 sm:py-4 border-slate-200 bg-slate-50/50'
                              : 'py-2.5 sm:py-3 border-slate-200 bg-slate-50/50'
                          } ${isUpdated ? 'animate-slot-update' : ''}`}
                        >
                          {/* Slot ordinal indicator for long lists */}
                          {prize.slots.length > 2 && (
                            <span className="text-[10px] text-slate-400 font-mono mb-0.5">
                              #{idx + 1}
                            </span>
                          )}
                          <span
                            className={`lottery-digits font-bold ${
                              isFirstPrize
                                ? 'text-3xl sm:text-4xl text-slate-900 font-extrabold'
                                : isThreeDigits
                                ? 'text-2xl sm:text-3xl text-slate-900'
                                : prize.slots.length <= 5
                                ? 'text-xl sm:text-2xl text-slate-900'
                                : 'text-base sm:text-lg text-slate-900'
                            } ${!num ? 'text-slate-300 font-normal' : ''}`}
                          >
                            {num || (prize.digits === 3 ? '— — —' : '— — — — —')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-3 px-4 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>งานเทศกาลปีใหม่สี่เผ่าไทย จังหวัดศรีสะเกษ • สลากกาชาด 99,999 ฉบับ</span>
          <span className="font-mono text-slate-400">ระบบอัปเดตอัตโนมัติทุก 5 วินาที</span>
        </div>
      </footer>

      {/* Ticket Verification Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-900 flex items-center space-x-2">
                <Search className="w-4 h-4 text-slate-600" />
                <span>ตรวจผลสลากกาชาด 2570</span>
              </h3>
              <button
                onClick={() => setSearchModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCheckTicket} className="py-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  ระบุหมายเลขสลาก (5 หลัก หรือ 3 หลัก):
                </label>
                <input
                  type="text"
                  maxLength={5}
                  value={searchTicket}
                  onChange={(e) => setSearchTicket(e.target.value.replace(/\D/g, ''))}
                  placeholder="เช่น 00051 หรือ 081"
                  className="w-full px-4 py-2.5 text-2xl lottery-digits font-bold text-center border border-slate-300 rounded-xl focus:outline-hidden focus:border-slate-800 bg-slate-50"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={searchTicket.length < 3}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-medium rounded-xl transition text-sm shadow-xs"
              >
                ตรวจผลรางวัล
              </button>
            </form>

            {searchResult && (
              <div
                className={`p-4 rounded-xl border text-sm ${
                  searchResult.found
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                {searchResult.found ? (
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-emerald-900">
                        ขอแสดงความยินดี
                      </p>
                      <p className="text-sm font-medium mt-0.5">
                        ถูก{searchResult.prizeName}
                      </p>
                      <p className="text-xs text-emerald-700 mt-1">
                        ของรางวัล: {searchResult.item}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-800">
                        หมายเลข {searchTicket.padStart(5, '0')} ไม่ตรงกับรางวัลที่ออกแล้ว
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        โปรดตรวจสอบหมายเลขอีกครั้ง หรือรอการออกรางวัลในหมวดถัดไป
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Prize Pool Details Modal */}
      <PrizePoolModal
        isOpen={prizePoolOpen}
        onClose={() => setPrizePoolOpen(false)}
        lottery={lottery}
      />
    </main>
  );
}
