'use client';

import React, { useState, useEffect } from 'react';
import { Team, DraftResult, PostMatchData, PlayoffMatch } from '@/types';
import { MPL_TEAMS } from '@/lib/data/teams';
import { TournamentEngine } from '@/lib/tournamentEngine';
import { DraftEngine } from '@/lib/draftEngine';
import { safeStorage, sanitizeInputText } from '@/lib/security';
import { rollRandomMatchDifficulty } from '@/lib/matchDifficulty';

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

const STORAGE_KEY = 'mpl_coach_secure_v2';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<string>('screen-welcome');
  const [coachName, setCoachName] = useState<string>('Coach Salman');
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [tournament, setTournament] = useState<TournamentEngine | null>(null);

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

  // Load Saved Career on mount
  useEffect(() => {
    const saved = safeStorage.load<any>(STORAGE_KEY, (d) => !!d && typeof d.coachName === 'string' && typeof d.userTeamId === 'string');
    if (saved) {
      const team = MPL_TEAMS.find(t => t.id === saved.userTeamId) || MPL_TEAMS[0];
      const engine = new TournamentEngine(MPL_TEAMS, team.id);
      if (saved.currentWeek) engine.currentWeek = saved.currentWeek;
      if (saved.standings) engine.standings = saved.standings;
      if (saved.schedule) engine.schedule = saved.schedule;
      if (saved.stage) engine.stage = saved.stage;
      if (saved.playoffMatches) engine.playoffMatches = saved.playoffMatches;
      if (saved.playerStats) engine.playerStats = saved.playerStats;
      if (saved.championTeam) engine.championTeam = saved.championTeam;

      ensureNextMatchDifficulty(engine);

      setCoachName(sanitizeInputText(saved.coachName, 24));
      setUserTeam(team);
      setTournament(engine);
      setCurrentScreen('screen-dashboard');
    }
  }, []);

  // Save career state
  const saveCareer = (updatedTourney?: TournamentEngine) => {
    const tourney = updatedTourney || tournament;
    if (!userTeam || !tourney) return;

    safeStorage.save(STORAGE_KEY, {
      coachName,
      userTeamId: userTeam.id,
      currentWeek: tourney.currentWeek,
      standings: tourney.standings,
      schedule: tourney.schedule,
      stage: tourney.stage,
      playoffMatches: tourney.playoffMatches,
      playerStats: tourney.playerStats,
      championTeam: tourney.championTeam
    });
  };

  const handleStartCareer = (teamId: string, name: string) => {
    const cleanName = sanitizeInputText(name, 24) || 'Coach Salman';
    const team = MPL_TEAMS.find(t => t.id === teamId) || MPL_TEAMS[0];
    const engine = new TournamentEngine(MPL_TEAMS, team.id);

    ensureNextMatchDifficulty(engine);

    setCoachName(cleanName);
    setUserTeam(team);
    setTournament(engine);
    setCurrentScreen('screen-dashboard');

    safeStorage.save(STORAGE_KEY, {
      coachName: cleanName,
      userTeamId: team.id,
      currentWeek: engine.currentWeek,
      standings: engine.standings,
      schedule: engine.schedule,
      stage: engine.stage,
      playoffMatches: engine.playoffMatches,
      playerStats: engine.playerStats,
      championTeam: engine.championTeam
    });
  };

  const handleResetCareer = () => {
    if (window.confirm('Apakah Anda yakin ingin mereset karier Head Coach dan memulai dari awal?')) {
      safeStorage.remove(STORAGE_KEY);
      window.location.reload();
    }
  };

  const handleEnterDraft = (homeTeam: Team, awayTeam: Team, isUserHome: boolean, matchInfo: any) => {
    // If not in middle of an ongoing series, initialize new BO3 series
    if (!activeBO3Series || activeBO3Series.matchInfo?.id !== matchInfo?.id) {
      setActiveBO3Series({
        matchInfo,
        homeTeam,
        awayTeam,
        isUserHome,
        gameNumber: 1,
        homeWins: 0,
        awayWins: 0
      });
    }

    const userSide = isUserHome ? 'blue' : 'red';
    const difficulty = matchInfo?.difficultyCondition || rollRandomMatchDifficulty();
    const draft = new DraftEngine(homeTeam, awayTeam, userSide, difficulty);
    setActiveDraftEngine(draft);
    setActiveMatchUserSide(userSide);
    setActiveMatchInfo(matchInfo);
    setCurrentScreen('screen-draft');
    draft.start();
  };

  const handleDraftComplete = (result: DraftResult) => {
    setActiveDraftResult(result);
    setCurrentScreen('screen-match');
  };

  const handleMatchFinish = (finishData: PostMatchData) => {
    if (tournament && activeMatchInfo) {
      if (tournament.stage === 'playoffs') {
        const homeScore = finishData.winnerSide === 'blue' ? 3 : 1;
        const awayScore = finishData.winnerSide === 'red' ? 3 : 1;
        const winnerId = finishData.winnerSide === 'blue' ? activeMatchInfo.homeTeam.id : activeMatchInfo.awayTeam.id;
        tournament.recordPlayoffMatchResult(activeMatchInfo.id, winnerId, homeScore, awayScore, finishData);
        finishData.seriesInfo = {
          matchId: activeMatchInfo.id,
          gameNumber: 1,
          homeWins: homeScore,
          awayWins: awayScore,
          homeTeam: activeMatchInfo.homeTeam,
          awayTeam: activeMatchInfo.awayTeam,
          isSeriesOver: true
        };
        setRecapData(finishData);
        setCurrentScreen('screen-recap');
        saveCareer();
      } else {
        // Regular Season BO3 Series
        const currentSeries = activeBO3Series || {
          matchInfo: activeMatchInfo,
          homeTeam: MPL_TEAMS.find(t => t.id === activeMatchInfo.homeTeamId) || userTeam!,
          awayTeam: MPL_TEAMS.find(t => t.id === activeMatchInfo.awayTeamId) || userTeam!,
          isUserHome: activeMatchInfo.homeTeamId === userTeam?.id,
          gameNumber: 1,
          homeWins: 0,
          awayWins: 0
        };

        const homeWonGame = finishData.winnerSide === 'blue';
        const newHomeWins = currentSeries.homeWins + (homeWonGame ? 1 : 0);
        const newAwayWins = currentSeries.awayWins + (!homeWonGame ? 1 : 0);
        const isSeriesOver = newHomeWins === 2 || newAwayWins === 2 || currentSeries.gameNumber >= 3;

        finishData.seriesInfo = {
          matchId: activeMatchInfo.id,
          gameNumber: currentSeries.gameNumber,
          homeWins: newHomeWins,
          awayWins: newAwayWins,
          homeTeam: currentSeries.homeTeam,
          awayTeam: currentSeries.awayTeam,
          isSeriesOver
        };

        setRecapData(finishData);
        setCurrentScreen('screen-recap');

        if (isSeriesOver) {
          const winnerId = newHomeWins > newAwayWins ? currentSeries.homeTeam.id : currentSeries.awayTeam.id;
          tournament.recordMatchResult(activeMatchInfo.id, winnerId, newHomeWins, newAwayWins, finishData);
          tournament.simulateOtherWeekMatches();
          setActiveBO3Series(null);
          saveCareer();
        } else {
          setActiveBO3Series({
            ...currentSeries,
            gameNumber: currentSeries.gameNumber + 1,
            homeWins: newHomeWins,
            awayWins: newAwayWins
          });
        }
      }
    }
  };

  const handleRecapContinue = () => {
    if (activeBO3Series && !recapData?.seriesInfo?.isSeriesOver) {
      // Continue to next game of the BO3 series
      const userSide = activeBO3Series.isUserHome ? 'blue' : 'red';
      const difficulty = activeBO3Series.matchInfo?.difficultyCondition || rollRandomMatchDifficulty();
      const draft = new DraftEngine(activeBO3Series.homeTeam, activeBO3Series.awayTeam, userSide, difficulty);
      setActiveDraftEngine(draft);
      setActiveMatchUserSide(userSide);
      setActiveMatchInfo(activeBO3Series.matchInfo);
      setCurrentScreen('screen-draft');
      draft.start();
      return;
    }

    if (tournament?.stage === 'playoffs') {
      setCurrentScreen('screen-playoffs');
    } else if (tournament?.stage === 'completed') {
      setCurrentScreen('screen-awards');
    } else {
      setCurrentScreen('screen-dashboard');
    }
  };

  const handleAdvanceWeek = () => {
    if (!tournament) return;
    const res = tournament.advanceWeek();
    ensureNextMatchDifficulty(tournament);
    saveCareer();
    if (res.status === 'playoffs_started') {
      setCurrentScreen('screen-playoffs');
    } else {
      // Re-trigger render
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
    tournament.simulateCurrentPlayoffMatch();
    saveCareer();
    setTournament(Object.assign(Object.create(Object.getPrototypeOf(tournament)), tournament));
  };

  return (
    <div className="min-h-screen flex flex-col bg-mpl-darkBg">
      <Navbar
        currentScreen={currentScreen}
        onNavigate={(screenId) => {
          if (userTeam && tournament) {
            setCurrentScreen(screenId);
          }
        }}
        onResetCareer={handleResetCareer}
        stage={tournament?.stage || 'regular'}
      />

      <div className="flex-1">
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
            onContinue={handleRecapContinue}
          />
        )}

        {currentScreen === 'screen-playoffs' && userTeam && tournament && (
          <PlayoffsScreen
            tournament={tournament}
            userTeam={userTeam}
            onPlayPlayoffMatch={handlePlayPlayoffMatch}
            onSimulatePlayoffMatch={handleSimulatePlayoffMatch}
            onGoAwards={() => setCurrentScreen('screen-awards')}
            onGoDashboard={() => setCurrentScreen('screen-dashboard')}
          />
        )}

        {currentScreen === 'screen-schedule' && userTeam && tournament && (
          <ScheduleScreen
            tournament={tournament}
            userTeam={userTeam}
            onEnterDraft={handleEnterDraft}
          />
        )}

        {currentScreen === 'screen-statistics' && userTeam && tournament && (
          <StatisticsScreen
            tournament={tournament}
            userTeam={userTeam}
          />
        )}

        {currentScreen === 'screen-awards' && tournament && (
          <AwardsScreen
            tournament={tournament}
            coachName={coachName}
            onReturnDashboard={() => setCurrentScreen('screen-dashboard')}
          />
        )}
      </div>
    </div>
  );
}
