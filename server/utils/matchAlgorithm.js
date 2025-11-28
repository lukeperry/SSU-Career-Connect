// Hybrid matching algorithm: AI-powered (Sentence-Transformers) + Rule-based fallback
const crypto = require('crypto');
const MatchScore = require('../api/models/matchScore');
const axios = require('axios');

// Embedding service configuration
const EMBEDDING_SERVICE_URL = process.env.EMBEDDING_SERVICE_URL || 'http://localhost:5001';
const USE_AI_MATCHING = process.env.USE_AI_MATCHING !== 'false'; // Default to true
const AI_TIMEOUT = 15000; // 15 second timeout (increased for larger models like all-mpnet-base-v2)

// Test if AI service is available
let aiServiceAvailable = false;

async function checkAIService() {
  try {
    const response = await axios.get(`${EMBEDDING_SERVICE_URL}/health`, { timeout: 2000 });
    aiServiceAvailable = response.data.status === 'healthy';
    if (aiServiceAvailable) {
      console.log('✅ AI Embedding Service connected:', response.data.model);
    }
    return aiServiceAvailable;
  } catch (error) {
    aiServiceAvailable = false;
    return false;
  }
}

// Check on startup
checkAIService();

// AI-powered matching using Sentence-Transformers
async function calculateAIMatchScore(job, talent) {
  try {
    const payload = {
      job: {
        title: job.title || '',
        description: job.description || '',
        requirements: job.requirements || '',
        skills: job.requiredSkills || []
      },
      talent: {
        experience: talent.experience || '',
        skills: talent.skills || []
      }
    };
    
    const response = await axios.post(
      `${EMBEDDING_SERVICE_URL}/match`,
      payload,
      { timeout: AI_TIMEOUT }
    );
    
    // Log detailed breakdown for debugging
    if (response.data.details && response.data.details.breakdown) {
      console.log(`   📊 Component Breakdown for "${job.title}":`);
      response.data.details.breakdown.forEach(comp => {
        console.log(`      ${comp.name}: ${(comp.raw_score * 100).toFixed(1)}% (weight: ${(comp.weight * 100).toFixed(0)}%) → ${(comp.weighted_contribution * 100).toFixed(1)}%`);
      });
    }
    
    return response.data.score;
  } catch (error) {
    console.warn('⚠️ AI service error, will use rule-based fallback:', error.message);
    aiServiceAvailable = false;
    return null;
  }
}

// Jaccard similarity - measures overlap between skill sets
function computeJaccardSimilarity(jobSkills, talentSkills) {
  const jobSet = new Set(jobSkills.map(s => normalizeText(s)));
  const talentSet = new Set(talentSkills.map(s => normalizeText(s)));
  
  // Intersection: skills in both sets (after normalization)
  const intersection = new Set([...jobSet].filter(x => talentSet.has(x)));
  
  // Union: all unique skills
  const union = new Set([...jobSet, ...talentSet]);
  
  // Jaccard = intersection / union
  const jaccard = intersection.size / union.size;
  
  return jaccard;
}

// Calculate coverage - what % of job requirements are met
function computeCoverage(jobSkills, talentSkills) {
  const jobNormalized = jobSkills.map(s => normalizeText(s));
  const talentNormalized = new Set(talentSkills.map(s => normalizeText(s)));
  
  let matchedCount = 0;
  
  jobNormalized.forEach(jobSkill => {
    // Check exact match first
    if (talentNormalized.has(jobSkill)) {
      matchedCount++;
    } else {
      // Check for partial matches (e.g., "retail store" contains "retail")
      const jobWords = jobSkill.split(/\s+/);
      const hasPartialMatch = [...talentNormalized].some(talentSkill => {
        const talentWords = talentSkill.split(/\s+/);
        // If any significant word matches, count as partial
        const commonWords = jobWords.filter(w => talentWords.includes(w) && w.length > 2);
        return commonWords.length > 0;
      });
      
      if (hasPartialMatch) {
        matchedCount += 0.5; // Give partial credit
      }
    }
  });
  
  // What percentage of job requirements does the talent meet?
  return matchedCount / jobNormalized.length;
}

