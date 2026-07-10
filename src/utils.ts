import { DIMENSIONS, CATEGORIES, STATEMENTS } from "./data";
import { AssessmentResponse, AssessmentResult, DimensionScore, ImprovementMilestone } from "./types";

/**
 * Generates a highly realistic, personalized rule-based interpretation
 * to serve as an immediate local fallback if the Gemini API is offline or unconfigured.
 */
export function generateLocalInterpretation(
  userName: string,
  overallScore: number,
  category: string,
  strengths: { name: string; score: number; dimensionId: string }[],
  developments: { name: string; score: number; dimensionId: string }[]
): { aiInterpretation: string; careerRecommendations: string[]; improvementPlan: ImprovementMilestone } {
  const topStrength = strengths[0]?.name || "Problem Solving";
  const secondStrength = strengths[1]?.name || "Innovation & Creativity";
  const mainWeakness = developments[0]?.name || "Business Acumen";
  const secondWeakness = developments[1]?.name || "Customer Orientation";

  // Construct a sophisticated profile title based on top strengths and main weaknesses
  let profileTitle = "The Dynamic Innovator";
  if (topStrength.includes("Problem") && mainWeakness.includes("Business")) {
    profileTitle = "The Visionary Architect (Strong Analytical Mind, Unrefined Business Model)";
  } else if (topStrength.includes("Resilience") && mainWeakness.includes("Risk")) {
    profileTitle = "The Resilient Operator (Exceptional Grit, Caution in Calculated Risk-Taking)";
  } else if (topStrength.includes("Execution") && mainWeakness.includes("Innovation")) {
    profileTitle = "The Disciplined Catalyst (Outstanding Executor, Developing Original Ideation)";
  } else if (topStrength.includes("Leadership") && mainWeakness.includes("Communication")) {
    profileTitle = "The Empathetic Strategist (Natural Visionary Leader, Developing Active Pitching)";
  } else if (topStrength.includes("Customer") && mainWeakness.includes("Business")) {
    profileTitle = "The User-Centric Advocate (Exceptional Empathy, Developing Revenue Structures)";
  } else {
    profileTitle = `The Balanced Catalyst (Strengths in ${topStrength} & ${secondStrength})`;
  }

  // Generate a multi-paragraph, professional 300-500 words summary
  const summaryMarkdown = `### Professional Profile: **${profileTitle}**

Dear **${userName}**, your overall entrepreneurial potential score of **${overallScore}/100** places you in the **${category}** category. This indicates a highly distinct psychological and operational profile when starting and scaling new ventures. 

#### 🚀 Core Interaction of Traits
Your primary strengths lie in **${topStrength}** and **${secondStrength}**. This suggests that you possess a strong capacity for driving initiatives forward. Specifically, your mastery of ${topStrength} allows you to excel in situations that require rapid pivoting, creative breakthroughs, or persistent efforts under fire. When things become complex, you naturally rely on these core pillars to guide team focus.

However, your venture-building readiness is currently moderated by developmental areas in **${mainWeakness}** and **${secondWeakness}**. There is a critical interaction here: while your high aptitude in ${topStrength} enables you to build incredible momentum, an unrefined foundation in ${mainWeakness} could result in strategic blind spots, such as building beautiful products that lack clear commercial monetization schemes or failing to validate the market size early enough. 

#### 💡 Strategic Guidance for Co-Founding and Leadership
Given this balance, you are exceptionally suited for **high-impact leadership roles**. If you choose to launch a venture immediately, it is highly recommended that you pair yourself with a co-founder whose core strengths directly complement your development areas—specifically someone with deep expertise in **${mainWeakness}**. This will form a balanced founding team, combining your brilliant capabilities in ${topStrength} with their structured operational or market-driven execution. Within an incubator or accelerator program, focus heavily on structured mentoring around ${mainWeakness} to systematically de-risk your early-stage hypotheses.

#### 📈 Long-term Mindset Evolution
In the long term, transition from viewing ${mainWeakness} as an administrative task to treating it as a core strategic lever. By dedicating structured study and weekly sprints to master these elements, you will transition from an emerging innovator to a completely startup-ready, self-sufficient founder who can confidently stand in front of venture capitalists and customers alike.`;

  // Tailor career recommendations based on strengths and weaknesses
  const allCareerOptions = [
    {
      title: "Startup Founder",
      justification: `Your high overall score and resilience make you a strong candidate to hold the primary vision and drive a new venture from scratch.`,
      needsStrength: ["Resilience & Grit", "Entrepreneurial Motivation", "Execution Capability"],
    },
    {
      title: "Co-Founder & Chief Product Officer",
      justification: `Your phenomenal strengths in ${topStrength} combined with your creative mindset suggest you would make an outstanding technical or product co-founder.`,
      needsStrength: ["Innovation & Creativity", "Problem Solving", "Customer Orientation"],
    },
    {
      title: "Product Manager",
      justification: `You possess a brilliant balance of user empathy and execution capability, making you highly effective at managing complex product lifecycles.`,
      needsStrength: ["Customer Orientation", "Execution Capability", "Problem Solving"],
    },
    {
      title: "Innovation Manager",
      justification: `Perfect for guiding corporate accelerators or leading R&D teams to design next-generation products in structured organizations.`,
      needsStrength: ["Innovation & Creativity", "Leadership & Teamwork"],
    },
    {
      title: "Research Entrepreneur",
      justification: `Ideally suited to translate complex, scientific, or academic discoveries into viable, commercialized spin-off businesses.`,
      needsStrength: ["Problem Solving", "Business & Financial Acumen"],
    },
    {
      title: "Consultant / Venture Partner",
      justification: `Your strong situational analysis and problem-solving skills allow you to quickly diagnose operational issues in early-stage startups.`,
      needsStrength: ["Problem Solving", "Communication & Negotiation"],
    },
    {
      title: "Corporate Intrapreneur",
      justification: `You possess the perfect balance of creativity and team collaboration needed to build high-growth internal projects inside established companies.`,
      needsStrength: ["Leadership & Teamwork", "Innovation & Creativity"],
    },
  ];

  // Select top 3 careers that match their strengths
  const selectedCareers = allCareerOptions
    .map((c) => {
      // Calculate a match score
      let score = 1;
      if (c.needsStrength?.some((s) => strengths.some((st) => st.name === s))) {
        score += 2;
      }
      return { ...c, matchScore: score };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3)
    .map((c) => `${c.title}: ${c.justification}`);

  // Construct a bespoke improvement plan targeting their specific weakest areas
  const plan: ImprovementMilestone = {
    day30: [
      `Conduct a deep-dive audit on your lowest scoring dimension (**${mainWeakness}**). Read 2 foundational business/practical books on this topic.`,
      `Find an active mentor, industry specialist, or startup advisor who exhibits elite mastery in **${mainWeakness}** and schedule a 30-minute structured feedback session.`,
      `Formulate a written hypothesis detailing how you will address **${mainWeakness}** in your current project or next business concept.`,
    ],
    day60: [
      `Design and run a mini-experiment to address **${secondWeakness}**. Draft a detailed survey or conduct 10 direct customer interviews to gather raw validation data.`,
      `Engage in a practical peer-review workshop or incubator cohort exercise to pressure-test your developing skills in **${mainWeakness}**.`,
      `Establish a quantitative performance indicator (KPI) to track and measure your personal progress in execution and **${mainWeakness}** daily.`,
    ],
    day90: [
      `Launch a micro-initiative or public pitch that forces you to fully step outside your comfort zone and heavily leverage your progress in **${mainWeakness}**.`,
      `Deliver a structured presentation, pitch-deck, or operational report to an advisor, demonstrating a complete turnaround in **${mainWeakness}** metrics.`,
      `Re-evaluate your entrepreneurial competencies by taking this assessment again to quantitatively measure score improvement.`,
    ],
  };

  return {
    aiInterpretation: summaryMarkdown,
    careerRecommendations: selectedCareers,
    improvementPlan: plan,
  };
}

/**
 * Main function to calculate scoring metrics and determine outcomes.
 */
export function calculateAssessment(
  responses: AssessmentResponse,
  userName: string,
  organization: string
): AssessmentResult {
  // 1. Group responses by dimension
  const dimensionSums: { [dimId: string]: number } = {};
  const dimensionCounts: { [dimId: string]: number } = {};

  // Initialize
  DIMENSIONS.forEach((d) => {
    dimensionSums[d.id] = 0;
    dimensionCounts[d.id] = 0;
  });

  // Accumulate
  Object.entries(responses).forEach(([statementId, value]) => {
    // statementId comes in format like q_prob_1, etc.
    // Let's map it correctly based on the statement's dimension
    const statementPrefix = statementId.split("_")[1]; // prob, innov, risk, lead, res, comm, exec, cust, bus, mot
    
    // Find the statement in STATEMENTS to get exact dimension
    const statement = STATEMENTS.find((s) => s.id === statementId);
    if (statement) {
      dimensionSums[statement.dimensionId] += value;
      dimensionCounts[statement.dimensionId] += 1;
    }
  });

  // 2. Calculate Dimension scores (0-100)
  const dimensionScores: DimensionScore[] = DIMENSIONS.map((d) => {
    const actualSum = dimensionSums[d.id] || 0;
    const count = dimensionCounts[d.id] || 5;
    const maxPossibleSum = count * 5; // each statement is max 5
    const score = maxPossibleSum > 0 ? Math.round((actualSum / maxPossibleSum) * 100) : 0;

    return {
      dimensionId: d.id,
      dimensionName: d.name,
      score,
      actualSum,
      maxPossibleSum,
    };
  });

  // 3. Overall Entrepreneurial Score (Average of all dimension scores)
  const overallScore = Math.round(
    dimensionScores.reduce((sum, d) => sum + d.score, 0) / dimensionScores.length
  );

  // 4. Find category
  const matchedCategory = CATEGORIES.find((c) => overallScore >= c.min && overallScore <= c.max) || CATEGORIES[2];

  // 5. Strengths (Top 3 dimensions)
  const sortedDimensions = [...dimensionScores].sort((a, b) => b.score - a.score);
  const strengths = sortedDimensions.slice(0, 3).map((d) => ({
    dimensionId: d.dimensionId,
    name: d.dimensionName,
    score: d.score,
  }));

  // 6. Development Areas (Bottom 3 dimensions)
  const developments = [...dimensionScores].sort((a, b) => a.score - b.score).slice(0, 3).map((d) => ({
    dimensionId: d.dimensionId,
    name: d.dimensionName,
    score: d.score,
  }));

  // 7. Local Interpretation Fallback (useful until API is called or if offline)
  const localInterp = generateLocalInterpretation(
    userName,
    overallScore,
    matchedCategory.name,
    strengths,
    developments
  );

  return {
    id: `assess_${Date.now()}`,
    userName,
    organization,
    date: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    responses,
    dimensionScores,
    overallScore,
    category: matchedCategory.name,
    categoryDescription: matchedCategory.description,
    strengths,
    developments,
    aiInterpretation: localInterp.aiInterpretation,
    careerRecommendations: localInterp.careerRecommendations,
    improvementPlan: localInterp.improvementPlan,
  };
}
