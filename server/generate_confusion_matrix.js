/**
 * Generate Confusion Matrix for Matching Algorithm
 * 
 * Analyzes test results to create a confusion matrix showing
 * how predicted match levels compare to expected match levels
 */

const axios = require('axios');

// Match quality levels (same as test suite)
const LEVELS = ['PERFECT', 'EXCELLENT', 'GOOD', 'MODERATE', 'LOW', 'POOR'];

const EXPECTED_LEVELS = {
    PERFECT: { min: 85, max: 100, label: "Perfect Match" },
    EXCELLENT: { min: 70, max: 84, label: "Excellent Match" },
    GOOD: { min: 55, max: 69, label: "Good Match" },
    MODERATE: { min: 40, max: 54, label: "Moderate Match" },
    LOW: { min: 25, max: 39, label: "Low Match" },
    POOR: { min: 0, max: 24, label: "Poor Match" }
};

// Test data (same as test_matching_algorithm.js)
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

function initializeConfusionMatrix() {
    const matrix = {};
    for (const expected of LEVELS) {
        matrix[expected] = {};
        for (const predicted of LEVELS) {
            matrix[expected][predicted] = 0;
        }
    }
    return matrix;
}

async function generateConfusionMatrix() {
    console.log("\n" + "=".repeat(80));
    console.log("📊 GENERATING CONFUSION MATRIX");
    console.log("=".repeat(80) + "\n");

    const confusionMatrix = initializeConfusionMatrix();
    let totalTests = 0;
    
    // Collect all results
    for (const talent of testTalents) {
        const talentExpected = expectedResults[talent.id];
        if (!talentExpected) continue;
        
        for (const [jobIdStr, expectedLevel] of Object.entries(talentExpected)) {
            const jobId = parseInt(jobIdStr);
            const job = testJobs.find(j => j.id === jobId);
            if (!job) continue;
            
            const matchResult = await testMatch(job, talent);
            if (!matchResult) continue;
            
            const actualLevel = getMatchLevel(matchResult.score);
            
            // Update confusion matrix
            if (confusionMatrix[expectedLevel] && confusionMatrix[expectedLevel][actualLevel] !== undefined) {
                confusionMatrix[expectedLevel][actualLevel]++;
            } else {
                // Handle UNKNOWN predictions
                if (!confusionMatrix[expectedLevel]['UNKNOWN']) {
                    confusionMatrix[expectedLevel]['UNKNOWN'] = 0;
                }
                confusionMatrix[expectedLevel]['UNKNOWN']++;
            }
            
            totalTests++;
        }
    }
    
    // Print Confusion Matrix
    console.log("\n" + "=".repeat(120));
    console.log("CONFUSION MATRIX: Expected (Rows) vs Predicted (Columns)");
    console.log("=".repeat(120));
    
    // Header
    const header = "Expected".padEnd(15) + "│ " + 
        LEVELS.map(l => l.padEnd(10)).join(" │ ");
    console.log(header);
    console.log("─".repeat(120));
    
    // Rows
    let correctPredictions = 0;
    for (const expected of LEVELS) {
        let row = expected.padEnd(15) + "│ ";
        for (const predicted of LEVELS) {
            const count = confusionMatrix[expected][predicted] || 0;
            const cell = count > 0 ? count.toString().padEnd(10) : "-".padEnd(10);
            
            // Highlight diagonal (correct predictions)
            if (expected === predicted) {
                correctPredictions += count;
                row += `\x1b[32m${cell}\x1b[0m │ `;
            } else {
                row += `${cell} │ `;
            }
        }
        console.log(row);
    }
    
    console.log("=".repeat(120));
    
    // Calculate metrics
    console.log("\n" + "=".repeat(80));
    console.log("📈 CLASSIFICATION METRICS");
    console.log("=".repeat(80));
    
    console.log(`\nTotal Tests: ${totalTests}`);
    console.log(`Correct Predictions (Diagonal): ${correctPredictions}`);
    console.log(`Exact Accuracy: ${((correctPredictions / totalTests) * 100).toFixed(1)}%\n`);
    
    // Per-class metrics
    console.log("Per-Class Metrics:");
    console.log("─".repeat(80));
    console.log("Class        │ Precision │ Recall    │ F1-Score  │ Support");
    console.log("─".repeat(80));
    
    const classMetrics = {};
    
    for (const level of LEVELS) {
        // True Positives (diagonal)
        const tp = confusionMatrix[level][level] || 0;
        
        // False Positives (column sum - TP)
        let fp = 0;
        for (const expected of LEVELS) {
            if (expected !== level) {
                fp += confusionMatrix[expected][level] || 0;
            }
        }
        
        // False Negatives (row sum - TP)
        let fn = 0;
        for (const predicted of LEVELS) {
            if (predicted !== level) {
                fn += confusionMatrix[level][predicted] || 0;
            }
        }
        
        // Support (total in expected class)
        const support = tp + fn;
        
        // Precision, Recall, F1
        const precision = (tp + fp) > 0 ? (tp / (tp + fp)) : 0;
        const recall = (tp + fn) > 0 ? (tp / (tp + fn)) : 0;
        const f1 = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 0;
        
        classMetrics[level] = { precision, recall, f1, support };
        
        console.log(
            `${level.padEnd(12)} │ ` +
            `${(precision * 100).toFixed(1).padEnd(9)}% │ ` +
            `${(recall * 100).toFixed(1).padEnd(9)}% │ ` +
            `${(f1 * 100).toFixed(1).padEnd(9)}% │ ` +
            `${support}`
        );
    }
    
    // Macro and Weighted averages
    console.log("─".repeat(80));
    
    let macroPrec = 0, macroRec = 0, macroF1 = 0;
    let weightedPrec = 0, weightedRec = 0, weightedF1 = 0;
    let totalSupport = 0;
    
    for (const level of LEVELS) {
        const metrics = classMetrics[level];
        macroPrec += metrics.precision;
        macroRec += metrics.recall;
        macroF1 += metrics.f1;
        
        weightedPrec += metrics.precision * metrics.support;
        weightedRec += metrics.recall * metrics.support;
        weightedF1 += metrics.f1 * metrics.support;
        
        totalSupport += metrics.support;
    }
    
    macroPrec /= LEVELS.length;
    macroRec /= LEVELS.length;
    macroF1 /= LEVELS.length;
    
    weightedPrec /= totalSupport;
    weightedRec /= totalSupport;
    weightedF1 /= totalSupport;
    
    console.log(
        `${"Macro Avg".padEnd(12)} │ ` +
        `${(macroPrec * 100).toFixed(1).padEnd(9)}% │ ` +
        `${(macroRec * 100).toFixed(1).padEnd(9)}% │ ` +
        `${(macroF1 * 100).toFixed(1).padEnd(9)}% │ ` +
        `${totalSupport}`
    );
    
    console.log(
        `${"Weighted Avg".padEnd(12)} │ ` +
        `${(weightedPrec * 100).toFixed(1).padEnd(9)}% │ ` +
        `${(weightedRec * 100).toFixed(1).padEnd(9)}% │ ` +
        `${(weightedF1 * 100).toFixed(1).padEnd(9)}% │ ` +
        `${totalSupport}`
    );
    
    console.log("=".repeat(80));
    
    // Off-by-one accuracy
    let offByOneCorrect = correctPredictions;
    for (let i = 0; i < LEVELS.length; i++) {
        const expected = LEVELS[i];
        // Check adjacent levels
        if (i > 0) {
            offByOneCorrect += confusionMatrix[expected][LEVELS[i-1]] || 0;
        }
        if (i < LEVELS.length - 1) {
            offByOneCorrect += confusionMatrix[expected][LEVELS[i+1]] || 0;
        }
    }
    
    console.log(`\n✅ Exact Match Accuracy: ${((correctPredictions / totalTests) * 100).toFixed(1)}%`);
    console.log(`⚠️  Off-by-One Accuracy: ${((offByOneCorrect / totalTests) * 100).toFixed(1)}%`);
    console.log(`🎯 Overall System Accuracy: ${((offByOneCorrect / totalTests) * 100).toFixed(1)}%`);
    
    // Generate visual heatmap
    console.log("\n" + "=".repeat(80));
    console.log("🔥 HEATMAP (Normalized by Row)");
    console.log("=".repeat(80));
    
    console.log("\nColor scale: 🟩 High (>60%) | 🟨 Medium (30-60%) | 🟥 Low (<30%)");
    console.log("");
    
    // Header
    const heatmapHeader = "Expected".padEnd(15) + "│ " + 
        LEVELS.map(l => l.substring(0, 8).padEnd(10)).join(" │ ");
    console.log(heatmapHeader);
    console.log("─".repeat(120));
    
    for (const expected of LEVELS) {
        let row = expected.padEnd(15) + "│ ";
        
        // Calculate row sum for normalization
        let rowSum = 0;
        for (const predicted of LEVELS) {
            rowSum += confusionMatrix[expected][predicted] || 0;
        }
        
        for (const predicted of LEVELS) {
            const count = confusionMatrix[expected][predicted] || 0;
            const percentage = rowSum > 0 ? (count / rowSum) * 100 : 0;
            
            let emoji = "⬜";
            if (percentage >= 60) emoji = "🟩";
            else if (percentage >= 30) emoji = "🟨";
            else if (percentage > 0) emoji = "🟥";
            
            const cell = `${emoji} ${percentage.toFixed(0)}%`.padEnd(10);
            row += `${cell} │ `;
        }
        console.log(row);
    }
    
    console.log("=".repeat(120) + "\n");
}

// Run the confusion matrix generation
generateConfusionMatrix().catch(error => {
    console.error("Error generating confusion matrix:", error);
    process.exit(1);
});