// Normalize text for better matching - removes punctuation, extra spaces, etc.
function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[\/\-_]/g, ' ')      // Replace separators with spaces: "drug/retail" → "drug retail"
    .replace(/[^\w\s]/g, '')        // Remove other punctuation
    .replace(/\s+/g, ' ')           // Collapse multiple spaces
    .trim();
}

// Enhanced skill matching with partial matching and synonyms
function advancedSkillMatch(jobSkills, talentSkills) {
  const jobSkillsLower = jobSkills.map(s => normalizeText(s));
  const talentSkillsLower = talentSkills.map(s => normalizeText(s));
  
  let totalScore = 0;
  let matchDetails = [];
  
  jobSkillsLower.forEach((jobSkill, idx) => {
    let bestMatch = 0;
    let matchedTalentSkill = null;
    let matchedIndex = -1;
    
    talentSkillsLower.forEach((talentSkill, tIdx) => {
      const jobWords = jobSkill.split(/\s+/).filter(w => w.length > 0);
      const talentWords = talentSkill.split(/\s+/).filter(w => w.length > 0);
      
      // Exact match after normalization
      if (jobSkill === talentSkill) {
        bestMatch = 1.0;
        matchedTalentSkill = talentSkills[tIdx];
        matchedIndex = tIdx;
      }
      // One contains the other (substring match)
      else if (jobSkill.includes(talentSkill) || talentSkill.includes(jobSkill)) {
        const overlap = Math.min(jobSkill.length, talentSkill.length) / Math.max(jobSkill.length, talentSkill.length);
        if (overlap > bestMatch) {
          bestMatch = overlap * 0.85; // 85% credit for substring match
          matchedTalentSkill = talentSkills[tIdx];
          matchedIndex = tIdx;
        }
      }
      // Word-level overlap (handles "communication skills" vs "good communication skills")
      else {
        const commonWords = jobWords.filter(w => talentWords.includes(w) && w.length > 2);
        if (commonWords.length > 0) {
          // Calculate overlap based on matched words
          const overlap = commonWords.length / Math.max(jobWords.length, talentWords.length);
          const score = overlap * 0.75; // 75% credit for word overlap
          
          if (score > bestMatch) {
            bestMatch = score;
            matchedTalentSkill = talentSkills[tIdx];
            matchedIndex = tIdx;
          }
        }
      }
      
      // Check for common synonyms/related terms
      const synonymPairs = [
        ['retail', 'store', 'shop'],
        ['drug', 'pharmacy', 'pharmaceutical', 'pharmacist'],
        ['medical', 'healthcare', 'clinical', 'health'],
        ['communication', 'interpersonal'],
        ['experience', 'background', 'expertise'],
        ['customer', 'client', 'patient'],
        ['service', 'care', 'support'],
        ['javascript', 'js'],
        ['typescript', 'ts'],
        ['database', 'db'],
        ['inventory', 'stock'],
      ];
      
      synonymPairs.forEach(synonyms => {
        const jobHasSynonym = synonyms.some(syn => jobWords.includes(syn));
        const talentHasSynonym = synonyms.some(syn => talentWords.includes(syn));
        
        if (jobHasSynonym && talentHasSynonym) {
          const score = 0.7; // 70% match for synonyms
          if (score > bestMatch) {
            bestMatch = score;
            matchedTalentSkill = talentSkills[tIdx];
            matchedIndex = tIdx;
          }
        }
      });
    });
    
    totalScore += bestMatch;
    if (bestMatch > 0) {
      matchDetails.push({ 
        job: jobSkills[idx], 
        talent: matchedTalentSkill, 
        score: bestMatch 
      });
    }
  });
  
  const finalScore = totalScore / Math.max(jobSkillsLower.length, 1);
  
  if (matchDetails.length > 0) {
    console.log(`   📊 Match details: ${matchDetails.length} skills matched`);
    matchDetails.slice(0, 5).forEach(m => {
      console.log(`      • ${m.job} ↔ ${m.talent} (${(m.score * 100).toFixed(0)}%)`);
    });
  }
  
  return finalScore;
}

