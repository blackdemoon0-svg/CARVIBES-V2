import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { t, type Lang } from "../../lib/i18n";
import { cars } from "../../lib/db";
import { USED_CAR_PICKS } from "../../lib/usedCars";
import { ArrowRight, CompassIcon } from "../../components/icons";
import AdvisorQuestions from "./AdvisorQuestions";
import AdvisorResults from "./AdvisorResults";
import { rankAdvisorCars } from "./advisorEngine";
import { trackAdvisor } from "./advisorAnalytics";
import {
  ADVISOR_STEP_COUNT,
  createInitialAdvisorProgress,
  readAdvisorProgress,
  clearAdvisorProgress,
  writeAdvisorProgress,
  type AdvisorProgress,
  type AdvisorScreen,
} from "./advisorModel";
import "./advisor.css";

export default function AdvisorExperience({ lang }: { lang: Lang }) {
  const [progress, setProgress] = useState<AdvisorProgress>(() =>
    readAdvisorProgress() ?? createInitialAdvisorProgress(),
  );
  const [compareNotice, setCompareNotice] = useState("");
  const noticeTimer = useRef<number | undefined>(undefined);
  const previousScreen = useRef<AdvisorScreen | null>(null);

  const results = useMemo(
    () => progress.screen === "results"
      ? rankAdvisorCars(cars, progress.profile, USED_CAR_PICKS)
      : [],
    [progress.screen, progress.profile],
  );

  useEffect(() => {
    writeAdvisorProgress(progress);
  }, [progress]);

  useEffect(() => {
    if (progress.screen === "results" && previousScreen.current !== "results") {
      trackAdvisor("advisor_result_viewed", { result_count: results.length });
    }
    previousScreen.current = progress.screen;
  }, [progress.screen, results.length]);

  useEffect(() => () => {
    if (noticeTimer.current !== undefined) window.clearTimeout(noticeTimer.current);
  }, []);

  const updateProfile = useCallback((update: Partial<AdvisorProgress["profile"]>) => {
    setProgress((current) => ({
      ...current,
      profile: {
        ...current.profile,
        ...update,
        priorities: update.priorities
          ? { ...current.profile.priorities, ...update.priorities }
          : current.profile.priorities,
      },
    }));
  }, []);

  const start = () => {
    trackAdvisor("advisor_started");
    setProgress((current) => ({ ...current, screen: "questions", step: 0, started: true }));
  };

  const canContinue =
    progress.step === 0
      ? progress.profile.budgetBand !== null
      : progress.step === 1
        ? progress.profile.purchaseType !== null
        : progress.step === 2
          ? progress.profile.uses.length > 0
          : true;

  const next = () => {
    if (!canContinue) return;
    trackAdvisor("advisor_question_completed", { step: progress.step + 1 });
    if (progress.step >= ADVISOR_STEP_COUNT - 1) {
      trackAdvisor("advisor_completed");
      setProgress((current) => ({ ...current, screen: "results", started: true }));
      return;
    }
    setProgress((current) => ({ ...current, step: current.step + 1 }));
  };

  const back = () => {
    if (progress.step > 0) {
      setProgress((current) => ({ ...current, step: current.step - 1 }));
      return;
    }
    setProgress((current) => ({ ...current, screen: "intro" }));
  };

  const editAnswers = () => {
    setProgress((current) => ({ ...current, screen: "questions", step: 0, started: true }));
  };

  const restart = () => {
    trackAdvisor("advisor_restarted");
    clearAdvisorProgress();
    setProgress(createInitialAdvisorProgress());
    setCompareNotice("");
  };

  const showCompareLimit = () => {
    setCompareNotice(t(lang, "advisor_compare_full"));
    if (noticeTimer.current !== undefined) window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setCompareNotice(""), 4200);
  };

  return (
    <>
      {progress.screen === "intro" && <Intro lang={lang} onStart={start} />}
      {progress.screen === "questions" && (
        <AdvisorQuestions
          lang={lang}
          step={progress.step}
          profile={progress.profile}
          canContinue={canContinue}
          onUpdate={updateProfile}
          onBack={back}
          onNext={next}
        />
      )}
      {progress.screen === "results" && (
        <AdvisorResults
          lang={lang}
          profile={progress.profile}
          results={results}
          onEdit={editAnswers}
          onRestart={restart}
          onCarClick={(carId, position) => trackAdvisor("advisor_car_clicked", { car_id: carId, position })}
          onCompareMax={showCompareLimit}
        />
      )}
      {compareNotice && (
        <div role="status" aria-live="polite" className="fixed bottom-5 left-1/2 z-[70] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 border border-white/15 bg-graphite px-4 py-3 text-center text-sm text-white shadow-2xl">
          {compareNotice}
        </div>
      )}
    </>
  );
}

