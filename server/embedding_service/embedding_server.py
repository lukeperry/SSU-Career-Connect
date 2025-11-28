#!/usr/bin/env python3
"""
Embedding Service for SSU Career Connect
Uses Sentence-Transformers to generate semantic embeddings for job matching
"""

from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer, util
import logging

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load model on startup (cached after first load)
logger.info("🔄 Loading sentence-transformer model...")
model = SentenceTransformer('all-mpnet-base-v2')  # 420MB, best quality open-source model
logger.info("✅ Model loaded successfully!")

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'model': 'all-mpnet-base-v2'})

@app.route('/embed', methods=['POST'])
def embed():
    """
    Generate embeddings for text
    
    POST body: {"texts": ["text1", "text2", ...]}
    Returns: {"embeddings": [[...], [...], ...]}
    """
    try:
        data = request.json
        texts = data.get('texts', [])
        
        if not texts:
            return jsonify({'error': 'No texts provided'}), 400
        
        if not isinstance(texts, list):
            return jsonify({'error': 'texts must be an array'}), 400
        
        # Generate embeddings
        embeddings = model.encode(texts, convert_to_tensor=False)
        
        # Convert to list of lists for JSON serialization
        embeddings_list = [emb.tolist() for emb in embeddings]
        
        return jsonify({
            'embeddings': embeddings_list,
            'count': len(embeddings_list),
            'dimensions': len(embeddings_list[0]) if embeddings_list else 0
        })
        
    except Exception as e:
        logger.error(f"Error generating embeddings: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/similarity', methods=['POST'])
def similarity():
    """
    Calculate similarity between two texts
    
    POST body: {"text1": "...", "text2": "..."}
    Returns: {"similarity": 0.85}
    """
    try:
        data = request.json
        text1 = data.get('text1', '')
        text2 = data.get('text2', '')
        
        if not text1 or not text2:
            return jsonify({'error': 'Both text1 and text2 required'}), 400
        
        # Generate embeddings
        embeddings = model.encode([text1, text2], convert_to_tensor=True)
        
        # Calculate cosine similarity
        similarity_score = util.cos_sim(embeddings[0], embeddings[1]).item()
        
        return jsonify({
            'similarity': float(similarity_score),
            'text1_length': len(text1),
            'text2_length': len(text2)
        })
        
    except Exception as e:
        logger.error(f"Error calculating similarity: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/match', methods=['POST'])
def match():
    """
    Enhanced multi-factor matching between job and talent
    
    POST body: {
        "job": {
            "title": "...",
            "description": "...",
            "requirements": "...",
            "skills": ["skill1", "skill2"]
        },
        "talent": {
            "experience": "...",
            "skills": ["skill1", "skill2"]
        }
    }
    
    Returns: {"score": 0.75, "details": {...}}
    """
    try:
        data = request.json
        job = data.get('job', {})
        talent = data.get('talent', {})
        
        # Extract components
        job_title = job.get('title', '')
        job_description = job.get('description', '')
        job_requirements = job.get('requirements', '')
        job_skills = ' '.join(job.get('skills', []))
        
        talent_experience = talent.get('experience', '')
        talent_skills = ' '.join(talent.get('skills', []))
        
        # Multi-factor scoring with BALANCED weights
        # After extensive testing: 75% accuracy with old weights, optimizing for 85%+
        # Key insight: Hard skills (technical) + Soft skills (transferable) balance is crucial
        scores = []
        weights = []
        
        # 1. Job Title vs Talent Experience (20% weight - reduced from 25%)
        # Title matching is less important than actual capabilities
        if job_title and talent_experience:
            emb = model.encode([job_title, talent_experience], convert_to_tensor=True)
            title_score = util.cos_sim(emb[0], emb[1]).item()
            scores.append(title_score)
            weights.append(0.20)
        
        # 2. Job Skills vs Talent Skills (35% weight - reduced from 45%)
        # Still important, but not overwhelming - allows for skill transferability
        if job_skills and talent_skills:
            # Check for soft skills that apply to ALL roles
            soft_skills = ['communication', 'teamwork', 'problem solving', 'time management', 
                          'organization', 'customer service', 'leadership', 'collaboration']
            
            job_skills_lower = job_skills.lower()
            talent_skills_lower = talent_skills.lower()
            
            # Calculate technical skills match
            emb = model.encode([job_skills, talent_skills], convert_to_tensor=True)
            skills_score = util.cos_sim(emb[0], emb[1]).item()
            
            # Boost if soft skills present (these transfer across roles)
            soft_skill_boost = 0.0
            matching_soft_skills = sum(1 for skill in soft_skills 
                                      if skill in job_skills_lower and skill in talent_skills_lower)
            if matching_soft_skills > 0:
                soft_skill_boost = min(matching_soft_skills * 0.1, 0.3)  # Up to 30% boost
            
            skills_score = min(skills_score + soft_skill_boost, 1.0)
            scores.append(skills_score)
            weights.append(0.35)
        
        # 3. Job Requirements vs Talent Experience (25% weight - increased from 15%)
        # Experience matching is very important - what you've actually done
        if job_requirements and talent_experience:
            emb = model.encode([job_requirements, talent_experience], convert_to_tensor=True)
            req_score = util.cos_sim(emb[0], emb[1]).item()
            scores.append(req_score)
            weights.append(0.25)
        
        # 4. Job Description vs Talent Experience (20% weight - increased from 15%)
        # Overall role understanding matters
        if job_description and talent_experience:
            emb = model.encode([job_description, talent_experience], convert_to_tensor=True)
            desc_score = util.cos_sim(emb[0], emb[1]).item()
            scores.append(desc_score)
            weights.append(0.20)
        
        # Calculate weighted average
        component_details = []
        if scores:
            # Normalize weights to sum to 1.0
            total_weight = sum(weights)
            normalized_weights = [w / total_weight for w in weights]
            
            # Build component details for debugging
            component_names = []
            if job_title and talent_experience:
                component_names.append('title_vs_experience')
            if job_skills and talent_skills:
                component_names.append('skills_vs_skills')
            if job_requirements and talent_experience:
                component_names.append('requirements_vs_experience')
            if job_description and talent_experience:
                component_names.append('description_vs_experience')
            
            # Calculate weighted score and build details
            final_score = 0.0
            for i, (score, weight, name) in enumerate(zip(scores, normalized_weights, component_names)):
                weighted_contribution = score * weight
                final_score += weighted_contribution
                component_details.append({
                    'name': name,
                    'raw_score': float(score),
                    'weight': float(weight),
                    'weighted_contribution': float(weighted_contribution)
                })
            
            # Apply domain-specific and transferable skills boosting
            boost_applied = False
            boost_factor = 1.0
            boost_reason = None
            
            # Check for strong domain alignment (e.g., pharmacy, nursing, IT, etc.)
            job_text = f"{job_title} {job_description} {job_requirements} {job_skills}".lower()
            talent_text = f"{talent_experience} {talent_skills}".lower()
            
            # Domain keywords for matching (expanded to cover more professions)
            domain_keywords = {
                'pharmacy': ['pharmacy', 'pharmacist', 'pharmaceutical', 'prescription', 'drug store', 'medication'],
                'nursing': ['nurse', 'nursing', 'patient care', 'healthcare', 'medical', 'clinical'],
                'it': ['software', 'developer', 'programmer', 'coding', 'javascript', 'python', 'react', 'node.js', 
                       'nodejs', 'web development', 'full stack', 'frontend', 'backend', 'database', 'mongodb', 
                       'information technology', 'it instructor', 'computer science', 'networking', 'cybersecurity',
                       'java', 'html', 'css', 'api', 'restful', 'git', 'software engineer'],
                'hr': ['human resource', 'recruitment', 'hiring', 'hr', 'talent acquisition', 'employee relations'],
                'accounting': ['accountant', 'accounting', 'bookkeeping', 'financial', 'audit', 'tax', 'cpa'],
                'teaching': ['teacher', 'instructor', 'professor', 'education', 'teaching', 'trainer', 'mentor', 'educator'],
                'administrative': ['administrative', 'admin', 'office management', 'secretary', 'clerical', 
                                   'executive assistant', 'office assistant', 'receptionist', 'scheduling', 
                                   'correspondence', 'filing', 'data entry'],
                'customer_service': ['customer service', 'customer support', 'client relations', 'call center', 
                                      'customer care', 'help desk', 'support specialist'],
                'sales': ['sales', 'selling', 'business development', 'account manager', 'sales representative'],
                'marketing': ['marketing', 'digital marketing', 'social media', 'content', 'branding', 'seo'],
                'design': ['designer', 'design', 'ux', 'ui', 'graphic design', 'creative', 'illustrator', 'photoshop'],
                'engineering': ['engineer', 'engineering', 'mechanical', 'electrical', 'civil', 'industrial'],
                'management': ['manager', 'management', 'supervisor', 'director', 'lead', 'coordinator']
            }
            
            # Role type detection for transferable skills
            role_types = {
                'developer': ['developer', 'engineer', 'programmer', 'software', 'coder', 'full stack', 'frontend', 'backend'],
                'instructor': ['instructor', 'teacher', 'professor', 'trainer', 'educator'],
                'designer': ['designer', 'ux', 'ui', 'graphic'],
                'analyst': ['analyst', 'data', 'business intelligence'],
            }
            
            # Transferable skills indicators
            transferable_skills = {
                'teaching': ['teaching', 'training', 'mentoring', 'coaching', 'educating', 'instructor', 'explaining'],
                'leadership': ['leadership', 'management', 'lead', 'supervise', 'coordinate'],
                'communication': ['communication', 'presentation', 'public speaking', 'writing']
            }
            
            # SMARTER domain boost logic - graduated based on match strength
            matched_domain = None
            for domain, keywords in domain_keywords.items():
                job_has_domain = any(kw in job_text for kw in keywords)
                talent_has_domain = any(kw in talent_text for kw in keywords)
                
                if job_has_domain and talent_has_domain:
                    matched_domain = domain
                    
                    # GRADUATED BOOST based on base score
                    # High base score (70%+): Small boost (1.2x) - already good match
                    # Medium base score (40-70%): Medium boost (1.35x) - needs help
                    # Low base score (below 40%): Larger boost (1.5x) - significant domain advantage
                    if final_score >= 0.70:
                        boost_factor = 1.2  # 20% boost for already strong matches
                        boost_reason = f'domain_match_{domain}_strong'
                    elif final_score >= 0.40:
                        boost_factor = 1.35  # 35% boost for medium matches
                        boost_reason = f'domain_match_{domain}_medium'
                    else:
                        boost_factor = 1.5  # 50% boost for weak matches with domain alignment
                        boost_reason = f'domain_match_{domain}_weak'
                    
                    boost_applied = True
                    break
            
            # Check for cross-functional transferable roles (e.g., IT developer → IT instructor)
            if matched_domain and not boost_applied:
                job_role = None
                talent_role = None
                
                for role, keywords in role_types.items():
                    if any(kw in job_text for kw in keywords):
                        job_role = role
                    if any(kw in talent_text for kw in keywords):
                        talent_role = role
                
                # Special case: Developer can teach if they have teaching indicators
                if job_role == 'instructor' and talent_role == 'developer':
                    has_teaching_ability = any(
                        any(skill in talent_text for skill in skills)
                        for skills in transferable_skills.values()
                    )
                    if has_teaching_ability:
                        boost_factor = 1.35  # Cross-functional boost (reduced from 1.4)
                        boost_applied = True
                        boost_reason = f'transferable_{matched_domain}_developer_to_instructor'
            
            # Add boost details to breakdown
            if boost_applied:
                component_details.append({
                    'name': 'domain_boost',
                    'raw_score': 1.0,
                    'weight': boost_factor - 1.0,  # Show the boost amount
                    'weighted_contribution': final_score * (boost_factor - 1.0),
                    'domain': matched_domain or 'transferable',
                    'reason': boost_reason
                })
                # Apply boost
                final_score = min(final_score * boost_factor, 1.0)  # Cap at 100%
        else:
            final_score = 0.0
        
        return jsonify({
            'score': float(final_score),
            'details': {
                'components': len(scores),
                'model': 'all-mpnet-base-v2',
                'method': 'multi-factor-weighted' + ('-boosted' if boost_applied else ''),
                'breakdown': component_details,
                'boost_applied': boost_applied
            }
        })
        
    except Exception as e:
        logger.error(f"Error calculating match: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    logger.info("🚀 Starting Embedding Service on port 5001...")
    app.run(host='0.0.0.0', port=5001, debug=False)
