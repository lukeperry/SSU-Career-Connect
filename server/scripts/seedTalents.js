require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Talent = require('../api/models/talent');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// SSU Programs by College
const ssuPrograms = [
  // Engineering
  'Bachelor of Science in Computer Engineering',
  'Bachelor of Science in Electronics Engineering',
  'Bachelor of Science in Electrical Engineering',
  'Bachelor of Science in Civil Engineering',
  
  // IT
  'Bachelor of Science in Information Technology',
  'Bachelor of Science in Computer Science',
  
  // Nursing & Health
  'Bachelor of Science in Nursing',
  'Bachelor of Science in Midwifery',
  
  // Education
  'Bachelor of Elementary Education',
  'Bachelor of Secondary Education Major in English',
  'Bachelor of Secondary Education Major in Mathematics',
  'Bachelor of Physical Education',
  
  // Arts & Sciences
  'Bachelor of Science in Biology',
  'Bachelor of Arts in Communication',
  'Bachelor of Science in Psychology',
  'Bachelor of Arts in Political Science',
  
  // Business
  'Bachelor of Science in Business Administration Major in Marketing',
  'Bachelor of Science in Accountancy',
  'Bachelor of Science in Entrepreneurship',
  
  // Marine
  'Bachelor of Science in Fisheries',
  'Bachelor of Science in Marine Biology'
];

