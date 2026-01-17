import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateBlogPrompt = (keyword: string, wordCount: number = 1200) => {
  return `Write a ${wordCount}-word SEO-optimized blog post about "${keyword}".

Structure the blog post as follows:
1. SEO Title (60 characters max, include the keyword)
2. Meta Description (155 characters max, compelling and include keyword)
3. Introduction (hook the reader, introduce the topic)
4. Main Content with H2 and H3 headings (use keyword naturally)
5. Bullet points or numbered lists where appropriate
6. Conclusion with call-to-action

Requirements:
- Use the keyword "${keyword}" naturally throughout (2-3% density)
- Include related keywords and synonyms
- Write in a professional, engaging tone
- Make it actionable and valuable for readers
- Include internal linking suggestions
- Optimize for featured snippets with clear answers

Format the output as clean markdown with proper headings.`;
};