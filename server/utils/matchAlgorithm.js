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
  return embeddings;
}

function cosineSimilarity(a, b) {
  const dotProduct = tf.sum(tf.mul(a, b));
  const normA = tf.norm(a);
  const normB = tf.norm(b);
  return dotProduct.div(normA.mul(normB));
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
  // Log the entire candidate object
  console.log('Candidate Object:', candidate);

  // Ensure candidate object has the expected structure
  const candidateExperience = candidate.experience || '';  // Fallback to empty string if undefined
  const candidateSkillsArray = candidate.skills || [];  // Fallback to empty array if undefined

  console.log('Raw Candidate Experience:', candidateExperience);
  console.log('Raw Candidate Skills:', candidateSkillsArray);

  // Comment out the rest of the algorithm for now
  /*
  // Normalize and lemmatize experience and skills without removing stopwords
  const processedCandidateExperience = await lemmatizeText(normalizeText(candidateExperience));
  const processedCandidateSkills = await lemmatizeText(normalizeText(candidateSkillsArray.join(' ')));

  // Log intermediate results for debugging
  console.log('Processed Candidate Experience:', processedCandidateExperience);
  console.log('Processed Candidate Skills:', processedCandidateSkills);

  const combinedCandidateText = processedCandidateExperience + ' ' + processedCandidateSkills;

  console.log('Combined Candidate Text:', combinedCandidateText);

  try {
    const embeddings = await computeEmbeddings([combinedCandidateText]);
    const embeddingsArray = embeddings.arraySync();
    const candidateEmbedding = embeddingsArray[0];

    const similarity = cosineSimilarity(tf.tensor(candidateEmbedding), tf.tensor(candidateEmbedding));
    const score = similarity.arraySync();
    console.log('Similarity Score:', score);
    return parseFloat(score.toFixed(2)); // Round the score to 2 decimal places
  } catch (error) {
    console.error('Error calculating match score:', error);
    return 0; // Return a default score in case of error
  }
  */
  return 0; // Return a default score for now
}

module.exports = {
  calculateMatchScore
};