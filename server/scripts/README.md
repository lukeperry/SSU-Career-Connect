# Test Data Generation Scripts

## Overview
This directory contains scripts for generating test data to populate the database with realistic sample data.

## Available Scripts

### seedTalents.js
Generates 30 diverse talent profiles with different personas for testing purposes.

**Features:**
- 15 different persona types (repeated to create 30 talents)
- Realistic Filipino names
- Varied education backgrounds (SSU programs)
- Different employment statuses
- Skills based on field of study
- Experience levels from 0-6 years
- Samar-based locations

**Personas Included:**
1. Fresh Graduate - IT
2. Junior Developer
3. Senior Developer
4. Registered Nurse
5. Fresh Graduate - Nursing
6. Electrical Engineer
7. Fresh Graduate - Civil Engineering
8. Marketing Professional
9. Accountant
10. Teacher
11. Graphic Designer
12. Customer Service Representative
13. Data Analyst
14. Underemployed - Engineering Graduate
15. Career Shifter - IT

**Test Credentials:**
- Email format: `[firstname].[lastname][number]@test.com`
- Password (all): `Test123!`
- Example: `juan.santos1@test.com` / `Test123!`

## Usage

### Run Talent Seed Script
```bash
cd server
node scripts/seedTalents.js
```

### Expected Output
```
✅ Connected to MongoDB
🔄 Starting talent generation...

✅ Generated: Juan Santos - Fresh Graduate - IT
✅ Generated: Maria Reyes - Junior Developer
... (30 talents total)

🔄 Inserting talents into database...

✅ Successfully created 30 test talents!

📊 Summary by Type:
   Fresh Graduate - IT: 2
   Junior Developer: 2
   Senior Developer: 2
   ... etc

📝 Test Credentials:
   Email: [firstname].[lastname][number]@test.com
   Password: Test123!
   Example: juan.santos1@test.com / Test123!

🔌 Database connection closed
```

## Notes

### Data Characteristics
- **Ages**: 22-35 years old
- **Locations**: Various cities/municipalities in Samar provinces
- **Phone Numbers**: Randomly generated Philippine mobile numbers
- **Skills**: Field-appropriate skills (tech, business, health, etc.)
- **Employment Status**: Mix of Employed, Unemployed, Underemployed, Self-Employed
- **Companies**: Mix of real Philippine companies and freelance

### Database Impact
- Creates 30 new talent accounts
- All talents are SSU graduates
- Profile completion varies by persona type
- All accounts are active and verified

### Cleanup (Optional)
To remove test data, you can run in MongoDB:
```javascript
db.talents.deleteMany({ email: /@test\.com$/ })
```

Or uncomment the cleanup line in the script (line 219):
```javascript
await Talent.deleteMany({ email: /@test\.com$/ });
```

## Troubleshooting

### "MongoDB connection error"
- Check if MongoDB is running
- Verify MONGODB_URI in .env file
- Ensure network connectivity

### "Duplicate key error"
- Test talents with same emails already exist
- Run cleanup command or use different email pattern
- Or increment the counter in email generation

### "Module not found"
- Run `npm install` in server directory
- Ensure all dependencies are installed

## Extending the Script

### Add More Personas
Edit the `talentPersonas` array to add new persona types:
```javascript
{
  type: 'Your Persona Type',
  degree: 'Degree Name',
  skills: ['Skill1', 'Skill2'],
  employmentStatus: 'Employed',
  yearsOfExperience: 3,
  experience: 'Description...',
  currentCompany: 'Company Name',
  currentPosition: 'Position',
  graduationYear: 2020
}
```

### Modify Skills
Update skill arrays at the top of the script:
- `techSkills`
- `engineeringSkills`
- `businessSkills`
- `healthSkills`
- `educationSkills`
- `creativeSkills`

### Change Locations
Modify the `samarLocations` array to use different locations.

### Adjust Talent Count
Change the loop condition in `generateTalents()`:
```javascript
for (let i = 0; i < 50; i++) { // Generate 50 talents instead of 30
```

## Future Enhancements
- [ ] Add HR partner seed script
- [ ] Add job postings seed script
- [ ] Add applications seed script
- [ ] Add profile pictures (via Unsplash API or placeholders)
- [ ] Add document uploads (sample PDFs)
- [ ] Command-line arguments for customization
- [ ] Interactive CLI for selecting what to seed

## Safety
- All test accounts use `@test.com` domain for easy identification
- Can be safely removed without affecting real user data
- Passwords are properly hashed using bcrypt