// Generate hash from skills array to detect changes
function generateSkillsHash(skills) {
  const skillsArray = Array.isArray(skills) ? skills : [];
  const skillsString = skillsArray.sort().join('|');
  return crypto.createHash('md5').update(skillsString).digest('hex');
}

// Smart cache wrapper - checks cache first, calculates only if needed
async function getOrCalculateMatchScore(job, talent) {
  try {
    const jobSkills = Array.isArray(job.requiredSkills) ? job.requiredSkills : [];
    const talentSkills = Array.isArray(talent.skills) ? talent.skills : [];
    
    // If either has no skills, return 0 immediately
    if (jobSkills.length === 0 || talentSkills.length === 0) {
      console.log('⚠️ Empty skills detected, returning score 0');
      return 0;
    }
    
    // Generate hashes to detect if skills changed
    const jobSkillsHash = generateSkillsHash(jobSkills);
    const talentSkillsHash = generateSkillsHash(talentSkills);
    
    // Try to find cached score
    const cachedScore = await MatchScore.findOne({ 
      jobId: job._id, 
      talentId: talent._id 
    });
    
    // If cache exists and skills haven't changed, return cached score
    if (cachedScore && 
        cachedScore.jobSkillsHash === jobSkillsHash && 
        cachedScore.talentSkillsHash === talentSkillsHash) {
      console.log(`✅ Using cached score: ${cachedScore.score.toFixed(3)} for job ${job.title}`);
      return cachedScore.score;
    }
    
    // Calculate new score using ML
    console.log(`🔄 Calculating new match score for job: ${job.title}...`);
    console.log(`   Job skills: ${jobSkills.join(', ')}`);
    console.log(`   Talent skills: ${talentSkills.join(', ')}`);
    
    const score = await calculateMatchScore(job, talent);
    
    // Save to cache (upsert - update if exists, insert if not)
    await MatchScore.findOneAndUpdate(
      { jobId: job._id, talentId: talent._id },
      {
        score,
        jobSkillsHash,
        talentSkillsHash,
        calculatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    console.log(`💾 Cached new score: ${(score * 100).toFixed(1)}% (${score.toFixed(4)})`);
    return score;
    
  } catch (error) {
    console.error('❌ Error in getOrCalculateMatchScore:', error);
    // Fallback to direct calculation if cache fails
    return await calculateMatchScore(job, talent);
  }
}

// Batch process multiple job matches in parallel (for performance)
async function batchCalculateMatchScores(jobs, talent, concurrency = 5) {
  const results = [];
  
  // Process jobs in batches of 'concurrency' at a time
  for (let i = 0; i < jobs.length; i += concurrency) {
    const batch = jobs.slice(i, i + concurrency);
    
    // Calculate all jobs in this batch in parallel
    const batchResults = await Promise.all(
      batch.map(async (job) => {
        try {
          const score = await getOrCalculateMatchScore(job, talent);
          return { job, score };
        } catch (error) {
          console.error(`❌ Error calculating score for job ${job.title}:`, error.message);
          return { job, score: 0 };
        }
      })
    );
    
    results.push(...batchResults);
  }
  
  return results;
}

// Extract years of experience from text (e.g., "3 years", "5+ years", "3-5 years", "2 years of experience")
function extractYearsOfExperience(text) {
  if (!text) return 0;
  
  const patterns = [
    /(\d+)\+?\s*(?:years?|yrs?)\s+(?:of\s+)?experience/i,  // "2 years of experience", "3+ years experience"
    /experience.*?(\d+)\+?\s*(?:years?|yrs?)/i,            // "experience with 2 years"
    /(\d+)\s*-\s*(\d+)\s*(?:years?|yrs?)/i,                // "3-5 years"
    /(\d+)\+?\s*(?:years?|yrs?)/i,                         // "3 years", "5+ years", "3 yrs"
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      // If range (e.g., "3-5 years"), take the minimum
      return parseInt(match[1]);
    }
  }
  
  return 0;
}

// Analyze experience match
function analyzeExperienceMatch(jobRequirements, talentExperience) {
  const jobYears = extractYearsOfExperience(jobRequirements);
  const talentYears = extractYearsOfExperience(talentExperience);
  
  // Check if talent has relevant experience keywords even without years
  const hasRelevantExperience = talentExperience && 
    (talentExperience.toLowerCase().includes('experience') || 
     talentExperience.toLowerCase().includes('worked') ||
     talentExperience.toLowerCase().includes('proficient') ||
     talentExperience.toLowerCase().includes('skilled'));
  
  if (jobYears === 0) {
    // No specific years requirement
    if (hasRelevantExperience && talentYears > 0) return 1.0; // Has experience
    if (hasRelevantExperience && talentYears === 0) return 0.8; // Mentions experience but no years
    if (talentYears > 0) return 0.9; // Has years mentioned
    return 0.6; // No clear experience info
  }
  
  if (talentYears === 0) {
    // Talent didn't specify years, but check for experience keywords
    if (hasRelevantExperience) {
      // Has experience mentioned, give benefit of doubt based on job level
      if (jobYears <= 1) return 0.85; // Entry level job, likely okay
      if (jobYears <= 3) return 0.65; // Mid level, might be okay
      return 0.4; // Senior level, risky
    }
    // No experience info at all
    if (jobYears <= 1) return 0.7; // Entry level job
    if (jobYears <= 2) return 0.4; // Mid level
    return 0.2; // Senior level
  }
  
  // Compare experience levels
  if (talentYears >= jobYears) {
    // Talent meets or exceeds requirement
    const excess = talentYears - jobYears;
    if (excess <= 2) return 1.0; // Perfect match
    if (excess <= 5) return 0.95; // Slightly overqualified
    return 0.9; // Very experienced, might be overqualified
  } else {
    // Talent has less experience than required
    const gap = jobYears - talentYears;
    if (gap === 1) return 0.75; // Close enough
    if (gap === 2) return 0.6; // Moderate gap
    if (gap === 3) return 0.45; // Noticeable gap
    return 0.3; // Large gap
  }
}

// Analyze text similarity between job description/requirements and talent experience
function analyzeTextSimilarity(jobText, talentText) {
  if (!jobText || !talentText) return 0;
  
  // Normalize both texts
  const normalizedJob = normalizeText(jobText);
  const normalizedTalent = normalizeText(talentText);
  
  // Extract meaningful keywords (filter out common words)
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
    'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that',
    'these', 'those', 'not', 'more', 'most', 'other', 'some', 'such', 'than', 'too', 'very'
  ]);
  
  const extractKeywords = (text) => {
    return text
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
  };
  
  const jobKeywords = extractKeywords(normalizedJob);
  const talentKeywords = extractKeywords(normalizedTalent);
  
  if (jobKeywords.length === 0 || talentKeywords.length === 0) return 0;
  
  // Use frequency-weighted matching
  const jobFreq = {};
  const talentFreq = {};
  
  jobKeywords.forEach(word => {
    jobFreq[word] = (jobFreq[word] || 0) + 1;
  });
  
  talentKeywords.forEach(word => {
    talentFreq[word] = (talentFreq[word] || 0) + 1;
  });
  
  // Count weighted common keywords
  const jobUnique = Object.keys(jobFreq);
  const talentUnique = new Set(Object.keys(talentFreq));
  
  let matchScore = 0;
  jobUnique.forEach(keyword => {
    if (talentUnique.has(keyword)) {
      // Give more weight to keywords that appear multiple times
      const weight = Math.min(jobFreq[keyword], talentFreq[keyword]);
      matchScore += weight;
    }
  });
  
  // Normalize by total job keywords
  const similarity = matchScore / jobKeywords.length;
  
  return Math.min(similarity, 1.0); // Cap at 100%
}

