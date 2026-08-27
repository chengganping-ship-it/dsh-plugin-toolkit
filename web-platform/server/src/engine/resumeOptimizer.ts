/**
 * v8.1: AI Resume Optimization Service
 * 
 * Target Users: Job seekers, career changers, recent graduates
 * Value Proposition: ATS (Applicant Tracking System) keyword gap analysis, 
 * intelligent resume rewriting, and job-specific resume tailoring
 * 
 * Features:
 * - ATS keyword scanning against job descriptions
 * - Keyword gap analysis (missing vs. matching)
 * - Smart resume rewriting with industry-specific language
 * - Skills extraction and matching
 * - Experience bullet point optimization
 * - ATS compatibility scoring
 * - Cover letter generation
 * - Interview question prediction
 */

export interface JobDescription {
  title: string;
  company: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  experienceLevel: string;
  industry: string;
}

export interface ResumeAnalysis {
  overallScore: number;           // 0-100
  atsCompatibility: number;       // 0-100
  keywordMatch: number;           // 0-100
  skillsMatch: number;            // 0-100
  experienceMatch: number;        // 0-100
  formatting: number;             // 0-100
}

export interface KeywordGap {
  keyword: string;
  count: number;                  // times in JD
  present: boolean;
  importance: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  suggestion: string;
}

export interface ResumeSection {
  name: string;
  score: number;
  issues: string[];
  suggestions: string[];
}

export interface OptimizedBullet {
  original: string;
  optimized: string;
  impactImprovement: number;      // %
  keywords: string[];
}

export interface InterviewQuestion {
  question: string;
  category: 'TECHNICAL' | 'BEHAVIORAL' | 'SITUATIONAL' | 'CULTURE_FIT';
  likelihood: number;             // 0-100
  suggestedAnswer: string;
}

export interface ResumeOptimization {
  analysis: ResumeAnalysis;
  keywordGaps: KeywordGap[];
  sectionScores: ResumeSection[];
  optimizedBullets: OptimizedBullet[];
  predictedQuestions: InterviewQuestion[];
  coverLetter: string;
  actionItems: string[];
  timestamp: number;
}

// ATS keyword extraction and matching
function extractKeywords(jd: JobDescription): string[] {
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  const text = `${jd.title} ${jd.description} ${jd.requiredSkills.join(' ')} ${jd.preferredSkills.join(' ')}`.toLowerCase();
  const words = text.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => !stopWords.includes(w));
  
  // Count frequency and return important keywords
  const freq: Record<string, number> = {};
  for (const word of words) {
    freq[word] = (freq[word] || 0) + 1;
  }
  
  return Object.entries(freq)
    .filter(([_, count]) => count >= 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);
}

// Calculate ATS compatibility score
function calculateCompatibility(jd: JobDescription, resumeText: string): ResumeAnalysis {
  const keywords = extractKeywords(jd);
  const resumeLower = resumeText.toLowerCase();
  
  const matchingKeywords = keywords.filter(k => resumeLower.includes(k));
  const keywordMatch = keywords.length > 0 ? (matchingKeywords.length / keywords.length) * 100 : 0;
  
  // Skills match
  const requiredSkills = jd.requiredSkills.map(s => s.toLowerCase());
  const matchingSkills = requiredSkills.filter(s => resumeLower.includes(s));
  const skillsMatch = requiredSkills.length > 0 ? (matchingSkills.length / requiredSkills.length) * 100 : 50;
  
  // Experience level check
  const expMatch = jd.experienceLevel.toLowerCase().includes('senior') && resumeLower.includes('senior') ? 90 :
                   jd.experienceLevel.toLowerCase().includes('junior') && resumeLower.includes('junior') ? 85 :
                   jd.experienceLevel.toLowerCase().includes('mid') && resumeLower.includes('mid') ? 80 : 60;
  
  // Formatting score (simplified)
  const formatting = {
    hasContactInfo: resumeLower.includes('@') || resumeLower.includes('phone') ? 20 : 0,
    hasEducation: resumeLower.includes('education') || resumeLower.includes('degree') ? 20 : 0,
    hasExperience: resumeLower.includes('experience') ? 20 : 0,
    hasSkills: resumeLower.includes('skills') ? 20 : 0,
    hasSummary: resumeLower.includes('summary') || resumeLower.includes('objective') ? 20 : 0,
  };
  const formatScore = Object.values(formatting).reduce((s, v) => s + v, 0);
  
  const overallScore = Math.round((keywordMatch * 0.35 + skillsMatch * 0.25 + expMatch * 0.2 + formatScore * 0.2));
  
  return {
    overallScore,
    atsCompatibility: formatScore,
    keywordMatch: Math.round(keywordMatch),
    skillsMatch: Math.round(skillsMatch),
    experienceMatch: expMatch,
    formatting: formatScore,
  };
}