function Intro({ lang, onStart }: { lang: Lang; onStart: () => void }) {
  return (
    <section className="relative isolate min-h-[calc(100svh-5rem)] overflow-hidden border-b border-line bg-ink pt-24 sm:pt-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute right-[-13rem] top-[-12rem] h-[34rem] w-[34rem] rounded-full border border-white/[0.05]" />
        <div className="absolute right-[-8rem] top-[-7rem] h-[24rem] w-[24rem] rounded-full border border-white/[0.06]" />
        <div className="absolute right-[-3rem] top-[-2rem] h-[14rem] w-[14rem] rounded-full border border-white/[0.07]" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100svh-8rem)] max-w-7xl items-center gap-12 px-5 py-10 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-12">
        <div className="advisor-step-in max-w-2xl">
          <p className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.23em] text-accent-soft sm:text-xs">
            <span className="h-px w-8 bg-accent" />
            {t(lang, "advisor_brand")}
          </p>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl">
            {t(lang, "advisor_title")}
          </h1>
          <p className="mt-4 font-display text-lg font-medium tracking-tight text-mist sm:text-2xl">
            {t(lang, "advisor_subtitle")}
          </p>

          <h2 className="mt-9 max-w-xl font-display text-2xl font-semibold leading-snug text-white sm:text-3xl">
            {t(lang, "advisor_tagline")}
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-mist sm:text-base">
            {t(lang, "advisor_intro")}
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={onStart}
              className="cv-btn cv-btn-primary group inline-flex min-h-14 w-full items-center justify-center gap-3 px-7 text-sm font-semibold sm:w-auto sm:min-w-56"
            >
              {t(lang, "advisor_start")}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <span className="flex items-center justify-center gap-2 text-xs font-medium text-fog sm:justify-start">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
              {t(lang, "advisor_duration")}
            </span>
          </div>
        </div>

        <div className="advisor-step-in relative mx-auto w-full max-w-xl lg:ms-auto" style={{ animationDelay: "90ms" }}>
          <div className="relative overflow-hidden border border-white/[0.1] bg-charcoal p-5 shadow-[0_30px_100px_-55px_rgba(0,0,0,0.95)] sm:p-8">
            <div className="absolute right-0 top-0 h-32 w-32 border-b border-l border-white/[0.04]" aria-hidden="true" />
            <div className="relative flex items-center justify-between gap-4 border-b border-line pb-5">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-fog">{t(lang, "advisor_profile_preview")}</p>
                <p className="mt-2 font-display text-lg font-semibold text-white">{t(lang, "advisor_profile_title")}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center border border-accent/35 bg-accent/[0.08] text-accent-soft">
                <CompassIcon className="h-6 w-6" />
              </div>
            </div>

            <div className="relative mt-5 space-y-3">
              <PreviewRow lang={lang} index="01" titleKey="advisor_preview_budget" width="74%" />
              <PreviewRow lang={lang} index="02" titleKey="advisor_preview_lifestyle" width="56%" />
              <PreviewRow lang={lang} index="03" titleKey="advisor_preview_preferences" width="88%" />
            </div>

            <div className="relative mt-6 flex items-center gap-3 border-t border-line pt-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-xs text-accent-soft" aria-hidden="true">✓</span>
              <p className="text-xs leading-relaxed text-mist">{t(lang, "advisor_preview_footer")}</p>
            </div>
          </div>
          <span aria-hidden="true" className="absolute -bottom-3 -right-3 h-16 w-16 border-b border-r border-accent/50" />
        </div>
      </div>
    </section>
  );
}

function PreviewRow({ lang, index, titleKey, width }: { lang: Lang; index: string; titleKey: string; width: string }) {
  return (
    <div className="flex items-center gap-4 border border-white/[0.07] bg-ink/55 px-4 py-3.5">
      <span className="font-display text-[10px] font-semibold tracking-[0.15em] text-accent-soft">{index}</span>
      <span className="min-w-0 flex-1 text-xs font-medium text-white">{t(lang, titleKey)}</span>
      <span className="h-1 w-16 overflow-hidden rounded-full bg-white/[0.08] sm:w-24" aria-hidden="true">
        <span className="block h-full rounded-full bg-white/35" style={{ width }} />
      </span>
    </div>
  );
}
