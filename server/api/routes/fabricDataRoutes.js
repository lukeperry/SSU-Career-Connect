// server/api/routes/fabricDataRoutes.js
const express = require('express');
const router = express.Router();
const Talent = require('../models/talent');
const Job = require('../models/job');
const Application = require('../models/application');
const { verifyToken } = require('../../utils/authMiddleware');

/**
 * Microsoft Fabric / Power BI Data Endpoints
 * These endpoints provide aggregated, analytics-ready data
 * for Power BI consumption
 */

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'Fabric Data API',
    timestamp: new Date().toISOString()
  });
});

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Access denied. Admin access required.' 
    });
  }
  next();
};

// Main dataset endpoint for Power BI
router.get('/dataset', verifyToken, isAdmin, async (req, res) => {
  try {
    const { entity, startDate, endDate, includePersonal } = req.query;
    
    // Only PLATFORM_ADMIN can access personal data
    const allowPersonal = includePersonal === 'true' && 
                         req.user.adminRole === 'PLATFORM_ADMIN';
    
    console.log(`Fabric API: Fetching ${entity} dataset for ${req.user.adminRole}`);
    
    switch(entity) {
      case 'demographics':
        return res.json(await getDemographicsDataset(startDate, endDate));
      case 'employment':
        return res.json(await getEmploymentDataset(startDate, endDate));
      case 'education':
        return res.json(await getEducationDataset(startDate, endDate));
      case 'jobs':
        return res.json(await getJobsDataset(startDate, endDate));
      case 'applications':
        return res.json(await getApplicationsDataset(startDate, endDate));
      case 'overview':
        return res.json(await getOverviewDataset(startDate, endDate));
      default:
        return res.status(400).json({ 
          error: 'Invalid entity type',
          validEntities: ['demographics', 'employment', 'education', 'jobs', 'applications', 'overview']
        });
    }
  } catch (error) {
    console.error('Fabric dataset error:', error);
    res.status(500).json({ 
      error: 'Failed to generate dataset',
      message: error.message 
    });
  }
});

// Overview KPIs
async function getOverviewDataset(startDate, endDate) {
  const dateFilter = {
    createdAt: { 
      $gte: new Date(startDate || '2020-01-01'),
      $lte: new Date(endDate || new Date())
    }
  };

  // Count SSU graduates by checking if school/university contains "Samar State University"
  const ssuGraduates = await Talent.countDocuments({
    ...dateFilter,
    $or: [
      { school: /Samar State University/i },
      { university: /Samar State University/i }
    ]
  });

  // Count hired talents by checking if they have been hired through the platform
  const hiredCount = await Talent.countDocuments({
    ...dateFilter,
    hiredThroughPlatform: true
  });

  // Application uses 'appliedAt' instead of 'createdAt'
  const applicationDateFilter = {
    appliedAt: { 
      $gte: new Date(startDate || '2020-01-01'),
      $lte: new Date(endDate || new Date())
    }
  };

  const [talentCount, jobCount, applicationCount, activeJobs] = await Promise.all([
    Talent.countDocuments(dateFilter),
    Job.countDocuments(dateFilter),
    Application.countDocuments(applicationDateFilter),
    Job.countDocuments({ ...dateFilter, status: 'open' })
  ]);

  return [{
    metric: 'Total Talents',
    value: talentCount,
    category: 'Users',
    timestamp: new Date()
  }, {
    metric: 'Total Jobs',
    value: jobCount,
    category: 'Jobs',
    timestamp: new Date()
  }, {
    metric: 'Active Jobs',
    value: activeJobs,
    category: 'Jobs',
    timestamp: new Date()
  }, {
    metric: 'Total Applications',
    value: applicationCount,
    category: 'Applications',
    timestamp: new Date()
  }, {
    metric: 'SSU Graduates',
    value: ssuGraduates,
    category: 'Education',
    timestamp: new Date()
  }, {
    metric: 'Successful Placements',
    value: hiredCount,
    category: 'Success',
    timestamp: new Date()
  }, {
    metric: 'Placement Rate',
    value: talentCount > 0 ? Math.round((hiredCount / talentCount) * 100) : 0,
    category: 'Success',
    timestamp: new Date()
  }];
}

