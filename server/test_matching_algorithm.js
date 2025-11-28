/**
 * Comprehensive Test Suite for Enhanced Matching Algorithm
 * Tests 20 diverse talents across various fields against multiple jobs
 * 
 * Expected Results:
 * - Same domain matches: 75-100%
 * - Cross-functional matches (e.g., developer → instructor): 60-80%
 * - Different domain matches: 20-50%
 * - No relevance: 0-25%
 */

const axios = require('axios');

// Test Jobs
const testJobs = [
    {
        id: 1,
        title: "Software Engineer",
        description: "Develop web applications using JavaScript, React, and Node.js",
        requirements: "3+ years of software development experience",
        skills: ["JavaScript", "React", "Node.js", "MongoDB"]
    },
    {
        id: 2,
        title: "IT Instructor",
        description: "Teach programming, web development, and computer science",
        requirements: "Experience with software development and teaching",
        skills: ["JavaScript", "Python", "Teaching", "Communication"]
    },
    {
        id: 3,
        title: "Pharmacy Assistant",
        description: "Assist pharmacists with prescription processing and customer service",
        requirements: "2+ years pharmacy experience, knowledge of pharmaceutical terminology",
        skills: ["Customer Service", "Medical Terminology", "Inventory Management"]
    },
    {
        id: 4,
        title: "Registered Nurse",
        description: "Provide patient care in hospital settings",
        requirements: "Valid RN license, 2+ years clinical experience",
        skills: ["Patient Care", "Medical Procedures", "Communication", "Teamwork"]
    },
    {
        id: 5,
        title: "Administrative Assistant",
        description: "Provide administrative support including scheduling and correspondence",
        requirements: "5+ years administrative experience",
        skills: ["Microsoft Office", "Communication", "Organization", "Time Management"]
    },
    {
        id: 6,
        title: "Customer Service Representative",
        description: "Handle customer inquiries and resolve issues",
        requirements: "2+ years customer service experience",
        skills: ["Customer Service", "Communication", "Problem Solving"]
    },
    {
        id: 7,
        title: "UI/UX Designer",
        description: "Design user interfaces and user experiences for web applications",
        requirements: "3+ years design experience, portfolio required",
        skills: ["Figma", "Adobe XD", "HTML", "CSS", "User Research"]
    },
    {
        id: 8,
        title: "Accountant",
        description: "Manage financial records and prepare tax documents",
        requirements: "CPA license, 5+ years accounting experience",
        skills: ["Accounting", "QuickBooks", "Tax Preparation", "Financial Analysis"]
    }
];

