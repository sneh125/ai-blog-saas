import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp, increment, setDoc } from 'firebase/firestore';
import { isAdmin, canGenerateBlog, PlanType } from '@/lib/admin';
import { countWords } from '@/lib/utils';
import { checkBlogLimit, checkWordLimit, updateUsage, UsageLimitError } from '@/lib/usage-limits';

export async function POST(request: NextRequest) {
  try {
    const { keyword, userId, wordCount = 1200 } = await request.json();

    console.log('Blog generation request:', { keyword, userId, wordCount });

    if (!keyword || !userId) {
      return NextResponse.json(
        { error: 'Keyword and userId are required' },
        { status: 400 }
      );
    }

    try {
      // Check usage limits BEFORE generating content
      console.log('Checking usage limits...');
      
      try {
        await checkBlogLimit(userId);
        await checkWordLimit(userId, wordCount);
        console.log('Usage limits check passed');
      } catch (error) {
        if (error instanceof UsageLimitError) {
          return NextResponse.json(
            { 
              error: error.message,
              limitType: error.limitType,
              upgradeRequired: true 
            },
            { status: 429 } // Too Many Requests
          );
        }
        throw error;
      }

      // Get user data
      console.log('Fetching user document for userId:', userId);
      
      const userDoc = await getDoc(doc(db, 'users', userId));
      let userData;
      
      if (!userDoc.exists()) {
        // Create new user with default data
        userData = {
          email: 'user@example.com',
          plan: 'FREE',
          blogCredits: 0,
          wordsUsed: 0,
          teamMembersCount: 1,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        
        await setDoc(doc(db, 'users', userId), userData, { merge: true });
        console.log('User document created successfully');
      } else {
        userData = userDoc.data();
      }

      const userPlan = userData.plan || 'FREE';
      console.log('User plan:', userPlan);

      console.log('Starting blog content generation...');

      // Generate demo content for now
      const blogContent = generateDemoContent(keyword, wordCount);
      const actualWordCount = countWords(blogContent);

      console.log('Blog content generated, word count:', actualWordCount);

      // Update usage AFTER successful generation
      await updateUsage(userId, actualWordCount);
      console.log('Usage updated successfully');

      // Save blog to Firestore
      const blogData = {
        userId,
        keyword,
        content: blogContent,
        wordCount: actualWordCount,
        seoData: {},
        createdAt: serverTimestamp(),
        plan: userPlan,
      };

      console.log('Saving blog to Firestore...');
      const blogRef = await addDoc(collection(db, 'blogs'), blogData);
      console.log('Blog saved with ID:', blogRef.id);

      // Get updated user data for credits remaining
      const updatedUserDoc = await getDoc(doc(db, 'users', userId));
      const updatedUserData = updatedUserDoc.data();
      
      console.log('Blog generation completed successfully');

      return NextResponse.json({
        success: true,
        blog: {
          id: blogRef.id,
          ...blogData,
          createdAt: new Date(),
        },
        usage: {
          blogsUsed: updatedUserData?.blogCredits || 0,
          wordsUsed: updatedUserData?.wordsUsed || 0,
        },
        seoData: {},
      });

    } catch (firestoreError: any) {
      console.error('Firestore error:', firestoreError);
      
      // If it's a usage limit error, don't return demo content
      if (firestoreError instanceof UsageLimitError) {
        return NextResponse.json(
          { 
            error: firestoreError.message,
            limitType: firestoreError.limitType,
            upgradeRequired: true 
          },
          { status: 429 }
        );
      }
      
      // If Firestore fails, return demo content without saving
      console.log('Firestore failed, returning demo content...');
      
      const blogContent = generateDemoContent(keyword, wordCount);
      const actualWordCount = countWords(blogContent);
      
      return NextResponse.json({
        success: true,
        blog: {
          id: 'demo-' + Date.now(),
          userId,
          keyword,
          content: blogContent,
          wordCount: actualWordCount,
          createdAt: new Date(),
          plan: 'FREE',
        },
        usage: {
          blogsUsed: 2,
          wordsUsed: actualWordCount,
        },
        seoData: {},
      });
    }

  } catch (error: any) {
    console.error('Error generating blog:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

// Generate demo content when AI is not available
function generateDemoContent(keyword: string, wordCount: number): string {
  const sections = [
    `# ${keyword}: Complete SEO Guide for 2024`,
    `## Introduction\n\n${keyword} has become increasingly important in today's digital landscape. This comprehensive guide will help you understand everything you need to know about ${keyword} and how to implement it effectively for maximum results.`,
    `## What is ${keyword}?\n\n${keyword} refers to the practice of optimizing and utilizing specific strategies to achieve better results. Understanding ${keyword} is crucial for anyone looking to improve their performance in this area. The concept has evolved significantly over the years, adapting to new technologies and user behaviors.`,
    `## Key Benefits of ${keyword}\n\n- **Improved Performance**: ${keyword} can significantly enhance your overall performance\n- **Better Results**: Implementing ${keyword} strategies leads to measurable improvements\n- **Cost Effective**: ${keyword} provides excellent return on investment\n- **Scalable Solution**: ${keyword} can grow with your needs\n- **Competitive Advantage**: Stay ahead of competitors with ${keyword}`,
    `## Best Practices for ${keyword}\n\n### 1. Start with Research\nBefore implementing ${keyword}, conduct thorough research to understand your specific requirements and goals. This foundation is critical for success.\n\n### 2. Create a Strategy\nDevelop a comprehensive strategy that aligns with your objectives and incorporates ${keyword} best practices.\n\n### 3. Monitor and Optimize\nContinuously monitor your ${keyword} performance and make adjustments as needed.`,
    `## Advanced ${keyword} Techniques\n\nFor those looking to take their ${keyword} implementation to the next level, consider these advanced techniques:\n\n- Data-driven decision making\n- A/B testing different approaches\n- Integration with existing systems\n- Automation where possible\n- Regular performance audits`,
    `## Common Mistakes to Avoid\n\n- Neglecting proper planning\n- Ignoring data and analytics\n- Failing to adapt to changes\n- Not staying updated with trends\n- Overlooking user experience\n- Insufficient testing before implementation`,
    `## Tools and Resources\n\nHere are some recommended tools for ${keyword}:\n\n1. Analytics platforms for tracking performance\n2. Optimization tools for improvement\n3. Monitoring software for real-time insights\n4. Educational resources for continuous learning\n5. Community forums for support and networking`,
    `## Future of ${keyword}\n\nThe landscape of ${keyword} continues to evolve rapidly. Staying informed about emerging trends and technologies is essential for long-term success. Key areas to watch include artificial intelligence integration, mobile optimization, and user experience enhancements.`,
    `## Conclusion\n\n${keyword} is a powerful approach that can deliver significant results when implemented correctly. By following the guidelines and best practices outlined in this guide, you'll be well-equipped to succeed with ${keyword}.\n\nRemember to stay updated with the latest trends and continuously optimize your approach for the best results. Success with ${keyword} requires patience, persistence, and a commitment to ongoing improvement.`
  ];

  return sections.join('\n\n');
}