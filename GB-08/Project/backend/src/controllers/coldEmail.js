import { parseFileBuffer } from "../utils/fileParser.js";

// Use global fetch (Node 18+) - if not available, will need node-fetch package
const fetchUrl = globalThis.fetch;

// Parse resume file (reuse same logic as resume controller)
export const parseResume = async (req, res) => {
  try {
    const buffer = req.file?.buffer;
    if (!buffer) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const mimeType = req.file.mimetype;
    let text = await parseFileBuffer(buffer, mimeType);

    // Format extracted text for display
    if (text && typeof text === 'string') {
      text = text
        .replace(/[\u2022\u25CF\u25A0\-]+\s*/g, '• ')
        .replace(/\s+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]{2,}/g, ' ')
        .replace(/\s+$/gm, '')
        .trim();

      const sectionHeadings = [
        'Education', 'Experience', 'Work Experience', 'Projects', 'Publications', 'Research', 'Skills', 'Certifications', 'Achievements', 'Awards', 'Summary', 'Profile'
      ];
      for (const h of sectionHeadings) {
        const re = new RegExp(`(^|\\n)\\s*${h}\\s*:?\\s*(\\n|$)`, 'gi');
        text = text.replace(re, (m, p1) => `${p1}${h.toUpperCase()}\n`);
      }
    }

    res.json({ success: true, resumeText: text });
  } catch (error) {
    console.error('Parse resume error:', error);
    res.status(500).json({ success: false, error: 'Failed to parse resume' });
  }
};

// Extract job description from URL
export const extractJD = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ success: false, error: 'URL is required' });
    }

    // Simple web scraping - fetch the URL and extract text
    try {
      if (!fetchUrl) {
        throw new Error('Fetch API not available. Please use Node 18+ or install node-fetch.');
      }
      
      const response = await fetchUrl(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      
      // Simple text extraction (remove HTML tags)
      let text = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Try to extract company name from URL
      const urlMatch = url.match(/https?:\/\/(?:www\.)?([^\/]+)/);
      const domain = urlMatch ? urlMatch[1] : '';
      const companyName = domain.split('.')[0] || '';

      // Try to find HR email pattern (simple heuristic)
      const emailMatch = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}/);
      const hrEmail = emailMatch ? emailMatch[0] : '';

      res.json({
        success: true,
        jobDescription: text.substring(0, 10000), // Limit to 10k chars
        companyName: companyName || undefined,
        hrEmail: hrEmail || undefined,
      });
    } catch (fetchError) {
      console.error('JD extraction error:', fetchError);
      res.status(500).json({
        success: false,
        error: 'Failed to extract job description from URL. Please paste the JD text manually.',
      });
    }
  } catch (error) {
    console.error('Extract JD error:', error);
    res.status(500).json({ success: false, error: 'Failed to extract job description' });
  }
};