// Identify keyword gaps
function findKeywordGaps(jd: JobDescription, resumeText: string): KeywordGap[] {
  const keywords = extractKeywords(jd);
  const resumeLower = resumeText.toLowerCase();
  
  return keywords.map(keyword => {
    const present = resumeLower.includes(keyword);
    const importance: KeywordGap['importance'] = jd.requiredSkills.some(s => s.toLowerCase().includes(keyword)) ? 'CRITICAL' :
                       jd.preferredSkills.some(s => s.toLowerCase().includes(keyword)) ? 'HIGH' :
                       keyword.length > 6 ? 'MEDIUM' : 'LOW';
    
    return {
      keyword,
      count: 1,
      present,
      importance,
      suggestion: present ? 'Already included' : `Add "${keyword}" to your skills or experience section`,
    };
  }).filter(g => !g.present).sort((a, b) => {
    const order: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    return (order[a.importance] || 0) - (order[b.importance] || 0);
  });
}

// Optimize bullet points
function optimizeBullets(experienceText: string, keywords: string[]): OptimizedBullet[] {
  const sentences = experienceText.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  return sentences.slice(0, 5).map(sentence => {
    const trimmed = sentence.trim();
    const hasNumber = /\d+/.test(trimmed);
    const hasAction = /^(Led|Managed|Developed|Created|Implemented|Improved|Reduced|Increased)/i.test(trimmed);
    
    let optimized = trimmed;
    if (!hasAction) {
      optimized = `Spearheaded ${trimmed.charAt(0).toLowerCase()}${trimmed.slice(1)}`;
    }
    if (!hasNumber) {
      optimized += ' resulting in 30% improvement';
    }
    
    return {
      original: trimmed,
      optimized,
      impactImprovement: hasAction && hasNumber ? 10 : 35,
      keywords: keywords.slice(0, 3),
    };
  });
}

// Generate interview questions
function predictInterviewQuestions(jd: JobDescription, gaps: KeywordGap[]): InterviewQuestion[] {
  const questions: InterviewQuestion[] = [];
  
  // Technical questions based on required skills
  for (const skill of jd.requiredSkills.slice(0, 3)) {
    questions.push({
      question: `Can you describe your experience with ${skill} and how you've applied it in previous roles?`,
      category: 'TECHNICAL',
      likelihood: 85,
      suggestedAnswer: `Highlight specific projects using ${skill}, quantify results, and mention challenges overcome`,
    });
  }
  
  // Questions for keyword gaps
  for (const gap of gaps.filter(g => g.importance === 'CRITICAL').slice(0, 2)) {
    questions.push({
      question: `How familiar are you with ${gap.keyword} and what's your learning plan?`,
      category: 'SITUATIONAL',
      likelihood: 70,
      suggestedAnswer: `Acknowledge the gap honestly, demonstrate eagerness to learn, and mention related experience`,
    });
  }
  
  // Behavioral questions
  questions.push({
    question: 'Tell me about a time you had to learn a new technology quickly',
    category: 'BEHAVIORAL',
    likelihood: 80,
    suggestedAnswer: 'Use the STAR method: Situation, Task, Action, Result. Focus on adaptability and learning speed',
  });
  
  // Culture fit
  questions.push({
    question: `What interests you about ${jd.company} and this role?`,
    category: 'CULTURE_FIT',
    likelihood: 90,
    suggestedAnswer: 'Research company values, mention specific aspects that align with your career goals',
  });
  
  return questions;
}

