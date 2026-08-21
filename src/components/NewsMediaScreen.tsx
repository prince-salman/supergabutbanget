'use client';

import React, { useState } from 'react';
import { NewsArticle, NewsCategory } from '@/types';
import { getTeamLogoUrl } from '@/lib/imageAssets';
import { Newspaper, MessageSquare, ThumbsUp, Eye, Clock, Share2, Sparkles, TrendingUp, Filter, ChevronRight, User, X } from 'lucide-react';

interface NewsMediaScreenProps {
  articles: NewsArticle[];
  coachName: string;
  userTeamName: string;
  onGoDashboard: () => void;
}

export const NewsMediaScreen: React.FC<NewsMediaScreenProps> = ({
  articles,
  coachName,
  userTeamName,
  onGoDashboard
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(null);

  const filteredArticles = articles.filter(a => {
    if (selectedCategory === 'ALL') return true;
    if (selectedCategory === 'USER') return a.isUserRelated;
    return a.category === selectedCategory;
  });

  const featured = filteredArticles[0] || articles[0];
  const listArticles = filteredArticles.length > 1 ? filteredArticles.slice(1) : filteredArticles;

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 animate-fadeIn text-gray-900">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-[#0d1622] via-[#1a2536] to-[#0d1622] text-white p-4 sm:p-6 rounded-3xl border border-white/10 shadow-xl mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            <span className="text-[10px] font-mono font-black text-red-400 uppercase tracking-widest">
              🔴 LIVE ESPORTS NEWSROOM
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-mpl-title font-black uppercase tracking-tight">
            📰 MEDIA BERITA & LIPUTAN MPL ID
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Liputan Eksklusif Match, Analisis Taktik Draft Coach, Wawancara Pemain, & Reaksi Komunitas Netizen!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white/10 px-3 py-2 rounded-2xl border border-white/15 text-right hidden sm:block">
            <div className="text-[10px] text-gray-400 uppercase font-mono">Status Liputan</div>
            <div className="text-xs font-black text-mpl-gold font-mpl-title">{articles.length} BERITA TERBIT</div>
          </div>
          <button
            onClick={onGoDashboard}
            className="px-4 py-2.5 bg-[#680008] hover:bg-[#85000a] text-white text-xs font-black rounded-xl shadow transition font-mpl-title uppercase tracking-wider"
          >
            ← Dashboard Tim
          </button>
        </div>
      </div>

      {/* 2. Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mb-6 pb-1">
        {[
          { id: 'ALL', label: '🔥 Semua Berita' },
          { id: 'USER', label: `⭐ Tim Anda (${userTeamName})` },
          { id: 'match_recap', label: '🏆 Match Recap' },
          { id: 'breaking', label: '⚡ Breaking News' },
          { id: 'meta_analysis', label: '📊 Analisis Meta' },
          { id: 'playoffs', label: '👑 Playoff & Final' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-black font-mpl-title whitespace-nowrap transition shadow-sm ${
              selectedCategory === cat.id
                ? 'bg-[#680008] text-white shadow-md scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 3. Featured Hero Headline Banner */}
      {featured && (
        <div
          onClick={() => setActiveArticle(featured)}
          className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden mb-8 cursor-pointer hover:shadow-xl transition group grid grid-cols-1 lg:grid-cols-12 gap-0"
        >
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`text-[10px] font-black text-white px-2.5 py-0.5 rounded-full font-mono uppercase ${featured.mediaOutlet.badgeColor}`}>
                  {featured.mediaOutlet.name}
                </span>
                <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full font-mono uppercase">
                  {featured.categoryLabel}
                </span>
                <span className="text-[10px] font-mono text-gray-500">• {featured.timestamp}</span>
              </div>

              <h2 className="text-xl sm:text-3xl font-black text-gray-900 font-mpl-title group-hover:text-[#680008] transition leading-tight mb-2">
                {featured.headline}
              </h2>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4">
                {featured.subheadline}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 flex flex-wrap justify-between items-center gap-2 text-xs text-gray-500 font-mono font-bold">
              <div className="flex items-center gap-3">
                <span>✍️ {featured.author}</span>
                <span>⏱️ {featured.readTime}</span>
              </div>
              <div className="flex items-center gap-3 text-[#680008]">
                <span>👁️ {featured.viewsCount.toLocaleString()} views</span>
                <span className="flex items-center gap-1 font-black underline">
                  Baca Selengkapnya <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-gradient-to-br from-gray-900 to-gray-800 p-6 flex flex-col justify-between text-white border-t lg:border-t-0 lg:border-l border-gray-200">
            <div>
              <div className="text-[10px] font-mono text-mpl-gold font-bold uppercase tracking-wider mb-2">
                💬 KUTIPAN KUNCI RUANG MEDIA:
              </div>
              {featured.quotes && featured.quotes[0] ? (
                <blockquote className="italic text-xs sm:text-sm text-gray-200 border-l-2 border-amber-400 pl-3 my-2 leading-relaxed">
                  "{featured.quotes[0].quote}"
                  <span className="block not-italic text-[10px] font-mono font-bold text-amber-300 mt-1">
                    — {featured.quotes[0].speaker} ({featured.quotes[0].role})
                  </span>
                </blockquote>
              ) : (
                <p className="text-xs text-gray-300">Liputan eksklusif jalannya laga dan keputusan drafting krusial.</p>
              )}
            </div>

            {/* Netizen Preview */}
            {featured.netizenReactions.length > 0 && (
              <div className="mt-4 pt-3 border-t border-white/10">
                <div className="text-[9px] font-mono text-gray-400 uppercase font-bold mb-1">
                  💬 REAKSI NETIZEN TERATAS:
                </div>
                <div className="text-xs text-gray-200 italic line-clamp-2">
                  "{featured.netizenReactions[0].content}"
                </div>
                <div className="text-[9px] font-mono text-gray-400 mt-1">
                  {featured.netizenReactions[0].username} • ❤️ {featured.netizenReactions[0].likes}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. News Articles Grid */}
      <div className="mb-8">
        <h3 className="text-sm sm:text-base font-black text-gray-900 font-mpl-title uppercase tracking-wider mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#680008]" /> DAFTAR ARTIKEL & LIPUTAN TERBARU ({filteredArticles.length})
        </h3>

        {filteredArticles.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center text-gray-500">
            <Newspaper className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <div className="font-bold text-sm">Belum ada artikel dalam kategori ini.</div>
            <p className="text-xs text-gray-400 mt-1">Mainkan match berikutnya untuk menerbitkan liputan berita terbaru!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredArticles.map(article => (
              <div
                key={article.id}
                onClick={() => setActiveArticle(article)}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 flex flex-col justify-between hover:shadow-md hover:border-[#680008]/40 transition cursor-pointer group"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className={`text-[9px] font-black text-white px-2 py-0.5 rounded font-mono uppercase ${article.mediaOutlet.badgeColor}`}>
                      {article.mediaOutlet.name}
                    </span>
                    <span className="text-[9px] font-mono text-gray-400">{article.timestamp}</span>
                  </div>

                  <h4 className="font-black text-sm sm:text-base text-gray-900 font-mpl-title group-hover:text-[#680008] transition leading-snug mb-1.5 line-clamp-2">
                    {article.headline}
                  </h4>

                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
                    {article.subheadline}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] font-mono text-gray-500 font-bold">
                  <span>{article.categoryLabel}</span>
                  <span className="text-[#680008] font-black group-hover:underline flex items-center gap-0.5">
                    Baca <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Full Article Reader Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 text-left flex flex-col">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black text-white px-2.5 py-1 rounded-full font-mono uppercase ${activeArticle.mediaOutlet.badgeColor}`}>
                  {activeArticle.mediaOutlet.name}
                </span>
                <span className="text-xs font-mono text-gray-500">{activeArticle.weekOrStage} • {activeArticle.timestamp}</span>
              </div>
              <button
                onClick={() => setActiveArticle(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full font-mono uppercase mb-2 inline-block">
                  {activeArticle.categoryLabel}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-mpl-title leading-tight">
                  {activeArticle.headline}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 font-bold mt-2 leading-relaxed">
                  {activeArticle.subheadline}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500 font-mono mt-4 pt-3 border-t border-gray-100">
                  <span>Oleh: <b>{activeArticle.author}</b></span>
                  <span>👁️ {activeArticle.viewsCount.toLocaleString()} pembaca</span>
                </div>
              </div>

              {/* Article Paragraphs */}
              <div className="space-y-4 text-xs sm:text-sm text-gray-800 leading-relaxed">
                {activeArticle.body.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>

              {/* Quotes Section */}
              {activeArticle.quotes && activeArticle.quotes.length > 0 && (
                <div className="bg-amber-50/60 p-4 sm:p-5 rounded-2xl border border-amber-200 space-y-3">
                  <div className="text-[10px] font-black text-amber-900 uppercase font-mono tracking-wider">
                    🎙️ PERNYATAAN RESMI MEDIA:
                  </div>
                  {activeArticle.quotes.map((q, idx) => (
                    <blockquote key={idx} className="border-l-4 border-amber-500 pl-3 italic text-xs sm:text-sm text-gray-900">
                      "{q.quote}"
                      <span className="block not-italic text-[10px] font-mono font-bold text-gray-600 mt-1">
                        — {q.speaker} ({q.role})
                      </span>
                    </blockquote>
                  ))}
                </div>
              )}

              {/* Netizen Comments Section */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-xs sm:text-sm font-black text-gray-900 font-mpl-title uppercase tracking-wider mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#680008]" /> KOMENTAR & REAKSI NETIZEN ({activeArticle.netizenReactions.length})
                </h4>

                <div className="space-y-2.5">
                  {activeArticle.netizenReactions.map(comm => (
                    <div key={comm.id} className="bg-gray-50 p-3 rounded-2xl border border-gray-200 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{comm.avatar}</span>
                          <span className="font-bold text-gray-900">{comm.username}</span>
                          <span className="text-[10px] text-gray-400 font-mono">{comm.handle}</span>
                        </div>
                        <span className="text-[9px] text-gray-400 font-mono">{comm.timeAgo}</span>
                      </div>
                      <p className="text-gray-700 mt-0.5 leading-snug">
                        {comm.content}
                      </p>
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] text-gray-500 font-mono font-bold">
                        <ThumbsUp className="w-3 h-3 text-red-600" /> {comm.likes} likes
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setActiveArticle(null)}
                className="px-6 py-2 bg-gray-900 hover:bg-black text-white text-xs font-black rounded-xl transition"
              >
                Tutup Berita
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
