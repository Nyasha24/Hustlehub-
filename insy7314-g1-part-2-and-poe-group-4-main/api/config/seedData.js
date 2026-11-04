const bcrypt = require('bcrypt');
const User = require('../models/User');
const Gig = require('../models/Gig');

const SEED_FREELANCERS = [
  {
    fullName: 'Sipho Ndlovu',
    email: 'sipho.dev@hustlehub.co.za',
    password: 'Password123!',
    role: 'freelancer'
  },
  {
    fullName: 'Anika Van Der Merwe',
    email: 'anika.design@hustlehub.co.za',
    password: 'Password123!',
    role: 'freelancer'
  },
  {
    fullName: 'Tariq Pillay',
    email: 'tariq.ai@hustlehub.co.za',
    password: 'Password123!',
    role: 'freelancer'
  },
  {
    fullName: 'Zola Mthembu',
    email: 'zola.marketing@hustlehub.co.za',
    password: 'Password123!',
    role: 'freelancer'
  }
];

const SEED_GIGS_TEMPLATES = [
  // 1. Web Development
  {
    freelancerIndex: 0,
    title: 'Full-Stack React 19 & Node.js Scalable Web App',
    category: 'Web Development',
    price: 6500,
    deliveryDays: 7,
    location: 'Cape Town, Western Cape',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    tags: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'Full-Stack'],
    description: 'Architecting enterprise-grade, high-performance web applications with modern React 19, Node.js, Express, and MongoDB. Includes responsive desktop/mobile layouts, automated Jest test coverage, Docker configuration, and production deployment.'
  },
  {
    freelancerIndex: 0,
    title: 'Modern Next.js 15 & Tailwind E-Commerce Storefront',
    category: 'Web Development',
    price: 8200,
    deliveryDays: 10,
    location: 'Sandton, Johannesburg, Gauteng',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    tags: ['Next.js', 'Tailwind', 'E-Commerce', 'PayFast', 'Stripe'],
    description: 'End-to-end modern digital storefront with lightning-fast SSR, Stripe/PayFast South African payment gateway integration, inventory management, dynamic cart, and SEO optimization.'
  },

  // 2. Design & Creative
  {
    freelancerIndex: 1,
    title: 'Brand Identity System & Figma Design Tokens',
    category: 'Design & Creative',
    price: 4800,
    deliveryDays: 5,
    location: 'Stellenbosch, Western Cape',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80',
    tags: ['Branding', 'Figma', 'Logo Design', 'Design System', 'UI/UX'],
    description: 'Bespoke visual identity creation including vector logo typography, dynamic color palette, typography guidelines, brand iconography, and production-ready Figma component library.'
  },
  {
    freelancerIndex: 1,
    title: 'Mobile App UI/UX Design & High-Fidelity Prototype',
    category: 'Design & Creative',
    price: 5500,
    deliveryDays: 6,
    location: 'Durban, KwaZulu-Natal',
    image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80',
    tags: ['Mobile UX', 'iOS', 'Android', 'Figma', 'Prototyping'],
    description: 'User-centric mobile interface design for iOS and Android. Includes user journey wireframing, interactive micro-interactions, clickable high-fidelity Figma prototype, and developer handoff specs.'
  },

  // 3. Digital Marketing
  {
    freelancerIndex: 3,
    title: 'Full-Funnel Google Search & Meta Performance Ads',
    category: 'Digital Marketing',
    price: 3800,
    deliveryDays: 4,
    location: 'Pretoria, Gauteng',
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80',
    tags: ['Google Ads', 'Meta Ads', 'PPC', 'Analytics', 'Growth'],
    description: 'Data-driven performance marketing campaign setup. Includes audience persona segmentation, conversion tracking pixels, negative keyword optimization, and custom weekly ROAS dashboards.'
  },
  {
    freelancerIndex: 3,
    title: 'Technical SEO Audit & High-Converting Content Strategy',
    category: 'Digital Marketing',
    price: 3200,
    deliveryDays: 3,
    location: 'Rosebank, Johannesburg, Gauteng',
    image: 'https://images.unsplash.com/photo-1432888622747-4eb9a8f2c293?auto=format&fit=crop&w=800&q=80',
    tags: ['SEO', 'Core Web Vitals', 'Content Strategy', 'Organic Growth'],
    description: 'Comprehensive Core Web Vitals optimization, schema markup injection, backlink gap analysis, and content calendar designed to rank #1 on Google South Africa for high-intent commercial keywords.'
  },

  // 4. Writing & Translation
  {
    freelancerIndex: 0,
    title: 'Technical Whitepaper, API Documentation & Guides',
    category: 'Writing & Translation',
    price: 4200,
    deliveryDays: 5,
    location: 'Cape Town, Western Cape',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
    tags: ['Technical Writing', 'API Docs', 'Swagger', 'Whitepaper'],
    description: 'Clear, authoritative technical documentation for developer APIs, SDKs, architecture diagrams, and cryptographic protocols. Delivered in Markdown, OpenAPI / Swagger specs, and polished PDF format.'
  },
  {
    freelancerIndex: 3,
    title: 'Executive Pitch Deck Copywriting & Investor Memorandum',
    category: 'Writing & Translation',
    price: 3600,
    deliveryDays: 4,
    location: 'Century City, Cape Town',
    image: 'https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?auto=format&fit=crop&w=800&q=80',
    tags: ['Copywriting', 'Pitch Deck', 'Venture Capital', 'Narrative'],
    description: 'Compelling narrative development for tech startups raising Seed to Series A capital. Value proposition refinement, market opportunity synthesis, and financial thesis articulation.'
  },

  // 5. Video & Animation
  {
    freelancerIndex: 1,
    title: 'Cinematic Commercial Video Editing & DaVinci Grading',
    category: 'Video & Animation',
    price: 5200,
    deliveryDays: 5,
    location: 'Kloof Street, Cape Town',
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
    tags: ['Video Editing', 'DaVinci Resolve', 'Color Grading', 'Sound Design'],
    description: 'High-end 4K commercial editing, multi-cam synchronization, DaVinci Resolve color grading, audio leveling, and sound design tailored for broadcast, YouTube, and TikTok/Reels.'
  },
  {
    freelancerIndex: 1,
    title: '2D Motion Graphics & SaaS Product Explainer Video',
    category: 'Video & Animation',
    price: 6100,
    deliveryDays: 7,
    location: 'Centurion, Gauteng',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    tags: ['Motion Graphics', 'After Effects', 'Explainer Video', 'Animation'],
    description: 'Dynamic 60-second After Effects product explainer animation with custom character rigging, isometric UI illustrations, professional voiceover sync, and licensed background score.'
  },

  // 6. AI & Tech Consulting
  {
    freelancerIndex: 2,
    title: 'Enterprise RAG Pipeline & Multi-Agent AI System',
    category: 'AI & Tech Consulting',
    price: 9500,
    deliveryDays: 8,
    location: 'Umhlanga, Durban, KwaZulu-Natal',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
    tags: ['AI', 'RAG', 'LLMs', 'Vector Search', 'LangChain', 'Python'],
    description: 'Custom Retrieval-Augmented Generation (RAG) system with vector embeddings, semantic hybrid search (Pinecone/Milvus), LangChain/LlamaIndex orchestrators, and private document processing.'
  },
  {
    freelancerIndex: 2,
    title: 'AWS & GCP Cloud Architecture Security Audit',
    category: 'AI & Tech Consulting',
    price: 7800,
    deliveryDays: 6,
    location: 'Sandton, Johannesburg, Gauteng',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    tags: ['Cloud Security', 'AWS', 'GCP', 'DevOps', 'Terraform', 'Audit'],
    description: 'Comprehensive cloud posture assessment, IAM least-privilege enforcement, Terraform IaC infrastructure audit, automated vulnerability scanning, and OWASP compliance reporting.'
  }
];

