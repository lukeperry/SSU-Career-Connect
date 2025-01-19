const tf = require('@tensorflow/tfjs-node'); // Ensure this is the CPU version
const use = require('@tensorflow-models/universal-sentence-encoder');

let cachedModel = null;

async function loadModel() {
  if (cachedModel) {
    return cachedModel;
  }

  // Set the backend to CPU
  await tf.setBackend('cpu');
  await tf.ready();

  const modelUrl = 'https://tfhub.dev/tensorflow/tfjs-model/universal-sentence-encoder-lite/1/default/1/model.json?tfjs-format=file';
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      cachedModel = await use.load({ modelUrl });
      return cachedModel;
    } catch (error) {
      console.error(`Error loading model on attempt ${attempt + 1}:`, error);
      if (attempt === 2) {
        throw error;
      }
    }
  }
}

async function computeEmbeddings(model, documents) {
  try {
    const embeddings = await model.embed(documents);
    return embeddings.arraySync(); // Ensure embeddings are returned as an array
  } catch (error) {
    console.error('Error computing embeddings:', error);
    throw error;
  }
}

function cosineSimilarity(a, b) {
  const dotProduct = tf.sum(tf.mul(a, b));
  const normA = tf.norm(a);
  const normB = tf.norm(b);
  return dotProduct.div(normA.mul(normB)).dataSync()[0];
}

function validateEmbeddings(embeddings) {
  return embeddings.every(embedding => embedding.length === 512);
}

async function calculateMatchScore(job, talent) {
  try {
    console.log('Job Object:', job);
    console.log('Talent Object:', talent);

    const jobSkills = Array.isArray(job.requiredSkills) ? job.requiredSkills.join(' ') : '';
    const talentSkills = Array.isArray(talent.skills) ? talent.skills.join(' ') : '';

    if (!jobSkills || !talentSkills) {
      console.log('Job or Talent skills are empty.');
      console.log('Job Skills:', jobSkills);
      console.log('Talent Skills:', talentSkills);
      return 0;
    }

    console.log('Job Skills:', jobSkills);
    console.log('Talent Skills:', talentSkills);

    let jobEmbedding, talentEmbedding;
    const model = await loadModel();
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        [jobEmbedding, talentEmbedding] = await computeEmbeddings(model, [jobSkills, talentSkills]);
        if (validateEmbeddings([jobEmbedding, talentEmbedding])) {
          break;
        }
      } catch (embeddingError) {
        console.warn(`Error computing embeddings on attempt ${attempt + 1}:`, embeddingError);
      }
      console.warn(`Invalid embeddings on attempt ${attempt + 1}, retrying...`);
    }

    if (!validateEmbeddings([jobEmbedding, talentEmbedding])) {
      throw new Error('Failed to compute valid embeddings after 3 attempts');
    }

    console.log('Job Embedding:', jobEmbedding);
    // console.log('Talent Embedding:', talentEmbedding); // Hide talent embedding

    const matchScore = cosineSimilarity(jobEmbedding, talentEmbedding);
    console.log('Match Score:', matchScore);

    return matchScore;
  } catch (error) {
    console.error('Error in calculateMatchScore:', error);
    throw error;
  }
}

module.exports = { calculateMatchScore };
