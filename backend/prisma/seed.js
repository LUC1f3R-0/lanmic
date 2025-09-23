const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');
  console.log('================================');

  try {
    // Step 1: Clear all existing data
    console.log('🗑️  Clearing existing data...');
    
    // Delete in correct order to respect foreign key constraints
    await prisma.refreshToken.deleteMany({});
    console.log('   ✅ Cleared refresh tokens');
    
    await prisma.blogPost.deleteMany({});
    console.log('   ✅ Cleared blog posts');
    
    await prisma.user.deleteMany({});
    console.log('   ✅ Cleared users');

    // Step 2: Create fresh data
    console.log('\n📝 Creating fresh data...');

    // Hash password with the same salt rounds as the auth service
    const adminPassword = await bcrypt.hash('admin@pass', 12);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'anonymous.inbox99@gmail.com',
        password: adminPassword,
        username: 'admin',
        isVerified: false, // User must verify email to access dashboard
        otp: null,
        otpExpiresAt: null,
        newEmail: null,
      },
    });

    console.log('   ✅ Admin user created:', {
      id: adminUser.id,
      email: adminUser.email,
      username: adminUser.username,
      isVerified: adminUser.isVerified,
    });

    // Create sample blog posts
    const sampleBlogPosts = [
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
        authorImage: null,
        blogImage: null,
        published: true,
        userId: adminUser.id,
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
        authorImage: null,
        blogImage: null,
        published: true,
        userId: adminUser.id,
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
        authorImage: null,
        blogImage: null,
        published: false, // This is a draft
        userId: adminUser.id,
      },
    ];

    for (const postData of sampleBlogPosts) {
      const blogPost = await prisma.blogPost.create({
        data: postData,
      });
      console.log(`   ✅ Blog post created: "${blogPost.title}" (${blogPost.published ? 'Published' : 'Draft'})`);
    }

    // Step 3: Summary
    console.log('\n📊 Seed Summary');
    console.log('================');
    console.log(`✅ Users created: 1`);
    console.log(`✅ Blog posts created: ${sampleBlogPosts.length}`);
    console.log(`✅ Refresh tokens: 0 (clean slate)`);
    
    console.log('\n🔑 Login Credentials');
    console.log('===================');
    console.log('Admin User:');
    console.log('  Email: anonymous.inbox99@gmail.com');
    console.log('  Password: admin@pass');
    console.log('  Status: Not verified (must verify email)');

    console.log('\n🎉 Database seed completed successfully!');
    console.log('==========================================');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed process failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
