import express from 'express';
import { grokResumeService } from '../../services/grokResumeService.js';
import { openAIResumeService } from '../../services/openAIResumeService.js';

const router = express.Router();

router.post('/get-skill-resources', async (req, res) => {
  try {
    const { missingKeywords, jobDescription } = req.body;

    if (!missingKeywords || !Array.isArray(missingKeywords)) {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid keywords'
      });
    }

    // Use the same service selection logic as the main resume analysis
    const useGrok = process.env.USE_GROK === 'true';
    const service = useGrok ? grokResumeService : openAIResumeService;

    // Get skill-specific learning resources from the AI
    const prompt = `Based on this job description:
${jobDescription || 'No specific job description provided'}

Please recommend learning resources for these missing skills:
${missingKeywords.join(', ')}

For each skill, suggest 2-3 highly relevant learning resources (courses, tutorials, documentation) that would help someone master that skill. Focus on respected platforms and materials appropriate for the job level.

Return the recommendations in this JSON format:
{
  "skillGaps": [
    {
      "skill": "skill name",
      "importance": "high|medium|low",
      "resources": [
        {
          "type": "course|tutorial|documentation",
          "title": "resource title",
          "url": "resource url",
          "provider": "platform name"
        }
      ]
    }
  ]
}`;

    const result = await service.getSkillResources(prompt);
    
    return res.json({
      success: true,
      skillGaps: result
    });

  } catch (error) {
    console.error('Error getting skill resources:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get skill resources'
    });
  }
});

export default router;