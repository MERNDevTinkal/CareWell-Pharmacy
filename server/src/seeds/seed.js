require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminUser = require('../models/AdminUser');
const User = require('../models/User');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const StoreSetting = require('../models/StoreSetting');
const NavigationMenu = require('../models/NavigationMenu');
const HomePageSection = require('../models/HomePageSection');
const CMSPage = require('../models/CMSPage');
const FAQ = require('../models/FAQ');
const BlogPost = require('../models/BlogPost');
const InventoryBatch = require('../models/InventoryBatch');
const Order = require('../models/Order');
const Review = require('../models/Review');

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/carewell_pharmacy');
  console.log(`Connected to MongoDB: ${conn.connection.host}`);
};

const seedData = async () => {
  try {
    await connectDB();
    const isFresh = process.argv.includes('--fresh');

    if (isFresh) {
      console.log('Fresh mode: Clearing all collections...');
      await Promise.all([
        AdminUser.deleteMany(),
        User.deleteMany(),
        Category.deleteMany(),
        Brand.deleteMany(),
        Product.deleteMany(),
        Coupon.deleteMany(),
        StoreSetting.deleteMany(),
        NavigationMenu.deleteMany(),
        HomePageSection.deleteMany(),
        CMSPage.deleteMany(),
        FAQ.deleteMany(),
        BlogPost.deleteMany(),
        InventoryBatch.deleteMany(),
        Order.deleteMany(),
        Review.deleteMany()
      ]);
      console.log('Collections cleared.');
    }

    console.log('Seeding Admins...');
    const hashedAdminPassword = await bcrypt.hash('Admin@123', 12);
    await AdminUser.findOneAndUpdate(
      { email: 'admin@carewell.com' },
      {
        name: 'Super Administrator',
        email: 'admin@carewell.com',
        password: hashedAdminPassword,
        role: 'super_admin',
        isActive: true,
        permissions: ['all']
      },
      { upsert: true, new: true }
    );

    await AdminUser.findOneAndUpdate(
      { email: 'orders@carewell.com' },
      {
        name: 'Order Manager',
        email: 'orders@carewell.com',
        password: hashedAdminPassword,
        role: 'order_manager',
        isActive: true,
        permissions: ['orders', 'prescriptions']
      },
      { upsert: true, new: true }
    );

    console.log('Seeding Customers...');
    const hashedCustomerPassword = await bcrypt.hash('Demo@123', 12);
    const johnDoe = await User.findOneAndUpdate(
      { email: 'john@demo.com' },
      {
        name: 'John Doe',
        email: 'john@demo.com',
        password: hashedCustomerPassword,
        phone: '+91 9876543210',
        role: 'customer',
        isActive: true,
        isEmailVerified: true,
        addresses: [{
          name: 'John Doe',
          phone: '+91 9876543210',
          line1: 'Flat 402, Sunshine Apartments, 12th Main',
          line2: 'Indiranagar',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560038',
          country: 'India',
          isDefault: true,
          type: 'home'
        }]
      },
      { upsert: true, new: true }
    );

    await User.findOneAndUpdate(
      { email: 'jane@demo.com' },
      {
        name: 'Jane Smith',
        email: 'jane@demo.com',
        password: hashedCustomerPassword,
        phone: '+91 9876500000',
        role: 'customer',
        isActive: true,
        isEmailVerified: true,
        addresses: [{
          name: 'Jane Smith',
          phone: '+91 9876500000',
          line1: 'B-12, Sector 15',
          city: 'Noida',
          state: 'Uttar Pradesh',
          pincode: '201301',
          country: 'India',
          isDefault: true,
          type: 'work'
        }]
      },
      { upsert: true, new: true }
    );

    await User.findOneAndUpdate(
      { email: 'demo.google@carewell.com' },
      {
        name: 'Demo Google User',
        email: 'demo.google@carewell.com',
        socialProvider: 'google',
        role: 'customer',
        isActive: true,
        isEmailVerified: true
      },
      { upsert: true, new: true }
    );

    console.log('Seeding Store Settings...');
    const settings = [
      { key: 'storeName', value: 'CareWell Pharmacy', group: 'general' },
      { key: 'storeTagline', value: 'Your Trusted Healthcare & Wellness Partner', group: 'general' },
      { key: 'storeLogo', value: '', group: 'general' },
      { key: 'primaryColor', value: '#10b981', group: 'branding' },
      { key: 'secondaryColor', value: '#0f172a', group: 'branding' },
      { key: 'contactEmail', value: 'support@carewell.com', group: 'contact' },
      { key: 'contactPhone', value: '+91 98765 43210', group: 'contact' },
      { key: 'contactAddress', value: '123 Health Avenue, MG Road, Bangalore - 560001, Karnataka, India', group: 'contact' },
      { key: 'currency', value: 'INR', group: 'localization' },
      { key: 'currencySymbol', value: '₹', group: 'localization' },
      { key: 'shippingCharge', value: 49, group: 'shipping' },
      { key: 'freeShippingThreshold', value: 599, group: 'shipping' },
      { key: 'taxRate', value: 12, group: 'tax' },
      { key: 'returnWindow', value: 7, group: 'policy' },
      { key: 'codAvailable', value: true, group: 'payment' },
      { key: 'maintenanceMode', value: false, group: 'system' },
      {
        key: 'announcementBar',
        value: {
          enabled: true,
          text: 'Free shipping on orders above ₹599! Use coupon code WELCOME10 for 10% off your first order.',
          link: '/products',
          bgColor: '#10b981',
          textColor: '#ffffff'
        },
        group: 'header'
      },
      {
        key: 'socialMedia',
        value: {
          facebook: 'https://facebook.com/carewell',
          twitter: 'https://twitter.com/carewell',
          instagram: 'https://instagram.com/carewell',
          youtube: 'https://youtube.com/carewell'
        },
        group: 'footer'
      },
      { key: 'seoTitle', value: 'CareWell Pharmacy - Buy Medicines & Healthcare Products Online', group: 'seo' },
      { key: 'seoDescription', value: 'CareWell Pharmacy offers genuine medicines, health supplements, ayurvedic care, and personal wellness products with fast doorstep delivery.', group: 'seo' },
      { key: 'copyrightText', value: '© 2026 CareWell Pharmacy. All rights reserved.', group: 'footer' }
    ];

    for (const s of settings) {
      await StoreSetting.findOneAndUpdate({ key: s.key }, s, { upsert: true });
    }

    console.log('Seeding Brands...');
    const brandData = [
      { name: 'Himalaya', slug: 'himalaya', description: 'Ayurvedic herbal medicines and wellness since 1930', logo: 'https://placehold.co/200x100?text=Himalaya', isActive: true, featured: true },
      { name: 'Sun Pharma', slug: 'sun-pharma', description: 'Leading global specialty generic pharmaceuticals company', logo: 'https://placehold.co/200x100?text=Sun+Pharma', isActive: true, featured: true },
      { name: 'Cipla', slug: 'cipla', description: 'Caring for life with respiratory and quality pharmaceuticals', logo: 'https://placehold.co/200x100?text=Cipla', isActive: true, featured: true },
      { name: 'Johnson & Johnson', slug: 'johnson-and-johnson', description: 'Everyday health and baby care essentials', logo: 'https://placehold.co/200x100?text=J%26J', isActive: true, featured: true },
      { name: 'Dabur', slug: 'dabur', description: 'Natural Ayurvedic healthcare and dietary supplements', logo: 'https://placehold.co/200x100?text=Dabur', isActive: true, featured: true },
      { name: 'Patanjali', slug: 'patanjali', description: 'Pure herbal and natural food & wellness remedies', logo: 'https://placehold.co/200x100?text=Patanjali', isActive: true, featured: true }
    ];

    const brandMap = {};
    for (const b of brandData) {
      const brand = await Brand.findOneAndUpdate({ slug: b.slug }, b, { upsert: true, new: true });
      brandMap[b.slug] = brand._id;
    }

    console.log('Seeding Categories...');
    const categoryData = [
      { name: 'Medicines', slug: 'medicines', description: 'Prescription & over-the-counter pharmaceuticals', image: 'https://placehold.co/400x300?text=Medicines', color: '#ef4444', icon: 'Pill', displayOrder: 1, featured: true },
      { name: 'Vitamins & Supplements', slug: 'vitamins-supplements', description: 'Daily multivitamins, minerals and immune boosters', image: 'https://placehold.co/400x300?text=Vitamins', color: '#f59e0b', icon: 'Activity', displayOrder: 2, featured: true },
      { name: 'Personal Care', slug: 'personal-care', description: 'Hygiene, oral care and everyday personal grooming', image: 'https://placehold.co/400x300?text=Personal+Care', color: '#8b5cf6', icon: 'Heart', displayOrder: 3, featured: true },
      { name: 'Baby Care', slug: 'baby-care', description: 'Diapers, gentle washes and infant nutrition', image: 'https://placehold.co/400x300?text=Baby+Care', color: '#ec4899', icon: 'Smile', displayOrder: 4, featured: true },
      { name: 'First Aid', slug: 'first-aid', description: 'Bandages, antiseptics and emergency medical kits', image: 'https://placehold.co/400x300?text=First+Aid', color: '#dc2626', icon: 'Cross', displayOrder: 5, featured: true },
      { name: 'Ayurvedic', slug: 'ayurvedic', description: 'Traditional herbal remedies and wellness extracts', image: 'https://placehold.co/400x300?text=Ayurvedic', color: '#84cc16', icon: 'Leaf', displayOrder: 6, featured: true },
      { name: 'Medical Devices', slug: 'medical-devices', description: 'BP monitors, glucometers and digital thermometers', image: 'https://placehold.co/400x300?text=Devices', color: '#3b82f6', icon: 'Cpu', displayOrder: 7, featured: false },
      { name: 'Skin Care', slug: 'skin-care', description: 'Dermatologist-recommended sunscreens and cleansers', image: 'https://placehold.co/400x300?text=Skin+Care', color: '#f97316', icon: 'Sun', displayOrder: 8, featured: false },
      { name: 'Eye Care', slug: 'eye-care', description: 'Lubricating drops and lens care solutions', image: 'https://placehold.co/400x300?text=Eye+Care', color: '#06b6d4', icon: 'Eye', displayOrder: 9, featured: false },
      { name: 'Nutrition & Fitness', slug: 'nutrition-fitness', description: 'Protein powders, energy electrolytes and workout fuels', image: 'https://placehold.co/400x300?text=Nutrition', color: '#10b981', icon: 'Zap', displayOrder: 10, featured: false }
    ];

    const categoryMap = {};
    for (const c of categoryData) {
      const cat = await Category.findOneAndUpdate({ slug: c.slug }, c, { upsert: true, new: true });
      categoryMap[c.slug] = cat._id;
    }

    console.log('Seeding 30 Products...');
    const rawProducts = [
      // 1. Medicines
      {
        name: 'Paracetamol 500mg Tablets (15 Tabs)',
        slug: 'paracetamol-500mg-tablets',
        sku: 'MED-PARA-500',
        category: categoryMap['medicines'],
        brand: brandMap['cipla'],
        mrp: 40, price: 32, discount: 20, stock: 150,
        prescriptionRequired: false, isBestSeller: true, isFeatured: true,
        shortDescription: 'Effective relief from mild to moderate fever and body aches.',
        description: 'Paracetamol 500mg helps reduce fever and relieve mild to moderate pain including headache, toothache, and body pain. Take as directed by physician.',
        manufacturer: 'Cipla Ltd', countryOfOrigin: 'India', storage: 'Store in a cool, dry place below 30°C.',
        images: [{ url: 'https://placehold.co/600x600?text=Paracetamol+500mg', isPrimary: true, order: 0 }]
      },
      {
        name: 'Pan-D Gastro-Resistant Capsules (15 Caps)',
        slug: 'pan-d-capsules',
        sku: 'MED-PAND-015',
        category: categoryMap['medicines'],
        brand: brandMap['sun-pharma'],
        mrp: 199, price: 169, discount: 15, stock: 95,
        prescriptionRequired: true, isFeatured: true,
        shortDescription: 'Prescription medicine for acid reflux and peptic ulcers.',
        description: 'Pantoprazole and Domperidone combination capsule for GERD, hyperacidity and heartburn. Prescription verification required.',
        manufacturer: 'Sun Pharmaceutical Industries', countryOfOrigin: 'India', storage: 'Protect from moisture and light.',
        images: [{ url: 'https://placehold.co/600x600?text=Pan-D+Capsules', isPrimary: true, order: 0 }]
      },
      {
        name: 'Azithromycin 500mg Tablets (3 Tabs)',
        slug: 'azithromycin-500mg-tablets',
        sku: 'MED-AZI-500',
        category: categoryMap['medicines'],
        brand: brandMap['sun-pharma'],
        mrp: 125, price: 99, discount: 21, stock: 60,
        prescriptionRequired: true, isNew: true,
        shortDescription: 'Broad-spectrum antibiotic for respiratory and bacterial infections.',
        description: 'Azithromycin 500mg is an antibiotic used to treat bacterial infections of the respiratory tract, skin, and throat. Prescription mandatory.',
        manufacturer: 'Sun Pharmaceutical Industries', countryOfOrigin: 'India', storage: 'Store below 25°C.',
        images: [{ url: 'https://placehold.co/600x600?text=Azithromycin+500mg', isPrimary: true, order: 0 }]
      },
      {
        name: 'Crocin Advance 500mg Fast Relief (20 Tabs)',
        slug: 'crocin-advance-500mg',
        sku: 'MED-CROC-500',
        category: categoryMap['medicines'],
        brand: brandMap['cipla'],
        mrp: 55, price: 45, discount: 18, stock: 200,
        prescriptionRequired: false, isBestSeller: true,
        shortDescription: 'Optizorb technology for rapid pain and fever relief.',
        description: 'Fast-acting paracetamol formulated with Optizorb technology to dissolve up to 5 times faster than standard paracetamol.',
        manufacturer: 'GlaxoSmithKline / Cipla', countryOfOrigin: 'India', storage: 'Keep out of reach of children.',
        images: [{ url: 'https://placehold.co/600x600?text=Crocin+Advance', isPrimary: true, order: 0 }]
      },
      // 2. Vitamins & Supplements
      {
        name: 'Vitamin C 1000mg + Zinc Effervescent (20 Tabs)',
        slug: 'vitamin-c-1000mg-zinc-effervescent',
        sku: 'VIT-C-1000-ZN',
        category: categoryMap['vitamins-supplements'],
        brand: brandMap['himalaya'],
        mrp: 399, price: 299, discount: 25, stock: 120,
        isFeatured: true, isBestSeller: true,
        shortDescription: 'Daily immunity booster with refreshing orange flavor.',
        description: 'High-potency Vitamin C enriched with elemental Zinc in a pleasant fizzy drink format. Boosts natural defenses and collagen synthesis.',
        manufacturer: 'The Himalaya Drug Company', countryOfOrigin: 'India', storage: 'Keep tube tightly closed in dry conditions.',
        images: [{ url: 'https://placehold.co/600x600?text=Vitamin+C+Effervescent', isPrimary: true, order: 0 }]
      },
      {
        name: 'Omega 3 Triple Strength Fish Oil (60 Softgels)',
        slug: 'omega-3-fish-oil-1000mg',
        sku: 'VIT-OMG-1000',
        category: categoryMap['vitamins-supplements'],
        brand: brandMap['cipla'],
        mrp: 899, price: 649, discount: 28, stock: 80,
        isFeatured: true,
        shortDescription: 'EPA & DHA rich molecularly distilled fish oil for heart and joints.',
        description: 'Enteric coated softgels with ultra-pure EPA (550mg) and DHA (350mg) to support cardiovascular health, cognitive function, and joint mobility.',
        manufacturer: 'Cipla Health', countryOfOrigin: 'India', storage: 'Store in refrigerator after opening.',
        images: [{ url: 'https://placehold.co/600x600?text=Omega+3+Fish+Oil', isPrimary: true, order: 0 }]
      },
      {
        name: 'Ashwagandha Pure Extracts 60 Veg Capsules',
        slug: 'ashwagandha-pure-extract-capsules',
        sku: 'VIT-ASH-060',
        category: categoryMap['vitamins-supplements'],
        brand: brandMap['himalaya'],
        mrp: 250, price: 195, discount: 22, stock: 110,
        isBestSeller: true,
        shortDescription: 'Certified organic adaptogen for stress relief and vitality.',
        description: 'Standardized Withania Somnifera extract to help manage daily stress, promote restful sleep, and enhance overall endurance.',
        manufacturer: 'The Himalaya Drug Company', countryOfOrigin: 'India', storage: 'Store in a dry place.',
        images: [{ url: 'https://placehold.co/600x600?text=Ashwagandha+Extract', isPrimary: true, order: 0 }]
      },
      {
        name: 'Complete Multivitamin for Men & Women (60 Tabs)',
        slug: 'complete-daily-multivitamin',
        sku: 'VIT-MV-060',
        category: categoryMap['vitamins-supplements'],
        brand: brandMap['himalaya'],
        mrp: 499, price: 379, discount: 24, stock: 130,
        isNew: true,
        shortDescription: '23 essential vitamins and trace minerals for everyday stamina.',
        description: 'Balanced daily nutritional support containing Vitamins A, B-Complex, C, D3, E along with Zinc, Iron, and Magnesium.',
        manufacturer: 'The Himalaya Drug Company', countryOfOrigin: 'India', storage: 'Store in cool place away from sunlight.',
        images: [{ url: 'https://placehold.co/600x600?text=Daily+Multivitamin', isPrimary: true, order: 0 }]
      },
      // 3. Personal Care
      {
        name: 'Dove Deeply Nourishing Body Wash 500ml',
        slug: 'dove-nourishing-body-wash-500ml',
        sku: 'PC-DOVE-500',
        category: categoryMap['personal-care'],
        brand: brandMap['johnson-and-johnson'],
        mrp: 375, price: 299, discount: 20, stock: 85,
        shortDescription: 'Gentle microbiome-friendly moisture for soft, smooth skin.',
        description: 'Dermatologically tested moisturizing formula that leaves skin softer after just one shower.',
        manufacturer: 'Unilever / J&J', countryOfOrigin: 'India', storage: 'For external use only.',
        images: [{ url: 'https://placehold.co/600x600?text=Dove+Body+Wash', isPrimary: true, order: 0 }]
      },
      {
        name: 'Sensodyne Repair & Protect Toothpaste 100g',
        slug: 'sensodyne-repair-protect-100g',
        sku: 'PC-SENS-100',
        category: categoryMap['personal-care'],
        brand: brandMap['cipla'],
        mrp: 240, price: 199, discount: 17, stock: 140,
        isBestSeller: true,
        shortDescription: 'Clinically proven daily protection for sensitive teeth.',
        description: 'Novamin technology forms a mineral repair layer over exposed dentin to shield against cold, hot, and sweet triggers.',
        manufacturer: 'GSK Consumer Healthcare', countryOfOrigin: 'India', storage: 'Brush twice daily.',
        images: [{ url: 'https://placehold.co/600x600?text=Sensodyne+Toothpaste', isPrimary: true, order: 0 }]
      },
      {
        name: 'Dettol Original Germ Protection Liquid 550ml',
        slug: 'dettol-original-liquid-550ml',
        sku: 'PC-DET-550',
        category: categoryMap['first-aid'],
        brand: brandMap['johnson-and-johnson'],
        mrp: 215, price: 185, discount: 14, stock: 175,
        isBestSeller: true,
        shortDescription: 'Antiseptic disinfectant liquid for cuts, scratches and bathing.',
        description: 'Trusted antibacterial formula that kills 99.9% of germs to protect your family from illness-causing bacteria.',
        manufacturer: 'Reckitt Benckiser', countryOfOrigin: 'India', storage: 'Dilute before use on skin.',
        images: [{ url: 'https://placehold.co/600x600?text=Dettol+Antiseptic', isPrimary: true, order: 0 }]
      },
      // 4. Baby Care
      {
        name: "Johnson's Baby Gentle Shampoo 200ml",
        slug: 'johnsons-baby-gentle-shampoo-200ml',
        sku: 'BC-JB-SHA-200',
        category: categoryMap['baby-care'],
        brand: brandMap['johnson-and-johnson'],
        mrp: 225, price: 189, discount: 16, stock: 90,
        shortDescription: 'No More Tears formula designed specially for infant fine hair.',
        description: 'Hypoallergenic and pH balanced baby shampoo that gently cleanses delicate scalp without irritating the eyes.',
        manufacturer: 'Johnson & Johnson Consumer Inc', countryOfOrigin: 'India', storage: 'Store at room temperature.',
        images: [{ url: 'https://placehold.co/600x600?text=Baby+Shampoo', isPrimary: true, order: 0 }]
      },
      {
        name: 'Pampers Premium Protection Diaper Pants (L - 44 Count)',
        slug: 'pampers-premium-diaper-pants-l',
        sku: 'BC-PAM-L-44',
        category: categoryMap['baby-care'],
        brand: brandMap['johnson-and-johnson'],
        mrp: 999, price: 799, discount: 20, stock: 65,
        isFeatured: true,
        shortDescription: 'Silky soft 360-degree waist with 12-hour dry technology.',
        description: 'Pants style diaper with breathable air channels and lotion with aloe vera to prevent diaper rash and irritation.',
        manufacturer: 'Procter & Gamble', countryOfOrigin: 'India', storage: 'Keep in dry packaging.',
        images: [{ url: 'https://placehold.co/600x600?text=Pampers+Diapers', isPrimary: true, order: 0 }]
      },
      // 5. First Aid
      {
        name: 'Band-Aid Flexible Fabric Waterproof Strips (30 Pack)',
        slug: 'band-aid-flexible-waterproof-30s',
        sku: 'FA-BA-30P',
        category: categoryMap['first-aid'],
        brand: brandMap['johnson-and-johnson'],
        mrp: 120, price: 95, discount: 21, stock: 220,
        shortDescription: 'Sterile breathable bandages with Quiltvent pad.',
        description: 'Adhesive wound strips that flex with your movements and stay firmly attached even during hand washing.',
        manufacturer: 'Johnson & Johnson', countryOfOrigin: 'India', storage: 'Store in a dry first aid kit.',
        images: [{ url: 'https://placehold.co/600x600?text=Band-Aid+Strips', isPrimary: true, order: 0 }]
      },
      {
        name: 'Betadine 10% Microbicidal Ointment 20g',
        slug: 'betadine-10-ointment-20g',
        sku: 'FA-BET-020',
        category: categoryMap['first-aid'],
        brand: brandMap['cipla'],
        mrp: 95, price: 79, discount: 17, stock: 160,
        shortDescription: 'Povidone-iodine antiseptic ointment for burns and wounds.',
        description: 'Broad-spectrum microbicidal ointment that prevents infection in minor cuts, abrasions, and skin burns.',
        manufacturer: 'Win-Medicare / Cipla', countryOfOrigin: 'India', storage: 'Store below 25°C.',
        images: [{ url: 'https://placehold.co/600x600?text=Betadine+Ointment', isPrimary: true, order: 0 }]
      },
      // 6. Ayurvedic
      {
        name: 'Dabur Chyawanprash 2X Immunity 1kg',
        slug: 'dabur-chyawanprash-1kg',
        sku: 'AY-DAB-CP-1K',
        category: categoryMap['ayurvedic'],
        brand: brandMap['dabur'],
        mrp: 395, price: 325, discount: 18, stock: 130,
        isFeatured: true, isBestSeller: true,
        shortDescription: 'Time-tested Ayurvedic formulation with 40+ natural herbs and Amla.',
        description: 'Clinically tested herbal jam that strengthens the immune system, guards against seasonal flu, and enhances stamina.',
        manufacturer: 'Dabur India Ltd', countryOfOrigin: 'India', storage: 'Consume within 6 months of opening.',
        images: [{ url: 'https://placehold.co/600x600?text=Dabur+Chyawanprash', isPrimary: true, order: 0 }]
      },
      {
        name: 'Patanjali Pure Organic Honey 500g',
        slug: 'patanjali-pure-honey-500g',
        sku: 'AY-PAT-HON-500',
        category: categoryMap['ayurvedic'],
        brand: brandMap['patanjali'],
        mrp: 185, price: 155, discount: 16, stock: 140,
        shortDescription: '100% pure filtered natural flower honey.',
        description: 'Natural sweetener packed with enzymes, antioxidants and trace nutrients for digestive and throat health.',
        manufacturer: 'Patanjali Ayurved Ltd', countryOfOrigin: 'India', storage: 'Do not refrigerate. Crystallization is natural.',
        images: [{ url: 'https://placehold.co/600x600?text=Patanjali+Honey', isPrimary: true, order: 0 }]
      },
      {
        name: 'Himalaya Liv.52 Herbal Liver Care (100 Tabs)',
        slug: 'himalaya-liv-52-100-tabs',
        sku: 'AY-HIM-LIV-100',
        category: categoryMap['ayurvedic'],
        brand: brandMap['himalaya'],
        mrp: 175, price: 145, discount: 17, stock: 180,
        isBestSeller: true,
        shortDescription: 'Herbal hepatoprotective formula for optimal liver health.',
        description: 'Natural blend of Capparis spinosa and Cichorium intybus to protect hepatic parenchyma and stimulate appetite.',
        manufacturer: 'The Himalaya Drug Company', countryOfOrigin: 'India', storage: 'Keep in cool dry place.',
        images: [{ url: 'https://placehold.co/600x600?text=Himalaya+Liv.52', isPrimary: true, order: 0 }]
      },
      // 7. Medical Devices
      {
        name: 'Omron HEM 7120 Fully Automatic Blood Pressure Monitor',
        slug: 'omron-hem-7120-bp-monitor',
        sku: 'DEV-OMR-BP712',
        category: categoryMap['medical-devices'],
        brand: brandMap['sun-pharma'],
        mrp: 2450, price: 1799, discount: 27, stock: 45,
        isFeatured: true, isNew: true,
        shortDescription: 'Intellisense technology for fast, accurate arm BP readings.',
        description: 'Clinically validated automatic digital upper arm blood pressure monitor with hypertension indicator and cuff wrapping guide.',
        manufacturer: 'Omron Healthcare', countryOfOrigin: 'Vietnam', storage: 'Keep dry. Remove batteries when unused.',
        images: [{ url: 'https://placehold.co/600x600?text=Omron+BP+Monitor', isPrimary: true, order: 0 }]
      },
      {
        name: 'Accu-Chek Active Blood Glucose Meter Kit',
        slug: 'accu-chek-active-glucometer-kit',
        sku: 'DEV-AC-GLU-KIT',
        category: categoryMap['medical-devices'],
        brand: brandMap['sun-pharma'],
        mrp: 1699, price: 1299, discount: 24, stock: 55,
        isFeatured: true,
        shortDescription: 'Fast 5-second blood sugar testing with 10 free strips.',
        description: 'Accurate and simple glucometer with double-check visual verification and pre/post meal reminders.',
        manufacturer: 'Roche Diabetes Care', countryOfOrigin: 'Germany', storage: 'Operate between 10°C and 40°C.',
        images: [{ url: 'https://placehold.co/600x600?text=AccuChek+Glucometer', isPrimary: true, order: 0 }]
      },
      {
        name: 'Dr. Morepen Digital Clinical Thermometer',
        slug: 'dr-morepen-digital-thermometer',
        sku: 'DEV-DRM-THERM',
        category: categoryMap['medical-devices'],
        brand: brandMap['sun-pharma'],
        mrp: 299, price: 199, discount: 33, stock: 120,
        shortDescription: 'Quick 60-second fever readout with beep alert.',
        description: 'Waterproof digital medical thermometer suitable for oral, underarm, and rectal temperature measurements with auto shut-off.',
        manufacturer: 'Morepen Laboratories', countryOfOrigin: 'India', storage: 'Clean with alcohol swab after use.',
        images: [{ url: 'https://placehold.co/600x600?text=Digital+Thermometer', isPrimary: true, order: 0 }]
      },
      // 8. Skin Care
      {
        name: 'Cetaphil Gentle Skin Cleanser 250ml',
        slug: 'cetaphil-gentle-cleanser-250ml',
        sku: 'SK-CET-CLN-250',
        category: categoryMap['skin-care'],
        brand: brandMap['johnson-and-johnson'],
        mrp: 620, price: 525, discount: 15, stock: 75,
        isFeatured: true, isBestSeller: true,
        shortDescription: 'Soap-free, non-comedogenic cleanser for sensitive skin.',
        description: 'Dermatologist-formulated gentle face and body wash with hydrating glycerin, niacinamide and panthenol.',
        manufacturer: 'Galderma', countryOfOrigin: 'India', storage: 'Avoid contact with eyes.',
        images: [{ url: 'https://placehold.co/600x600?text=Cetaphil+Cleanser', isPrimary: true, order: 0 }]
      },
      {
        name: 'Himalaya Purifying Neem Face Wash 150ml',
        slug: 'himalaya-neem-face-wash-150ml',
        sku: 'SK-HIM-NFW-150',
        category: categoryMap['skin-care'],
        brand: brandMap['himalaya'],
        mrp: 195, price: 155, discount: 21, stock: 160,
        isBestSeller: true,
        shortDescription: 'Herbal cleanser prevents pimples and purifies oily skin.',
        description: 'Enriched with antibacterial Neem and anti-inflammatory Turmeric to gently remove excess oil without drying the skin.',
        manufacturer: 'The Himalaya Drug Company', countryOfOrigin: 'India', storage: 'For daily morning and evening use.',
        images: [{ url: 'https://placehold.co/600x600?text=Neem+Face+Wash', isPrimary: true, order: 0 }]
      },
      // 9. Eye Care
      {
        name: 'Systane Ultra High Performance Eye Drops 10ml',
        slug: 'systane-ultra-eye-drops-10ml',
        sku: 'EYE-SYS-ULT-10',
        category: categoryMap['eye-care'],
        brand: brandMap['sun-pharma'],
        mrp: 460, price: 389, discount: 15, stock: 85,
        isNew: true,
        shortDescription: 'Extended protection and soothing dry-eye relief.',
        description: 'Lubricant eye drops engineered with HP-Guar polymer system to soothe irritation, burning, and screen fatigue.',
        manufacturer: 'Alcon Laboratories', countryOfOrigin: 'USA', storage: 'Discard 30 days after opening.',
        images: [{ url: 'https://placehold.co/600x600?text=Systane+Eye+Drops', isPrimary: true, order: 0 }]
      },
      {
        name: 'Bausch & Lomb Renu Fresh Multi-Purpose Solution 355ml',
        slug: 'bausch-lomb-renu-fresh-355ml',
        sku: 'EYE-BL-REN-355',
        category: categoryMap['eye-care'],
        brand: brandMap['sun-pharma'],
        mrp: 520, price: 440, discount: 15, stock: 70,
        shortDescription: 'All-in-one lens disinfecting, cleaning and storing solution.',
        description: 'Proven multi-action contact lens disinfectant removes protein deposits and conditions soft contact lenses.',
        manufacturer: 'Bausch & Lomb', countryOfOrigin: 'India', storage: 'Keep cap tightly closed.',
        images: [{ url: 'https://placehold.co/600x600?text=Renu+Lens+Solution', isPrimary: true, order: 0 }]
      },
      // 10. Nutrition & Fitness
      {
        name: 'Optimum Nutrition Gold Standard 100% Whey Protein (Double Rich Chocolate 1kg)',
        slug: 'on-gold-standard-whey-chocolate-1kg',
        sku: 'NUT-ON-WHEY-1K',
        category: categoryMap['nutrition-fitness'],
        brand: brandMap['sun-pharma'],
        mrp: 3899, price: 3099, discount: 21, stock: 40,
        isFeatured: true,
        shortDescription: '24g pure whey protein isolate with 5.5g natural BCAAs per scoop.',
        description: 'The world standard in post-workout muscle recovery, formulated with whey protein isolates and micro-fraction peptides.',
        manufacturer: 'Glanbia Nutrition', countryOfOrigin: 'USA', storage: 'Keep in cool dry place with lid sealed.',
        images: [{ url: 'https://placehold.co/600x600?text=ON+Whey+Protein', isPrimary: true, order: 0 }]
      },
      {
        name: 'Dabur Glucose-D Instant Energy Orange Drink 500g',
        slug: 'dabur-glucose-d-orange-500g',
        sku: 'NUT-DAB-GLU-500',
        category: categoryMap['nutrition-fitness'],
        brand: brandMap['dabur'],
        mrp: 140, price: 119, discount: 15, stock: 150,
        isBestSeller: true,
        shortDescription: 'Enriched with Vitamin D and Calcium for rapid stamina rejuvenation.',
        description: 'Refreshing glucose energy beverage powder that instantly combats fatigue and exhaustion caused by summer heat or intense exertion.',
        manufacturer: 'Dabur India Ltd', countryOfOrigin: 'India', storage: 'Store in an airtight container.',
        images: [{ url: 'https://placehold.co/600x600?text=Glucose-D+Orange', isPrimary: true, order: 0 }]
      },
      {
        name: 'Fast&Up Charge Natural Vitamin C & Zinc Drink (20 Effervescent Tabs)',
        slug: 'fast-and-up-charge-natural-vitamin-c',
        sku: 'NUT-FUP-CHG-020',
        category: categoryMap['nutrition-fitness'],
        brand: brandMap['cipla'],
        mrp: 390, price: 310, discount: 21, stock: 110,
        isNew: true,
        shortDescription: 'Natural Amla extract + 10mg Zinc for daily active recovery.',
        description: 'Informed-Choice certified effervescent sports immunity formula. Rapid absorption and gentle on the stomach.',
        manufacturer: 'Aeronutrix Sports Nutrition', countryOfOrigin: 'India', storage: 'Close cap immediately after removing tablet.',
        images: [{ url: 'https://placehold.co/600x600?text=Fast%26Up+Charge', isPrimary: true, order: 0 }]
      },
      {
        name: 'Electral Electrolyte Sachet (WHO Formula 21.8g)',
        slug: 'electral-ors-sachet-21g',
        sku: 'MED-ELC-ORS-021',
        category: categoryMap['medicines'],
        brand: brandMap['sun-pharma'],
        mrp: 23, price: 21, discount: 9, stock: 300,
        isBestSeller: true,
        shortDescription: 'Oral Rehydration Salts for restoration of body water and electrolytes.',
        description: 'WHO recommended composition for the treatment of dehydration and diarrhea. Dissolve entire sachet in 1 liter of drinking water.',
        manufacturer: 'FDC Limited', countryOfOrigin: 'India', storage: 'Use solution within 24 hours of mixing.',
        images: [{ url: 'https://placehold.co/600x600?text=Electral+ORS', isPrimary: true, order: 0 }]
      },
      {
        name: 'Patanjali Aloe Vera Gel with Kesar Chandan 150ml',
        slug: 'patanjali-aloe-vera-gel-kesar-chandan',
        sku: 'SK-PAT-AVG-150',
        category: categoryMap['skin-care'],
        brand: brandMap['patanjali'],
        mrp: 110, price: 92, discount: 16, stock: 190,
        isBestSeller: true,
        shortDescription: 'Natural herbal skin nourishing gel with Saffron and Sandalwood.',
        description: 'Multi-purpose soothing gel that calms sunburn, moisturizes dry patches, and reduces dark spots with regular application.',
        manufacturer: 'Patanjali Ayurved Ltd', countryOfOrigin: 'India', storage: 'Store in cool dry place.',
        images: [{ url: 'https://placehold.co/600x600?text=Aloe+Vera+Gel', isPrimary: true, order: 0 }]
      }
    ];

    const seededProducts = [];
    for (const p of rawProducts) {
      const prod = await Product.findOneAndUpdate({ slug: p.slug }, p, { upsert: true, new: true });
      seededProducts.push(prod);

      // Create an inventory batch for each product
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 18);
      await InventoryBatch.findOneAndUpdate(
        { product: prod._id, batchNumber: `BTH-${prod.sku.replace(/-/g, '')}-26` },
        {
          product: prod._id,
          batchNumber: `BTH-${prod.sku.replace(/-/g, '')}-26`,
          expiryDate,
          quantity: prod.stock,
          mrp: prod.mrp,
          purchasePrice: Math.round(prod.mrp * 0.5),
          supplier: 'CareWell Central Logistics Hub'
        },
        { upsert: true }
      );
    }

    console.log('Seeding Homepage Sections...');
    const sections = [
      {
        type: 'hero_banner',
        title: 'Your Health, Our Priority',
        subtitle: 'Genuine Medicines & Healthcare Essentials',
        description: 'Order 100% authentic medicines, vitamins, and wellness products with doorstep delivery and verified pharmacist review.',
        ctaText: 'Shop Medicines',
        ctaLink: '/products',
        image: 'https://placehold.co/1200x500?text=CareWell+Pharmacy+Hero',
        backgroundColor: '#ecfdf5',
        textColor: '#064e3b',
        displayOrder: 1,
        isVisible: true
      },
      {
        type: 'category_collection',
        title: 'Shop by Category',
        subtitle: 'Explore our wide range of healthcare categories',
        displayOrder: 2,
        isVisible: true
      },
      {
        type: 'featured_products',
        title: 'Featured Products',
        subtitle: 'Handpicked healthcare essentials for your everyday well-being',
        productFilter: { featured: true, limit: 8 },
        displayOrder: 3,
        isVisible: true
      },
      {
        type: 'prescription_promo',
        title: 'Have a Doctor’s Prescription?',
        subtitle: 'Fast & Secure Home Delivery',
        description: 'Simply take a photo of your prescription and upload it. Our licensed pharmacist will verify the medicines and dispatch them directly to your door.',
        ctaText: 'Upload Prescription Now',
        ctaLink: '/upload-prescription',
        image: 'https://placehold.co/600x400?text=Upload+Prescription',
        backgroundColor: '#0f172a',
        textColor: '#ffffff',
        displayOrder: 4,
        isVisible: true
      },
      {
        type: 'best_sellers',
        title: 'Best Selling Essentials',
        subtitle: 'Most trusted by thousands of happy patients across India',
        productFilter: { bestSeller: true, limit: 8 },
        displayOrder: 5,
        isVisible: true
      },
      {
        type: 'wellness_collection',
        title: 'New Arrivals in Wellness',
        subtitle: 'Boost your active lifestyle with fresh nutritional supplements',
        productFilter: { isNew: true, limit: 6 },
        displayOrder: 6,
        isVisible: true
      },
      {
        type: 'trust_info',
        title: 'Why Choose CareWell Pharmacy?',
        subtitle: 'Healthcare backed by uncompromising quality and care',
        displayOrder: 7,
        isVisible: true,
        customData: {
          points: [
            { icon: 'ShieldCheck', title: '100% Genuine Medicines', description: 'Procured directly from verified pharmaceutical manufacturers and licensed distributors.' },
            { icon: 'Truck', title: 'Superfast Delivery', description: 'Same-day and express delivery available across metropolitan hubs.' },
            { icon: 'FileCheck', title: 'Licensed Pharmacists', description: 'Every prescription is rigorously reviewed by registered clinical pharmacists.' },
            { icon: 'RotateCcw', title: 'Easy 7-Day Returns', description: 'Hassle-free return policy on eligible wellness and unopened health products.' }
          ]
        }
      },
      {
        type: 'testimonials',
        title: 'What Our Patients Say',
        subtitle: 'Real stories from customers who rely on CareWell Pharmacy',
        displayOrder: 8,
        isVisible: true,
        customData: {
          reviews: [
            { name: 'Dr. Ramesh Sharma', role: 'Verified Patient', rating: 5, comment: 'CareWell delivered my chronic medicines within 3 hours when local pharmacies were out of stock. Outstanding service!' },
            { name: 'Ananya Deshmukh', role: 'Working Mother', rating: 5, comment: 'Prescription upload is seamless. The pharmacist called to double-check dosages before dispatching. Highly recommended!' },
            { name: 'Vikram Mehta', role: 'Fitness Enthusiast', rating: 5, comment: 'Authentic supplements at great discounts. Clean website and smooth checkout experience.' }
          ]
        }
      }
    ];

    for (const sec of sections) {
      await HomePageSection.findOneAndUpdate({ type: sec.type }, sec, { upsert: true });
    }

    console.log('Seeding Coupons...');
    const coupons = [
      {
        code: 'WELCOME10',
        description: '10% off your first order on orders above ₹299',
        type: 'percentage',
        value: 10,
        minPurchase: 299,
        maxDiscount: 100,
        isActive: true,
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      },
      {
        code: 'SAVE50',
        description: 'Flat ₹50 off on orders above ₹499',
        type: 'fixed',
        value: 50,
        minPurchase: 499,
        isActive: true,
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      },
      {
        code: 'HEALTH20',
        description: '20% off on all wellness & vitamin supplements',
        type: 'percentage',
        value: 20,
        minPurchase: 599,
        maxDiscount: 200,
        isActive: true,
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      }
    ];

    for (const cp of coupons) {
      await Coupon.findOneAndUpdate({ code: cp.code }, cp, { upsert: true });
    }

    console.log('Seeding CMS Pages...');
    const pages = [
      {
        title: 'About CareWell Pharmacy',
        slug: 'about-us',
        type: 'about',
        isPublished: true,
        content: `<h2>About CareWell Pharmacy</h2>
<p>Established in 2015, CareWell Pharmacy is India's premier digital healthcare and pharmacy destination. Our mission is to make authentic medications, nutritional supplements, and everyday health supplies easily accessible and affordable for every family.</p>
<h3>Our Commitment to Health</h3>
<p>Every product cataloged on CareWell is sourced exclusively from licensed pharmaceutical manufacturers. Our team of registered clinical pharmacists validates all prescription orders to ensure patient safety and drug interaction prevention.</p>
<ul>
<li><strong>100% Genuine:</strong> Direct-from-manufacturer sourcing guarantees zero counterfeits.</li>
<li><strong>Temperature Controlled:</strong> Cold-chain delivery for sensitive biologicals and vaccines.</li>
<li><strong>Customer Support:</strong> Dedicated pharmacist hotline available 7 days a week.</li>
</ul>`
      },
      {
        title: 'Privacy Policy',
        slug: 'privacy-policy',
        type: 'privacy',
        isPublished: true,
        content: `<h2>Privacy Policy</h2>
<p>CareWell Pharmacy is committed to protecting your confidential medical and personal data. This policy outlines how we collect, store, and safeguard your healthcare records.</p>
<h3>Data Security</h3>
<p>All prescription records and health history are encrypted using industry-standard AES-256 protocols. We never sell, lease, or share your medical records with unauthorized third parties or advertisers.</p>
<h3>Your Rights</h3>
<p>You have the absolute right to access your health records, request data deletion, or export your purchase history at any time through your account dashboard.</p>`
      },
      {
        title: 'Terms & Conditions',
        slug: 'terms-conditions',
        type: 'terms',
        isPublished: true,
        content: `<h2>Terms and Conditions of Service</h2>
<p>Please read these Terms carefully before using CareWell Pharmacy. By accessing or purchasing from our platform, you agree to be bound by these provisions.</p>
<h3>Prescription Policy</h3>
<p>Schedule H and H1 prescription medications strictly require a valid, non-expired prescription written by a registered medical practitioner. CareWell reserves the right to decline any order with invalid documentation.</p>
<h3>Pricing & Billing</h3>
<p>All prices listed on CareWell are inclusive of applicable GST taxes. In the event of an inadvertent technical pricing discrepancy, we will contact you before dispatch.</p>`
      },
      {
        title: 'Shipping & Delivery Policy',
        slug: 'shipping-policy',
        type: 'shipping',
        isPublished: true,
        content: `<h2>Shipping & Delivery Information</h2>
<p>CareWell Pharmacy delivers to over 19,000 pincodes across India through reputable logistics partners.</p>
<h3>Delivery Timelines</h3>
<ul>
<li><strong>Metro Hubs:</strong> Same-day or Next-day delivery (within 24 hours).</li>
<li><strong>Tier 2 & 3 Cities:</strong> 2 to 4 business days.</li>
<li><strong>Remote Regions:</strong> 5 to 7 business days.</li>
</ul>
<h3>Shipping Charges</h3>
<p>Standard delivery is ₹49 on orders below ₹599. Orders of ₹599 or above enjoy <strong>Free Shipping</strong> across India!</p>`
      },
      {
        title: 'Return & Refund Policy',
        slug: 'return-refund-policy',
        type: 'returns',
        isPublished: true,
        content: `<h2>Return and Refund Policy</h2>
<p>Your satisfaction and safety are paramount. We offer a 7-day return policy for eligible products.</p>
<h3>Eligible for Return</h3>
<ul>
<li>Unopened personal care, baby care, and wellness items in original seal.</li>
<li>Medical devices with manufacturing defects within warranty period.</li>
<li>Damaged, leaked, or incorrect items reported within 48 hours of delivery.</li>
</ul>
<h3>Non-Returnable Items</h3>
<p>Opened medicines, refrigerated products, and injectable biologicals cannot be returned due to government regulatory standards.</p>`
      },
      {
        title: 'Prescription Policy',
        slug: 'prescription-policy',
        type: 'prescription_policy',
        isPublished: true,
        content: `<h2>Prescription Verification Policy</h2>
<p>CareWell Pharmacy adheres strictly to the Drugs and Cosmetics Act and Central Drugs Standard Control Organisation (CDSCO) guidelines.</p>
<h3>Requirements for Valid Prescriptions</h3>
<ol>
<li>Doctor's Name, Medical Registration Number, and Clinic Address.</li>
<li>Patient's Name, Age, and Gender.</li>
<li>Clear Medicine Name, Strength, Dosage, and Duration.</li>
<li>Doctor's physical or verified digital signature with current date (less than 6 months old).</li>
</ol>`
      },
      {
        title: 'Medical Disclaimer',
        slug: 'disclaimer',
        type: 'disclaimer',
        isPublished: true,
        content: `<h2>Medical Disclaimer</h2>
<p>The product descriptions, health articles, dosage guidelines, and general wellness advice provided on CareWell Pharmacy are for informational and educational purposes only.</p>
<p>They do not constitute medical diagnosis, treatment, or clinical prescription. Always consult a qualified medical professional before initiating any new medication or dietary supplement regimen.</p>`
      }
    ];

    for (const p of pages) {
      await CMSPage.findOneAndUpdate({ slug: p.slug }, p, { upsert: true });
    }

    console.log('Seeding FAQs...');
    const faqs = [
      { question: 'How do I place an order for prescription medicines?', answer: 'Search for your medicine, add it to your cart, and proceed to checkout. During checkout, you will be prompted to upload a photo or PDF of your doctor\'s prescription. Our licensed pharmacist will review it before dispatch.', category: 'Prescriptions', order: 1 },
      { question: 'How long does prescription verification take?', answer: 'Our registered pharmacists review uploaded prescriptions within 15 to 30 minutes during working hours (8:00 AM to 10:00 PM).', category: 'Prescriptions', order: 2 },
      { question: 'What is the minimum order amount for free delivery?', answer: 'Orders of ₹599 or above qualify for free standard home delivery across all serviceable pincodes in India.', category: 'Shipping', order: 3 },
      { question: 'Can I pay via Cash on Delivery (COD)?', answer: 'Yes! Cash on Delivery is available for all eligible orders and pin codes up to ₹5,000.', category: 'Payments', order: 4 },
      { question: 'How can I track my order?', answer: 'Once your order is packed and dispatched, a tracking ID and link will be provided in your Account > Orders section, and sent via SMS and email.', category: 'Ordering', order: 5 },
      { question: 'What happens if my prescription is rejected?', answer: 'If our pharmacist cannot verify your prescription (e.g. illegible handwriting or expired date), you will receive a notification with the specific reason and the option to re-upload a clear copy.', category: 'Prescriptions', order: 6 },
      { question: 'How do I return a product?', answer: 'Navigate to Account > Orders, select the delivered order, and click "Request Return". Pack the item in its original condition for our courier partner to collect.', category: 'Returns', order: 7 },
      { question: 'Are all medicines sold on CareWell 100% genuine?', answer: 'Yes, absolutely. CareWell Pharmacy sources directly from licensed pharmaceutical companies and their certified distributors with full batch tracking.', category: 'General', order: 8 },
      { question: 'Can I cancel an order after placing it?', answer: 'You can cancel an order anytime before it is shipped directly from your Account > Orders page.', category: 'Ordering', order: 9 },
      { question: 'How long does a refund take to process?', answer: 'Approved refunds are credited back to your original payment method within 3 to 5 business days.', category: 'Payments', order: 10 }
    ];

    for (const f of faqs) {
      await FAQ.findOneAndUpdate({ question: f.question }, f, { upsert: true });
    }

    console.log('Seeding Blog Posts...');
    const blogs = [
      {
        title: '5 Essential Vitamins to Strengthen Your Immune System',
        slug: '5-essential-vitamins-for-immunity',
        excerpt: 'Discover the top clinically proven vitamins and trace minerals that protect your body against seasonal infections and daily fatigue.',
        content: `<h3>Strengthen Your Body's Natural Defense</h3>
<p>Maintaining a resilient immune system is essential for daily vitality and longevity. Here are the top 5 micronutrients supported by clinical science:</p>
<h4>1. Vitamin C (Ascorbic Acid)</h4>
<p>A powerhouse antioxidant that stimulates white blood cell production and protects tissues against oxidative stress.</p>
<h4>2. Vitamin D3 (The Sunshine Vitamin)</h4>
<p>Critical for activating T-cells and regulating adaptive immune responses. Most urban adults are deficient and benefit from regular supplementation.</p>
<h4>3. Zinc Elemental</h4>
<p>Vital for cellular metabolism and wound healing. Taking zinc at the onset of cold symptoms significantly reduces recovery time.</p>
<h4>4. Vitamin E</h4>
<p>A fat-soluble antioxidant that protects cellular membranes from environmental pollutants and free radical damage.</p>
<h4>5. B-Complex Group</h4>
<p>Vitamins B6, B9, and B12 are instrumental in synthesizing antibodies and supporting cellular energy turnover.</p>`,
        category: 'Health & Wellness',
        tags: ['Vitamins', 'Immunity', 'Nutrition'],
        coverImage: 'https://placehold.co/800x450?text=Immunity+Vitamins',
        isPublished: true,
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        readTime: 4
      },
      {
        title: 'How to Safely Store Medicines at Home: Essential Guidelines',
        slug: 'how-to-store-medicines-safely-at-home',
        excerpt: 'Avoid common medication storage mistakes that reduce potency and learn how to keep your home medicine cabinet safe for children.',
        content: `<h3>Protecting Medicine Potency</h3>
<p>Did you know storing medications in your bathroom cabinet can degrade their active ingredients? Heat and humidity from showers break down chemical bonds.</p>
<h4>Golden Rules of Medication Storage:</h4>
<ul>
<li><strong>Avoid the Bathroom:</strong> Store non-refrigerated medicines in a cool, dry bedroom closet or kitchen pantry away from stoves.</li>
<li><strong>Watch Temperature Limits:</strong> Standard room temperature means below 25°C to 30°C. Protect syrups and tablets from direct sunlight.</li>
<li><strong>Refrigeration vs Freezing:</strong> Store insulin, biologicals, and certain eye drops between 2°C and 8°C. Never freeze medications unless explicitly instructed.</li>
<li><strong>Child Safety First:</strong> Keep all pharmaceuticals in elevated, child-resistant cabinets locked away from young children.</li>
</ul>`,
        category: 'Pharmacy Advice',
        tags: ['Safety', 'Medications', 'Storage Tips'],
        coverImage: 'https://placehold.co/800x450?text=Safe+Medicine+Storage',
        isPublished: true,
        publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        readTime: 5
      },
      {
        title: 'Understanding Your Doctor’s Prescription: Key Abbreviations Explained',
        slug: 'understanding-your-prescription',
        excerpt: 'Demystifying common Latin abbreviations and instructions found on medical prescriptions.',
        content: `<h3>Decoding the Doctor’s Shorthand</h3>
<p>Medical prescriptions frequently contain traditional Latin abbreviations that specify timing and dosage. Here is a handy guide:</p>
<table border="1" cellpadding="8" style="border-collapse:collapse;width:100%">
<tr><th>Abbreviation</th><th>Latin Meaning</th><th>English Instruction</th></tr>
<tr><td>OD</td><td>Omni Die</td><td>Once daily</td></tr>
<tr><td>BD / BID</td><td>Bis in Die</td><td>Twice daily (every 12 hours)</td></tr>
<tr><td>TDS / TID</td><td>Ter in Die</td><td>Three times daily (every 8 hours)</td></tr>
<tr><td>SOS</td><td>Si Opus Sit</td><td>As needed / In emergency</td></tr>
<tr><td>AC</td><td>Ante Cibum</td><td>Before meals</td></tr>
<tr><td>PC</td><td>Post Cibum</td><td>After meals</td></tr>
<tr><td>HS</td><td>Hora Somni</td><td>At bedtime</td></tr>
</table>
<p>If you are ever uncertain about medication frequency or food interactions, always consult your CareWell pharmacist.</p>`,
        category: 'Patient Guide',
        tags: ['Prescriptions', 'Doctor Advice', 'Healthcare Guide'],
        coverImage: 'https://placehold.co/800x450?text=Prescription+Guide',
        isPublished: true,
        publishedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        readTime: 3
      }
    ];

    for (const b of blogs) {
      await BlogPost.findOneAndUpdate({ slug: b.slug }, b, { upsert: true });
    }

    console.log('Seeding Navigation Menus...');
    const navigationData = [
      {
        name: 'Header Menu',
        location: 'header',
        items: [
          { label: 'Home', url: '/', order: 1 },
          { label: 'All Products', url: '/products', order: 2 },
          { label: 'Medicines', url: '/category/medicines', order: 3 },
          { label: 'Vitamins', url: '/category/vitamins-supplements', order: 4 },
          { label: 'Ayurvedic', url: '/category/ayurvedic', order: 5 },
          { label: 'Upload Prescription', url: '/upload-prescription', order: 6 },
          { label: 'Health Blog', url: '/blog', order: 7 }
        ]
      },
      {
        name: 'Footer Column 1 - Company',
        location: 'footer_col1',
        items: [
          { label: 'About Us', url: '/pages/about-us', order: 1 },
          { label: 'Our Pharmacists', url: '/pages/about-us', order: 2 },
          { label: 'Health Blog', url: '/blog', order: 3 },
          { label: 'Contact Us', url: '/contact', order: 4 }
        ]
      },
      {
        name: 'Footer Column 2 - Help & Support',
        location: 'footer_col2',
        items: [
          { label: 'Frequently Asked Questions', url: '/faq', order: 1 },
          { label: 'Shipping & Delivery', url: '/pages/shipping-policy', order: 2 },
          { label: 'Returns & Refunds', url: '/pages/return-refund-policy', order: 3 },
          { label: 'Upload Prescription', url: '/upload-prescription', order: 4 }
        ]
      },
      {
        name: 'Footer Column 3 - Policies',
        location: 'footer_col3',
        items: [
          { label: 'Privacy Policy', url: '/pages/privacy-policy', order: 1 },
          { label: 'Terms & Conditions', url: '/pages/terms-conditions', order: 2 },
          { label: 'Prescription Policy', url: '/pages/prescription-policy', order: 3 },
          { label: 'Medical Disclaimer', url: '/pages/disclaimer', order: 4 }
        ]
      }
    ];

    for (const nav of navigationData) {
      await NavigationMenu.findOneAndUpdate({ location: nav.location }, nav, { upsert: true });
    }

    console.log('Seeding Sample Orders for John Doe...');
    const p1 = seededProducts[0]; // Paracetamol
    const p2 = seededProducts[4]; // Vitamin C

    const sampleOrder1 = await Order.findOneAndUpdate(
      { orderNumber: 'CW261017001' },
      {
        orderNumber: 'CW261017001',
        user: johnDoe._id,
        customerInfo: { name: johnDoe.name, email: johnDoe.email, phone: johnDoe.phone },
        items: [
          {
            product: p1._id,
            productName: p1.name,
            productSlug: p1.slug,
            sku: p1.sku,
            price: p1.price,
            mrp: p1.mrp,
            discount: p1.discount,
            quantity: 2,
            image: p1.images[0]?.url
          },
          {
            product: p2._id,
            productName: p2.name,
            productSlug: p2.slug,
            sku: p2.sku,
            price: p2.price,
            mrp: p2.mrp,
            discount: p2.discount,
            quantity: 1,
            image: p2.images[0]?.url
          }
        ],
        shippingAddress: johnDoe.addresses[0],
        subtotal: p1.price * 2 + p2.price,
        shippingCharge: 0,
        couponCode: 'WELCOME10',
        couponDiscount: 36,
        taxAmount: 40,
        totalAmount: p1.price * 2 + p2.price - 36,
        status: 'delivered',
        statusHistory: [
          { status: 'pending_confirmation', note: 'Order placed by customer', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
          { status: 'confirmed', note: 'Payment verified and order confirmed', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 3600000) },
          { status: 'shipped', note: 'Shipped with BlueDart (Tracking: BD8392193)', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
          { status: 'delivered', note: 'Delivered to customer', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }
        ],
        paymentStatus: 'paid',
        paymentMethod: 'demo_upi',
        courier: 'BlueDart Express',
        trackingNumber: 'BD8392193',
        deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      { upsert: true, new: true }
    );

    console.log('Seeding Product Reviews...');
    await Review.findOneAndUpdate(
      { product: p1._id, user: johnDoe._id },
      {
        product: p1._id,
        user: johnDoe._id,
        order: sampleOrder1._id,
        rating: 5,
        title: 'Effective and authentic medicine',
        comment: 'Worked very fast for reducing fever. Received in genuine intact blister pack with good expiry date.',
        status: 'approved',
        isVerifiedPurchase: true
      },
      { upsert: true }
    );

    // Update product rating summary
    await Product.findByIdAndUpdate(p1._id, {
      'reviewSummary.average': 5.0,
      'reviewSummary.count': 1,
      'reviewSummary.distribution': { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1 }
    });

    console.log('----------------------------------------------------');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('----------------------------------------------------');
    console.log(`- 2 Admin Accounts (admin@carewell.com / Admin@123)`);
    console.log(`- 3 Demo Users (john@demo.com / Demo@123, jane@demo.com, demo.google@carewell.com)`);
    console.log(`- 6 Brands`);
    console.log(`- 10 Categories`);
    console.log(`- 30 Pharmacy Products with Batches & Real Pricing`);
    console.log(`- 8 Dynamic Homepage Sections`);
    console.log(`- 3 Active Coupons (WELCOME10, SAVE50, HEALTH20)`);
    console.log(`- 7 CMS Policy Pages`);
    console.log(`- 10 Categorized FAQs`);
    console.log(`- 3 Health Articles`);
    console.log(`- Store Settings & Navigation Menus`);
    console.log(`- Sample Orders & Verified Customer Reviews`);
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed with error:', error);
    process.exit(1);
  }
};

seedData();