// Generate cold email using AI
export const generateEmail = async (req, res) => {
  try {
    const { resumeText, jobDescription, companyName, hrName, hrEmail } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        success: false,
        error: 'Resume text and job description are required',
      });
    }

    // ALWAYS use Grok/Groq for cold email generation (to avoid OpenAI quota issues)
    // Support both GROK_API_KEY and GROQ_API_KEY naming conventions
    const grokApiKey = process.env.GROK_API_KEY || process.env.GROQ_API_KEY;
    const grokApiUrl = process.env.GROK_API_URL || process.env.GROQ_API_URL;
    const hasGrokConfig = grokApiKey && grokApiUrl;
    
    if (!hasGrokConfig) {
      console.error('Grok/Groq API not configured. Missing:', {
        hasGrokKey: !!process.env.GROK_API_KEY,
        hasGrokUrl: !!process.env.GROK_API_URL,
        hasGroqKey: !!process.env.GROQ_API_KEY,
        hasGroqUrl: !!process.env.GROQ_API_URL,
      });
      return res.status(500).json({
        success: false,
        error: 'Grok/Groq AI is required for cold email generation. Please configure GROK_API_KEY (or GROQ_API_KEY) and GROK_API_URL (or GROQ_API_URL) in your environment variables.',
      });
    }

    console.log('Using Grok/Groq AI for cold email generation...');
    
    // Enhanced prompt that analyzes both resume and JD thoroughly
    const prompt = `You are an expert at writing professional, personalized cold emails for job applications. 

Analyze the following resume and job description carefully, then generate a compelling cold email.

RESUME CONTENT:
${resumeText.substring(0, 3000)}

JOB DESCRIPTION:
${jobDescription.substring(0, 3000)}

${companyName ? `COMPANY NAME: ${companyName}` : ''}
${hrName ? `RECRUITER NAME: ${hrName}` : ''}
${hrEmail ? `RECRUITER EMAIL: ${hrEmail}` : ''}

INSTRUCTIONS:
1. Analyze the resume to identify key skills, experiences, projects, and achievements
2. Extract the candidate's name from the resume (look for name at the beginning)
3. Analyze the job description to understand required skills, responsibilities, and company needs
4. Match the candidate's qualifications with the job requirements
5. Generate a personalized, professional cold email that:
   - Has a compelling, specific subject line (not generic)
   - Opens with genuine interest and a brief personal connection
   - Highlights 2-3 most relevant experiences/skills from the resume that match the JD
   - Shows understanding of the company/role
   - Includes a clear call-to-action (request for interview/meeting)
   - Maintains professional tone throughout
   - Is concise (3-4 short paragraphs, not too long)
   - Ends with proper closing: "Best regards," on one line, then candidate's name on the next line

IMPORTANT FORMATTING:
- The email body must end with:
  "Best regards,\n\n[Candidate Name]"
- Use \\n for line breaks in JSON
- "Best regards," should be on its own line
- Candidate's name should be on a separate line after "Best regards,"

Return ONLY valid JSON in this exact format:
{
  "subject": "Specific, compelling subject line here",
  "body": "Professional email body with proper paragraphs. Use \\n for line breaks. End with:\\n\\nBest regards,\\n\\n[Candidate Name]"
}

Do NOT include any text outside the JSON. Return only the JSON object.`;

      if (!fetchUrl) {
        throw new Error('Fetch API not available for Grok. Please use Node.js 18+ or install node-fetch.');
      }

      // Ensure the URL ends with /chat/completions for Groq API
      let apiUrl = grokApiUrl;
      if (apiUrl.includes('api.groq.com') && !apiUrl.includes('/chat/completions')) {
        // If it's Groq API and doesn't have the full endpoint, add it
        apiUrl = apiUrl.endsWith('/') 
          ? `${apiUrl}chat/completions` 
          : `${apiUrl}/chat/completions`;
      }

      console.log('Calling Grok/Groq API at:', apiUrl);

      // Groq uses OpenAI-compatible format with messages array
      const requestBody = apiUrl.includes('api.groq.com') || apiUrl.includes('/chat/completions')
        ? {
            model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile', // Updated to current Groq model
            messages: [
              {
                role: 'system',
                content: 'You are an expert at writing professional, personalized cold emails for job applications. Return only valid JSON.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            max_tokens: 2500,
            temperature: 0.7,
          }
        : {
            // Fallback for other Grok APIs that might use prompt format
            prompt,
            max_tokens: 2500,
            temperature: 0.7,
          };

      const response = await fetchUrl(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${grokApiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Grok API error:', response.status, errorText);
        throw new Error(`Grok API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Grok/Groq API response received');
      
      let emailData;
      
      // Handle OpenAI-compatible format (Groq uses this)
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const content = data.choices[0].message.content;
        try {
          emailData = JSON.parse(content);
        } catch (e) {
          // If it's not JSON, try to extract JSON from text
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            emailData = JSON.parse(jsonMatch[0]);
          } else {
            // Fallback: use the string as body
            emailData = { subject: 'Application for Position', body: content };
          }
        }
      }
      // Handle different Grok response formats (for non-Groq APIs)
      else if (typeof data === 'string') {
        try {
          emailData = JSON.parse(data);
        } catch (e) {
          const jsonMatch = data.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            emailData = JSON.parse(jsonMatch[0]);
          } else {
            emailData = { subject: 'Application for Position', body: data };
          }
        }
      } else if (data.response || data.content || data.text) {
        // Handle Grok response format (could be nested)
        const content = data.response || data.content || data.text || '';
        try {
          emailData = JSON.parse(content);
        } catch (e) {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            emailData = JSON.parse(jsonMatch[0]);
          } else {
            emailData = { subject: 'Application for Position', body: content };
          }
        }
      } else if (data.subject && data.body) {
        // Already in correct format
        emailData = data;
      } else {
        // Try to use the data as-is
        emailData = data;
      }

      // Validate and return
      if (!emailData.subject || !emailData.body) {
        console.warn('Grok response missing subject or body, using fallback');
        emailData = {
          subject: emailData.subject || 'Application for Position',
          body: emailData.body || emailData.content || emailData.text || JSON.stringify(emailData),
        };
      }

      // Ensure proper line breaks - convert \n to actual newlines
      let emailBody = emailData.body;
      if (typeof emailBody === 'string') {
        // Replace escaped newlines with actual newlines
        emailBody = emailBody.replace(/\\n/g, '\n');
        // Ensure "Best regards," and name are on separate lines
        emailBody = emailBody.replace(/Best regards,\s*/g, 'Best regards,\n\n');
      }

      console.log('Email generated successfully');
      res.json({
        success: true,
        email: {
          subject: emailData.subject,
          body: emailBody,
        },
      });
  } catch (error) {
    console.error('Generate email error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate email',
    });
  }
};

// Send email via SMTP using nodemailer with resume attachment
export const sendEmail = async (req, res) => {
  try {
    const { to, subject, body } = req.body;
    const resumeFile = req.file; // Resume file from multer

    if (!to || !subject || !body) {
      return res.status(400).json({
        success: false,
        error: 'Recipient email, subject, and body are required',
      });
    }

    // Check if SMTP is configured
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || smtpUser;

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
      return res.status(500).json({
        success: false,
        error: 'SMTP is not configured. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in your environment variables.',
      });
    }

    // Dynamic import nodemailer
    const nodemailer = await import('nodemailer');

    // Create transporter with better error handling
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort, 10),
      secure: smtpPort === '465', // true for 465 (SSL), false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        // Do not fail on invalid certs
        rejectUnauthorized: false,
      },
    });

    // Verify connection
    try {
      await transporter.verify();
      console.log('SMTP connection verified successfully');
    } catch (verifyError) {
      console.error('SMTP verification failed:', verifyError);
      return res.status(500).json({
        success: false,
        error: `SMTP connection failed: ${verifyError.message}. Please check your SMTP configuration.`,
      });
    }

    // Prepare email options
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'IntervuIQ'}" <${smtpFrom}>`,
      to,
      subject,
      text: body,
      html: body.replace(/\n/g, '<br>'), // Convert newlines to HTML breaks
    };

    // Attach resume if provided
    if (resumeFile && resumeFile.buffer) {
      mailOptions.attachments = [
        {
          filename: resumeFile.originalname || 'resume.pdf',
          content: resumeFile.buffer,
          contentType: resumeFile.mimetype || 'application/pdf',
        },
      ];
      console.log('Resume attachment added:', resumeFile.originalname);
    }

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent successfully:', info.messageId);

    res.json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send email. Please check your SMTP configuration.',
    });
  }
};

