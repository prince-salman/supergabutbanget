'use client';

import React, { useState, useEffect } from 'react';
import { 
  Team, 
  DraftResult, 
  PostMatchData, 
  PlayoffMatch, 
  NewsArticle, 
  MatchDeskAnalysis, 
  DerbyInfo, 
  TrashTalkOption, 
  HeadToHeadDraftRecord, 
  PressConferenceSession, 
  PressOption 
} from '@/types';
import { MPL_TEAMS } from '@/lib/data/teams';
import { TournamentEngine } from '@/lib/tournamentEngine';
import { DraftEngine } from '@/lib/draftEngine';
import { safeStorage, sanitizeInputText, scrubDangerousKeys } from '@/lib/security';
import { rollRandomMatchDifficulty } from '@/lib/matchDifficulty';
import { generateMatchDeskAnalysis } from '@/lib/casterDeskEngine';
import { detectDerby, generateTrashTalkOptions } from '@/lib/derbyEngine';
import { pressConferenceEngine } from '@/lib/pressConferenceEngine';
import { newsEngine } from '@/lib/newsEngine';

import { Navbar } from '@/components/Navbar';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { DashboardScreen } from '@/components/DashboardScreen';
import { DraftPickScreen } from '@/components/DraftPickScreen';
import { MatchScreen } from '@/components/MatchScreen';
import { RecapScreen } from '@/components/RecapScreen';
import { PlayoffsScreen } from '@/components/PlayoffsScreen';
import { AwardsScreen } from '@/components/AwardsScreen';
import { StatisticsScreen } from '@/components/StatisticsScreen';
import { ScheduleScreen } from '@/components/ScheduleScreen';
import { NewsMediaScreen } from '@/components/NewsMediaScreen';
import { PreMatchBriefingModal } from '@/components/PreMatchBriefingModal';
import { PressConferenceModal } from '@/components/PressConferenceModal';

