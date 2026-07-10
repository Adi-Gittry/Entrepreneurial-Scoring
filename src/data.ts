import { Dimension, Statement } from "./types";

export const DIMENSIONS: Dimension[] = [
  {
    id: "prob_solving",
    name: "Problem Solving",
    description: "Identifying issues, situational analysis, critical thinking, and opportunity recognition.",
    iconName: "Search",
  },
  {
    id: "innovation",
    name: "Innovation & Creativity",
    description: "Idea generation, thinking outside the box, experimental mindset, and product creativity.",
    iconName: "Lightbulb",
  },
  {
    id: "risk_taking",
    name: "Risk Taking Ability",
    description: "Decision making under uncertainty, assessing calculated risk, handling ambiguity, and founder courage.",
    iconName: "TrendingUp",
  },
  {
    id: "leadership",
    name: "Leadership & Teamwork",
    description: "Influencing others, team building, delegating responsibilities, and proactive initiative.",
    iconName: "Users",
  },
  {
    id: "resilience",
    name: "Resilience & Grit",
    description: "Persistence under pressure, adapting to failure, learning from setbacks, and continuous adaptability.",
    iconName: "Shield",
  },
  {
    id: "communication",
    name: "Communication & Negotiation",
    description: "Pitching and presenting ideas, networking, customer/investor persuasion, and active listening.",
    iconName: "MessageSquare",
  },
  {
    id: "execution",
    name: "Execution Capability",
    description: "Bias for action, goal achievement, accountability, and disciplined time management.",
    iconName: "Zap",
  },
  {
    id: "customer_orient",
    name: "Customer Orientation",
    description: "Understanding user pain points, design empathy, feedback acceptance, and market awareness.",
    iconName: "HeartHandshake",
  },
  {
    id: "business_acumen",
    name: "Business & Financial Acumen",
    description: "Revenue model understanding, cost-value creation, margins, cash flow awareness, and scalability.",
    iconName: "Briefcase",
  },
  {
    id: "motivation",
    name: "Entrepreneurial Motivation",
    description: "Independence, passion-driven effort, long-term commitment, and high achievement orientation.",
    iconName: "Award",
  },
];

