"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MurafiqLogo } from "@/components/brand/MurafiqLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  PlusCircle,
  Search,
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Clock,
  Sparkles
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [trackingNumber, setTrackingNumber] = useState("");

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      router.push(`/track?ref=${encodeURIComponent(trackingNumber.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-arabic text-right selection:bg-blue-600 selection:text-white" dir="rtl">
      {/* 1. Navbar */}
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur sticky top-0 z-30 shadow-xs">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <MurafiqLogo size="md" />
            <div>
              <span className="block text-sm font-black text-slate-900 tracking-tight">
                مُرافِق
              </span>
              <span className="text-[10px] text-slate-400 block font-sans">Case & Resolution Platform</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/portal/dashboard">
              <Button variant="ghost" size="sm" className="font-bold text-slate-700">
                بوابة المؤسسات
              </Button>
            </Link>
            <Link href="/ar/cases/new">
              <Button variant="default" size="sm" className="font-bold flex items-center gap-1.5 shadow-sm">
                <PlusCircle className="w-4 h-4" />
                <span>تسجيل طلب جديد</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <main className="py-16 sm:py-24 px-4">
        <div className="mx-auto max-w-4xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200/80 px-3.5 py-1 text-xs font-semibold text-blue-800">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>نظام موحد وبسيط لمتابعة وحسم الشكاوى والطلبات</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            حل المشكلات يبدأ من هنا، <br className="hidden sm:inline" />
            بكل بساطة وشفافية
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            منصة مرافِق تمكّنك من تقديم شكواك أو استفسارك لأي مدرسة، جامعة، أو مؤسسة، ومتابعة خطوات الحل خطوة بخطوة حتى الإغلاق النهائي.
          </p>

          {/* Quick Action Box */}
          <div className="pt-6 max-w-xl mx-auto">
            <Card className="border border-slate-200 shadow-md bg-white p-2">
              <CardContent className="p-4 space-y-4">
                {/* Search Bar for Existing Tickets */}
                <form onSubmit={handleTrack} className="flex gap-2">
                  <Input
                    placeholder="لديك رقم تتبع؟ (مثال: MRF-2026-48219)"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <Button type="submit" variant="default" className="shrink-0 flex items-center gap-1.5">
                    <Search className="w-4 h-4" />
                    <span>تتبع</span>
                  </Button>
                </form>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-4 text-xs text-slate-400">أو</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                {/* Primary CTA Button */}
                <Link href="/ar/cases/new" className="block">
                  <Button variant="default" size="lg" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center justify-center gap-2">
                    <PlusCircle className="w-5 h-5 text-emerald-400" />
                    <span>تسجيل شكوى أو طلب جديد الآن (نموذج مبسط)</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 3. Three Pillars of Murafiq */}
        <section className="mt-20 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border border-slate-200/80 bg-white">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <PlusCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">1. تسجيل فوري وسهل</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              نموذج مباشر ومختصر يتيح لك تسجيل تفاصيل مشكلتك في دقائق، مع الحفاظ الكامل على سرية بياناتك الشخصية.
            </p>
          </Card>

          <Card className="p-6 border border-slate-200/80 bg-white">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">2. تتبع حي للالتزامات</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              متابعة مواعيد الحل المحددة والتواصل المباشر مع المسؤولين داخل المؤسسة المعنية دون تعقيدات ورقية.
            </p>
          </Card>

          <Card className="p-6 border border-slate-200/80 bg-white">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">3. تقارير حل معتمدة</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              الحصول على وثيقة تسوية واضحة وملزمة توضح الإجراءات المتخذة ومستوى الرضا النهائي.
            </p>
          </Card>
        </section>

        {/* 4. Institutional Gateway Banner */}
        <section className="mt-16 max-w-5xl mx-auto">
          <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="space-y-2 text-center md:text-right">
              <Badge variant="outline" className="text-slate-300 border-slate-700">
                بوابة الجهات والمؤسسات
              </Badge>
              <h2 className="text-2xl font-bold">هل أنت ممثل لإحدى المؤسسات المسجلة؟</h2>
              <p className="text-sm text-slate-400 max-w-xl">
                ادخل إلى لوحة التحكم لإدارة الحالات المعينة، توزيع المهام، وتحديث خطوات الحل عبر مسار عمل رقمي متكامل.
              </p>
            </div>
            <Link href="/portal/dashboard" className="shrink-0">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 font-bold px-6">
                دخول لوحة التحكم ←
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* 5. Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-400">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>جميع الحقوق محفوظة © {new Date().getFullYear()} منصة مُرافِق</span>
          <div className="flex items-center gap-4">
            <Link href="/track" className="hover:text-slate-600 transition">فحص التقارير المعتمدة</Link>
            <Link href="/portal/dashboard" className="hover:text-slate-600 transition">بوابة المؤسسات</Link>
            <Link href="/ar/cases/new" className="hover:text-slate-600 transition">تسجيل شكوى</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
