const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Configuration
const SEED_CONFIG = {
  // User configurations
  users: [
    {
      email: 'anonymous.inbox99@gmail.com',
      password: 'admin@pass',
      username: 'admin',
      isVerified: false,
      role: 'admin'
    }
  ],
  
  // Blog post configurations
  blogPosts: [
    {
      title: 'Welcome to Lanmic Blog',
      description: 'This is the first blog post on our platform. Learn about our features and how to get started.',
      content: `# Welcome to Lanmic Blog

This is your first blog post! Here's what you can do:

## Features
- Create and manage blog posts
- Upload images for your posts
- Categorize your content
- Publish or save as drafts

## Getting Started
1. Navigate to the dashboard
2. Click "Create New Post"
3. Fill in the details
4. Upload an image (optional)
5. Publish your post

Happy blogging! 🚀`,
      category: 'General',
      readTime: '3 min read',
      authorName: 'Admin',
      authorPosition: 'Platform Administrator',
      published: true
    },
    {
      title: 'How to Write Great Content',
      description: 'Tips and tricks for creating engaging blog posts that your readers will love.',
      content: `# How to Write Great Content

Writing great content is an art that can be learned. Here are some tips:

## 1. Know Your Audience
- Research your target audience
- Understand their pain points
- Write in their language

## 2. Create Compelling Headlines
- Use numbers and lists
- Ask questions
- Create curiosity

## 3. Structure Your Content
- Use headings and subheadings
- Break up long paragraphs
- Include bullet points and lists

## 4. Add Visual Elements
- Include relevant images
- Use infographics
- Add videos when appropriate

## 5. Edit and Proofread
- Check for grammar errors
- Ensure clarity
- Read aloud for flow

Remember: Great content takes time and effort, but the results are worth it!`,
      category: 'Writing',
      readTime: '5 min read',
      authorName: 'Admin',
      authorPosition: 'Content Creator',
      published: true
    },
    {
      title: 'Draft Post - Coming Soon',
      description: 'This is a draft post that will be published later.',
      content: `# Draft Post - Coming Soon

This is a draft post that demonstrates how unpublished content looks.

## What's Coming
- More exciting content
- New features
- Updates and improvements

Stay tuned for more!`,
      category: 'Updates',
      readTime: '2 min read',
      authorName: 'Admin',
      authorPosition: 'Platform Administrator',
      published: false
    },
    {
      title: 'Advanced Blogging Techniques',
      description: 'Learn advanced techniques to take your blogging to the next level.',
      content: `# Advanced Blogging Techniques

Ready to level up your blogging game? Here are some advanced techniques:

## SEO Optimization
- Keyword research and placement
- Meta descriptions
- Internal linking strategies
- Image optimization

## Content Strategy
- Editorial calendar planning
- Content pillar approach
- Repurposing content
- Guest posting

## Engagement Tactics
- Call-to-action optimization
- Comment management
- Social media integration
- Email list building

## Analytics and Optimization
- Traffic analysis
- Conversion tracking
- A/B testing
- Performance monitoring

Master these techniques to become a blogging pro!`,
      category: 'Advanced',
      readTime: '7 min read',
      authorName: 'Admin',
      authorPosition: 'Blogging Expert',
      published: true
    }
  ]
};

async function clearDatabase() {
  console.log('🗑️  Clearing existing data...');
  
  // Delete in correct order to respect foreign key constraints
  await prisma.refreshToken.deleteMany({});
  console.log('   ✅ Cleared refresh tokens');
  
  await prisma.blogPost.deleteMany({});
  console.log('   ✅ Cleared blog posts');
  
  await prisma.user.deleteMany({});
  console.log('   ✅ Cleared users');
}

async function createUsers() {
  console.log('\n👥 Creating users...');
  const users = [];
  
  for (const userConfig of SEED_CONFIG.users) {
    const hashedPassword = await bcrypt.hash(userConfig.password, 12);
    
    const user = await prisma.user.create({
      data: {
        email: userConfig.email,
        password: hashedPassword,
        username: userConfig.username,
        isVerified: userConfig.isVerified,
        otp: null,
        otpExpiresAt: null,
        newEmail: null,
      },
    });
    
    users.push(user);
    console.log(`   ✅ User created: ${user.username} (${user.email}) - ${user.isVerified ? 'Verified' : 'Not Verified'}`);
  }
  
  return users;
}

async function createBlogPosts(users) {
  console.log('\n📝 Creating blog posts...');
  const adminUser = users.find(u => u.username === 'admin');
  
  if (!adminUser) {
    throw new Error('Admin user not found');
  }
  
  const blogPosts = [];
  
  for (const postConfig of SEED_CONFIG.blogPosts) {
    const blogPost = await prisma.blogPost.create({
      data: {
        ...postConfig,
        userId: adminUser.id,
        authorImage: null,
        blogImage: null,
      },
    });
    
    blogPosts.push(blogPost);
    console.log(`   ✅ Blog post created: "${blogPost.title}" (${blogPost.published ? 'Published' : 'Draft'})`);
  }
  
  return blogPosts;
}

async function displaySummary(users, blogPosts) {
  console.log('\n📊 Seed Summary');
  console.log('================');
  console.log(`✅ Users created: ${users.length}`);
  console.log(`✅ Blog posts created: ${blogPosts.length}`);
  console.log(`✅ Refresh tokens: 0 (clean slate)`);
  
  console.log('\n🔑 Login Credentials');
  console.log('===================');
  
  for (const user of users) {
    const userConfig = SEED_CONFIG.users.find(u => u.email === user.email);
    console.log(`${userConfig.role.charAt(0).toUpperCase() + userConfig.role.slice(1)} User:`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Password: ${userConfig.password}`);
    console.log(`  Status: ${user.isVerified ? 'Verified (ready to use)' : 'Not verified (must verify email)'}`);
    console.log('');
  }
  
  console.log('📚 Sample Blog Posts');
  console.log('===================');
  for (const post of blogPosts) {
    console.log(`• "${post.title}" (${post.category}) - ${post.published ? 'Published' : 'Draft'}`);
  }
}

async function main() {
  console.log('🌱 Starting advanced database seed...');
  console.log('=====================================');
  
  try {
    // Clear existing data
    await clearDatabase();
    
    // Create fresh data
    const users = await createUsers();
    const blogPosts = await createBlogPosts(users);
    
    // Display summary
    await displaySummary(users, blogPosts);
    
    console.log('\n🎉 Advanced database seed completed successfully!');
    console.log('================================================');
    
  } catch (error) {
    console.error('❌ Advanced seed failed:', error);
    throw error;
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const command = args[0];

if (command === '--help' || command === '-h') {
  console.log('Advanced Database Seed Script');
  console.log('=============================');
  console.log('');
  console.log('Usage:');
  console.log('  node scripts/seed-advanced.js [options]');
  console.log('');
  console.log('Options:');
  console.log('  --help, -h     Show this help message');
  console.log('  --clear-only   Only clear the database (no new data)');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/seed-advanced.js');
  console.log('  node scripts/seed-advanced.js --clear-only');
  process.exit(0);
}

if (command === '--clear-only') {
  console.log('🗑️  Clearing database only...');
  clearDatabase()
    .then(() => {
      console.log('✅ Database cleared successfully!');
      process.exit(0);
    })
    .catch((e) => {
      console.error('❌ Clear failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
} else {
  main()
    .catch((e) => {
      console.error('❌ Advanced seed process failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
