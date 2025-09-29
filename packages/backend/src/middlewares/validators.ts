/**
 * Validation middleware for job descriptions
 */
export function validateJobDescription(req, res, next) {
  const { jobDescription } = req.body;

  if (!jobDescription || typeof jobDescription !== 'string') {
    return res.status(400).json({ error: 'Job description is required.' });
  }

  if (jobDescription.length < 30) {
    return res
      .status(400)
      .json({ error: 'Job description is too short. Please provide more detail.' });
  }

  if (jobDescription.length > 2000) {
    return res
      .status(400)
      .json({ error: 'Job description is too long. Please shorten it (max 2000 characters).' });
  }

  next(); // ✅ passes validation
}