// Check location compatibility
function analyzeLocationMatch(jobLocation, talentLocation) {
  if (!jobLocation || !talentLocation) return 0.5; // Neutral if missing
  
  const jobLoc = jobLocation.toLowerCase().trim();
  const talentLoc = talentLocation.toLowerCase().trim();
  
  if (jobLoc === talentLoc) return 1.0; // Exact match
  
  // Check if one contains the other (e.g., "Manila, Philippines" vs "Manila")
  if (jobLoc.includes(talentLoc) || talentLoc.includes(jobLoc)) return 0.9;
  
  // Check for common city/province keywords
  const jobWords = new Set(jobLoc.split(/\W+/));
  const talentWords = new Set(talentLoc.split(/\W+/));
  const commonWords = [...jobWords].filter(w => talentWords.has(w) && w.length > 2);
  
  if (commonWords.length > 0) return 0.7; // Same region
  
  return 0.3; // Different locations (might need relocation)
}

// Check if job title matches talent's experience/background
function analyzeJobTitleRelevance(jobTitle, talentExperience) {
  if (!jobTitle || !talentExperience) return 0;
  
  const jobTitleNormalized = normalizeText(jobTitle);
  const experienceNormalized = normalizeText(talentExperience);
  
  const jobTitleWords = jobTitleNormalized.split(/\s+/).filter(w => w.length > 3);
  
  // Check if job title keywords appear in experience
  let matchCount = 0;
  jobTitleWords.forEach(word => {
    if (experienceNormalized.includes(word)) {
      matchCount++;
    }
  });
  
  if (matchCount === 0) return 0;
  
  // Return relevance score
  const relevance = matchCount / Math.max(jobTitleWords.length, 1);
  return relevance;
}

