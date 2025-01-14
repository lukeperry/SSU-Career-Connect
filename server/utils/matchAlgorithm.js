const tf = require('@tensorflow/tfjs-node');
const use = require('@tensorflow-models/universal-sentence-encoder');
const natural = require('natural');
const wordnet = new natural.WordNet();

let model;

async function loadModel() {
  if (!model) {
    model = await use.load();
  }
}

async function computeEmbeddings(documents) {
  await loadModel();
  const embeddings = await model.embed(documents);
  return embeddings.arraySync(); // Ensure embeddings are returned as an array
}

function cosineSimilarity(a, b) {
  const dotProduct = tf.sum(tf.mul(a, b));
  const normA = tf.norm(a);
  const normB = tf.norm(b);
  return dotProduct.div(normA.mul(normB)).dataSync()[0];
}

function normalizeText(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '');
}

function removeStopwords(text) {
  const stopwords = new Set(['a', 'an', 'the', 'and', 'or', 'but', 'if', 'then', 'else', 'when', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now']);
  return text.split(' ').filter(word => !stopwords.has(word)).join(' ');
}

async function lemmatizeText(text) {
  const tokenizer = new natural.WordTokenizer();
  const words = tokenizer.tokenize(text);
  const lemmatizedWords = await Promise.all(words.map(word => new Promise((resolve, reject) => {
    wordnet.lookup(word, (results) => {
      if (results && results.length > 0) {
        resolve(results[0].lemma);
      } else {
        resolve(word);
      }
    });
  })));
  return lemmatizedWords.join(' ');
}

async function calculateMatchScore(job, candidate) {
  try {
    // Log the entire candidate object
    console.log('Candidate Object:', candidate);

    // Ensure candidate object has the expected structure
    const candidateExperience = candidate.experience || '';  // Fallback to empty string if undefined
    const candidateSkillsArray = candidate.skills || [];  // Fallback to empty array if undefined

    console.log('Raw Candidate Experience:', candidateExperience);
    console.log('Raw Candidate Skills:', candidateSkillsArray);

    // Normalize, remove stopwords, and lemmatize experience and skills
    const processedCandidateExperience = await lemmatizeText(removeStopwords(normalizeText(candidateExperience)));
    const processedCandidateSkills = await lemmatizeText(removeStopwords(normalizeText(candidateSkillsArray.join(' '))));

    // Log intermediate results for debugging
    console.log('Processed Candidate Experience:', processedCandidateExperience);
    console.log('Processed Candidate Skills:', processedCandidateSkills);

    // Example match score calculation (this can be replaced with a more complex algorithm)
    const jobDescription = job.description || '';
    const jobSkills = job.requiredSkills || [];

    const processedJobDescription = await lemmatizeText(removeStopwords(normalizeText(jobDescription)));
    const processedJobSkills = await lemmatizeText(removeStopwords(normalizeText(jobSkills.join(' '))));

    console.log('Processed Job Description:', processedJobDescription);
    console.log('Processed Job Skills:', processedJobSkills);

    // Compute embeddings
    const candidateText = `${processedCandidateExperience} ${processedCandidateSkills}`;
    const jobText = `${processedJobDescription} ${processedJobSkills}`;
    const embeddings = await computeEmbeddings([candidateText, jobText]);

    // Ensure embeddings are returned as an array
    if (!Array.isArray(embeddings) || embeddings.length !== 2) {
      throw new Error('Embeddings computation failed');
    }

    const [candidateEmbedding, jobEmbedding] = embeddings;

    // Calculate cosine similarity
    const matchScore = cosineSimilarity(candidateEmbedding, jobEmbedding);

    // Apply a minimum score threshold
    const MIN_SCORE_THRESHOLD = 0.3;
    if (matchScore < MIN_SCORE_THRESHOLD) {
      return 0; // Discard jobs with a score below the threshold
    }

    // Apply weighting factors (example: 70% skills, 30% experience)
    const skillsWeight = 0.7;
    const experienceWeight = 0.3;
    const weightedScore = (matchScore * skillsWeight) + (matchScore * experienceWeight);

    return weightedScore;
  } catch (error) {
    console.error('Error in calculateMatchScore:', error);
    throw error;
  }
}

module.exports = { calculateMatchScore };