// Test Talents (20 diverse profiles)
const testTalents = [
    {
        id: 1,
        name: "John Doe - Full Stack Developer",
        experience: "Full Stack Software Engineer with 5 years of experience building scalable web applications using JavaScript, React, Node.js, and MongoDB. Proficient in RESTful API development and cloud deployment.",
        skills: ["JavaScript", "React", "Node.js", "MongoDB", "Git", "HTML", "CSS"]
    },
    {
        id: 2,
        name: "Jane Smith - IT Instructor",
        experience: "Computer Science instructor with 8 years of teaching experience. Expert in programming languages including JavaScript, Python, and Java. Passionate about mentoring students and explaining technical concepts.",
        skills: ["JavaScript", "Python", "Java", "Teaching", "Communication", "Curriculum Development"]
    },
    {
        id: 3,
        name: "Maria Garcia - Pharmacy Tech",
        experience: "Pharmacy Assistant with 4 years of experience in retail pharmacy settings. Skilled in prescription processing, customer service, inventory management, and pharmaceutical terminology.",
        skills: ["Customer Service", "Medical Terminology", "Inventory Management", "Prescription Processing"]
    },
    {
        id: 4,
        name: "Sarah Johnson - Registered Nurse",
        experience: "Registered Nurse with 6 years of clinical experience in hospital settings. Expert in patient care, medical procedures, and healthcare team collaboration. Valid RN license.",
        skills: ["Patient Care", "Medical Procedures", "Clinical Skills", "Communication", "Teamwork"]
    },
    {
        id: 5,
        name: "Michael Brown - Executive Assistant",
        experience: "Executive Administrative Assistant with 10 years of experience providing high-level administrative support. Expert in office management, scheduling, correspondence, and Microsoft Office Suite.",
        skills: ["Microsoft Office", "Communication", "Organization", "Time Management", "Scheduling"]
    },
    {
        id: 6,
        name: "Emily Davis - Customer Service Pro",
        experience: "Customer Service Representative with 5 years of experience handling customer inquiries, resolving complaints, and maintaining high satisfaction ratings. Excellent communication skills.",
        skills: ["Customer Service", "Communication", "Problem Solving", "Conflict Resolution"]
    },
    {
        id: 7,
        name: "David Wilson - UX Designer",
        experience: "UI/UX Designer with 4 years of experience creating user-centered designs for web and mobile applications. Proficient in Figma, Adobe XD, and user research methodologies.",
        skills: ["Figma", "Adobe XD", "HTML", "CSS", "User Research", "Prototyping", "Wireframing"]
    },
    {
        id: 8,
        name: "Lisa Martinez - CPA",
        experience: "Certified Public Accountant with 7 years of experience in financial accounting, tax preparation, and audit. Expert in QuickBooks and financial analysis.",
        skills: ["Accounting", "QuickBooks", "Tax Preparation", "Financial Analysis", "Audit"]
    },
    {
        id: 9,
        name: "Robert Taylor - Frontend Developer",
        experience: "Frontend Developer specializing in React and modern JavaScript. 3 years of experience building responsive web applications with focus on user experience.",
        skills: ["JavaScript", "React", "HTML", "CSS", "TypeScript", "Redux"]
    },
    {
        id: 10,
        name: "Jennifer Anderson - Python Developer",
        experience: "Software Engineer with 4 years of experience in Python development, data analysis, and backend systems. Proficient in Django, Flask, and database design.",
        skills: ["Python", "Django", "Flask", "SQL", "Data Analysis", "API Development"]
    },
    {
        id: 11,
        name: "Christopher Lee - Career Changer (Pharmacy to Nursing)",
        experience: "Pharmacy Assistant with 5 years of healthcare experience, currently pursuing RN license. Strong background in patient interaction and medical terminology.",
        skills: ["Customer Service", "Medical Terminology", "Patient Care", "Healthcare"]
    },
    {
        id: 12,
        name: "Amanda White - Career Changer (Dev to Teaching)",
        experience: "Software Developer with 6 years of programming experience, now transitioning to education. Experience mentoring junior developers and teaching programming workshops.",
        skills: ["JavaScript", "Python", "Teaching", "Mentoring", "Communication"]
    },
    {
        id: 13,
        name: "Daniel Harris - Sales Manager",
        experience: "Sales Manager with 8 years of experience in B2B sales, business development, and account management. Proven track record of exceeding sales targets.",
        skills: ["Sales", "Business Development", "Account Management", "Communication", "Negotiation"]
    },
    {
        id: 14,
        name: "Jessica Clark - Marketing Specialist",
        experience: "Digital Marketing Specialist with 5 years of experience in social media marketing, content creation, SEO, and brand management.",
        skills: ["Marketing", "Social Media", "SEO", "Content Creation", "Analytics"]
    },
    {
        id: 15,
        name: "Matthew Lewis - HR Manager",
        experience: "Human Resources Manager with 7 years of experience in recruitment, employee relations, and talent management. Expert in HR policies and compliance.",
        skills: ["Human Resources", "Recruitment", "Employee Relations", "Talent Management"]
    },
    {
        id: 16,
        name: "Ashley Walker - Graphic Designer",
        experience: "Graphic Designer with 5 years of experience in branding, logo design, and print media. Proficient in Adobe Creative Suite.",
        skills: ["Graphic Design", "Adobe Illustrator", "Photoshop", "Branding", "Creative"]
    },
    {
        id: 17,
        name: "Joshua Hall - Entry Level IT",
        experience: "Recent Computer Science graduate with internship experience in web development. Familiar with JavaScript, HTML, CSS, and basic programming concepts.",
        skills: ["JavaScript", "HTML", "CSS", "Problem Solving", "Learning"]
    },
    {
        id: 18,
        name: "Nicole Allen - Nursing Student",
        experience: "Nursing student completing clinical rotations. Experience as nursing aide with patient care, vital signs monitoring, and healthcare documentation.",
        skills: ["Patient Care", "Communication", "Healthcare", "Teamwork"]
    },
    {
        id: 19,
        name: "Brandon Young - Admin Clerk",
        experience: "Administrative Clerk with 3 years of experience in data entry, filing, and basic office support. Familiar with Microsoft Office.",
        skills: ["Data Entry", "Microsoft Office", "Organization", "Filing"]
    },
    {
        id: 20,
        name: "Rachel King - Generalist",
        experience: "Versatile professional with experience in customer service, basic administration, and retail management. Strong interpersonal and organizational skills.",
        skills: ["Customer Service", "Communication", "Organization", "Teamwork", "Problem Solving"]
    }
];