// Skills by field
const techSkills = ['JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'MongoDB', 'Git', 'HTML/CSS', 'TypeScript', 'Vue.js', 'Angular'];
const engineeringSkills = ['AutoCAD', 'MATLAB', 'SolidWorks', 'Circuit Design', 'Project Management', 'Technical Drawing', 'Problem Solving'];
const businessSkills = ['Microsoft Excel', 'Data Analysis', 'Marketing Strategy', 'Financial Analysis', 'Sales', 'Customer Service', 'Leadership'];
const healthSkills = ['Patient Care', 'Medical Terminology', 'Clinical Skills', 'First Aid', 'Health Assessment', 'Documentation'];
const educationSkills = ['Curriculum Development', 'Classroom Management', 'Lesson Planning', 'Student Assessment', 'Communication'];
const creativeSkills = ['Adobe Photoshop', 'Graphic Design', 'Video Editing', 'Content Writing', 'Social Media Management', 'Canva'];

// Sample companies
const companies = [
  'Accenture Philippines', 'IBM Philippines', 'Smart Communications', 'Globe Telecom',
  'Jollibee Foods Corporation', 'San Miguel Corporation', 'Ayala Corporation', 'SM Investments',
  'PLDT', 'Convergys', 'Teleperformance', 'Concentrix', 'Freelance', 'None'
];

// Samar locations
const samarLocations = [
  { province: 'Samar (Western Samar)', city: 'Catbalogan City', barangay: 'Poblacion 1' },
  { province: 'Samar (Western Samar)', city: 'Calbayog City', barangay: 'Central' },
  { province: 'Samar (Western Samar)', city: 'Catbalogan City', barangay: 'Maguino-o' },
  { province: 'Northern Samar', city: 'Catarman', barangay: 'Poblacion' },
  { province: 'Eastern Samar', city: 'Borongan', barangay: 'Poblacion' },
  { province: 'Samar (Western Samar)', city: 'Paranas', barangay: 'Central' },
  { province: 'Samar (Western Samar)', city: 'Calbayog City', barangay: 'Obrero' },
  { province: 'Northern Samar', city: 'Laoang', barangay: 'Poblacion' },
];

// Generate realistic Filipino names
const firstNames = {
  male: ['Juan', 'Miguel', 'Gabriel', 'Rafael', 'Angelo', 'Joshua', 'Christian', 'Daniel', 'Mark', 'John', 'Paulo', 'Luis', 'Carlos', 'Rico', 'Vincent'],
  female: ['Maria', 'Ana', 'Isabella', 'Sofia', 'Gabriela', 'Nicole', 'Angelica', 'Patricia', 'Michelle', 'Katherine', 'Jasmine', 'Christine', 'Melissa', 'Angela', 'Cristina']
};

const lastNames = ['Santos', 'Reyes', 'Cruz', 'Bautista', 'Garcia', 'Mendoza', 'Torres', 'Flores', 'Rivera', 'Gomez', 'Ramos', 'Martinez', 'Fernandez', 'Lopez', 'Gonzales', 'Rodriguez', 'Castillo', 'Aquino', 'Villanueva', 'Morales'];

// Talent personas with different backgrounds
const talentPersonas = [
  {
    type: 'Fresh Graduate - IT',
    degree: 'Bachelor of Science in Information Technology',
    skills: [...techSkills.slice(0, 6), 'Problem Solving', 'Teamwork'],
    employmentStatus: 'Unemployed',
    yearsOfExperience: 0,
    experience: 'Fresh graduate with strong academic background. Completed capstone project on web development. Participated in hackathons and coding competitions. Eager to start career in software development.',
    currentCompany: 'None',
    graduationYear: 2024
  },
  {
    type: 'Junior Developer',
    degree: 'Bachelor of Science in Computer Science',
    skills: [...techSkills.slice(0, 8), 'REST APIs', 'Docker'],
    employmentStatus: 'Employed',
    yearsOfExperience: 2,
    experience: 'Working as Junior Full Stack Developer for 2 years. Built and maintained web applications using React and Node.js. Collaborated with cross-functional teams. Implemented RESTful APIs and database designs.',
    currentCompany: 'Accenture Philippines',
    currentPosition: 'Junior Software Developer',
    graduationYear: 2022
  },
  {
    type: 'Senior Developer',
    degree: 'Bachelor of Science in Computer Engineering',
    skills: [...techSkills, 'Kubernetes', 'AWS', 'System Design', 'Team Leadership'],
    employmentStatus: 'Employed',
    yearsOfExperience: 5,
    experience: 'Senior Full Stack Developer with 5 years experience. Led development teams in multiple projects. Expert in cloud technologies and microservices architecture. Mentored junior developers.',
    currentCompany: 'IBM Philippines',
    currentPosition: 'Senior Software Engineer',
    graduationYear: 2019
  },
  {
    type: 'Registered Nurse',
    degree: 'Bachelor of Science in Nursing',
    skills: [...healthSkills, 'Emergency Care', 'IV Therapy', 'Compassion'],
    employmentStatus: 'Employed',
    yearsOfExperience: 3,
    experience: 'Licensed Registered Nurse with 3 years hospital experience. Provided patient care in medical-surgical units. Skilled in emergency procedures and patient assessment. Strong communication skills.',
    currentCompany: 'Samar Provincial Hospital',
    currentPosition: 'Staff Nurse',
    graduationYear: 2021
  },
  {
    type: 'Fresh Graduate - Nursing',
    degree: 'Bachelor of Science in Nursing',
    skills: [...healthSkills.slice(0, 5), 'Teamwork', 'Time Management'],
    employmentStatus: 'Unemployed',
    yearsOfExperience: 0,
    experience: 'Fresh graduate, board exam passer. Completed clinical rotations in various hospital departments. Strong foundation in nursing fundamentals and patient care. Seeking first nursing position.',
    currentCompany: 'None',
    graduationYear: 2024
  },
  {
    type: 'Electrical Engineer',
    degree: 'Bachelor of Science in Electrical Engineering',
    skills: [...engineeringSkills, 'Power Systems', 'Electrical Design', 'PLC Programming'],
    employmentStatus: 'Employed',
    yearsOfExperience: 4,
    experience: 'Licensed Electrical Engineer with 4 years experience in power systems and electrical design. Worked on commercial and industrial projects. Proficient in AutoCAD and electrical simulation software.',
    currentCompany: 'Meralco',
    currentPosition: 'Electrical Engineer',
    graduationYear: 2020
  },
  {
    type: 'Fresh Graduate - Civil Engineering',
    degree: 'Bachelor of Science in Civil Engineering',
    skills: [...engineeringSkills.slice(0, 6), 'Surveying', 'Construction Management'],
    employmentStatus: 'Unemployed',
    yearsOfExperience: 0,
    experience: 'Fresh graduate with on-the-job training experience in construction sites. Familiar with AutoCAD and structural analysis. Strong analytical and problem-solving skills. Ready to take board exam.',
    currentCompany: 'None',
    graduationYear: 2024
  },
  {
    type: 'Marketing Professional',
    degree: 'Bachelor of Science in Business Administration Major in Marketing',
    skills: [...businessSkills, 'Digital Marketing', 'SEO', 'Content Marketing', ...creativeSkills.slice(0, 4)],
    employmentStatus: 'Employed',
    yearsOfExperience: 3,
    experience: 'Marketing Specialist with 3 years experience in digital marketing campaigns. Managed social media accounts and created engaging content. Skilled in SEO, email marketing, and analytics.',
    currentCompany: 'SM Investments',
    currentPosition: 'Marketing Specialist',
    graduationYear: 2021
  },
  {
    type: 'Accountant',
    degree: 'Bachelor of Science in Accountancy',
    skills: [...businessSkills, 'QuickBooks', 'Tax Preparation', 'Auditing', 'Financial Reporting'],
    employmentStatus: 'Employed',
    yearsOfExperience: 5,
    experience: 'Licensed CPA with 5 years experience in accounting and auditing. Managed financial statements, tax compliance, and internal audits. Expert in accounting software and financial analysis.',
    currentCompany: 'Ayala Corporation',
    currentPosition: 'Senior Accountant',
    graduationYear: 2019
  },
  {
    type: 'Teacher',
    degree: 'Bachelor of Elementary Education',
    skills: [...educationSkills, 'Child Development', 'Educational Technology', 'Patience'],
    employmentStatus: 'Employed',
    yearsOfExperience: 6,
    experience: 'Licensed Professional Teacher with 6 years teaching experience. Handled elementary classes with focus on holistic child development. Created engaging lesson plans and assessments.',
    currentCompany: 'DepEd - Samar Division',
    currentPosition: 'Elementary Teacher',
    graduationYear: 2018
  },
  {
    type: 'Graphic Designer',
    degree: 'Bachelor of Arts in Communication',
    skills: [...creativeSkills, 'UI/UX Design', 'Branding', 'Typography', 'Adobe Illustrator'],
    employmentStatus: 'Self-Employed',
    yearsOfExperience: 3,
    experience: 'Freelance Graphic Designer with 3 years experience. Created branding materials, social media graphics, and marketing collaterals for various clients. Skilled in Adobe Creative Suite.',
    currentCompany: 'Freelance',
    currentPosition: 'Freelance Graphic Designer',
    graduationYear: 2021
  },
  {
    type: 'Customer Service Representative',
    degree: 'Bachelor of Science in Business Administration',
    skills: ['Customer Service', 'Communication', 'Problem Solving', 'Microsoft Office', 'CRM Software', 'Conflict Resolution'],
    employmentStatus: 'Employed',
    yearsOfExperience: 2,
    experience: 'Customer Service Representative with 2 years BPO experience. Handled customer inquiries and complaints via phone and email. Consistently met performance metrics and customer satisfaction goals.',
    currentCompany: 'Teleperformance',
    currentPosition: 'Customer Service Representative',
    graduationYear: 2022
  },
  {
    type: 'Data Analyst',
    degree: 'Bachelor of Science in Information Technology',
    skills: [...businessSkills, 'Python', 'SQL', 'Tableau', 'Power BI', 'Data Visualization', 'Statistics'],
    employmentStatus: 'Employed',
    yearsOfExperience: 3,
    experience: 'Data Analyst with 3 years experience in business intelligence and data visualization. Created dashboards and reports using Tableau and Power BI. Proficient in SQL and Python for data analysis.',
    currentCompany: 'Globe Telecom',
    currentPosition: 'Data Analyst',
    graduationYear: 2021
  },
  {
    type: 'Underemployed - Engineering Graduate',
    degree: 'Bachelor of Science in Electronics Engineering',
    skills: [...engineeringSkills, 'Electronics Repair', 'Soldering', 'Troubleshooting'],
    employmentStatus: 'Underemployed',
    yearsOfExperience: 1,
    experience: 'Electronics Engineering graduate currently working in retail. Seeking engineering position to utilize technical skills. Has background in circuit design and electronics troubleshooting.',
    currentCompany: 'SM Supermalls',
    currentPosition: 'Sales Associate',
    graduationYear: 2023
  },
  {
    type: 'Career Shifter - IT',
    degree: 'Bachelor of Science in Psychology',
    skills: ['HTML/CSS', 'JavaScript', 'React', 'Problem Solving', 'Communication', 'Research', 'Critical Thinking'],
    employmentStatus: 'Unemployed',
    yearsOfExperience: 2,
    experience: 'Psychology graduate who completed web development bootcamp. 2 years HR experience but passionate about tech. Built several portfolio projects. Seeking entry-level developer role.',
    currentCompany: 'None',
    graduationYear: 2020
  }
];

// Map degrees to colleges
const degreeToCollege = {
  // Engineering
  'Bachelor of Science in Computer Engineering': 'College of Engineering',
  'Bachelor of Science in Electronics Engineering': 'College of Engineering',
  'Bachelor of Science in Electrical Engineering': 'College of Engineering',
  'Bachelor of Science in Civil Engineering': 'College of Engineering',

  // IT (now part of Arts and Sciences)
  'Bachelor of Science in Information Technology': 'College of Arts and Sciences',
  'Bachelor of Science in Computer Science': 'College of Arts and Sciences',

  // Nursing & Health
  'Bachelor of Science in Nursing': 'College of Nursing',
  'Bachelor of Science in Midwifery': 'College of Nursing',

  // Education
  'Bachelor of Elementary Education': 'College of Education',
  'Bachelor of Secondary Education Major in English': 'College of Education',
  'Bachelor of Secondary Education Major in Mathematics': 'College of Education',
  'Bachelor of Physical Education': 'College of Education',

  // Arts & Sciences
  'Bachelor of Science in Biology': 'College of Arts and Sciences',
  'Bachelor of Arts in Communication': 'College of Arts and Sciences',
  'Bachelor of Science in Psychology': 'College of Arts and Sciences',
  'Bachelor of Arts in Political Science': 'College of Arts and Sciences',

  // Business
  'Bachelor of Science in Business Administration Major in Marketing': 'College of Business',
  'Bachelor of Science in Accountancy': 'College of Business',
  'Bachelor of Science in Entrepreneurship': 'College of Business',

  // Marine
  'Bachelor of Science in Fisheries': 'College of Fisheries',
  'Bachelor of Science in Marine Biology': 'College of Fisheries',
};

// Helper function to get random item from array
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper function to get random items from array
const getRandomItems = (arr, count) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Generate birth date for age 22-35
const generateBirthDate = (age) => {
  const year = new Date().getFullYear() - age;
  const month = Math.floor(Math.random() * 12);
  const day = Math.floor(Math.random() * 28) + 1;
  return new Date(year, month, day);
};

// Generate talents
const generateTalents = async () => {
  try {
    console.log('🔄 Starting talent generation...\n');
    
  // Delete all talents with emails ending in '@test.com'
  await Talent.deleteMany({ email: /@test\.com$/ });
  console.log('🗑️  Deleted all talents with emails ending in @test.com\n');
    
    const talents = [];
    
    // Create 30 talents by repeating personas
  for (let i = 0; i < 100; i++) {
      const persona = talentPersonas[i % talentPersonas.length];
      const gender = Math.random() > 0.5 ? 'Male' : 'Female';
      const firstName = getRandomItem(firstNames[gender.toLowerCase()]);
      const lastName = getRandomItem(lastNames);
      const age = Math.floor(Math.random() * 14) + 22; // 22-35 years old
      const location = getRandomItem(samarLocations);
      // Create email and username
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@test.com`;
      const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${i + 1}`;
      // Hash password before using
      const password = await bcrypt.hash('Test123!', 10);
      // Find college based on degree
      const college = degreeToCollege[persona.degree] || 'Other';
      // Build talent data
      const talentData = {
        firstName,
        lastName,
        gender,
        username,
        email,
        password,
        phoneNumber: `+639${Math.floor(100000000 + Math.random() * 900000000)}`,
        birthday: generateBirthDate(age),
        province: location.province,
        city: location.city,
        barangay: location.barangay,
        location: `${location.barangay}, ${location.city}, ${location.province}`,
        graduationYear: persona.graduationYear,
        school: 'Samar State University',
        degree: persona.degree,
        college,
        isSSUGraduate: true,
        educationLevel: 'Bachelor\'s Degree',
        
        // Professional
        skills: persona.skills,
        experience: persona.experience,
        employmentStatus: persona.employmentStatus,
        currentCompany: persona.currentCompany,
        currentPosition: persona.currentPosition || '',
        yearsOfExperience: persona.yearsOfExperience,
        
        // Civil status variation
        civilStatus: age < 25 ? 'Single' : getRandomItem(['Single', 'Married', 'Single']),
        
        // Account status
        isActive: true,
        accountStatus: 'Active',
        verifiedEmail: true,
        
        // Profile completion (will be calculated by pre-save hook)
        profileCompleted: persona.yearsOfExperience > 0,
      };
      
      talents.push(talentData);
      
      console.log(`✅ Generated: ${firstName} ${lastName} - ${persona.type}`);
    }
    
    // Upsert all talents by email
    console.log('\n🔄 Upserting talents into database...\n');
    let upsertedCount = 0;
    for (const talentData of talents) {
      // Upsert talent
      const updatedTalent = await Talent.findOneAndUpdate(
        { email: talentData.email },
        talentData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      // Calculate and set age if birthday exists
      if (updatedTalent && updatedTalent.birthday) {
        const today = new Date();
        const birthDate = new Date(updatedTalent.birthday);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        updatedTalent.age = age;
        await updatedTalent.save();
      }
      upsertedCount++;
    }
    console.log(`\n✅ Successfully upserted ${upsertedCount} test talents!`);
    
    console.log('\n📊 Summary by Type:');
    
    // Count by persona type
    const typeCounts = {};
    talents.forEach((t, i) => {
      const type = talentPersonas[i % talentPersonas.length].type;
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    
    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });
    
    console.log('\n📝 Test Credentials:');
    console.log('   Email: [firstname].[lastname][number]@test.com');
    console.log('   Password: Test123!');
    console.log('   Example: juan.santos1@test.com / Test123!\n');
    
  } catch (error) {
    console.error('❌ Error generating talents:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the script
generateTalents();