const STORAGE_KEY = 'mpl_coach_secure_v2';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<string>('screen-welcome');
  const [coachName, setCoachName] = useState<string>('Coach Salman');
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [tournament, setTournament] = useState<TournamentEngine | null>(null);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);

  // Pre-Match Briefing Modal state (Features 52, 53, 38)
  const [preMatchBriefing, setPreMatchBriefing] = useState<{
    homeTeam: Team;
    awayTeam: Team;
    isUserHome: boolean;
    matchInfo: any;
    deskAnalysis: MatchDeskAnalysis;
    derbyInfo: DerbyInfo;
    trashTalkOptions: TrashTalkOption[];
    h2hRecords: HeadToHeadDraftRecord[];
  } | null>(null);

  // Post-Match Interactive Press Conference state (Feature 51)
  const [activePressSession, setActivePressSession] = useState<PressConferenceSession | null>(null);

  // Head-to-Head Draft Records map (Feature 38)
  const [h2hDraftHistory, setH2hDraftHistory] = useState<Record<string, HeadToHeadDraftRecord[]>>({});

  // Active match flow state
  const [activeDraftEngine, setActiveDraftEngine] = useState<DraftEngine | null>(null);
  const [activeDraftResult, setActiveDraftResult] = useState<DraftResult | null>(null);
  const [activeMatchUserSide, setActiveMatchUserSide] = useState<'blue' | 'red'>('blue');
  const [activeMatchInfo, setActiveMatchInfo] = useState<any>(null);
  const [recapData, setRecapData] = useState<PostMatchData | null>(null);
  const [activeBO3Series, setActiveBO3Series] = useState<{
    matchInfo: any;
    homeTeam: Team;
    awayTeam: Team;
    isUserHome: boolean;
    gameNumber: number;
    homeWins: number;
    awayWins: number;
  } | null>(null);

  // Ensure next match has a rolled difficulty condition
  const ensureNextMatchDifficulty = (engine: TournamentEngine) => {
    const next = engine.getUserNextMatch();
    if (next && !(next as any).difficultyCondition) {
      (next as any).difficultyCondition = rollRandomMatchDifficulty();
    }
  };

  const applyLoadedCareer = (saved: any) => {
    if (!saved || !saved.userTeamId) return;
    const team = MPL_TEAMS.find(t => t.id === saved.userTeamId) || MPL_TEAMS[0];
    const engine = new TournamentEngine(MPL_TEAMS, team.id);
    if (saved.currentWeek) engine.currentWeek = saved.currentWeek;
    if (saved.standings) engine.standings = saved.standings;
    if (saved.schedule) engine.schedule = saved.schedule;
    if (saved.stage) engine.stage = saved.stage;
    if (saved.playoffMatches) engine.playoffMatches = saved.playoffMatches;
    if (saved.playerStats) engine.playerStats = saved.playerStats;
    if (saved.teamStats) engine.teamStats = saved.teamStats;
    if (saved.heroStats && typeof saved.heroStats === 'object') {
      Object.keys(engine.heroStats).forEach(hId => {
        if (saved.heroStats[hId]) {
          engine.heroStats[hId] = {
            ...engine.heroStats[hId],
            ...saved.heroStats[hId],
            bans: saved.heroStats[hId].bans || 0,
            picks: saved.heroStats[hId].picks || 0,
            wins: saved.heroStats[hId].wins || 0,
            losses: saved.heroStats[hId].losses || 0,
            winRate: saved.heroStats[hId].winRate || 0
          };
        }
      });
    }
    if (saved.awards) engine.awards = saved.awards;
    if (saved.championTeam) engine.championTeam = saved.championTeam;

    ensureNextMatchDifficulty(engine);

    const cName = sanitizeInputText(saved.coachName, 24) || 'Coach Salman';
    setCoachName(cName);
    setUserTeam(team);
    setTournament(engine);

    if (saved.h2hDraftHistory) {
      setH2hDraftHistory(saved.h2hDraftHistory);
    }

    if (saved.newsArticles && Array.isArray(saved.newsArticles) && saved.newsArticles.length > 0) {
      newsEngine.articles = saved.newsArticles;
    } else {
      newsEngine.initSeasonNews(team, cName);
    }
    setNewsArticles([...newsEngine.articles]);

    setCurrentScreen('screen-dashboard');
  };

  // Load Saved Career on mount (from localStorage with Disk API fallback)
  useEffect(() => {
    const saved = safeStorage.load<any>(STORAGE_KEY, (d) => !!d && typeof d.coachName === 'string' && typeof d.userTeamId === 'string');
    if (saved) {
      applyLoadedCareer(saved);
    } else {
      // Disk Server API fallback (if browser cache was cleared or Chrome reinstalled)
      fetch('/api/career')
        .then(res => res.json())
        .then(res => {
          if (res.success && res.data) {
            applyLoadedCareer(res.data);
            safeStorage.save(STORAGE_KEY, res.data);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Save career state to both localStorage AND local hard disk
  const saveCareer = (updatedTourney?: TournamentEngine) => {
    const tourney = updatedTourney || tournament;
    if (!userTeam || !tourney) return;

    const payload = {
      coachName,
      userTeamId: userTeam.id,
      currentWeek: tourney.currentWeek,
      standings: tourney.standings,
      schedule: tourney.schedule,
      stage: tourney.stage,
      playoffMatches: tourney.playoffMatches,
      playerStats: tourney.playerStats,
      teamStats: tourney.teamStats,
      heroStats: tourney.heroStats,
      awards: tourney.awards,
      championTeam: tourney.championTeam,
      newsArticles: newsEngine.articles,
      h2hDraftHistory
    };

    safeStorage.save(STORAGE_KEY, payload);

    // Save to Disk via /api/career
    fetch('/api/career', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {});
  };

  const handleStartCareer = (teamId: string, name: string) => {
    const cleanName = sanitizeInputText(name, 24) || 'Coach Salman';
    const team = MPL_TEAMS.find(t => t.id === teamId) || MPL_TEAMS[0];
    const engine = new TournamentEngine(MPL_TEAMS, team.id);

    ensureNextMatchDifficulty(engine);

    setCoachName(cleanName);
    setUserTeam(team);
    setTournament(engine);

    newsEngine.initSeasonNews(team, cleanName);
    setNewsArticles([...newsEngine.articles]);

    setCurrentScreen('screen-dashboard');

    const payload = {
      coachName: cleanName,
      userTeamId: team.id,
      currentWeek: engine.currentWeek,
      standings: engine.standings,
      schedule: engine.schedule,
      stage: engine.stage,
      playoffMatches: engine.playoffMatches,
      playerStats: engine.playerStats,
      championTeam: engine.championTeam,
      newsArticles: newsEngine.articles
    };

    safeStorage.save(STORAGE_KEY, payload);
    fetch('/api/career', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {});
  };

  const handleResetCareer = async () => {
    if (window.confirm('Apakah Anda yakin ingin mereset karier Head Coach dan memulai dari awal?')) {
      safeStorage.remove(STORAGE_KEY);
      try {
        await fetch('/api/career', { method: 'DELETE' });
      } catch {}
      setUserTeam(null);
      setTournament(null);
      setNewsArticles([]);
      setCurrentScreen('screen-welcome');
      window.location.reload();
    }
  };

  // Export / Backup Save File to a downloaded .json
  const handleExportSave = () => {
    if (!userTeam || !tournament) {
      alert('Belum ada save data karier aktif untuk diunduh.');
      return;
    }

    const payload = {
      coachName,
      userTeamId: userTeam.id,
      currentWeek: tournament.currentWeek,
      standings: tournament.standings,
      schedule: tournament.schedule,
      stage: tournament.stage,
      playoffMatches: tournament.playoffMatches,
      playerStats: tournament.playerStats,
      championTeam: tournament.championTeam,
      savedAt: new Date().toISOString()
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `mpl_coach_save_${userTeam.tag.toLowerCase()}_week${tournament.currentWeek}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  };

  // Import / Restore Save File from an uploaded .json (with Cyber-Defense verification)
  const handleImportSave = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Security: Check max file size (2 MB limit)
    if (file.size > 2 * 1024 * 1024) {
      alert('❌ Ukuran file melebihi batas keamanan (Maksimal 2 MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed && typeof parsed === 'object' && parsed.userTeamId) {
          const cleanParsed = scrubDangerousKeys(parsed);
          applyLoadedCareer(cleanParsed);
          saveCareer();
          alert('✅ Save file berhasil diverifikasi dan dipulihkan! Selamat melanjutkan karier Coach!');
        } else {
          alert('❌ Format file save tidak valid atau rusak.');
        }
      } catch (err) {
        alert('❌ Gagal memvalidasi file save JSON.');
      }
    };
    reader.readAsText(file);
  };

  const startDraftFlow = (
    homeTeam: Team, 
    awayTeam: Team, 
    isUserHome: boolean, 
    matchInfo: any, 
    series: any,
    pastH2H: HeadToHeadDraftRecord[]
  ) => {
    // Side Alternation in Esports (Game 1 Blue/Red -> Game 2 Red/Blue -> Game 3 Blue/Red):
    const isOddGame = series.gameNumber % 2 === 1;
    const gameBlueTeam = isOddGame ? homeTeam : awayTeam;
    const gameRedTeam = isOddGame ? awayTeam : homeTeam;
    const userSide: 'blue' | 'red' = (isUserHome ? isOddGame : !isOddGame) ? 'blue' : 'red';

    setActiveMatchUserSide(userSide);
    setActiveMatchInfo(matchInfo);

    const engine = new DraftEngine(
      gameBlueTeam,
      gameRedTeam,
      userSide,
      matchInfo?.difficultyCondition
    );
    engine.headToHeadHistory = pastH2H;

    setActiveDraftEngine(engine);
    setCurrentScreen('screen-draft');
  };

  const handleEnterDraft = (homeTeam: Team, awayTeam: Team, isUserHome: boolean, matchInfo: any) => {
    const isNewSeries = !activeBO3Series || activeBO3Series.matchInfo?.id !== matchInfo?.id;
    const series = isNewSeries
      ? {
          matchInfo,
          homeTeam,
          awayTeam,
          isUserHome,
          gameNumber: 1,
          homeWins: 0,
          awayWins: 0
        }
      : activeBO3Series;

    if (isNewSeries) {
      setActiveBO3Series(series);
    }

    const enemyTeam = isUserHome ? awayTeam : homeTeam;
    const pastH2H = h2hDraftHistory[enemyTeam.id] || [];

    // If it's Game 1 of the series, show the PreMatchBriefingModal!
    if (series.gameNumber === 1 && tournament) {
      const deskAnalysis = generateMatchDeskAnalysis(homeTeam, awayTeam, tournament, coachName);
      const derbyInfo = detectDerby(homeTeam, awayTeam);
      const trashTalkOptions = generateTrashTalkOptions(userTeam || homeTeam, enemyTeam, coachName, derbyInfo);

      setPreMatchBriefing({
        homeTeam,
        awayTeam,
        isUserHome,
        matchInfo,
        deskAnalysis,
        derbyInfo,
        trashTalkOptions,
        h2hRecords: pastH2H
      });
    } else {
      startDraftFlow(homeTeam, awayTeam, isUserHome, matchInfo, series, pastH2H);
    }
  };

  const handleProceedFromBriefing = (chosenTrashTalk?: TrashTalkOption) => {
    if (!preMatchBriefing) return;
    const { homeTeam, awayTeam, isUserHome, matchInfo, h2hRecords } = preMatchBriefing;
    setPreMatchBriefing(null);

    const series = activeBO3Series || {
      matchInfo,
      homeTeam,
      awayTeam,
      isUserHome,
      gameNumber: 1,
      homeWins: 0,
      awayWins: 0
    };

    startDraftFlow(homeTeam, awayTeam, isUserHome, matchInfo, series, h2hRecords);
  };

  const handleDraftComplete = (result: DraftResult) => {
    if (activeMatchInfo?.difficultyCondition) {
      result.difficultyCondition = activeMatchInfo.difficultyCondition;
    }

    // Save into Head-to-Head Draft Records (Feature 38)
    if (userTeam) {
      const isUserBlue = activeMatchUserSide === 'blue';
      const enemy = isUserBlue ? result.redTeam : result.blueTeam;
      const userPicks = isUserBlue ? result.bluePicks.map(h => h.name) : result.redPicks.map(h => h.name);
      const enemyPicks = isUserBlue ? result.redPicks.map(h => h.name) : result.bluePicks.map(h => h.name);
      const userBans = isUserBlue ? result.blueBans.map(h => h.name) : result.redBans.map(h => h.name);
      const enemyBans = isUserBlue ? result.redBans.map(h => h.name) : result.blueBans.map(h => h.name);

      const rec: HeadToHeadDraftRecord = {
        matchId: activeMatchInfo?.id || Date.now(),
        dateStr: `Game ${activeBO3Series?.gameNumber || 1}`,
        stageStr: tournament?.stage === 'playoffs' ? 'Playoffs' : `Week ${tournament?.currentWeek || 1}`,
        userPicks,
        enemyPicks,
        userBans,
        enemyBans,
        userWon: false,
        score: 'Live'
      };

      setH2hDraftHistory(prev => {
        const list = prev[enemy.id] || [];
        return {
          ...prev,
          [enemy.id]: [rec, ...list].slice(0, 5)
        };
      });
    }

    setActiveDraftResult(result);
    setCurrentScreen('screen-match');
  };

  const handleMatchFinish = (data: PostMatchData) => {
    // 1. Record real game stats into tournament engine & generate news
    if (tournament && userTeam) {
      tournament.recordGameStats(data);
      newsEngine.generateMatchArticle(data, activeBO3Series, tournament, coachName, userTeam.id);
      setNewsArticles([...newsEngine.articles]);
      saveCareer();
    }

    // 2. Track series score & determine if series is over (BO3 in Regular Season, BO5 in Playoffs, BO7 in Grand Finals)
    if (activeBO3Series) {
      const isHomeWinner = data.winnerTeam.id === activeBO3Series.homeTeam.id;
      const updatedHomeWins = activeBO3Series.homeWins + (isHomeWinner ? 1 : 0);
      const updatedAwayWins = activeBO3Series.awayWins + (!isHomeWinner ? 1 : 0);

      const isPlayoffs = tournament?.stage === 'playoffs';
      const isGrandFinal = activeBO3Series.matchInfo?.stageName === 'Grand Finals' || activeBO3Series.matchInfo?.id === 'grand_final' || activeBO3Series.matchInfo?.title?.includes('Grand Final');
      const requiredWins = isPlayoffs ? (isGrandFinal ? 4 : 3) : 2;
      const isOver = updatedHomeWins >= requiredWins || updatedAwayWins >= requiredWins;

      const updatedSeries = {
        ...activeBO3Series,
        homeWins: updatedHomeWins,
        awayWins: updatedAwayWins
      };
      setActiveBO3Series(updatedSeries);

      data.seriesInfo = {
        matchId: activeBO3Series.matchInfo?.id || 'm_active',
        isSeriesOver: isOver,
        gameNumber: activeBO3Series.gameNumber,
        homeWins: updatedHomeWins,
        awayWins: updatedAwayWins,
        homeTeam: activeBO3Series.homeTeam,
        awayTeam: activeBO3Series.awayTeam
      };
    }
    setRecapData(data);
    setCurrentScreen('screen-recap');
  };

  const handleSeriesFinished = (finalHomeScore: number, finalAwayScore: number) => {
    if (!tournament || !activeBO3Series) return;

    const m = activeBO3Series.matchInfo;
    const winnerTeamId = finalHomeScore > finalAwayScore ? activeBO3Series.homeTeam.id : activeBO3Series.awayTeam.id;
    if (tournament.stage === 'regular') {
      tournament.recordMatchResult(m.id, winnerTeamId, finalHomeScore, finalAwayScore);
      ensureNextMatchDifficulty(tournament);
      saveCareer();
    } else if (tournament.stage === 'playoffs') {
      tournament.recordPlayoffMatchResult(m.id, winnerTeamId, finalHomeScore, finalAwayScore);
      saveCareer();
    }

    setActiveBO3Series(null);
  };

  const handleRecapNext = () => {
    if (!tournament || !activeBO3Series) {
      setCurrentScreen('screen-dashboard');
      return;
    }

    const series = activeBO3Series;
    const isPlayoffs = tournament.stage === 'playoffs';
    const isGrandFinal = series.matchInfo?.stageName === 'Grand Finals' || series.matchInfo?.id === 'grand_final' || series.matchInfo?.title?.includes('Grand Final');
    const requiredWins = isPlayoffs ? (isGrandFinal ? 4 : 3) : 2;

    if (series.homeWins >= requiredWins || series.awayWins >= requiredWins) {
      handleSeriesFinished(series.homeWins, series.awayWins);

      // Feature 51: Trigger Interactive Post-Match Press Conference Session!
      if (recapData && userTeam) {
        const session = pressConferenceEngine.generatePostMatchPressConference(recapData, series, coachName, userTeam);
        setActivePressSession(session);
      } else {
        setCurrentScreen(tournament.stage === 'playoffs' ? 'screen-playoffs' : 'screen-dashboard');
      }
    } else {
      const nextGameNumber = series.gameNumber + 1;
      const nextSeries = {
        ...series,
        gameNumber: nextGameNumber
      };
      setActiveBO3Series(nextSeries);

      const enemyTeam = series.isUserHome ? series.awayTeam : series.homeTeam;
      const pastH2H = h2hDraftHistory[enemyTeam.id] || [];
      startDraftFlow(series.homeTeam, series.awayTeam, series.isUserHome, series.matchInfo, nextSeries, pastH2H);
    }
  };

  const handleFinishPressConference = (answers: { questionId: string; selectedOption: PressOption }[]) => {
    setActivePressSession(null);

    // If user answered questions, append coach quote into the newest news article!
    if (answers.length > 0 && newsEngine.articles.length > 0) {
      const firstAnswer = answers[0].selectedOption;
      if (!newsEngine.articles[0].quotes) newsEngine.articles[0].quotes = [];
      newsEngine.articles[0].quotes.unshift({
        speaker: `Coach ${coachName}`,
        role: `Head Coach ${userTeam?.name || ''}`,
        quote: firstAnswer.text
      });
      setNewsArticles([...newsEngine.articles]);
      saveCareer();
    }

    setCurrentScreen(tournament?.stage === 'playoffs' ? 'screen-playoffs' : 'screen-dashboard');
  };

  const handleAdvanceWeek = () => {
    if (!tournament) return;
    const completedWeek = tournament.currentWeek;
    const res = tournament.advanceWeek();
    ensureNextMatchDifficulty(tournament);
    // Generate League-wide match articles for other teams in this week!
    newsEngine.generateAIMatchArticlesForWeek(completedWeek, tournament, userTeam?.id || '');
    newsEngine.generateWeeklyRecap(completedWeek, tournament);
    setNewsArticles([...newsEngine.articles]);
    saveCareer();
    if (res.status === 'playoffs_started') {
      setCurrentScreen('screen-playoffs');
    } else {
      setTournament(Object.assign(Object.create(Object.getPrototypeOf(tournament)), tournament));
    }
  };

  const handlePlayPlayoffMatch = (match: PlayoffMatch) => {
    if (!match.homeTeam || !match.awayTeam || !userTeam) return;
    if (!match.difficultyCondition) {
      match.difficultyCondition = rollRandomMatchDifficulty();
    }
    const isUserHome = match.homeTeam.id === userTeam.id;
    handleEnterDraft(match.homeTeam, match.awayTeam, isUserHome, match);
  };

  const handleSimulatePlayoffMatch = () => {
    if (!tournament) return;
    const match = tournament.getCurrentPlayoffMatch();
    tournament.simulateCurrentPlayoffMatch();
    if (match) {
      newsEngine.generatePlayoffNews(match, coachName, match.stageName === 'Grand Finals');
      setNewsArticles([...newsEngine.articles]);
    }
    saveCareer();
    setTournament(Object.assign(Object.create(Object.getPrototypeOf(tournament)), tournament));
  };

  const stage = tournament ? tournament.stage : 'regular';

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F4F6] text-gray-900 font-sans selection:bg-[#680008] selection:text-white">
      {/* 1. Navbar */}
      <Navbar
        currentScreen={currentScreen}
        onNavigate={(screenId) => setCurrentScreen(screenId)}
        onResetCareer={handleResetCareer}
        onExportSave={handleExportSave}
        onImportSave={handleImportSave}
        stage={stage}
      />

      {/* 2. Dynamic Screens */}
      <div className="flex-1 pb-12">
        {currentScreen === 'screen-welcome' && (
          <WelcomeScreen onStartCareer={handleStartCareer} />
        )}

        {currentScreen === 'screen-dashboard' && userTeam && tournament && (
          <DashboardScreen
            userTeam={userTeam}
            coachName={coachName}
            tournament={tournament}
            onEnterDraft={handleEnterDraft}
            onAdvanceWeek={handleAdvanceWeek}
            onGoPlayoffs={() => setCurrentScreen('screen-playoffs')}
            onGoAwards={() => setCurrentScreen('screen-awards')}
            onGoNews={() => setCurrentScreen('screen-news')}
          />
        )}

        {currentScreen === 'screen-draft' && activeDraftEngine && (
          <DraftPickScreen
            draftEngine={activeDraftEngine}
            coachName={coachName}
            onDraftComplete={handleDraftComplete}
          />
        )}

        {currentScreen === 'screen-match' && activeDraftResult && (
          <MatchScreen
            draftResult={activeDraftResult}
            userSide={activeMatchUserSide}
            onMatchFinish={handleMatchFinish}
          />
        )}

        {currentScreen === 'screen-recap' && recapData && (
          <RecapScreen
            recapData={recapData}
            userSide={activeMatchUserSide}
            onContinue={handleRecapNext}
          />
        )}

        {currentScreen === 'screen-schedule' && tournament && userTeam && (
          <ScheduleScreen
            tournament={tournament}
            userTeam={userTeam}
            onEnterDraft={handleEnterDraft}
          />
        )}

        {currentScreen === 'screen-statistics' && tournament && userTeam && (
          <StatisticsScreen
            tournament={tournament}
            userTeam={userTeam}
          />
        )}

        {currentScreen === 'screen-news' && userTeam && (
          <NewsMediaScreen
            articles={newsArticles}
            coachName={coachName}
            userTeamName={userTeam.name}
            onGoDashboard={() => setCurrentScreen('screen-dashboard')}
          />
        )}

        {currentScreen === 'screen-playoffs' && tournament && userTeam && (
          <PlayoffsScreen
            tournament={tournament}
            userTeam={userTeam}
            onPlayPlayoffMatch={handlePlayPlayoffMatch}
            onSimulatePlayoffMatch={handleSimulatePlayoffMatch}
            onGoAwards={() => setCurrentScreen('screen-awards')}
            onGoDashboard={() => setCurrentScreen('screen-dashboard')}
          />
        )}

        {currentScreen === 'screen-awards' && tournament && (
          <AwardsScreen
            tournament={tournament}
            coachName={coachName}
            onReturnDashboard={() => setCurrentScreen('screen-dashboard')}
          />
        )}

        {/* 3. Pre-Match Briefing Modal (Features 52, 53, 38) */}
        {preMatchBriefing && (
          <PreMatchBriefingModal
            homeTeam={preMatchBriefing.homeTeam}
            awayTeam={preMatchBriefing.awayTeam}
            isUserHome={preMatchBriefing.isUserHome}
            coachName={coachName}
            deskAnalysis={preMatchBriefing.deskAnalysis}
            derbyInfo={preMatchBriefing.derbyInfo}
            trashTalkOptions={preMatchBriefing.trashTalkOptions}
            h2hRecords={preMatchBriefing.h2hRecords}
            onProceedToDraft={handleProceedFromBriefing}
          />
        )}

        {/* 4. Interactive Post-Match Press Conference Modal (Feature 51) */}
        {activePressSession && (
          <PressConferenceModal
            session={activePressSession}
            coachName={coachName}
            onFinishPress={handleFinishPressConference}
          />
        )}
      </div>

      {/* Official MPL Footer */}
      <footer className="bg-white border-t border-gray-200 py-5 px-4 text-center text-xs text-gray-500 font-mono">
        <div className="max-w-7xl mx-auto flex justify-center items-center">
          <span className="font-bold text-[#680008] font-mpl-title tracking-wider">MPL ID COACH SIMULATOR 2026</span>
        </div>
      </footer>
    </div>
  );
}
