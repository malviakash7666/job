import db from "../../models/index.js";

const { JobApplication, Job, User } = db;

/**
 * Apply for a job
 * POST /api/v1/job-applications
 */
export const applyForJob = async (req, res) => {
  try {
    const { jobId, fullName, email, phone, resumeUrl, coverLetter } = req.body;

    const applicantId = req.user?.userId;

    if (!applicantId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    if (!jobId || !fullName || !email) {
      return res.status(400).json({
        success: false,
        message: "jobId, fullName, and email are required",
      });
    }

    // Check if job exists
    const job = await Job.findByPk(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Prevent duplicate application
    const existingApplication = await JobApplication.findOne({
      where: {
        jobId,
        applicantId,
      },
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    const application = await JobApplication.create({
      jobId,
      applicantId,
      fullName,
      email,
      phone,
      resumeUrl,
      coverLetter,
      status: "Applied",
    });

    return res.status(201).json({
      success: true,
      message: "Job application submitted successfully",
      data: application,
    });
  } catch (error) {
    console.error("applyForJob error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to apply for job",
      error: error.message,
    });
  }
};

/**
 * Get logged-in user's applications
 * GET /api/v1/job-applications/my
 */
export const getMyApplications = async (req, res) => {
  try {
    const applicantId = req.user?.userId;

    if (!applicantId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }
    if (req.user.role !== "job_seeker") {
  return res.status(403).json({
    success: false,
    message: "Only job seekers can apply for jobs",
  });
}
if (req.user.role !== "job_seeker") {
  return res.status(403).json({
    success: false,
    message: "Only job seekers can apply for jobs",
  });
}
    const applications = await JobApplication.findAll({
      where: { applicantId },
      include: [
        {
          model: Job,
          as: "job",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    console.error("getMyApplications error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
      error: error.message,
    });
  }
};

/**
 * Get all applications for a specific job
 * GET /api/v1/job-applications/job/:jobId
 */
export const getApplicationsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findByPk(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const isOwner = job.createdBy === req.user.userId;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view applications for this job",
      });
    }

    const applications = await JobApplication.findAll({
      where: { jobId },
      include: [
        {
          model: User,
          as: "applicant",
          attributes: ["id", "name", "email"],
        },
        {
          model: Job,
          as: "job",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    console.error("getApplicationsByJob error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch job applications",
      error: error.message,
    });
  }
};

/**
 * Get single application by id
 * GET /api/v1/job-applications/:id
 */
export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await JobApplication.findByPk(id, {
      include: [
        {
          model: User,
          as: "applicant",
          attributes: ["id", "name", "email"],
        },
        {
          model: Job,
          as: "job",
        },
      ],
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const isApplicant = application.applicantId === req.user.userId;
    const isOwner = application.job.createdBy === req.user.userId;
    const isAdmin = req.user.role === "admin";

    if (!isApplicant && !isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this application",
      });
    }

    return res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error("getApplicationById error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch application",
      error: error.message,
    });
  }
};

/**
 * Update application status
 * PATCH /api/v1/job-applications/:id/status
 */
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "Applied",
      "Reviewed",
      "Shortlisted",
      "Rejected",
      "Hired",
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`,
      });
    }

    const application = await JobApplication.findByPk(id, {
      include: [
        {
          model: Job,
          as: "job",
        },
      ],
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const isOwner = application.job.createdBy === req.user.userId;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this application",
      });
    }

    application.status = status;
    await application.save();

    return res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      data: application,
    });
  } catch (error) {
    console.error("updateApplicationStatus error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update application status",
      error: error.message,
    });
  }
};

/**
 * Delete application
 * DELETE /api/v1/job-applications/:id
 */
export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await JobApplication.findByPk(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    await application.destroy();

    return res.status(200).json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error) {
    console.error("deleteApplication error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete application",
      error: error.message,
    });
  }
};