// Generate cover letter
function generateCoverLetter(jd: JobDescription, analysis: ResumeAnalysis): string {
  return `Dear Hiring Manager,

I am writing to express my strong interest in the ${jd.title} position at ${jd.company}. With a ${analysis.overallScore}% match to your requirements, I am confident in my ability to contribute immediately.

My experience aligns with your key requirements, particularly in ${jd.requiredSkills.slice(0, 2).join(' and ')}. I have successfully applied these skills to deliver measurable results in previous roles.

What excites me most about this opportunity is the chance to ${jd.description.includes('grow') ? 'grow with a dynamic team' : 'make an impact in ' + jd.industry}. I am eager to bring my expertise in ${jd.preferredSkills[0] || 'the field'} to ${jd.company}.

I would welcome the opportunity to discuss how my background, skills, and enthusiasm can contribute to your team's success.

Sincerely,
[Your Name]`;
}

// Main cache
let cachedOptimization: ResumeOptimization | null = null;
let lastResumeFetch = 0;

export async function optimizeResume(
  jobDescription: JobDescription,
  resumeText: string
): Promise<ResumeOptimization> {
  const analysis = calculateCompatibility(jobDescription, resumeText);
  const keywordGaps = findKeywordGaps(jobDescription, resumeText);
  const keywords = extractKeywords(jobDescription);
  const optimizedBullets = optimizeBullets(resumeText, keywords);
  const predictedQuestions = predictInterviewQuestions(jobDescription, keywordGaps);
  const coverLetter = generateCoverLetter(jobDescription, analysis);
  
  const sectionScores = [
    { name: 'Contact Info', score: analysis.formatting >= 20 ? 100 : 0, issues: analysis.formatting < 20 ? ['Missing contact information'] : [], suggestions: ['Add phone and email'] },
    { name: 'Summary', score: analysis.formatting >= 20 ? 90 : 0, issues: analysis.formatting < 20 ? ['No professional summary'] : [], suggestions: ['Add 2-3 line summary'] },
    { name: 'Experience', score: analysis.experienceMatch, issues: analysis.experienceMatch < 80 ? ['Experience level mismatch'] : [], suggestions: ['Align experience with job level'] },
    { name: 'Skills', score: analysis.skillsMatch, issues: analysis.skillsMatch < 70 ? ['Missing key skills'] : [], suggestions: ['Add required skills from JD'] },
    { name: 'Education', score: analysis.formatting >= 20 ? 95 : 0, issues: analysis.formatting < 20 ? ['No education section'] : [], suggestions: ['Add degree and institution'] },
  ];
  
  const actionItems = [
    ...keywordGaps.filter(g => g.importance === 'CRITICAL').map(g => `Add missing critical skill: ${g.keyword}`),
    ...analysis.atsCompatibility < 80 ? ['Improve ATS formatting - use standard headers'] : [],
    ...analysis.keywordMatch < 70 ? ['Add more keywords from job description'] : [],
    ...analysis.experienceMatch < 80 ? ['Adjust experience level to match JD'] : [],
    'Quantify achievements with specific numbers',
    'Proofread for grammar and spelling',
  ];
  
  const optimization: ResumeOptimization = {
    analysis,
    keywordGaps,
    sectionScores,
    optimizedBullets,
    predictedQuestions,
    coverLetter,
    actionItems,
    timestamp: Date.now(),
  };
  
  cachedOptimization = optimization;
  lastResumeFetch = Date.now();
  return optimization;
}

export function getCachedResumeOptimization(): ResumeOptimization | null {
  return cachedOptimization;
}

export function clearResumeCache(): void {
  cachedOptimization = null;
  lastResumeFetch = 0;
}
