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
  Trash2,
  RotateCcw,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Edit2,
  PlusCircle,
  Clock,
  ArrowRight
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
      setSaveStatus('กำลังบันทึก...');
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
        setSaveStatus('บันทึกเรียบร้อย!');
        setTimeout(() => setSaveStatus(null), 2500);
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

    // Advance to next slot automatically if available
    if (selectedSlotIndex + 1 < targetPrize.slots.length) {
      setSelectedSlotIndex(selectedSlotIndex + 1);
    }
  };

  // Reset actions
  const handleReset = async (type: 'blank' | 'sample') => {
    const confirmMsg =
      type === 'blank'
        ? 'คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลสลากทั้งหมด?'
        : 'คุณต้องการโหลดข้อมูลตัวอย่างตามภาพอ้างอิงหรือไม่?';
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

  // Selected prize for quick form
  const currentSelectedPrize = lottery.prizes.find((p) => p.id === selectedPrizeId);

  // If loading auth state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="text-slate-500 font-semibold animate-pulse">กำลังตรวจสอบสิทธิ์...</div>
      </div>
    );
  }

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl border border-slate-100">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">เข้าสู่ระบบผู้ดูแลระบบ</h1>
            <p className="text-sm text-slate-500 mt-1">
              ระบบกรอกหมายเลขสลากกาชาด 2570 (Admin Only)
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                รหัสผ่าน Admin
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="กรอกรหัสผ่าน (ค่าเริ่มต้น: admin2570)"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900 text-sm"
                required
                autoFocus
              />
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmittingLogin}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
            >
              {isSubmittingLogin ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>

            <div className="pt-2 text-center">
              <Link
                href="/"
                className="text-xs text-slate-500 hover:text-amber-700 font-medium transition inline-flex items-center space-x-1"
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
    <div className="min-h-screen bg-slate-100 p-4 md:p-6 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Navigation */}
        <header className="bg-white rounded-2xl p-4 md:p-5 shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">
                Admin Control
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {lottery.updatedAt ? new Date(lottery.updatedAt).toLocaleTimeString('th-TH') : ''}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 mt-0.5">
              ระบบจัดการผลการออกสลากกาชาด ประจำปี 2570
            </h1>
          </div>

          {/* Quick status & Links */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Status Selector */}
            <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200 text-xs font-medium">
              <button
                onClick={() => handleStatusChange('live')}
                className={`px-3 py-1 rounded-lg transition ${
                  lottery.status === 'live'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                กำลังออกรางวัล (Live)
              </button>
              <button
                onClick={() => handleStatusChange('completed')}
                className={`px-3 py-1 rounded-lg transition ${
                  lottery.status === 'completed'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                เสร็จสิ้น
              </button>
              <button
                onClick={() => handleStatusChange('paused')}
                className={`px-3 py-1 rounded-lg transition ${
                  lottery.status === 'paused'
                    ? 'bg-amber-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                พักการออก
              </button>
            </div>

            {/* View live board */}
            <Link
              href="/"
              target="_blank"
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Tv className="w-4 h-4" />
              <span>เปิดจอแสดงผลสด (Live Board)</span>
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold transition border border-rose-200 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </header>

        {/* Quick Input Bar */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border-2 border-amber-400">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <PlusCircle className="w-5 h-5 text-amber-600" />
                <span>กรอกหมายเลขรางวัล (ป้อนหมายเลขทันทีที่จับสลากได้)</span>
              </h2>
              <p className="text-xs text-slate-500">
                เมื่อกรอกรางวัลที่ 1 ระบบจะคำนวณและเติมรางวัลข้างเคียง (รางวัลที่ 7) ให้โดยอัตโนมัติทันที
              </p>
            </div>
            {saveStatus && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 animate-pulse">
                {saveStatus}
              </span>
            )}
          </div>

          <form onSubmit={handleQuickSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end">
            {/* Select Prize */}
            <div className="sm:col-span-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                เลือกประเภทรางวัล:
              </label>
              <select
                value={selectedPrizeId}
                onChange={(e) => {
                  setSelectedPrizeId(e.target.value);
                  setSelectedSlotIndex(0);
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500"
              >
                {lottery.prizes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} - {p.itemDescription} ({p.quantity} รางวัล)
                  </option>
                ))}
              </select>
            </div>

            {/* Select Slot */}
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ช่องรางวัล (ลำดับที่):
              </label>
              <select
                value={selectedSlotIndex}
                onChange={(e) => setSelectedSlotIndex(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500"
              >
                {currentSelectedPrize?.slots.map((s, idx) => (
                  <option key={idx} value={idx}>
                    ลำดับที่ {idx + 1} {s ? `(ปัจจุบัน: ${s})` : '(ยังไม่มีหมายเลข)'}
                  </option>
                ))}
              </select>
            </div>

            {/* Input Number */}
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                หมายเลขสลาก ({currentSelectedPrize?.digits || 5} หลัก):
              </label>
              <input
                type="text"
                maxLength={currentSelectedPrize?.digits || 5}
                value={inputNumber}
                onChange={(e) => setInputNumber(e.target.value.replace(/\D/g, ''))}
                placeholder={`เช่น ${currentSelectedPrize?.digits === 3 ? '081' : '00051'}`}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-amber-400 font-mono text-lg font-bold text-center tracking-widest text-slate-900 focus:ring-2 focus:ring-amber-500 bg-amber-50/20"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs transition flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>บันทึกผล</span>
              </button>
            </div>
          </form>
        </div>

        {/* Prize Pool Dashboard - Interactive Slots View */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              กระดานรายการรางวัลทั้งหมด (คลิกเพื่อแก้ไขหมายเลขโดยตรง)
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleReset('sample')}
                className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                title="โหลดชุดข้อมูลตัวอย่างเหมือนภาพอ้างอิง"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>โหลดข้อมูลตัวอย่าง</span>
              </button>
              <button
                onClick={() => handleReset('blank')}
                className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-700 text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                title="ล้างหมายเลขทั้งหมดเพื่อเริ่มจับรางวัลใหม่"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ล้างกระดาน (เริ่มใหม่)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {lottery.prizes.map((prize) => (
              <div
                key={prize.id}
                className={`bg-white rounded-2xl p-4 shadow-xs border ${
                  prize.id === 'p1' ? 'border-amber-400 bg-amber-50/20' : 'border-slate-200'
                }`}
              >
                {/* Prize Title Bar */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold">
                      {prize.badgeNumber}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 text-base">
                        {prize.title}
                      </span>
                      <span className="text-xs text-slate-500 ml-2 font-medium">
                        {prize.itemDescription}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {prize.isAdjacent && (
                      <span className="text-[11px] bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-md">
                        คำนวณอัตโนมัติจากรางวัลที่ 1
                      </span>
                    )}
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {prize.quantity} รางวัล ({prize.digits} หลัก)
                    </span>
                  </div>
                </div>

                {/* Slots Grid */}
                <div
                  className={`grid gap-2.5 ${
                    prize.digits === 3
                      ? 'grid-cols-1 sm:grid-cols-3'
                      : prize.slots.length === 2
                      ? 'grid-cols-2'
                      : prize.slots.length <= 4
                      ? 'grid-cols-2 sm:grid-cols-4'
                      : prize.slots.length <= 5
                      ? 'grid-cols-2 sm:grid-cols-5'
                      : 'grid-cols-2 sm:grid-cols-5 lg:grid-cols-10'
                  }`}
                >
                  {prize.slots.map((val, idx) => (
                    <div
                      key={idx}
                      className={`relative group rounded-xl p-2.5 flex flex-col items-center justify-center border-2 transition cursor-pointer ${
                        val
                          ? 'bg-white border-slate-300 hover:border-amber-500 shadow-xs'
                          : 'bg-slate-50 border-dashed border-slate-300 hover:border-slate-400'
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
                      <span className="text-[10px] text-slate-400 font-medium mb-0.5">
                        ลำดับที่ {idx + 1}
                      </span>
                      <span
                        className={`font-mono font-bold tracking-wider ${
                          prize.digits === 3
                            ? 'text-3xl text-slate-900'
                            : prize.slots.length <= 2
                            ? 'text-2xl text-slate-900'
                            : 'text-lg text-slate-900'
                        } ${!val ? 'text-slate-300' : ''}`}
                      >
                        {val || '- - - - -'}
                      </span>

                      {/* Quick hover action */}
                      {val && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`ต้องการลบหมายเลข ${val} หรือไม่?`)) {
                              handleUpdateSlot(prize.id, idx, null);
                            }
                          }}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition shadow-xs"
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

        {/* MongoDB Connection Status Guide Box */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 text-xs text-slate-600 space-y-2">
          <div className="flex items-center space-x-2 font-bold text-slate-800 text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>สถานะระบบจัดเก็บข้อมูล (Storage Status)</span>
          </div>
          <p>
            ขณะนี้ระบบทำงานในโหมดจัดเก็บอัตโนมัติ (Local JSON Storage) ข้อมูลจะไม่สูญหายเมื่อรีสตาร์ทเซิร์ฟเวอร์
          </p>
          <p className="text-slate-500">
            เมื่อคุณต้องการเชื่อมต่อกับ <strong>MongoDB</strong> เพียงสร้างไฟล์ <code>.env.local</code> และใส่ค่า:
            <code className="block bg-slate-100 p-2 rounded-md font-mono mt-1 text-slate-800">
              MONGODB_URI=mongodb+srv://&lt;username&gt;:&lt;password&gt;@cluster0.xxxxx.mongodb.net/lottery?retryWrites=true&w=majority
            </code>
            ระบบจะสลับไปใช้ MongoDB อัตโนมัติทันทีโดยไม่ต้องแก้ไขโค้ดใดๆ เพิ่มเติม
          </p>
        </div>
      </div>
    </div>
  );
}

