'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { LotteryState, PrizeDefinition } from '@/lib/types';
import { SAMPLE_LOTTERY_STATE } from '@/lib/constants';
import {
  Lock,
  LogOut,
  Tv,
  Save,
  RotateCcw,
  Sparkles,
  PlusCircle,
  ArrowRight,
  Check,
} from 'lucide-react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);

  const [lottery, setLottery] = useState<LotteryState>(SAMPLE_LOTTERY_STATE);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Quick entry state
  const [selectedPrizeId, setSelectedPrizeId] = useState('p1');
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);
  const [inputNumber, setInputNumber] = useState('');

  // Check authentication
  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth');
      const data = await res.json();
      setIsAuthenticated(data.authenticated);
    } catch {
      setIsAuthenticated(false);
    }
  }, []);

  // Fetch current data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/lottery', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && json.data) {
        setLottery(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
    fetchData();
  }, [checkAuth, fetchData]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingLogin(true);
    setLoginError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        setPassword('');
        fetchData();
      } else {
        setLoginError(data.error || 'รหัสผ่านไม่ถูกต้อง');
      }
    } catch {
      setLoginError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    setIsAuthenticated(false);
  };

  // Submit slot update
  const handleUpdateSlot = async (prizeId: string, slotIndex: number, numberVal: string | null) => {
    try {
      setSaveStatus('กำลังบันทึก');
      const res = await fetch('/api/lottery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_slot',
          prizeId,
          slotIndex,
          number: numberVal,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setLottery(json.data);
        setSaveStatus('บันทึกเรียบร้อย');
        setTimeout(() => setSaveStatus(null), 2000);
      } else {
        setSaveStatus(json.error || 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      setSaveStatus('ไม่สามารถบันทึกได้');
    }
  };

  // Quick form submit
  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetPrize = lottery.prizes.find((p) => p.id === selectedPrizeId);
    if (!targetPrize) return;

    await handleUpdateSlot(selectedPrizeId, selectedSlotIndex, inputNumber);
    setInputNumber('');

    if (selectedSlotIndex + 1 < targetPrize.slots.length) {
      setSelectedSlotIndex(selectedSlotIndex + 1);
    }
  };

  // Reset actions
  const handleReset = async (type: 'blank' | 'sample') => {
    const confirmMsg =
      type === 'blank'
        ? 'ต้องการล้างข้อมูลสลากทั้งหมดเพื่อเริ่มจับรางวัลใหม่?'
        : 'ต้องการโหลดข้อมูลตัวอย่างตามลำดับที่กำหนดหรือไม่?';
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch('/api/lottery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: type === 'blank' ? 'reset_blank' : 'reset_sample' }),
      });
      const json = await res.json();
      if (json.success) {
        setLottery(json.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Change drawing status
  const handleStatusChange = async (status: 'live' | 'completed' | 'paused') => {
    try {
      const res = await fetch('/api/lottery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_status', status }),
      });
      const json = await res.json();
      if (json.success) {
        setLottery(json.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const currentSelectedPrize = lottery.prizes.find((p) => p.id === selectedPrizeId);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-slate-500 text-sm">กำลังตรวจสอบสิทธิ์</div>
      </div>
    );
  }

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
        <div className="bg-white rounded-2xl max-w-sm w-full p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mx-auto mb-3 border border-slate-200">
              <Lock className="w-5 h-5 text-slate-600" />
            </div>
            <h1 className="text-lg font-semibold text-slate-900">เข้าสู่ระบบเจ้าหน้าที่</h1>
            <p className="text-xs text-slate-500 mt-1">
              ระบบจัดการผลการออกรางวัลสลากกาชาด 2570
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                รหัสผ่านผู้ดูแลระบบ
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="รหัสผ่าน (ค่าเริ่มต้น: admin2570)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:border-slate-800 text-slate-900 text-sm"
                required
                autoFocus
              />
            </div>

            {loginError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmittingLogin}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition text-sm shadow-xs disabled:opacity-50"
            >
              {isSubmittingLogin ? 'กำลังเข้าสู่ระบบ' : 'เข้าสู่ระบบ'}
            </button>

            <div className="pt-2 text-center">
              <Link
                href="/"
                className="text-xs text-slate-500 hover:text-slate-800 transition inline-flex items-center space-x-1"
              >
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                <span>กลับสู่หน้าจอแสดงผลสด</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <header className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                ADMIN
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {lottery.updatedAt ? new Date(lottery.updatedAt).toLocaleTimeString('th-TH') : ''}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-semibold text-slate-900 mt-1">
              แผงควบคุมการออกรางวัลสลากกาชาด 2570
            </h1>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {/* Status Selector */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200 text-xs font-medium">
              <button
                onClick={() => handleStatusChange('live')}
                className={`px-3 py-1 rounded-md transition ${
                  lottery.status === 'live'
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                กำลังออกรางวัล
              </button>
              <button
                onClick={() => handleStatusChange('completed')}
                className={`px-3 py-1 rounded-md transition ${
                  lottery.status === 'completed'
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                เสร็จสิ้น
              </button>
              <button
                onClick={() => handleStatusChange('paused')}
                className={`px-3 py-1 rounded-md transition ${
                  lottery.status === 'paused'
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                พักการออก
              </button>
            </div>

            <Link
              href="/"
              target="_blank"
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition shadow-xs"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>เปิดจอแสดงผล</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition border border-slate-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ออก</span>
            </button>
          </div>
        </header>

        {/* Quick Input Section */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 flex items-center space-x-2">
                <PlusCircle className="w-4 h-4 text-slate-600" />
                <span>ป้อนหมายเลขสลาก</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                เมื่อบันทึกรางวัลที่ 1 ระบบจะคำนวณและเติมรางวัลข้างเคียง (รางวัลที่ 7) ให้โดยอัตโนมัติ
              </p>
            </div>
            {saveStatus && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-mono">
                {saveStatus}
              </span>
            )}
          </div>

          <form onSubmit={handleQuickSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-4">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                หมวดรางวัล
              </label>
              <select
                value={selectedPrizeId}
                onChange={(e) => {
                  setSelectedPrizeId(e.target.value);
                  setSelectedSlotIndex(0);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-slate-800"
              >
                {lottery.prizes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} - {p.itemDescription} ({p.quantity} รางวัล)
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                ลำดับรางวัล
              </label>
              <select
                value={selectedSlotIndex}
                onChange={(e) => setSelectedSlotIndex(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-slate-800"
              >
                {currentSelectedPrize?.slots.map((s, idx) => (
                  <option key={idx} value={idx}>
                    ลำดับที่ {idx + 1} {s ? `(ปัจจุบัน: ${s})` : '(ว่าง)'}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                หมายเลข ({currentSelectedPrize?.digits || 5} หลัก)
              </label>
              <input
                type="text"
                maxLength={currentSelectedPrize?.digits || 5}
                value={inputNumber}
                onChange={(e) => setInputNumber(e.target.value.replace(/\D/g, ''))}
                placeholder={`เช่น ${currentSelectedPrize?.digits === 3 ? '081' : '00051'}`}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 lottery-digits text-base font-bold text-center tracking-widest text-slate-900 focus:outline-hidden focus:border-slate-800 bg-white"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition text-xs flex items-center justify-center space-x-1.5 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>บันทึก</span>
              </button>
            </div>
          </form>
        </div>

        {/* Sequential Prize Overview Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              รายการสลากตามลำดับรางวัล (คลิกที่ช่องเพื่อแก้ไขหมายเลข)
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleReset('sample')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition flex items-center space-x-1"
                title="โหลดข้อมูลตัวอย่าง"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                <span>ข้อมูลตัวอย่าง</span>
              </button>
              <button
                onClick={() => handleReset('blank')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition flex items-center space-x-1"
                title="ล้างข้อมูลทั้งหมดเพื่อเริ่มจับรางวัลใหม่"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>ล้างกระดาน</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {lottery.prizes.map((prize) => (
              <div
                key={prize.id}
                className={`bg-white rounded-2xl p-4 border transition ${
                  prize.id === 'p1' ? 'border-amber-300' : 'border-slate-200'
                } shadow-xs`}
              >
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-mono font-semibold">
                      {prize.badgeNumber}
                    </span>
                    <div>
                      <span className="font-semibold text-slate-900 text-sm">
                        {prize.title}
                      </span>
                      <span className="text-xs text-slate-500 ml-2">
                        {prize.itemDescription}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-xs">
                    {prize.isAdjacent && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded">
                        คำนวณอัตโนมัติจากรางวัลที่ 1
                      </span>
                    )}
                    <span className="text-slate-500 font-mono">
                      {prize.quantity} รางวัล ({prize.digits} หลัก)
                    </span>
                  </div>
                </div>

                <div
                  className={`grid gap-2 ${
                    prize.digits === 3
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
                  {prize.slots.map((val, idx) => (
                    <div
                      key={idx}
                      className={`relative group rounded-xl p-2.5 flex flex-col items-center justify-center border transition cursor-pointer ${
                        val
                          ? 'bg-white border-slate-300 hover:border-slate-800 shadow-xs'
                          : 'bg-slate-50/50 border-dashed border-slate-200 hover:border-slate-400'
                      }`}
                      onClick={() => {
                        const newVal = window.prompt(
                          `กรอกหมายเลข ${prize.title} ลำดับที่ ${idx + 1} (${prize.digits} หลัก):`,
                          val || ''
                        );
                        if (newVal !== null) {
                          handleUpdateSlot(prize.id, idx, newVal.trim() === '' ? null : newVal);
                        }
                      }}
                    >
                      <span className="text-[10px] text-slate-400 font-mono mb-0.5">
                        #{idx + 1}
                      </span>
                      <span
                        className={`lottery-digits font-bold tracking-wider ${
                          prize.digits === 3
                            ? 'text-2xl text-slate-900'
                            : prize.slots.length <= 2
                            ? 'text-2xl text-slate-900'
                            : 'text-base text-slate-900'
                        } ${!val ? 'text-slate-300 font-normal' : ''}`}
                      >
                        {val || (prize.digits === 3 ? '— — —' : '— — — — —')}
                      </span>

                      {val && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`ต้องการลบหมายเลข ${val}?`)) {
                              handleUpdateSlot(prize.id, idx, null);
                            }
                          }}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-slate-300 hover:bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition"
                          title="ลบหมายเลขนี้"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