// Expected match quality levels
const EXPECTED_LEVELS = {
    PERFECT: { min: 85, max: 100, label: "Perfect Match" },
    EXCELLENT: { min: 70, max: 84, label: "Excellent Match" },
    GOOD: { min: 55, max: 69, label: "Good Match" },
    MODERATE: { min: 40, max: 54, label: "Moderate Match" },
    LOW: { min: 25, max: 39, label: "Low Match" },
    POOR: { min: 0, max: 24, label: "Poor Match" }
};

// Expected results matrix (Talent ID -> Job ID -> Expected Level)
const expectedResults = {
    1: { 1: "PERFECT", 2: "EXCELLENT", 7: "GOOD", 3: "POOR", 4: "POOR", 5: "MODERATE", 6: "MODERATE", 8: "POOR" },
    2: { 2: "PERFECT", 1: "EXCELLENT", 7: "MODERATE", 3: "POOR", 4: "POOR", 5: "MODERATE", 6: "MODERATE", 8: "POOR" },
    3: { 3: "PERFECT", 4: "GOOD", 6: "GOOD", 1: "POOR", 2: "POOR", 5: "MODERATE", 7: "POOR", 8: "POOR" },
    4: { 4: "PERFECT", 3: "GOOD", 6: "MODERATE", 1: "POOR", 2: "POOR", 5: "MODERATE", 7: "POOR", 8: "POOR" },
    5: { 5: "PERFECT", 6: "GOOD", 1: "MODERATE", 2: "MODERATE", 3: "MODERATE", 4: "MODERATE", 7: "MODERATE", 8: "MODERATE" },
    6: { 6: "PERFECT", 5: "GOOD", 3: "MODERATE", 4: "MODERATE", 1: "MODERATE", 2: "MODERATE", 7: "MODERATE", 8: "MODERATE" },
    7: { 7: "PERFECT", 1: "EXCELLENT", 2: "MODERATE", 5: "MODERATE", 6: "MODERATE", 3: "POOR", 4: "POOR", 8: "POOR" },
    8: { 8: "PERFECT", 5: "MODERATE", 6: "MODERATE", 1: "POOR", 2: "POOR", 3: "POOR", 4: "POOR", 7: "POOR" },
    9: { 1: "EXCELLENT", 7: "EXCELLENT", 2: "GOOD", 5: "MODERATE", 6: "MODERATE", 3: "POOR", 4: "POOR", 8: "POOR" },
    10: { 1: "GOOD", 2: "GOOD", 7: "MODERATE", 5: "MODERATE", 6: "MODERATE", 3: "POOR", 4: "POOR", 8: "POOR" },
    11: { 3: "EXCELLENT", 4: "EXCELLENT", 6: "GOOD", 1: "POOR", 2: "POOR", 5: "MODERATE", 7: "POOR", 8: "POOR" },
    12: { 2: "PERFECT", 1: "EXCELLENT", 7: "MODERATE", 3: "POOR", 4: "POOR", 5: "MODERATE", 6: "MODERATE", 8: "POOR" },
    13: { 6: "GOOD", 5: "MODERATE", 1: "MODERATE", 2: "MODERATE", 3: "MODERATE", 4: "MODERATE", 7: "MODERATE", 8: "MODERATE" },
    14: { 6: "MODERATE", 5: "MODERATE", 1: "MODERATE", 2: "MODERATE", 3: "MODERATE", 4: "MODERATE", 7: "MODERATE", 8: "MODERATE" },
    15: { 5: "GOOD", 6: "MODERATE", 1: "MODERATE", 2: "MODERATE", 3: "MODERATE", 4: "MODERATE", 7: "MODERATE", 8: "MODERATE" },
    16: { 7: "GOOD", 5: "MODERATE", 6: "MODERATE", 1: "MODERATE", 2: "MODERATE", 3: "POOR", 4: "POOR", 8: "POOR" },
    17: { 1: "GOOD", 2: "GOOD", 7: "MODERATE", 5: "MODERATE", 6: "MODERATE", 3: "POOR", 4: "POOR", 8: "POOR" },
    18: { 4: "GOOD", 3: "MODERATE", 6: "MODERATE", 1: "POOR", 2: "POOR", 5: "MODERATE", 7: "POOR", 8: "POOR" },
    19: { 5: "GOOD", 6: "MODERATE", 1: "MODERATE", 2: "MODERATE", 3: "MODERATE", 4: "MODERATE", 7: "MODERATE", 8: "MODERATE" },
    20: { 6: "GOOD", 5: "GOOD", 3: "MODERATE", 4: "MODERATE", 1: "MODERATE", 2: "MODERATE", 7: "MODERATE", 8: "MODERATE" }
};