// Aggregated demographics (no PII)
async function getDemographicsDataset(startDate, endDate) {
  const pipeline = [
    {
      $match: {
        createdAt: { 
          $gte: new Date(startDate || '2020-01-01'),
          $lte: new Date(endDate || new Date())
        }
      }
    },
    {
      $addFields: {
        age: {
          $floor: {
            $divide: [
              { $subtract: [new Date(), '$birthday'] },
              31557600000 // milliseconds in a year
            ]
          }
        }
      }
    },
    {
      $addFields: {
        ageGroup: {
          $switch: {
            branches: [
              { case: { $lt: ['$age', 18] }, then: 'Under 18' },
              { case: { $and: [{ $gte: ['$age', 18] }, { $lte: ['$age', 24] }] }, then: '18-24' },
              { case: { $and: [{ $gte: ['$age', 25] }, { $lte: ['$age', 34] }] }, then: '25-34' },
              { case: { $and: [{ $gte: ['$age', 35] }, { $lte: ['$age', 49] }] }, then: '35-49' },
              { case: { $gte: ['$age', 50] }, then: '50+' }
            ],
            default: 'Unknown'
          }
        }
      }
    },
    {
      $group: {
        _id: {
          ageGroup: '$ageGroup',
          gender: '$gender',
          province: '$province',
          city: '$city',
          barangay: '$barangay',
          location: '$location'
        },
        count: { $sum: 1 },
        avgExperience: { $avg: '$yearsOfExperience' },
        ssuGraduates: { 
          $sum: { 
            $cond: [
              {
                $or: [
                  { $regexMatch: { input: { $ifNull: ['$school', ''] }, regex: 'Samar State University', options: 'i' } },
                  { $regexMatch: { input: { $ifNull: ['$university', ''] }, regex: 'Samar State University', options: 'i' } }
                ]
              },
              1,
              0
            ]
          } 
        },
        employed: {
          $sum: { $cond: [{ $eq: ['$employmentStatus', 'Employed'] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        _id: 0,
        ageGroup: '$_id.ageGroup',
        gender: '$_id.gender',
        province: '$_id.province',
        city: '$_id.city',
        barangay: '$_id.barangay',
        location: '$_id.location',
        count: 1,
        avgExperience: { $round: ['$avgExperience', 1] },
        ssuGraduates: 1,
        employed: 1,
        percentSSU: { 
          $round: [{ $multiply: [{ $divide: ['$ssuGraduates', '$count'] }, 100] }, 1] 
        },
        employmentRate: {
          $round: [{ $multiply: [{ $divide: ['$employed', '$count'] }, 100] }, 1]
        }
      }
    },
    { $sort: { count: -1 } }
  ];
  
  return await Talent.aggregate(pipeline);
}

// Employment statistics
async function getEmploymentDataset(startDate, endDate) {
  const pipeline = [
    {
      $match: {
        createdAt: { 
          $gte: new Date(startDate || '2020-01-01'),
          $lte: new Date(endDate || new Date())
        }
      }
    },
    {
      $group: {
        _id: {
          employmentStatus: '$employmentStatus',
          educationLevel: '$educationLevel',
          location: '$location',
          industry: '$industry'
        },
        count: { $sum: 1 },
        avgSalaryMin: { $avg: '$expectedSalary.min' },
        avgSalaryMax: { $avg: '$expectedSalary.max' },
        avgExperience: { $avg: '$yearsOfExperience' },
        hiredCount: { 
          $sum: { $cond: ['$hiredThroughPlatform', 1, 0] } 
        },
        ssuGraduates: {
          $sum: { 
            $cond: [
              {
                $or: [
                  { $regexMatch: { input: { $ifNull: ['$school', ''] }, regex: 'Samar State University', options: 'i' } },
                  { $regexMatch: { input: { $ifNull: ['$university', ''] }, regex: 'Samar State University', options: 'i' } }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        employmentStatus: '$_id.employmentStatus',
        educationLevel: '$_id.educationLevel',
        location: '$_id.location',
        industry: '$_id.industry',
        count: 1,
        avgSalaryMin: { $round: ['$avgSalaryMin', 0] },
        avgSalaryMax: { $round: ['$avgSalaryMax', 0] },
        avgExperience: { $round: ['$avgExperience', 1] },
        hiredCount: 1,
        ssuGraduates: 1,
        placementRate: { 
          $round: [{ $multiply: [{ $divide: ['$hiredCount', '$count'] }, 100] }, 1] 
        }
      }
    },
    { $sort: { count: -1 } }
  ];
  
  return await Talent.aggregate(pipeline);
}

// Education statistics
async function getEducationDataset(startDate, endDate) {
  // Main education analytics pipeline
  const pipeline = [
    {
      $match: {
        createdAt: { 
          $gte: new Date(startDate || '2020-01-01'),
          $lte: new Date(endDate || new Date())
        },
        graduationYear: { $exists: true, $ne: null }
      }
    },
    {
      $addFields: {
        isSSUGrad: {
          $or: [
            { $regexMatch: { input: { $ifNull: ['$school', ''] }, regex: 'Samar State University', options: 'i' } },
            { $regexMatch: { input: { $ifNull: ['$university', ''] }, regex: 'Samar State University', options: 'i' } }
          ]
        }
      }
    },
    {
      $group: {
        _id: {
          educationLevel: '$educationLevel',
          school: '$school',
          college: '$college',
          major: '$major',
          graduationYear: '$graduationYear',
          isSSUGraduate: '$isSSUGrad'
        },
        count: { $sum: 1 },
        employed: { 
          $sum: { 
            $cond: [{ $eq: ['$employmentStatus', 'Employed'] }, 1, 0] 
          } 
        },
        seeking: {
          $sum: { 
            $cond: [{ $eq: ['$employmentStatus', 'Actively Seeking'] }, 1, 0] 
          }
        },
        hired: {
          $sum: { $cond: ['$hiredThroughPlatform', 1, 0] }
        }
      }
    },
    {
      $project: {
        _id: 0,
        educationLevel: '$_id.educationLevel',
        school: '$_id.school',
        college: '$_id.college',
        major: '$_id.major',
        graduationYear: '$_id.graduationYear',
        isSSUGraduate: '$_id.isSSUGraduate',
        count: 1,
        employed: 1,
        seeking: 1,
        hired: 1,
        employmentRate: { 
          $round: [{ $multiply: [{ $divide: ['$employed', '$count'] }, 100] }, 1] 
        },
        placementRate: {
          $round: [{ $multiply: [{ $divide: ['$hired', '$count'] }, 100] }, 1]
        }
      }
    },
    { $sort: { count: -1 } }
  ];

  // Graduation year employment rate pipeline
  const gradYearEmploymentPipeline = [
    {
      $match: {
        createdAt: { 
          $gte: new Date(startDate || '2020-01-01'),
          $lte: new Date(endDate || new Date())
        },
        graduationYear: { $exists: true, $ne: null }
      }
    },
    {
      $group: {
        _id: '$graduationYear',
        count: { $sum: 1 },
        employed: { $sum: { $cond: [{ $eq: ['$employmentStatus', 'Employed'] }, 1, 0] } }
      }
    },
    {
      $project: {
        _id: 0,
        graduationYear: '$_id',
        count: 1,
        employed: 1,
        employmentRate: {
          $cond: [
            { $eq: ['$count', 0] },
            0,
            { $round: [{ $multiply: [{ $divide: ['$employed', '$count'] }, 100] }, 1] }
          ]
        }
      }
    },
    { $sort: { graduationYear: 1 } }
  ];

  const mainData = await Talent.aggregate(pipeline);
  const gradYearEmploymentData = await Talent.aggregate(gradYearEmploymentPipeline);
  return { mainData, gradYearEmploymentData };
}

// Job market analytics
async function getJobsDataset(startDate, endDate) {
  const jobs = await Job.find({
    createdAt: { 
      $gte: new Date(startDate || '2020-01-01'),
      $lte: new Date(endDate || new Date())
    }
  })
  .select('title companyName industry jobType salaryMin salaryMax location createdAt status')
  .lean();
  
  return jobs.map(job => ({
    jobId: job._id.toString(),
    title: job.title,
    company: job.companyName,
    industry: job.industry || 'Not Specified',
    jobType: job.jobType,
    salaryMin: job.salaryMin || 0,
    salaryMax: job.salaryMax || 0,
    salaryRange: job.salaryMin && job.salaryMax ? `${job.salaryMin}-${job.salaryMax}` : 'Not Specified',
    location: job.location,
    postedDate: job.createdAt,
    status: job.status,
    year: new Date(job.createdAt).getFullYear(),
    month: new Date(job.createdAt).getMonth() + 1,
    monthName: new Date(job.createdAt).toLocaleString('default', { month: 'long' })
  }));
}

// Applications analytics
async function getApplicationsDataset(startDate, endDate) {
  const applications = await Application.find({
    appliedAt: { 
      $gte: new Date(startDate || '2020-01-01'),
      $lte: new Date(endDate || new Date())
    }
  })
  .populate('jobId', 'title companyName industry location jobType')
  .populate('talentId', 'gender educationLevel location school university')
  .lean();
  
  return applications.map(app => {
    const isSSU = app.talentId?.school?.toLowerCase().includes('samar state university') || 
                  app.talentId?.university?.toLowerCase().includes('samar state university');
    
    return {
      applicationId: app._id.toString(),
      jobTitle: app.jobId?.title || 'Unknown',
      company: app.jobId?.companyName || 'Unknown',
      industry: app.jobId?.industry || 'Not Specified',
      jobType: app.jobId?.jobType || 'Not Specified',
      jobLocation: app.jobId?.location || 'Not Specified',
      talentGender: app.talentId?.gender || 'Not Specified',
      talentEducation: app.talentId?.educationLevel || 'Not Specified',
      isSSUGraduate: isSSU,
      talentLocation: app.talentId?.location || 'Not Specified',
      applicationDate: app.appliedAt,
      status: app.status,
      year: new Date(app.appliedAt).getFullYear(),
      month: new Date(app.appliedAt).getMonth() + 1,
      monthName: new Date(app.appliedAt).toLocaleString('default', { month: 'long' })
    };
  });
}

module.exports = router;
