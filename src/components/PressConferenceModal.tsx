'use client';

import React, { useState } from 'react';
import { PressConferenceSession, PressQuestion, PressOption } from '@/types';
import { MessageSquare, Mic, Camera, Award, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';

interface PressConferenceModalProps {
  session: PressConferenceSession;
  coachName: string;
  onFinishPress: (answers: { questionId: string; selectedOption: PressOption }[]) => void;
}

export const PressConferenceModal: React.FC<PressConferenceModalProps> = ({
  session,
  coachName,
  onFinishPress
}) => {
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, PressOption>>({});

  const currentQ = session.questions[currentQIndex];
  const isLastQuestion = currentQIndex === session.questions.length - 1;
  const isAnswered = currentQ && !!selectedAnswers[currentQ.id];

  const handleSelectOption = (opt: PressOption) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQ.id]: opt
    }));
  };

  const handleNext = () => {
    if (!isAnswered) return;

    if (isLastQuestion) {
      const answersArray = session.questions.map(q => ({
        questionId: q.id,
        selectedOption: selectedAnswers[q.id]
      }));
      onFinishPress(answersArray);
    } else {
      setCurrentQIndex(i => i + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn text-gray-900 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-200 text-left flex flex-col my-auto overflow-hidden">
        {/* 1. Top Header */}
        <div className="bg-gradient-to-r from-[#0d1622] via-[#1a2536] to-[#0d1622] text-white p-5 sm:p-6 border-b border-white/10">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-widest flex items-center gap-1">
              <Camera className="w-3.5 h-3.5" /> RUANG KONFERENSI PERS RESMI MPL ID
            </span>
            <span className="text-[10px] font-mono text-gray-400">
              Pertanyaan {currentQIndex + 1} dari {session.questions.length}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase font-mpl-title tracking-tight">
            🎙️ SESI WAWANCARA RESMI MEDIA
          </h2>
          <p className="text-xs text-gray-400 mt-0.5 font-mono">
            {session.matchTitle}
          </p>
        </div>

        {/* 2. Question & Options Content */}
        {currentQ && (
          <div className="p-5 sm:p-7 space-y-5">
            {/* Reporter Question Card */}
            <div className="bg-amber-50/70 p-4 sm:p-5 rounded-2xl border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-[9px] font-mono font-black text-white px-2 py-0.5 rounded uppercase"
                  style={{ backgroundColor: currentQ.outletColor }}
                >
                  {currentQ.outletName}
                </span>
                <span className="text-xs font-bold text-gray-700">
                  {currentQ.reporterName} (Jurnalis)
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-gray-900 italic leading-relaxed">
                "{currentQ.question}"
              </p>
            </div>

            {/* Answer Options */}
            <div>
              <div className="text-[10px] font-mono text-gray-500 uppercase font-black tracking-wider mb-2.5">
                PILIH RESPON JAWABAN COACH {coachName.toUpperCase()}:
              </div>

              <div className="space-y-2.5">
                {currentQ.options.map(opt => {
                  const isSelected = selectedAnswers[currentQ.id]?.id === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectOption(opt)}
                      className={`p-3.5 sm:p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col gap-1 ${
                        isSelected
                          ? 'border-[#680008] bg-red-50/60 shadow-md ring-2 ring-red-500/20'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-gray-900 font-mpl-title">
                          {opt.tone === 'confident' && '🔥 PERCAYA DIRI & TEGAS'}
                          {opt.tone === 'humble' && '🤝 RENDAH HATI & SPORTIF'}
                          {opt.tone === 'analytical' && '🧠 ANALISIS TAKTIK DATA'}
                          {opt.tone === 'spicy' && '🌶️ PSYWAR & TAUNTING'}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          {opt.effectDescription}
                        </span>
                      </div>

                      <p className="text-xs text-gray-800 leading-snug mt-1 italic">
                        "{opt.text}"
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 3. Footer Navigation */}
        <div className="bg-gray-50 p-4 sm:p-5 border-t border-gray-200 flex items-center justify-between gap-3">
          <div className="text-xs text-gray-500 font-mono">
            {isAnswered ? '✅ Jawaban dipilih' : '⚠️ Pilih salah satu respon jawaban'}
          </div>

          <button
            onClick={handleNext}
            disabled={!isAnswered}
            className={`px-6 py-2.5 text-xs sm:text-sm font-black rounded-xl shadow transition font-mpl-title uppercase tracking-wider flex items-center gap-2 ${
              isAnswered
                ? 'bg-[#680008] hover:bg-[#85000a] text-white cursor-pointer shadow-md'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLastQuestion ? 'Selesaikan Konferensi Pers' : 'Pertanyaan Berikutnya'} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
