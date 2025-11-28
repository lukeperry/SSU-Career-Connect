#!/usr/bin/env python3
"""
Test script for embedding service
"""

from sentence_transformers import SentenceTransformer, util

print("🧪 Testing Sentence-Transformers...")

# Load model
print("📥 Loading model...")
model = SentenceTransformer('all-MiniLM-L6-v2')
print("✅ Model loaded!")

# Test texts
job_pharmacy = "Pharmacy Assistant with experience in retail pharmacy settings, prescription processing, medical terminology"
talent_pharmacy = "2 years of experience as Pharmacy Assistant in retail pharmacy. Proficient in prescription processing, inventory management, customer service."

job_software = "Software Engineer with JavaScript, Node.js, React experience. Web development, API design."
talent_software = "Full stack developer with 3 years JavaScript, Node.js, React. Built web applications."

print("\n🔬 Testing Pharmacy Match...")
embeddings = model.encode([job_pharmacy, talent_pharmacy], convert_to_tensor=True)
similarity = util.cos_sim(embeddings[0], embeddings[1]).item()
print(f"  Pharmacy Job ↔ Pharmacy Talent: {similarity:.1%}")

print("\n🔬 Testing Software Match...")
embeddings = model.encode([job_software, talent_software], convert_to_tensor=True)
similarity = util.cos_sim(embeddings[0], embeddings[1]).item()
print(f"  Software Job ↔ Software Talent: {similarity:.1%}")

print("\n🔬 Testing Cross-Domain Match...")
embeddings = model.encode([job_pharmacy, talent_software], convert_to_tensor=True)
similarity = util.cos_sim(embeddings[0], embeddings[1]).item()
print(f"  Pharmacy Job ↔ Software Talent: {similarity:.1%}")

embeddings = model.encode([job_software, talent_pharmacy], convert_to_tensor=True)
similarity = util.cos_sim(embeddings[0], embeddings[1]).item()
print(f"  Software Job ↔ Pharmacy Talent: {similarity:.1%}")

print("\n✅ All tests complete!")
print("\n📊 Expected Results:")
print("  - Pharmacy ↔ Pharmacy: 70-85% (HIGH)")
print("  - Software ↔ Software: 70-85% (HIGH)")
print("  - Pharmacy ↔ Software: 10-25% (LOW)")