async function calculateMatchScore(job, talent) {
  try {
    const jobSkills = Array.isArray(job.requiredSkills) ? job.requiredSkills : [];
    const talentSkills = Array.isArray(talent.skills) ? talent.skills : [];

    if (jobSkills.length === 0 || talentSkills.length === 0) {
      return 0;
    }

    // Try AI-powered matching first if enabled and available
    if (USE_AI_MATCHING && aiServiceAvailable) {
      const aiScore = await calculateAIMatchScore(job, talent);
      if (aiScore !== null) {
        console.log(`   🤖 AI Match Score: ${(aiScore * 100).toFixed(1)}%`);
        return aiScore;
      }
      // If AI fails, continue to rule-based fallback below
      console.log(`   📋 Falling back to rule-based matching...`);
    }

    // Rule-based fallback (or primary if AI disabled)
    
    // 1. SKILL MATCHING (35% weight) - Core technical requirements
    const jaccardScore = computeJaccardSimilarity(jobSkills, talentSkills);
    const coverageScore = computeCoverage(jobSkills, talentSkills);
    const skillMatchScore = advancedSkillMatch(jobSkills, talentSkills);
    const skillFinalScore = (jaccardScore * 0.2) + (coverageScore * 0.3) + (skillMatchScore * 0.5);
    
    // 2. EXPERIENCE MATCHING (20% weight) - Years of experience requirement
    const experienceScore = analyzeExperienceMatch(
      job.requirements || job.description,
      talent.experience || ''
    );
    
    // 3. TEXT SIMILARITY (20% weight) - Deep analysis of job description vs talent experience
    const textSimilarityScore = analyzeTextSimilarity(
      (job.description || '') + ' ' + (job.requirements || ''),
      talent.experience || ''
    );
    
    // 4. JOB TITLE RELEVANCE (15% weight) - Does job title match talent's background?
    const titleRelevance = analyzeJobTitleRelevance(job.title, talent.experience);
    
    // 5. LOCATION MATCHING (10% weight) - Geographic compatibility
    const locationScore = analyzeLocationMatch(job.location, talent.location);
    
    // Weighted final score
    const finalScore = 
      (skillFinalScore * 0.35) +
      (experienceScore * 0.20) +
      (textSimilarityScore * 0.20) +
      (titleRelevance * 0.15) +
      (locationScore * 0.10);
    
    console.log(`   🎯 Rules: Skills ${(skillFinalScore * 100).toFixed(1)}% | Exp ${(experienceScore * 100).toFixed(1)}% | Text ${(textSimilarityScore * 100).toFixed(1)}% | Title ${(titleRelevance * 100).toFixed(1)}% | Loc ${(locationScore * 100).toFixed(1)}% | Final: ${(finalScore * 100).toFixed(1)}%`);

    return finalScore;
  } catch (error) {
    console.error('Error in calculateMatchScore:', error);
    throw error;
  }
}

module.exports = { 
  calculateMatchScore, 
  getOrCalculateMatchScore,
  batchCalculateMatchScores,
  generateSkillsHash 
};
