import React, { useState, useEffect } from "react";
import {
  Search,
  Lightbulb,
  TrendingUp,
  Users,
  Shield,
  MessageSquare,
  Zap,
  HeartHandshake,
  Briefcase,
  Award,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Printer,
  Download,
  Moon,
  Sun,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Play,
  FileText,
  User,
  Building,
  Calendar,
  History,
  Trash2,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from "recharts";
import { DIMENSIONS, STATEMENTS, CATEGORIES } from "./data";
import { AssessmentResponse, AssessmentResult, SavedAssessment } from "./types";
import { calculateAssessment } from "./utils";

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Search,
  Lightbulb,
  TrendingUp,
  Users,
  Shield,
  MessageSquare,
  Zap,
  HeartHandshake,
  Briefcase,
  Award,
};

const LIKERT_OPTIONS = [
  { value: 1, label: "Strongly Disagree", color: "hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-300 border-slate-200 dark:border-slate-800 text-red-600 dark:text-red-400" },
  { value: 2, label: "Disagree", color: "hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:border-orange-300 border-slate-200 dark:border-slate-800 text-orange-600 dark:text-orange-400" },
  { value: 3, label: "Neutral", color: "hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400" },
  { value: 4, label: "Agree", color: "hover:bg-teal-50 dark:hover:bg-teal-950/20 hover:border-teal-300 border-slate-200 dark:border-slate-800 text-teal-600 dark:text-teal-400" },
  { value: 5, label: "Strongly Agree", color: "hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:border-emerald-300 border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400" },
];

