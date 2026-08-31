const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Provider = require('./models/Provider');
const Service = require('./models/Service');
const Booking = require('./models/Booking');
const Review = require('./models/Review');

dotenv.config();

const seedData = async () => {
  try {
    console.log('[Ustaad.pk Seeder] Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[Ustaad.pk Seeder] Connected. Clearing old data...');

    await User.deleteMany();
    await Provider.deleteMany();
    await Service.deleteMany();
    await Booking.deleteMany();
    await Review.deleteMany();

    console.log('[Ustaad.pk Seeder] Seeding standard service catalog...');

    const services = await Service.insertMany([
      {
        name: 'Electrical Repairs & Wiring',
        category: 'Electrician',
        description: 'Complete home electrical wiring, UPS/Solar setup, breaker fixes, and short circuit troubleshooting.',
        icon: 'Zap',
        basePrice: 800,
        estimatedDuration: '1 - 3 hours'
      },
      {
        name: 'Plumbing & Pipe Fitting',
        category: 'Plumber',
        description: 'Sanitary fittings, leakage detection, motor installation, geyser maintenance, and pipeline repairs.',
        icon: 'Droplets',
        basePrice: 700,
        estimatedDuration: '1 - 2 hours'
      },
      {
        name: 'AC Master Service & Gas Refill',
        category: 'AC Mechanic',
        description: 'Inverter/Split AC general servicing, deep jet wash, compressor checking, and R410/R32 gas top-up.',
        icon: 'Airplay',
        basePrice: 1500,
        estimatedDuration: '1.5 hours'
      },
      {
        name: 'Home & Online Tutor',
        category: 'Home Tutor',
        description: 'Expert home tuition for O/A Levels, Matric/FSc, Math, Physics, Chemistry, and English.',
        icon: 'GraduationCap',
        basePrice: 1200,
        estimatedDuration: '1 hour session'
      },
      {
        name: 'House Painting & Polish',
        category: 'Painter',
        description: 'Interior & exterior emulsion, weather sheet, wall putty, deco paint, and wooden polish.',
        icon: 'Paintbrush',
        basePrice: 2000,
        estimatedDuration: 'Full Day'
      },
      {
        name: 'Woodwork & Furniture Repair',
        category: 'Carpenter',
        description: 'Door lock installation, wardrobe fixing, custom shelves, kitchen cabinets, and sofa repairs.',
        icon: 'Hammer',
        basePrice: 1000,
        estimatedDuration: '2 - 4 hours'
      },
      {
        name: 'Deep Home & Sofa Cleaning',
        category: 'Cleaner',
        description: 'Floor scrubbing, sofa/carpet vacuum shampooing, kitchen degreasing, and water tank cleaning.',
        icon: 'Sparkles',
        basePrice: 1500,
        estimatedDuration: '3 - 5 hours'
      },
      {
        name: 'Home Appliance Repair',
        category: 'Appliance Repair',
        description: 'Washing machine, refrigerator, microwave oven, and water dispenser diagnostic and repair.',
        icon: 'Wrench',
        basePrice: 900,
        estimatedDuration: '1 - 2 hours'
      }
    ]);

    console.log('[Ustaad.pk Seeder] Creating default Admin and Customer accounts...');

    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const customerPassword = await bcrypt.hash('customer123', salt);
    const providerPassword = await bcrypt.hash('provider123', salt);

    // 1. Admin
    const adminUser = await User.create({
      name: 'Ustaad Admin Team',
      email: 'admin@ustaad.pk',
      passwordHash: adminPassword,
      role: 'admin',
      phone: '+92 300 1234567',
      city: 'Lahore',
      address: 'Arfa Software Technology Park, Ferozepur Road, Lahore'
    });

    // 2. Main Customer
    const customerUser = await User.create({
      name: 'Hamza Tariq',
      email: 'customer@ustaad.pk',
      passwordHash: customerPassword,
      role: 'customer',
      phone: '+92 321 9876543',
      city: 'Lahore',
      address: 'House #42, Street 8, Model Town, Lahore'
    });

    // 3. Second Customer
    const customerUser2 = await User.create({
      name: 'Sara Khan',
      email: 'sara.khan@gmail.com',
      passwordHash: customerPassword,
      role: 'customer',
      phone: '+92 333 4455667',
      city: 'Lahore',
      address: 'Block Y, DHA Phase 3, Lahore'
    });

    console.log('[Ustaad.pk Seeder] Creating verified Pakistani Service Providers...');

    const providersData = [
      {
        name: 'Muhammad Rashid (Rashid Electric)',
        email: 'rashid.electric@ustaad.pk',
        phone: '+92 301 5551234',
        city: 'Lahore',
        address: 'Main Market, Gulberg II, Lahore',
        category: 'Electrician',
        skills: ['Solar Inverters', 'Short Circuit Detection', 'UPS Wiring', 'LED Panel Lights', 'Circuit Breakers'],
        bio: 'Over 8 years of professional experience in domestic and commercial electrical installations in Lahore. Certified by TEVTA.',
        priceRange: { min: 600, max: 2000 },
        location: { lat: 31.5102, long: 74.3441, city: 'Lahore', address: 'Gulberg II, Lahore' },
        experienceYears: 8,
        avgRating: 4.9,
        totalReviews: 14,
        completedBookingsCount: 38,
        totalEarnings: 45600,
        verified: true
      },
      {
        name: 'Tariq Mahmood (Master Plumber)',
        email: 'tariq.plumber@ustaad.pk',
        phone: '+92 302 4448765',
        city: 'Lahore',
        address: 'Commercial Area, DHA Phase 5, Lahore',
        category: 'Plumber',
        skills: ['Leakage Repair', 'PPRC Fitting', 'Water Pump Repair', 'Geyser Installation', 'Drain Unblocking'],
        bio: 'Reliable plumbing expert serving DHA, Gulberg, and Cantt areas for over 10 years. Quick response time and transparent rates.',
        priceRange: { min: 800, max: 2500 },
        location: { lat: 31.4697, long: 74.4128, city: 'Lahore', address: 'DHA Phase 5, Lahore' },
        experienceYears: 10,
        avgRating: 4.8,
        totalReviews: 18,
        completedBookingsCount: 42,
        totalEarnings: 58000,
        verified: true
      },
      {
        name: 'Kamran Ali (CoolTech AC)',
        email: 'kamran.ac@ustaad.pk',
        phone: '+92 322 7773322',
        city: 'Lahore',
        address: 'Khokhar Chowk, Johar Town, Lahore',
        category: 'AC Mechanic',
        skills: ['Inverter PCB Repair', 'R410A Gas Refill', 'Master Jet Service', 'Leak Detection', 'AC Relocation'],
        bio: 'Specialist in Gree, Dawlance, Haier, and Kenwood DC Inverter AC systems. 100% genuine parts and guaranteed cooling satisfaction.',
        priceRange: { min: 1200, max: 3500 },
        location: { lat: 31.4682, long: 74.2798, city: 'Lahore', address: 'Johar Town, Lahore' },
        experienceYears: 7,
        avgRating: 5.0,
        totalReviews: 22,
        completedBookingsCount: 56,
        totalEarnings: 84000,
        verified: true
      },
      {
        name: 'Dr. Ayesha Malik (STEM Home Tutor)',
        email: 'ayesha.tutor@ustaad.pk',
        phone: '+92 331 8889900',
        city: 'Lahore',
        address: 'Model Town C-Block, Lahore',
        category: 'Home Tutor',
        skills: ['O-Level Physics', 'A-Level Chemistry', 'Matric Mathematics', 'Biology', 'Past Paper Drills'],
        bio: 'M.Phil / Gold Medalist educator with 6+ years experience helping students achieve straight A*s in Cambridge O/A Levels and top board positions.',
        priceRange: { min: 1500, max: 4000 },
        location: { lat: 31.4889, long: 74.3211, city: 'Lahore', address: 'Model Town, Lahore' },
        experienceYears: 6,
        avgRating: 5.0,
        totalReviews: 12,
        completedBookingsCount: 28,
        totalEarnings: 62000,
        verified: true
      },
      {
        name: 'Bilal Ahmad (Deco & Wall Painters)',
        email: 'bilal.painter@ustaad.pk',
        phone: '+92 303 6667788',
        city: 'Lahore',
        address: 'Sector C, Bahria Town, Lahore',
        category: 'Painter',
        skills: ['Brighto / Berger Paint', 'Deco Polish', 'Weather Sheet', 'Wall Texture', 'Waterproofing'],
        bio: 'Professional team of painters for modern houses, apartments, and commercial plazas with clean finishing and no mess left behind.',
        priceRange: { min: 1500, max: 5000 },
        location: { lat: 31.3683, long: 74.1804, city: 'Lahore', address: 'Bahria Town, Lahore' },
        experienceYears: 9,
        avgRating: 4.7,
        totalReviews: 10,
        completedBookingsCount: 20,
        totalEarnings: 70000,
        verified: true
      },
      {
        name: 'Ustaad Aslam (Islamabad Woodworks)',
        email: 'aslam.carpenter@ustaad.pk',
        phone: '+92 300 9991122',
        city: 'Islamabad',
        address: 'F-7 Markaz, Islamabad',
        category: 'Carpenter',
        skills: ['Kitchen Cabinets', 'Door Polish', 'Lock Fitting', 'Custom Wardrobes', 'Sofa Frame Repair'],
        bio: 'Master carpenter serving Islamabad and Rawalpindi. Quality wood craftsmanship with imported hardware fitting.',
        priceRange: { min: 1000, max: 3000 },
        location: { lat: 33.7215, long: 73.0535, city: 'Islamabad', address: 'F-7, Islamabad' },
        experienceYears: 12,
        avgRating: 4.8,
        totalReviews: 16,
        completedBookingsCount: 34,
        totalEarnings: 52000,
        verified: true
      },
      {
        name: 'Farhan Siddiqui (Karachi CleanPro)',
        email: 'farhan.cleaner@ustaad.pk',
        phone: '+92 304 3332211',
        city: 'Karachi',
        address: 'Boat Basin, Clifton Block 5, Karachi',
        category: 'Cleaner',
        skills: ['Sofa Steam Cleaning', 'Water Tank Deep Cleaning', 'Fumigation', 'Post Construction Clean', 'Carpet Wash'],
        bio: 'Equipped with industrial Kärcher vacuum and extraction machines for deep domestic cleaning.',
        priceRange: { min: 1200, max: 4500 },
        location: { lat: 24.8198, long: 67.0321, city: 'Karachi', address: 'Clifton, Karachi' },
        experienceYears: 5,
        avgRating: 4.6,
        totalReviews: 8,
        completedBookingsCount: 19,
        totalEarnings: 38000,
        verified: true
      },
      {
        name: 'Zubair Khan (New Electrician - Pending Verification)',
        email: 'zubair.electric@ustaad.pk',
        phone: '+92 315 1112233',
        city: 'Rawalpindi',
        address: 'Saddar, Rawalpindi',
        category: 'Electrician',
        skills: ['House Wiring', 'Generator Hookup', 'Ceiling Fan Installation'],
        bio: 'Skilled young electrician eager to provide quality service in Rawalpindi.',
        priceRange: { min: 500, max: 1500 },
        location: { lat: 33.5954, long: 73.0543, city: 'Rawalpindi', address: 'Saddar, Rawalpindi' },
        experienceYears: 2,
        avgRating: 0,
        totalReviews: 0,
        completedBookingsCount: 0,
        totalEarnings: 0,
        verified: false // Unverified test record for Admin Panel
      }
    ];

    const createdProviders = [];

    for (const p of providersData) {
      const u = await User.create({
        name: p.name,
        email: p.email,
        passwordHash: providerPassword,
        role: 'provider',
        phone: p.phone,
        city: p.city,
        address: p.address
      });

      const prov = await Provider.create({
        userId: u._id,
        category: p.category,
        skills: p.skills,
        bio: p.bio,
        priceRange: p.priceRange,
        location: p.location,
        experienceYears: p.experienceYears,
        avgRating: p.avgRating,
        totalReviews: p.totalReviews,
        completedBookingsCount: p.completedBookingsCount,
        totalEarnings: p.totalEarnings,
        verified: p.verified
      });

      createdProviders.push(prov);
    }

    console.log('[Ustaad.pk Seeder] Creating sample Bookings and Reviews...');

    // Booking 1: Completed Electrician booking with 5-star review
    const booking1 = await Booking.create({
      customerId: customerUser._id,
      providerId: createdProviders[0]._id, // Rashid Electric
      serviceCategory: 'Electrician',
      serviceTitle: 'Main Breaker Trip Repair & Distribution Box Fix',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      timeSlot: '09:00 - 12:00',
      status: 'completed',
      location: {
        address: 'Model Town Block C, Lahore',
        city: 'Lahore',
        lat: 31.4889,
        long: 74.3211
      },
      budget: 1500,
      finalPrice: 1500,
      notes: 'Main trip switch kept burning. Needed urgent troubleshooting.',
      hasReview: true
    });

    await Review.create({
      bookingId: booking1._id,
      customerId: customerUser._id,
      providerId: createdProviders[0]._id,
      rating: 5,
      comment: 'Excellent work by Rashid bhai! Fixed the short circuit in less than an hour and explained everything clearly. Very honest pricing.',
      flagged: false
    });

    // Booking 2: Completed AC Mechanic booking with review
    const booking2 = await Booking.create({
      customerId: customerUser2._id,
      providerId: createdProviders[2]._id, // CoolTech AC
      serviceCategory: 'AC Mechanic',
      serviceTitle: '1.5 Ton Inverter AC Master Jet Wash & Gas Check',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      timeSlot: '14:00 - 17:00',
      status: 'completed',
      location: {
        address: 'DHA Phase 3, Lahore',
        city: 'Lahore',
        lat: 31.4721,
        long: 74.3821
      },
      budget: 2500,
      finalPrice: 2500,
      notes: 'AC was blowing warm air.',
      hasReview: true
    });

    await Review.create({
      bookingId: booking2._id,
      customerId: customerUser2._id,
      providerId: createdProviders[2]._id,
      rating: 5,
      comment: 'Kamran Ali is truly a pro. Deep cleaned the indoor and outdoor units without any water spills. Cooling is icy now!',
      flagged: false
    });

    // Booking 3: Pending booking for test interaction
    await Booking.create({
      customerId: customerUser._id,
      providerId: createdProviders[1]._id, // Tariq Plumber
      serviceCategory: 'Plumber',
      serviceTitle: 'Under-sink pipe leakage and mixer tap replacement',
      date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      timeSlot: '10:00 - 13:00',
      status: 'pending',
      location: {
        address: 'House #42, Model Town, Lahore',
        city: 'Lahore',
        lat: 31.4889,
        long: 74.3211
      },
      budget: 1200,
      finalPrice: 1200,
      notes: 'Kitchen sink pipe has a steady drip.'
    });

    // Booking 4: Accepted booking
    await Booking.create({
      customerId: customerUser._id,
      providerId: createdProviders[0]._id, // Rashid Electric
      serviceCategory: 'Electrician',
      serviceTitle: 'Ceiling Fan and UPS Installation',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      timeSlot: '15:00 - 18:00',
      status: 'accepted',
      location: {
        address: 'Model Town, Lahore',
        city: 'Lahore',
        lat: 31.4889,
        long: 74.3211
      },
      budget: 1800,
      finalPrice: 1800,
      notes: 'Need 2 ceiling fans wired to the new solar battery bank.'
    });

    // Flagged review simulation for Admin review desk testing
    const flaggedBooking = await Booking.create({
      customerId: customerUser2._id,
      providerId: createdProviders[0]._id,
      serviceCategory: 'Electrician',
      serviceTitle: 'Rapid Repeat Service',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      timeSlot: '12:00 - 15:00',
      status: 'completed',
      location: { address: 'DHA, Lahore', city: 'Lahore', lat: 31.47, long: 74.38 },
      budget: 1000,
      finalPrice: 1000,
      hasReview: true
    });

    await Review.create({
      bookingId: flaggedBooking._id,
      customerId: customerUser2._id,
      providerId: createdProviders[0]._id,
      rating: 5,
      comment: 'Repeat review left within minutes of previous one to test fake review safety filter.',
      flagged: true,
      flagReason: 'Anti-Fraud Rule Triggered: Customer submitted 3+ reviews for the same provider within 7 days.'
    });

    console.log('\n======================================================');
    console.log('✅ USTAAD.PK DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('Demo Logins:');
    console.log('  1. Customer: customer@ustaad.pk / customer123');
    console.log('  2. Provider: rashid.electric@ustaad.pk / provider123');
    console.log('  3. Admin:    admin@ustaad.pk / admin123');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error]:', error);
    process.exit(1);
  }
};

seedData();