async function testMatch(job, talent) {
    try {
        const response = await axios.post('http://localhost:5001/match', {
            job: {
                title: job.title,
                description: job.description,
                requirements: job.requirements,
                skills: job.skills
            },
            talent: {
                experience: talent.experience,
                skills: talent.skills
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error testing ${talent.name} vs ${job.title}:`, error.message);
        return null;
    }
}

function getMatchLevel(score) {
    const percentage = score * 100;
    for (const [level, range] of Object.entries(EXPECTED_LEVELS)) {
        if (percentage >= range.min && percentage <= range.max) {
            return level;
        }
    }
    return "UNKNOWN";
}

function compareResults(expected, actual) {
    if (expected === actual) return "✅ PASS";
    
    const levels = Object.keys(EXPECTED_LEVELS);
    const expectedIndex = levels.indexOf(expected);
    const actualIndex = levels.indexOf(actual);
    const diff = Math.abs(expectedIndex - actualIndex);
    
    if (diff === 1) return "⚠️  CLOSE (off by 1 level)";
    return "❌ FAIL";
}

async function runTests() {
    console.log("\n" + "=".repeat(80));
    console.log("🧪 COMPREHENSIVE MATCHING ALGORITHM TEST SUITE");
    console.log("=".repeat(80) + "\n");
    
    const results = {
        total: 0,
        passed: 0,
        close: 0,
        failed: 0,
        scores: []
    };
    
    // Test each talent against selected jobs
    for (const talent of testTalents) {
        console.log(`\n👤 Testing: ${talent.name}`);
        console.log("-".repeat(80));
        
        const talentExpected = expectedResults[talent.id];
        if (!talentExpected) continue;
        
        for (const [jobIdStr, expectedLevel] of Object.entries(talentExpected)) {
            const jobId = parseInt(jobIdStr);
            const job = testJobs.find(j => j.id === jobId);
            if (!job) continue;
            
            const matchResult = await testMatch(job, talent);
            if (!matchResult) continue;
            
            const score = matchResult.score;
            const percentage = (score * 100).toFixed(1);
            const actualLevel = getMatchLevel(score);
            const comparison = compareResults(expectedLevel, actualLevel);
            
            results.total++;
            if (comparison.includes("PASS")) results.passed++;
            else if (comparison.includes("CLOSE")) results.close++;
            else results.failed++;
            
            results.scores.push({
                talent: talent.name,
                job: job.title,
                score: percentage,
                expected: expectedLevel,
                actual: actualLevel,
                status: comparison
            });
            
            // Show result
            const expectedRange = EXPECTED_LEVELS[expectedLevel];
            console.log(
                `  ${comparison} ${job.title.padEnd(30)} | ` +
                `Score: ${percentage}% | ` +
                `Expected: ${expectedLevel} (${expectedRange.min}-${expectedRange.max}%) | ` +
                `Actual: ${actualLevel}`
            );
            
            // Show breakdown for failed tests
            if (comparison.includes("FAIL") && matchResult.details?.breakdown) {
                console.log(`      📊 Breakdown:`);
                matchResult.details.breakdown.forEach(comp => {
                    console.log(
                        `         ${comp.name.padEnd(25)}: ${(comp.raw_score * 100).toFixed(1)}% ` +
                        `(weight: ${(comp.weight * 100).toFixed(0)}%) → ${(comp.weighted_contribution * 100).toFixed(1)}%`
                    );
                });
            }
        }
    }
    
    // Summary
    console.log("\n" + "=".repeat(80));
    console.log("📊 TEST RESULTS SUMMARY");
    console.log("=".repeat(80));
    console.log(`Total Tests: ${results.total}`);
    console.log(`✅ Passed: ${results.passed} (${((results.passed / results.total) * 100).toFixed(1)}%)`);
    console.log(`⚠️  Close: ${results.close} (${((results.close / results.total) * 100).toFixed(1)}%)`);
    console.log(`❌ Failed: ${results.failed} (${((results.failed / results.total) * 100).toFixed(1)}%)`);
    console.log(`🎯 Accuracy: ${(((results.passed + results.close) / results.total) * 100).toFixed(1)}%`);
    
    // Show failed tests
    if (results.failed > 0) {
        console.log("\n" + "=".repeat(80));
        console.log("❌ FAILED TESTS (Need Algorithm Adjustment):");
        console.log("=".repeat(80));
        results.scores
            .filter(r => r.status.includes("FAIL"))
            .forEach(r => {
                console.log(
                    `${r.talent.padEnd(35)} | ${r.job.padEnd(30)} | ` +
                    `Score: ${r.score}% | Expected: ${r.expected} | Actual: ${r.actual}`
                );
            });
    }
    
    console.log("\n" + "=".repeat(80) + "\n");
}

// Run the tests
runTests().catch(error => {
    console.error("Test suite error:", error);
    process.exit(1);
});