export default function App() {
  // App Theme & Global State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem("assess_theme");
    return savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  const [step, setStep] = useState<"landing" | "questions" | "loading" | "results">("landing");
  const [userName, setUserName] = useState<string>(() => localStorage.getItem("assess_username") || "");
  const [organization, setOrganization] = useState<string>(() => localStorage.getItem("assess_org") || "");
  
  // Assessment Core States
  const [responses, setResponses] = useState<AssessmentResponse>(() => {
    const savedResponses = localStorage.getItem("assess_current_responses");
    return savedResponses ? JSON.parse(savedResponses) : {};
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(() => {
    const savedIndex = localStorage.getItem("assess_current_index");
    return savedIndex ? parseInt(savedIndex, 10) : 0;
  });

  // Results State
  const [result, setResult] = useState<AssessmentResult | null>(() => {
    const savedResult = localStorage.getItem("assess_latest_result");
    return savedResult ? JSON.parse(savedResult) : null;
  });

  // Saved History State
  const [savedAssessments, setSavedAssessments] = useState<SavedAssessment[]>(() => {
    const savedHistory = localStorage.getItem("assess_history");
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  // UI States
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);
  const [expandedDimensionId, setExpandedDimensionId] = useState<string | null>(null);
  const [activePlanTab, setActivePlanTab] = useState<"day30" | "day60" | "day90">("day30");
  const [loadingMessage, setLoadingMessage] = useState("Analyzing cognitive profile...");
  const [isAIPowered, setIsAIPowered] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "info" | "warning">("info");

  // Sync Dark Mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("assess_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("assess_theme", "light");
    }
  }, [isDarkMode]);

  // Sync state to localStorage on modification
  useEffect(() => {
    localStorage.setItem("assess_username", userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem("assess_org", organization);
  }, [organization]);

  useEffect(() => {
    localStorage.setItem("assess_current_responses", JSON.stringify(responses));
  }, [responses]);

  useEffect(() => {
    localStorage.setItem("assess_current_index", currentQuestionIndex.toString());
  }, [currentQuestionIndex]);

  // Toast auto-hide
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const triggerToast = (msg: string, type: "success" | "info" | "warning" = "info") => {
    setToastMessage(msg);
    setToastType(type);
  };

  // Reset or Start fresh handler
  const handleStartFresh = () => {
    setResponses({});
    setCurrentQuestionIndex(0);
    setStep("questions");
    localStorage.removeItem("assess_current_responses");
    localStorage.removeItem("assess_current_index");
    triggerToast("Starting a fresh assessment session.", "success");
  };

  // Resume handler
  const handleResume = () => {
    setStep("questions");
    triggerToast(`Resumed assessment at statement ${currentQuestionIndex + 1}.`, "info");
  };

  // Handles selecting an answer
  const handleAnswerSelect = (value: number) => {
    const currentQuestion = STATEMENTS[currentQuestionIndex];
    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));

    // Auto navigate to next question with a slight, smooth delay
    setTimeout(() => {
      if (currentQuestionIndex < STATEMENTS.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      }
    }, 200);
  };

  // Form submission & scoring logic trigger
  const handleSubmitAssessment = async () => {
    // Verify name and organization
    if (!userName.trim()) {
      triggerToast("Please provide your name before submitting the assessment.", "warning");
      setStep("landing");
      return;
    }

    setStep("loading");
    
    // Cycle loading messages for elite user feedback
    const messages = [
      "Synthesizing dimension scoring matrices...",
      "Generating strength and gap profiling analytics...",
      "Evaluating leadership indices and risk parameters...",
      "Formulating custom career recommendation vectors...",
      "Querying Gemini Accelerator Core for interpretation report...",
    ];
    let msgIdx = 0;
    const interval = setInterval(() => {
      if (msgIdx < messages.length) {
        setLoadingMessage(messages[msgIdx]);
        msgIdx++;
      }
    }, 1500);

    // 1. Calculate local base results (used as base scores and immediate fallback)
    const baseResult = calculateAssessment(responses, userName, organization);

    try {
      // 2. Query server-side Gemini API
      const response = await fetch("/api/assess/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: userName.trim(),
          organization: organization.trim(),
          overallScore: baseResult.overallScore,
          category: baseResult.category,
          dimensionScores: baseResult.dimensionScores,
          strengths: baseResult.strengths,
          developments: baseResult.developments,
        }),
      });

      clearInterval(interval);

      if (response.status === 412) {
        // Missing key fallback
        console.warn("Gemini API missing key fallback triggered.");
        setIsAIPowered(false);
        saveAndShowResult(baseResult);
        triggerToast("Report generated successfully using our Local Diagnostic Core.", "success");
      } else if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      } else {
        const aiData = await response.json();
        
        // Merge AI-generated insights into the result object
        const fullResult: AssessmentResult = {
          ...baseResult,
          aiInterpretation: aiData.aiInterpretation,
          careerRecommendations: aiData.careerRecommendations,
          improvementPlan: aiData.improvementPlan,
        };

        setIsAIPowered(true);
        saveAndShowResult(fullResult);
        triggerToast("Elite AI-Powered report generated successfully!", "success");
      }
    } catch (error) {
      clearInterval(interval);
      console.error("Failed to query Gemini API. Using fallback.", error);
      setIsAIPowered(false);
      saveAndShowResult(baseResult);
      triggerToast("Report compiled. Using high-fidelity local psychometric engine.", "info");
    }
  };

  const saveAndShowResult = (finalResult: AssessmentResult) => {
    setResult(finalResult);
    localStorage.setItem("assess_latest_result", JSON.stringify(finalResult));

    // Save to device history log
    const newHistoryItem: SavedAssessment = {
      id: finalResult.id,
      userName: finalResult.userName,
      organization: finalResult.organization,
      date: finalResult.date,
      overallScore: finalResult.overallScore,
      category: finalResult.category,
      result: finalResult,
    };

    const updatedHistory = [newHistoryItem, ...savedAssessments.filter((item) => item.id !== finalResult.id)];
    setSavedAssessments(updatedHistory);
    localStorage.setItem("assess_history", JSON.stringify(updatedHistory));

    setStep("results");
  };

  const handleSelectHistoryItem = (historyItem: SavedAssessment) => {
    setResult(historyItem.result);
    setUserName(historyItem.userName);
    setOrganization(historyItem.organization);
    // Reload responses if they want to review answers
    setResponses(historyItem.result.responses);
    setStep("results");
    setShowHistorySidebar(false);
    triggerToast(`Viewing saved report for ${historyItem.userName} (${historyItem.overallScore}/100)`, "info");
  };

  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedAssessments.filter((item) => item.id !== id);
    setSavedAssessments(updated);
    localStorage.setItem("assess_history", JSON.stringify(updated));
    triggerToast("Report deleted from local history.", "info");
  };

  const handleClearAllHistory = () => {
    if (window.confirm("Are you sure you want to clear your entire local assessment history on this device?")) {
      setSavedAssessments([]);
      localStorage.removeItem("assess_history");
      triggerToast("History cleared successfully.", "success");
    }
  };

  // Helper to parse custom markdown (bullet points, bold text, headers)
  function renderMarkdown(text: string) {
    if (!text) return null;
    return text.split("\n").map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("###")) {
        return (
          <h4 key={idx} className="text-lg font-bold text-slate-900 dark:text-white mt-5 mb-2 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-1">
            <span className="w-1.5 h-4 bg-teal-500 rounded-sm inline-block"></span>
            {trimmed.replace("###", "").trim()}
          </h4>
        );
      }
      if (trimmed.startsWith("####")) {
        return (
          <h5 key={idx} className="text-sm font-semibold text-teal-600 dark:text-teal-400 mt-4 mb-2 uppercase tracking-wider">
            {trimmed.replace("####", "").trim()}
          </h5>
        );
      }
      if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        const cleanLine = trimmed.replace(/^[-*]\s*/, "");
        return (
          <li key={idx} className="ml-5 list-disc text-slate-700 dark:text-slate-300 my-1.5 text-sm leading-relaxed">
            {parseInlineFormatting(cleanLine)}
          </li>
        );
      }
      if (trimmed === "") {
        return <div key={idx} className="h-3" />;
      }
      return (
        <p key={idx} className="text-slate-700 dark:text-slate-300 my-2 leading-relaxed text-sm">
          {parseInlineFormatting(trimmed)}
        </p>
      );
    });
  }

  function parseInlineFormatting(text: string) {
    const parts = text.split(/(\*\*.*?\*\*)/);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-bold text-slate-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  }

  // Get color configurations for score categories
  const getCategoryColor = (catName: string) => {
    switch (catName) {
      case "Startup Founder Ready":
        return { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800" };
      case "High Entrepreneurial Potential":
        return { text: "text-teal-600 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-950/30", border: "border-teal-200 dark:border-teal-800" };
      case "Emerging Entrepreneur":
        return { text: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800" };
      case "Developing Potential":
        return { text: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-800" };
      default:
        return { text: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800" };
    }
  };

  // Radar chart formatted data
  const radarData = result?.dimensionScores.map((ds) => ({
    subject: ds.dimensionName,
    A: ds.score,
    fullMark: 100,
  })) || [];

  const answeredQuestionsCount = Object.keys(responses).length;
  const isAssessmentIncomplete = answeredQuestionsCount > 0 && answeredQuestionsCount < STATEMENTS.length;

  return (
    <div id="app_root" className="min-h-screen font-sans bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200 flex flex-col selection:bg-teal-100 dark:selection:bg-teal-900/40">
      
      {/* Toast alert */}
      {toastMessage && (
        <div id="toast_container" className="fixed bottom-6 right-6 z-50 animate-bounce shadow-xl border p-4 rounded-xl flex items-center gap-3 backdrop-blur-md alert-toast bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-800 max-w-sm">
          {toastType === "success" && <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />}
          {toastType === "info" && <Sparkles className="text-teal-500 shrink-0" size={20} />}
          {toastType === "warning" && <AlertTriangle className="text-orange-500 shrink-0" size={20} />}
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{toastMessage}</p>
        </div>
      )}

      {/* Global Header */}
      <header id="app_header" className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center sticky top-0 z-40 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-600 rounded flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-1.5">
                Founder<span className="text-teal-600 dark:text-teal-400">Ready</span>
                <span className="text-xs font-normal text-slate-400 dark:text-slate-500 ml-2 font-mono">Index</span>
              </h1>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
                DPU Unitech Foundation & Accelerator Cell
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="history_sidebar_toggle"
              onClick={() => setShowHistorySidebar(true)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-teal-500 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors cursor-pointer relative"
              title="View saved reports"
            >
              <History size={18} />
              {savedAssessments.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-500 ring-2 ring-white dark:ring-slate-950"></span>
              )}
            </button>

            <button
              id="theme_toggle_btn"
              onClick={() => setIsDarkMode((prev) => !prev)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-teal-500 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
              title={isDarkMode ? "Light mode" : "Dark mode"}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center items-center">
        
        {/* LANDING SCREEN */}
        {step === "landing" && (
          <div id="landing_screen" className="w-full max-w-4xl py-6 animate-fade-in flex flex-col gap-8">
            
            {/* Greeting & Quick resume banner */}
            {isAssessmentIncomplete && (
              <div id="resume_assessment_banner" className="bg-teal-50/80 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/60 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Unfinished Assessment Detected</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">You completed {answeredQuestionsCount} of {STATEMENTS.length} statements on your last visit.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <button
                    id="resume_assessment_btn"
                    onClick={handleResume}
                    className="flex-1 sm:flex-none text-xs font-semibold px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-700 text-white rounded-md transition-colors cursor-pointer"
                  >
                    Resume Session
                  </button>
                  <button
                    id="start_fresh_btn"
                    onClick={handleStartFresh}
                    className="flex-1 sm:flex-none text-xs font-semibold px-4 py-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-md transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                  >
                    Start Fresh
                  </button>
                </div>
              </div>
            )}

            {/* Hero Area */}
            <div className="text-center flex flex-col items-center gap-4">
              <span className="px-3 py-1 text-[10px] uppercase font-bold tracking-widest text-teal-600 dark:text-teal-400 bg-teal-500/10 rounded-full border border-teal-500/20">
                Foundational Diagnostic Toolkit
              </span>
              <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-slate-900 dark:text-white max-w-2xl leading-tight">
                Entrepreneurial Potential <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-500">Readiness Index</span>
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
                A highly comprehensive, data-driven assessment evaluating the core psychometric qualities, leadership mindset, and commercial execution readiness required to build scalable startup ventures. Suitable for incubators, accelerators, and innovators.
              </p>
            </div>

            {/* Quick Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900/60 p-5 rounded-xl border border-slate-200 dark:border-slate-850 flex items-start gap-4 shadow-sm">
                <div className="p-3 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 rounded-xl">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">10 Critical Dimensions</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">Evaluates Risk-Taking, Problem Solving, Communication, Acumen, Resilience, and more.</p>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900/60 p-5 rounded-xl border border-slate-200 dark:border-slate-850 flex items-start gap-4 shadow-sm">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Gemini AI Synthesis</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">Generates customized, 300-500 words psychometric reports, career paths, and improvement roadmaps.</p>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900/60 p-5 rounded-xl border border-slate-200 dark:border-slate-850 flex items-start gap-4 shadow-sm">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
                  <Printer size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Exportable PDF Report</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">Generate dynamic radar graphs and download print-ready dossiers directly from your browser.</p>
                </div>
              </div>
            </div>

            {/* Registration Card */}
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-lg mx-auto w-full flex flex-col gap-6">
              <div className="flex flex-col gap-1.5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">Begin Your Assessment</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Please provide your candidate registration credentials below to initialize the index logging.</p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="user_name_input" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <User size={14} className="text-slate-400" />
                    Full Candidate Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="user_name_input"
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter full name (e.g. Jane Doe)"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="user_org_input" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Building size={14} className="text-slate-400" />
                    Organization / University / Program
                  </label>
                  <input
                    id="user_org_input"
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. DPU Unitech Accelerator Cohort II"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <button
                id="landing_start_assessment_btn"
                onClick={() => {
                  if (!userName.trim()) {
                    triggerToast("Full Candidate Name is required to initialize the report.", "warning");
                    return;
                  }
                  setStep("questions");
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-semibold py-2.5 rounded-md hover:shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
              >
                <Play size={15} fill="currentColor" />
                Initialize Evaluation
              </button>
            </div>

            {/* Dimensions Preview Section */}
            <div className="flex flex-col gap-4">
              <h3 className="text-center text-sm font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase font-display">The 10 Evaluation Pillars</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {DIMENSIONS.map((d) => {
                  const IconComp = ICON_MAP[d.iconName] || Search;
                  return (
                    <div key={d.id} className="bg-white dark:bg-slate-900/65 p-4 rounded-xl border border-slate-200 dark:border-slate-850 flex flex-col items-center text-center gap-2.5 shadow-sm transition-all hover:shadow-md">
                      <div className="p-2.5 bg-slate-50 dark:bg-slate-950 text-teal-600 dark:text-teal-400 rounded-lg shrink-0 border border-slate-100 dark:border-slate-900">
                        <IconComp size={16} />
                      </div>
                      <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-snug">{d.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* QUESTIONS SCREEN */}
        {step === "questions" && (
          <div id="questions_screen" className="w-full max-w-3xl py-4 animate-fade-in flex flex-col gap-6 text-slate-800 dark:text-slate-100">
            
            {/* Header progress info */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-mono">Statement {currentQuestionIndex + 1} of {STATEMENTS.length}</span>
                <span className="text-teal-600 dark:text-teal-400 font-bold font-mono">{Math.round(((currentQuestionIndex + 1) / STATEMENTS.length) * 100)}% Complete</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-teal-600 transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / STATEMENTS.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Question Card */}
            <div id="active_question_card" className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              
              {/* Dimension Indicator Header */}
              {(() => {
                const currentQuestion = STATEMENTS[currentQuestionIndex];
                const currentDimension = DIMENSIONS.find((d) => d.id === currentQuestion.dimensionId);
                const IconComp = currentDimension ? ICON_MAP[currentDimension.iconName] : Search;

                return (
                  <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-lg">
                        <IconComp size={18} />
                      </div>
                      <div>
                        <span className="text-[10px] tracking-widest font-bold uppercase font-display text-teal-600 dark:text-teal-400">Pillar {DIMENSIONS.findIndex(d => d.id === currentQuestion.dimensionId) + 1} of 10</span>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">{currentDimension?.name}</h4>
                      </div>
                    </div>
                    <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-md font-mono font-bold shrink-0">
                      Q{currentQuestionIndex + 1}
                    </span>
                  </div>
                );
              })()}

              {/* Statement text display */}
              <div className="p-8 sm:p-10 flex flex-col gap-6 text-center">
                <div className="min-h-20 flex items-center justify-center">
                  <h3 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-slate-900 dark:text-white leading-relaxed max-w-2xl">
                    "{STATEMENTS[currentQuestionIndex].text}"
                  </h3>
                </div>

                <p className="text-xs text-slate-400 dark:text-slate-500 italic">Select your alignment with this statement using the scale below:</p>
              </div>

              {/* Likert Scale Selectors */}
              <div className="border-t border-slate-200 dark:border-slate-800 p-6 bg-slate-50/50 dark:bg-slate-950/20">
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {LIKERT_OPTIONS.map((opt) => {
                    const isSelected = responses[STATEMENTS[currentQuestionIndex].id] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleAnswerSelect(opt.value)}
                        className={`p-4 rounded-xl border text-center transition-all duration-150 cursor-pointer flex flex-col items-center justify-center gap-2 ${opt.color} ${
                          isSelected
                            ? "bg-slate-900 border-slate-900 text-white dark:bg-teal-500 dark:border-teal-500 dark:text-slate-950 shadow-md scale-102 ring-2 ring-teal-500/20"
                            : "bg-white dark:bg-slate-900 hover:shadow-sm"
                        }`}
                      >
                        <span className={`text-lg font-black font-mono ${isSelected ? "text-inherit" : "text-slate-700 dark:text-slate-300"}`}>
                          {opt.value}
                        </span>
                        <span className="text-[11px] font-semibold leading-tight">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Card Controls */}
              <div className="px-6 py-4 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
                <button
                  id="prev_question_btn"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                  className="px-4 py-2 text-xs font-semibold rounded-md border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950 disabled:opacity-50 disabled:pointer-events-none transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ChevronLeft size={14} />
                  Previous
                </button>

                <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 font-mono">
                  {answeredQuestionsCount} of {STATEMENTS.length} Answered
                </div>

                {currentQuestionIndex < STATEMENTS.length - 1 ? (
                  <button
                    id="next_question_btn"
                    disabled={!responses[STATEMENTS[currentQuestionIndex].id]}
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                    className="px-4 py-2 text-xs font-semibold rounded-md bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    Next
                    <ChevronRight size={14} />
                  </button>
                ) : (
                  <button
                    id="submit_assessment_btn"
                    disabled={answeredQuestionsCount < STATEMENTS.length}
                    onClick={handleSubmitAssessment}
                    className="px-5 py-2 text-xs font-bold rounded-md bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 disabled:pointer-events-none active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    Submit & Analyze
                    <Sparkles size={14} />
                  </button>
                )}
              </div>

            </div>

            {/* Quick Warning if incomplete */}
            {answeredQuestionsCount < STATEMENTS.length && (
              <div className="text-center p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[11px] text-amber-600 dark:text-amber-400 font-medium animate-pulse">
                ⚠️ You must answer all {STATEMENTS.length} statements before scoring calculations can be completed. ({STATEMENTS.length - answeredQuestionsCount} remaining)
              </div>
            )}

            {/* Statement Grid Jumper Index */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl flex flex-col gap-3 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">Evaluation Statement Index</span>
              <div className="grid grid-cols-10 gap-1.5">
                {STATEMENTS.map((st, idx) => {
                  const isAnswered = !!responses[st.id];
                  const isCurrent = currentQuestionIndex === idx;

                  return (
                    <button
                      key={st.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`h-8 rounded-md text-[10px] font-bold font-mono transition-all duration-150 cursor-pointer flex items-center justify-center ${
                        isCurrent
                          ? "ring-2 ring-teal-550 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900"
                          : isAnswered
                          ? "bg-teal-600 text-white dark:bg-teal-500 dark:text-slate-950 hover:bg-teal-700 dark:hover:bg-teal-400"
                          : "bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 border border-transparent"
                      }`}
                      title={`Statement ${idx + 1}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cancel/Reset Banner */}
            <div className="flex justify-between items-center text-xs px-2">
              <button
                id="reset_assessment_btn"
                onClick={() => {
                  if (window.confirm("Are you sure you want to completely reset this assessment? All current answers will be lost.")) {
                    handleStartFresh();
                    setStep("landing");
                  }
                }}
                className="text-red-500 dark:text-red-400 hover:underline font-semibold cursor-pointer flex items-center gap-1"
              >
                <Trash2 size={13} />
                Reset Evaluation
              </button>
              <button
                id="exit_to_landing"
                onClick={() => setStep("landing")}
                className="text-slate-400 dark:text-slate-500 hover:underline font-medium cursor-pointer"
              >
                Back to Welcome Screen
              </button>
            </div>

          </div>
        )}

        {/* LOADING PROGRESS SCREEN */}
        {step === "loading" && (
          <div id="loading_screen" className="py-20 flex flex-col items-center justify-center gap-6 animate-pulse max-w-md text-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-slate-200 dark:border-slate-900 border-t-teal-500 animate-spin"></div>
              <Sparkles className="text-teal-400 absolute inset-0 m-auto animate-bounce" size={24} />
            </div>
            
            <div className="flex flex-col gap-2 mt-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">Computing Entrepreneurial Index</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono transition-all duration-300">{loadingMessage}</p>
            </div>
          </div>
        )}

        {/* RESULTS SCREEN */}
        {step === "results" && result && (
          <div id="results_screen" className="w-full py-2 animate-fade-in flex flex-col gap-8 print-full-width text-slate-800 dark:text-slate-100">
            
            {/* Header controls hub */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 no-print">
              <div>
                <button
                  id="back_to_evaluation_btn"
                  onClick={() => setStep("landing")}
                  className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-teal-500 dark:hover:text-teal-400 mb-2 flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft size={14} />
                  Back to Hub
                </button>
                <h3 className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-white tracking-tight">Your Evaluation Report</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">Dossier ID: {result.id} • Compiled {result.date}</p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  id="print_report_btn"
                  onClick={() => window.print()}
                  className="flex-1 sm:flex-none px-4 py-2 bg-slate-900 dark:bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold cursor-pointer border border-slate-800 flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Printer size={15} />
                  Print / Save PDF
                </button>
                <button
                  id="results_restart_fresh_btn"
                  onClick={handleStartFresh}
                  className="flex-1 sm:flex-none px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-xs font-bold cursor-pointer flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <RefreshCw size={15} />
                  New Assessment
                </button>
              </div>
            </div>

            {/* Print Header (Only visible on paper prints / PDF renders) */}
            <div className="hidden print:flex flex-col gap-4 border-b border-slate-300 pb-6 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 font-display">ENTREPRENEURIAL READINESS INDEX REPORT</h1>
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-mono">DPU Unitech Foundation & Accelerator Cell</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900">Dossier ID: {result.id}</p>
                  <p className="text-xs text-slate-500">Date: {result.date}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Candidate</span>
                  <p className="text-sm font-bold text-slate-800">{result.userName}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Organization / Cohort</span>
                  <p className="text-sm font-bold text-slate-800">{result.organization || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* HERO OVERALL SCORE CARD SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print-card">
              
              {/* Score Display Card */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center gap-4 shadow-sm lg:col-span-1">
                <span className="text-[10px] tracking-widest uppercase font-bold text-slate-400 dark:text-slate-500 font-mono">INDEX SCORE</span>
                
                {/* Visual Ring */}
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" className="stroke-slate-100 dark:stroke-slate-800/80 fill-none" strokeWidth="10" />
                    <circle 
                      cx="60" 
                      cy="60" 
                      r="50" 
                      className="stroke-teal-500 fill-none transition-all duration-1000 ease-out" 
                      strokeWidth="10" 
                      strokeDasharray={2 * Math.PI * 50} 
                      strokeDashoffset={2 * Math.PI * 50 * (1 - result.overallScore / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-4xl font-black font-display tracking-tight text-slate-900 dark:text-white">{result.overallScore}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-mono uppercase font-bold">out of 100</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 mt-2">
                  <span className={`text-sm font-bold tracking-tight px-3 py-1.5 rounded-full border ${getCategoryColor(result.category).text} ${getCategoryColor(result.category).bg} ${getCategoryColor(result.category).border}`}>
                    {result.category}
                  </span>
                </div>
              </div>

              {/* Score Category Description box */}
              <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-center gap-4 shadow-sm lg:col-span-2">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-teal-500 rounded-sm"></span>
                  <h4 className="text-sm tracking-widest uppercase font-bold text-slate-400 dark:text-slate-500 font-mono">Category Profile Breakdown</h4>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold font-display text-slate-900 dark:text-white leading-snug">
                  What "{result.category}" means for your entrepreneurial journey:
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {result.categoryDescription}
                </p>
                
                {/* Candidate details row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-800/60 pt-4 mt-2 no-print">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-bold uppercase">Candidate</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{result.userName}</span>
                  </div>
                  {result.organization && (
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-bold uppercase">Organization</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{result.organization}</span>
                    </div>
                  )}
                  <div className="flex flex-col col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-bold uppercase">Dossier Date</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 font-mono">
                      <Calendar size={11} />
                      {result.date}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* VISUAL ANALYTICS AND SCORE DATA GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 print-card">
              
              {/* Radar Chart Container */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4 lg:col-span-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">10-Dimension Cognitive Radar Mapping</h4>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-850 text-slate-550 dark:text-slate-400 px-2 py-1 rounded-md font-mono font-bold">SPIDER PLOT</span>
                </div>
                
                <div className="w-full h-80 sm:h-96 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                      <PolarGrid stroke={isDarkMode ? "#334155" : "#e2e8f0"} />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fill: isDarkMode ? "#94a3b8" : "#475569", fontSize: 9, fontWeight: 600 }}
                      />
                      <PolarRadiusAxis 
                        angle={30} 
                        domain={[0, 100]} 
                        tick={{ fill: isDarkMode ? "#64748b" : "#94a3b8", fontSize: 9 }}
                      />
                      <Radar
                        name="Entrepreneurial Index"
                        dataKey="A"
                        stroke="#0d9488"
                        fill="#0d9488"
                        fillOpacity={0.35}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Scores List Sidebar Grid */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4 lg:col-span-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">Competency Scoreboard</h4>
                
                <div className="flex flex-col gap-3 overflow-y-auto max-h-[360px] pr-1">
                  {result.dimensionScores.map((ds, idx) => {
                    const dimensionDef = DIMENSIONS.find(d => d.id === ds.dimensionId);
                    const IconComp = dimensionDef ? ICON_MAP[dimensionDef.iconName] : Search;

                    return (
                      <div key={ds.dimensionId} className="flex flex-col gap-1.5 border-b border-slate-50 dark:border-slate-800/80 last:border-0 pb-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <IconComp size={14} className="text-teal-600 dark:text-teal-400" />
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{ds.dimensionName}</span>
                          </div>
                          <span className="font-bold font-mono text-slate-900 dark:text-white">{ds.score}/100</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-teal-555 rounded-full"
                            style={{ width: `${ds.score}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* STRENGTHS AND DEVELOPMENT AREAS BEN-TO BLOCK */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print-card">
              
              {/* Top 3 Strengths */}
              <div className="bg-emerald-500/5 dark:bg-emerald-500/2 border border-emerald-500/10 dark:border-emerald-500/10 p-6 rounded-xl shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={18} />
                  <h4 className="text-sm font-bold uppercase tracking-wider font-display">Top 3 Primary Strengths</h4>
                </div>

                <div className="flex flex-col gap-3">
                  {result.strengths.map((s, idx) => {
                    const dim = DIMENSIONS.find(d => d.id === s.dimensionId);
                    return (
                      <div key={s.dimensionId} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{idx + 1}. {s.name}</span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{dim?.description}</span>
                        </div>
                        <span className="text-xs font-black font-mono px-2 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 rounded-md shrink-0">
                          {s.score}/100
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom 3 Developments */}
              <div className="bg-orange-500/5 dark:bg-orange-500/2 border border-orange-500/10 dark:border-orange-500/10 p-6 rounded-xl shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                  <AlertTriangle size={18} />
                  <h4 className="text-sm font-bold uppercase tracking-wider font-display">Core Developmental Areas</h4>
                </div>

                <div className="flex flex-col gap-3">
                  {result.developments.map((d, idx) => {
                    const dim = DIMENSIONS.find(dim => dim.id === d.dimensionId);
                    return (
                      <div key={d.dimensionId} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{idx + 1}. {d.name}</span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{dim?.description}</span>
                        </div>
                        <span className="text-xs font-black font-mono px-2 py-1 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900 rounded-md shrink-0">
                          {d.score}/100
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* AI GENERATED NARRATIVE INTERPRETATION CANVAS */}
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-6 print-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-teal-600 dark:text-teal-400" size={18} />
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white font-display">Deep AI Psychometric Narrative</h4>
                </div>
                
                {/* AI Badge indicator */}
                <div className="flex items-center gap-1.5 self-start sm:self-center">
                  <span className={`h-2 w-2 rounded-full ${isAIPowered ? "bg-emerald-500 animate-ping" : "bg-teal-500 animate-ping"}`}></span>
                  <span className="text-[9px] uppercase font-bold tracking-widest font-mono text-slate-500 dark:text-slate-400">
                    {isAIPowered ? "● Live Gemini Synthesis" : "● Local Expert Logic Core"}
                  </span>
                </div>
              </div>

              {/* Rich Narrative Output Block */}
              <div className="prose dark:prose-invert max-w-none">
                {renderMarkdown(result.aiInterpretation)}
              </div>
            </div>

            {/* CAREER RECOMMENDATIONS */}
            <div className="flex flex-col gap-4 print-card">
              <div className="flex items-center gap-2">
                <Briefcase className="text-teal-600 dark:text-teal-400" size={18} />
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-display">Targeted Career Recommendations</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {result.careerRecommendations.map((recText, idx) => {
                  const parts = recText.split(":");
                  const title = parts[0] || "Recommendation";
                  const justification = parts.slice(1).join(":") || "";

                  return (
                    <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-teal-600 dark:text-teal-400 shrink-0 bg-teal-500/10 px-2 py-0.5 rounded">0{idx + 1}</span>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white font-display leading-tight">{title}</h4>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">{justification.trim()}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 90-DAY IMPROVEMENT ROADMAP */}
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-6 print-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div className="flex items-center gap-2">
                  <Zap className="text-teal-600 dark:text-teal-400" size={18} />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">Actionable Skill Optimization Roadmap</h4>
                </div>

                {/* Timeline tabs control */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-lg no-print">
                  {(["day30", "day60", "day90"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActivePlanTab(tab)}
                      className={`px-3 py-1 text-xs font-bold transition-all cursor-pointer rounded-md ${
                        activePlanTab === tab
                          ? "bg-slate-900 text-white dark:bg-slate-800 dark:text-white"
                          : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400"
                      }`}
                    >
                      {tab === "day30" ? "30 Days" : tab === "day60" ? "60 Days" : "90 Days"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Tab Timeline View */}
              <div className="flex flex-col gap-4">
                {/* Print layout renders all blocks consecutively */}
                <div className="hidden print:grid grid-cols-3 gap-6">
                  {(["day30", "day60", "day90"] as const).map((tab) => (
                    <div key={tab} className="flex flex-col gap-3 border-r border-slate-100 pr-4 last:border-0">
                      <h4 className="text-xs font-black uppercase text-teal-600 tracking-wider">
                        {tab === "day30" ? "30-Day Sprint" : tab === "day60" ? "60-Day Sprint" : "90-Day Sprint"}
                      </h4>
                      <ul className="flex flex-col gap-2">
                        {result.improvementPlan[tab].map((item, idx) => (
                          <li key={idx} className="text-xs text-slate-700 leading-relaxed list-decimal ml-4">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Interactive slider view (Screen Only) */}
                <div className="print:hidden flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] tracking-widest uppercase font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-1 rounded">
                      {activePlanTab === "day30" ? "Phase I Sprint: Days 1 to 30" : activePlanTab === "day60" ? "Phase II Sprint: Days 31 to 60" : "Phase III Sprint: Days 61 to 90"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {result.improvementPlan[activePlanTab].map((milestone, idx) => (
                      <div key={idx} className="bg-slate-50 dark:bg-slate-950/60 p-5 rounded-xl border border-slate-100 dark:border-slate-800/60 flex items-start gap-3.5">
                        <span className="w-6 h-6 rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium mt-0.5">{milestone}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* DETAILED ANSWER COMPETE ACCORDION BREAKDOWN */}
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4 print-card print-page-break">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="text-teal-600 dark:text-teal-400" size={18} />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">Evaluation Statement Audit Log</h4>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500">AUDIT HISTORY</span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Expand any evaluation pillar below to review your individual response log out of the 5-point Likert Scale alignment metrics:
              </p>

              <div className="flex flex-col gap-2 mt-2">
                {DIMENSIONS.map((dim, idx) => {
                  const ds = result.dimensionScores.find(d => d.dimensionId === dim.id);
                  const isExpanded = expandedDimensionId === dim.id;
                  const IconComp = ICON_MAP[dim.iconName] || Search;
                  const dimStatements = STATEMENTS.filter(s => s.dimensionId === dim.id);

                  return (
                    <div key={dim.id} className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/20">
                      <button
                        onClick={() => setExpandedDimensionId(isExpanded ? null : dim.id)}
                        className="w-full px-5 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-950 text-left cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-teal-600 dark:text-teal-400 rounded-lg">
                            <IconComp size={15} />
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Pillar 0{idx + 1}</span>
                            <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 leading-tight">{dim.name}</h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs font-black font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-md">
                            {ds?.score || 0}/100
                          </span>
                          <span className="text-slate-400">{isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-5 pb-4 border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-900 flex flex-col gap-3 pt-3">
                          {dimStatements.map((st, sIdx) => {
                            const answerValue = responses[st.id] || 0;
                            const answerLabel = LIKERT_OPTIONS.find(o => o.value === answerValue)?.label || "No Answer";

                            return (
                              <div key={st.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-50 dark:border-slate-900 last:border-0 pb-2.5 last:pb-0">
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal font-medium pr-4">
                                  <span className="font-mono text-[10px] text-slate-400">Statement 0{sIdx + 1}:</span> "{st.text}"
                                </p>
                                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                    {answerLabel}
                                  </span>
                                  <span className="text-xs font-black font-mono bg-teal-500/10 text-teal-600 dark:text-teal-400 px-2 py-0.5 rounded">
                                    {answerValue} pts
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Print Footer Notice */}
            <div className="hidden print:block text-center text-[10px] text-slate-400 border-t border-slate-200 pt-6 mt-10">
              <p>This is a certified psychometric diagnostic assessment generated by the DPU Unitech Accelerator Platform.</p>
              <p className="mt-1">All rights reserved © 2026 DPU Unitech Foundation.</p>
            </div>

            {/* Back bottom row controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 no-print mt-4 border-t border-slate-200/60 dark:border-slate-900/60 pt-6">
              <button
                id="reset_and_start_fresh_footer"
                onClick={() => {
                  if (window.confirm("Are you sure you want to completely clear these results and start a new evaluation?")) {
                    handleStartFresh();
                  }
                }}
                className="text-xs font-semibold text-red-500 dark:text-red-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <Trash2 size={13} />
                Delete Current Results & Start Fresh
              </button>
              
              <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 leading-normal">
                <span>Evaluated locally in browser</span>
                <span>•</span>
                <span>DPU Unitech cell</span>
              </p>
            </div>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200/60 dark:border-slate-900/60 py-6 text-center text-[11px] text-slate-400 dark:text-slate-500 tracking-wide font-medium bg-white dark:bg-slate-950/40 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 DPU Unitech Foundation & Accelerator Cell. Designed for Startup Founder Ecosystems.</p>
          <div className="flex items-center gap-4">
            <a href="https://ai.studio/build" target="_blank" referrerPolicy="no-referrer" className="hover:text-teal-500 hover:underline transition-all flex items-center gap-1 cursor-pointer">
              <span>AI Studio</span>
              <ExternalLink size={11} />
            </a>
          </div>
        </div>
      </footer>

      {/* HISTORIC LOGS SIDEBAR */}
      {showHistorySidebar && (
        <div id="history_sidebar_overlay" className="fixed inset-0 bg-slate-950/40 dark:bg-slate-950/60 z-50 backdrop-blur-xs flex justify-end animate-fade-in no-print">
          <div 
            id="history_sidebar" 
            className="w-full max-w-sm h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6 shadow-2xl flex flex-col gap-6"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div className="flex items-center gap-2">
                <History className="text-teal-600 dark:text-teal-400" size={18} />
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white font-display">Evaluation Dossier History</h4>
              </div>
              <button
                id="close_history_sidebar"
                onClick={() => setShowHistorySidebar(false)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold cursor-pointer"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
              Recall, review, or delete previous psychometric assessments stored securely on this browser profile:
            </p>

            <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
              {savedAssessments.length === 0 ? (
                <div className="text-center py-10 flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500">
                  <FileText size={28} className="stroke-1" />
                  <span className="text-xs font-semibold">No Saved Assessments Found</span>
                  <span className="text-[10px]">Complete your first assessment to record a dossier.</span>
                </div>
              ) : (
                savedAssessments.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectHistoryItem(item)}
                    className="p-3 bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-900/60 transition-all cursor-pointer flex justify-between items-center gap-4 group"
                  >
                    <div className="flex flex-col gap-0.5 truncate">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400 truncate">
                        {item.userName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono truncate">{item.organization || "Private Candidacy"}</span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                        <Calendar size={9} />
                        {item.date}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-black font-mono text-slate-900 dark:text-white">{item.overallScore}</span>
                        <span className="text-[9px] uppercase font-bold text-teal-600 dark:text-teal-400 font-mono leading-none">PTS</span>
                      </div>
                      
                      <button
                        id={`delete_history_item_${item.id}`}
                        onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                        className="p-1.5 text-slate-300 hover:text-red-500 dark:text-slate-700 dark:hover:text-red-400 rounded transition-colors cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {savedAssessments.length > 0 && (
              <button
                id="clear_all_history_btn"
                onClick={handleClearAllHistory}
                className="w-full text-center py-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:text-red-400 text-xs font-bold rounded-lg transition-colors cursor-pointer mt-auto"
              >
                Clear Entire History Log
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