export const STATEMENTS: Statement[] = [
  // 1. Problem Solving
  {
    id: "q_prob_1",
    dimensionId: "prob_solving",
    text: "I actively seek out unresolved challenges in daily life and try to devise logical solutions to them.",
  },
  {
    id: "q_prob_2",
    dimensionId: "prob_solving",
    text: "When faced with a complex situation, I can quickly break it down and analyze the underlying root causes.",
  },
  {
    id: "q_prob_3",
    dimensionId: "prob_solving",
    text: "I enjoy brainstorming multiple diverse solutions to a single problem rather than settling on the first obvious option.",
  },
  {
    id: "q_prob_4",
    dimensionId: "prob_solving",
    text: "I have a strong ability to see trends and recognize market or operational opportunities where others see only chaos.",
  },
  {
    id: "q_prob_5",
    dimensionId: "prob_solving",
    text: "I am skilled at critical thinking and assessing the practical feasibility of various solutions before executing.",
  },

  // 2. Innovation & Creativity
  {
    id: "q_innov_1",
    dimensionId: "innovation",
    text: "I regularly generate novel ideas and concepts that challenge existing rules, systems, or paradigms.",
  },
  {
    id: "q_innov_2",
    dimensionId: "innovation",
    text: "I thrive in unstructured environments where I can think differently and propose unconventional methods.",
  },
  {
    id: "q_innov_3",
    dimensionId: "innovation",
    text: "I constantly look for ways to improve, re-imagine, or innovate existing daily products, apps, or services.",
  },
  {
    id: "q_innov_4",
    dimensionId: "innovation",
    text: "I believe that experimentation, failure, and rapid trial-and-error are absolutely essential to achieve progress.",
  },
  {
    id: "q_innov_5",
    dimensionId: "innovation",
    text: "I find creative inspiration easily and feel highly confident turning abstract thoughts into tangible drafts or prototypes.",
  },

  // 3. Risk Taking Ability
  {
    id: "q_risk_1",
    dimensionId: "risk_taking",
    text: "I am comfortable making critical, high-stakes decisions even when I have incomplete, noisy, or ambiguous information.",
  },
  {
    id: "q_risk_2",
    dimensionId: "risk_taking",
    text: "I view calculated risks as necessary opportunities for growth and scale, rather than as direct threats to my security.",
  },
  {
    id: "q_risk_3",
    dimensionId: "risk_taking",
    text: "I possess the courage to pursue a highly promising direction even when there is a significant, real chance of complete failure.",
  },
  {
    id: "q_risk_4",
    dimensionId: "risk_taking",
    text: "I cope exceptionally well with ambiguity and do not require absolute structural clarity or a pre-defined path to act.",
  },
  {
    id: "q_risk_5",
    dimensionId: "risk_taking",
    text: "I have deep self-confidence in my ability to navigate, adapt, and overcome highly unpredictable or volatile situations.",
  },

  // 4. Leadership & Teamwork
  {
    id: "q_lead_1",
    dimensionId: "leadership",
    text: "I can naturally influence, inspire, and motivate other people to align with and work towards a shared vision.",
  },
  {
    id: "q_lead_2",
    dimensionId: "leadership",
    text: "I thoroughly enjoy building, organizing, and guiding diverse teams towards achieving challenging collective milestones.",
  },
  {
    id: "q_lead_3",
    dimensionId: "leadership",
    text: "I am effective at delegating responsibilities and empowering team members to take full ownership of their work streams.",
  },
  {
    id: "q_lead_4",
    dimensionId: "leadership",
    text: "I handle interpersonal conflicts constructively and help divergent team members find common ground and collaborate.",
  },
  {
    id: "q_lead_5",
    dimensionId: "leadership",
    text: "I am proactive in taking the initiative to kickstart new tasks or guide a group in times of collective stagnation.",
  },

  // 5. Resilience & Grit
  {
    id: "q_res_1",
    dimensionId: "resilience",
    text: "I view business setbacks and personal failures as highly valuable learning feedback loops rather than demotivating defeats.",
  },
  {
    id: "q_res_2",
    dimensionId: "resilience",
    text: "I maintain high enthusiasm and persist with my goals even when facing continuous obstacles, skepticism, or rejection.",
  },
  {
    id: "q_res_3",
    dimensionId: "resilience",
    text: "I am able to quickly adapt my plans, shift strategies, and remain calm when circumstances change unexpectedly.",
  },
  {
    id: "q_res_4",
    dimensionId: "resilience",
    text: "I am highly willing to acknowledge my mistakes, learn from them, and immediately iterate on my ideas.",
  },
  {
    id: "q_res_5",
    dimensionId: "resilience",
    text: "I possess the grit and determination needed to work on a long-term goal for months or years without immediate rewards.",
  },

  // 6. Communication & Negotiation
  {
    id: "q_comm_1",
    dimensionId: "communication",
    text: "I can clearly articulate highly technical or complex concepts in a simple, compelling way for any audience.",
  },
  {
    id: "q_comm_2",
    dimensionId: "communication",
    text: "I am highly persuasive and feel very confident pitching ideas to convince skeptical stakeholders or potential partners.",
  },
  {
    id: "q_comm_3",
    dimensionId: "communication",
    text: "I genuinely enjoy networking, meeting unfamiliar people, and building proactive, long-lasting professional relationships.",
  },
  {
    id: "q_comm_4",
    dimensionId: "communication",
    text: "I am highly comfortable negotiating and am able to consistently find win-win solutions in high-pressure agreements.",
  },
  {
    id: "q_comm_5",
    dimensionId: "communication",
    text: "I practice active listening and focus on truly understanding the needs and feedback of others before formulating responses.",
  },

  // 7. Execution Capability
  {
    id: "q_exec_1",
    dimensionId: "execution",
    text: "I have a strong bias for action; I prefer launching and testing ideas in the real world over endless theory and planning.",
  },
  {
    id: "q_exec_2",
    dimensionId: "execution",
    text: "Once I commit to a goal or a project, I ensure it is completed thoroughly and to an exceptionally high standard.",
  },
  {
    id: "q_exec_3",
    dimensionId: "execution",
    text: "I consistently set clear personal objectives and meet deadlines without needing external tracking or management.",
  },
  {
    id: "q_exec_4",
    dimensionId: "execution",
    text: "I manage my time effectively and am highly skilled at prioritizing high-impact tasks under tight or competing schedules.",
  },
  {
    id: "q_exec_5",
    dimensionId: "execution",
    text: "I take full, active personal accountability for the outcomes of my work, whether they end in success or failure.",
  },

  // 8. Customer Orientation
  {
    id: "q_cust_1",
    dimensionId: "customer_orient",
    text: "I always prioritize understanding direct customer pain points and needs before thinking about a product or solution.",
  },
  {
    id: "q_cust_2",
    dimensionId: "customer_orient",
    text: "I am highly empathetic and find it easy to view product or service experiences from the absolute shoes of the end-user.",
  },
  {
    id: "q_cust_3",
    dimensionId: "customer_orient",
    text: "I keep a keen eye on shifting customer habits, market trends, and modern user-experience expectations.",
  },
  {
    id: "q_cust_4",
    dimensionId: "customer_orient",
    text: "I actively seek out user feedback and am entirely willing to completely scrap or pivot my plans based on what users say.",
  },
  {
    id: "q_cust_5",
    dimensionId: "customer_orient",
    text: "I believe that solving real user problems is the single most important metric for any sustainable enterprise.",
  },

  // 9. Business & Financial Acumen
  {
    id: "q_bus_1",
    dimensionId: "business_acumen",
    text: "I have a solid understanding of how modern companies generate revenue and build sustainable business models.",
  },
  {
    id: "q_bus_2",
    dimensionId: "business_acumen",
    text: "I can understand basic financial parameters like pricing, unit economics, gross margins, and operating cash flow.",
  },
  {
    id: "q_bus_3",
    dimensionId: "business_acumen",
    text: "I naturally focus on how a service creates clear, measurable value for its buyers relative to its costs.",
  },
  {
    id: "q_bus_4",
    dimensionId: "business_acumen",
    text: "I understand the concept of market positioning, distribution channels, and how products acquire organic visibility.",
  },
  {
    id: "q_bus_5",
    dimensionId: "business_acumen",
    text: "I can quickly evaluate whether a startup concept is commercially viable and scalable, or just a niche project.",
  },

  // 10. Entrepreneurial Motivation
  {
    id: "q_mot_1",
    dimensionId: "motivation",
    text: "Having complete independence, autonomy, and control over my professional destiny is incredibly important to me.",
  },
  {
    id: "q_mot_2",
    dimensionId: "motivation",
    text: "I am fueled by a deep inner passion to build new things from scratch and make a positive, scalable impact on society.",
  },
  {
    id: "q_mot_3",
    dimensionId: "motivation",
    text: "I have a strong internal drive for extreme achievement and continuously push past standard comfort levels.",
  },
  {
    id: "q_mot_4",
    dimensionId: "motivation",
    text: "I want my day-to-day efforts to be aligned with a larger, mission-driven purpose rather than just a stable corporate salary.",
  },
  {
    id: "q_mot_5",
    dimensionId: "motivation",
    text: "I am prepared to make significant personal sacrifices, work intense hours, and remain committed to a startup for years.",
  },
];