const MTHUNZI_TEST_ACCOUNTS = [
  {
    fullName: 'Mthunzi Sibiya',
    email: 'mthunzi.sibiya2005@gmail.com',
    password: 'Paris123!',
    role: 'client'
  },
  {
    fullName: 'Mthunzi Sibiya',
    email: 'mthunzisibiya2005@gmail.com',
    password: 'Paris123!',
    role: 'client'
  },
  {
    fullName: 'Mthunzi Sibiya (Freelancer)',
    email: 'mthunzi.sibiya2006@gmail.com',
    password: 'Paris123!',
    role: 'freelancer'
  },
  {
    fullName: 'Mthunzi Sibiya (Freelancer)',
    email: 'mthunzisibiya2006@gmail.com',
    password: 'Paris123!',
    role: 'freelancer'
  },
  {
    fullName: 'Mthunzi Sibiya (Admin)',
    email: 'mthunzi.sibiya2007@gmail.com',
    password: 'Paris123!',
    role: 'admin'
  },
  {
    fullName: 'Mthunzi Sibiya (Admin)',
    email: 'mthunzisibiya2007@gmail.com',
    password: 'Paris123!',
    role: 'admin'
  }
];

const seedInitialGigs = async (force = false) => {
  try {
    // Always upsert Mthunzi's personal & test accounts with verified password and roles
    console.log('Syncing Mthunzi verified test accounts (2005 client, 2006 freelancer, 2007 admin)...');
    const createdMthunziAccounts = [];
    for (const acc of MTHUNZI_TEST_ACCOUNTS) {
      const passwordHash = await bcrypt.hash(acc.password, 12);
      let user = await User.findOne({ email: acc.email });
      if (user) {
        user.passwordHash = passwordHash;
        user.role = acc.role;
        user.fullName = acc.fullName;
        await user.save();
      } else {
        user = await User.create({
          fullName: acc.fullName,
          email: acc.email,
          passwordHash,
          role: acc.role
        });
      }
      createdMthunziAccounts.push(user);
    }

    const existingCount = await Gig.countDocuments();
    if (existingCount > 0 && !force) {
      console.log(`Database already has ${existingCount} gigs. Skipping auto-seed.`);
      return { count: existingCount, seeded: false };
    }

    console.log('Seeding initial verified freelancers and high-quality gigs...');

    if (force) {
      await Gig.deleteMany({});
    }

    // Upsert Freelancers
    const createdFreelancers = [];
    for (const f of SEED_FREELANCERS) {
      let user = await User.findOne({ email: f.email });
      if (!user) {
        const passwordHash = await bcrypt.hash(f.password, 12);
        user = await User.create({
          fullName: f.fullName,
          email: f.email,
          passwordHash,
          role: f.role
        });
      }
      createdFreelancers.push(user);
    }

    // Create Gigs (link the second freelancer to Mthunzi's freelancer account for live testing)
    const mthunziFreelancer = createdMthunziAccounts.find(a => a.email === 'mthunzi.sibiya2006@gmail.com') || createdFreelancers[0];

    for (let i = 0; i < SEED_GIGS_TEMPLATES.length; i++) {
      const gig = SEED_GIGS_TEMPLATES[i];
      // Assign the first 2 gigs to Mthunzi Freelancer so they show in his dashboard
      const freelancer = i < 2 ? mthunziFreelancer : (createdFreelancers[gig.freelancerIndex] || createdFreelancers[0]);
      await Gig.create({
        title: gig.title,
        category: gig.category,
        price: gig.price,
        deliveryDays: gig.deliveryDays,
        location: gig.location,
        image: gig.image,
        tags: gig.tags,
        description: gig.description,
        freelancer: freelancer._id
      });
    }

    console.log(`Successfully seeded ${SEED_GIGS_TEMPLATES.length} premium gigs across all categories!`);
    return { count: SEED_GIGS_TEMPLATES.length, seeded: true };
  } catch (err) {
    console.error('Auto-seed failed:', err.message);
    throw err;
  }
};

module.exports = { seedInitialGigs, SEED_FREELANCERS, SEED_GIGS_TEMPLATES, MTHUNZI_TEST_ACCOUNTS };
