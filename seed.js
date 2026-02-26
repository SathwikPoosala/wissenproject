const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User.model');
const Squad = require('./models/Squad.model');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Clear existing data
    await User.deleteMany();
    await Squad.deleteMany();
    console.log(' Cleared existing data\n');

    // Create Admin User
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@company.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log(' Admin user created');
    console.log('   Email: admin@company.com');
    console.log('   Password: admin123\n');

    // Create 10 Squads (5 for each batch)
    const squadNames = [
      'Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo',
      'Foxtrot', 'Golf', 'Hotel', 'India', 'Juliet'
    ];

    const squads = [];

    for (let i = 0; i < 10; i++) {
      const batch = i < 5 ? 'BATCH_1' : 'BATCH_2';
      const squad = await Squad.create({
        name: `Squad ${squadNames[i]}`,
        batch: batch,
        createdBy: admin._id
      });
      squads.push(squad);
      console.log(` Created ${squad.name} (${batch})`);
    }

    console.log('\n All squads created\n');

    // Create 80 employees (8 per squad)
    let employeeCount = 0;

    for (let i = 0; i < squads.length; i++) {
      const squad = squads[i];
      
      for (let j = 1; j <= 8; j++) {
        employeeCount++;
        const employee = await User.create({
          name: `Employee ${employeeCount}`,
          email: `employee${employeeCount}@company.com`,
          password: 'employee123',
          role: 'employee',
          squad: squad._id
        });

        // Add employee to squad
        squad.members.push(employee._id);
      }

      await squad.save();
      console.log(` Added 8 members to ${squad.name}`);
    }

    console.log('\n Database seeding completed!\n');
    console.log('Summary:');
    console.log(`   - 1 Admin user`);
    console.log(`   - 10 Squads (5 per batch)`);
    console.log(`   - 80 Employees (8 per squad)`);
    console.log('\n Default Credentials:');
    console.log('   Admin: admin@company.com / admin123');
    console.log('   Employees: employee1@company.com to employee80@company.com / employee123\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