export const CATEGORIES = [
  {
    min: 0,
    max: 20,
    name: "Very Low Potential",
    description: "Your answers suggest a strong preference for highly structured environments, low risk, and predictable tasks. Traditional career paths or structured operational roles within established organizations may align better with your strengths.",
  },
  {
    min: 21,
    max: 40,
    name: "Developing Potential",
    description: "You show initial indicators of entrepreneurial curiosity, but may currently prefer stable structures and low ambiguity. Building foundational skills in finance, risk management, and risk-taking can help develop your potential.",
  },
  {
    min: 41,
    max: 60,
    name: "Emerging Entrepreneur",
    description: "You possess a solid foundation of entrepreneurial traits—specifically creativity and resilience—but may benefit from further skill development in business mechanics or team leadership. You are well-suited for early-stage startup teams or corporate innovation roles.",
  },
  {
    min: 61,
    max: 80,
    name: "High Entrepreneurial Potential",
    description: "You display an outstanding combination of risk tolerance, problem-solving, and motivational drive. You are highly capable of formulating, launching, and navigating a startup venture, potentially as a founder or key co-founder.",
  },
  {
    min: 81,
    max: 100,
    name: "Startup Founder Ready",
    description: "Your mindset and skillset are extremely aligned with the demands of building and scaling high-growth ventures. You demonstrate exceptional resilience, strategic business acumen, leadership capability, and execution discipline. You are ready to lead as a primary founder.",
  },
];
