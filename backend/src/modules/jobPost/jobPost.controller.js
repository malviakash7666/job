import { Op } from "sequelize";
import db from "../../models/index.js";
const { Job, User, JobApplication } = db;

/* ── Pagination helper ── */
const getPagination = (page, limit) => {
  const currentPage = Math.max(Number(page) || 1, 1);
  const currentLimit = Math.max(Number(limit) || 10, 1);
  const offset = (currentPage - 1) * currentLimit;
  return { currentPage, currentLimit, offset };
};

/* ── Allowed sort fields ── */
const JOB_SORT_FIELDS = ["createdAt", "updatedAt", "title", "companyName", "deadline", "salaryMin", "salaryMax"];

/**
 * @desc   Create a new job
 * @route  POST /api/job-post
 * @access Private (job_poster, admin)
 */
export const createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      companyName,
      location,
      jobType,
      experienceLevel,
      salaryMin,
      salaryMax,
      skills,
      requirements,
      responsibilities,
      deadline,
      status,
    } = req.body;

    if (!title || !description || !companyName || !location) {
      return res.status(400).json({
        success: false,
        message: "Title, description, companyName, and location are required",
      });
    }

    if (salaryMin && salaryMax && Number(salaryMin) > Number(salaryMax)) {
      return res.status(400).json({
        success: false,
        message: "salaryMin cannot be greater than salaryMax",
      });
    }

    const job = await Job.create({
      title: title.trim(),
      description: description.trim(),
      companyName: companyName.trim(),
      location: location.trim(),
      jobType,
      experienceLevel,
      salaryMin: salaryMin || null,
      salaryMax: salaryMax || null,
      skills: Array.isArray(skills) ? skills : [],
      requirements: requirements || null,
      responsibilities: responsibilities || null,
      deadline: deadline || null,
      status: status || "Open",
      createdBy: req.user.userId, // ✅ was req.user.id
    });

    return res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: job,
    });
  } catch (error) {
    console.error("createJob error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create job",
      error: error.message,
    });
  }
};

/**
 * @desc   Get all jobs (admin / job_poster panel) with filters
 * @route  GET /api/job-post
 * @access Private
 */
export const getAllJobs = async (req, res) => {
  try {
    const {
      search,
      status,
      jobType,
      experienceLevel,
      location,
      companyName,
      sortBy = "createdAt",
      sortOrder = "DESC",
      page = 1,
      limit = 10,
    } = req.query;

    const { currentPage, currentLimit, offset } = getPagination(page, limit);
    const where = {};

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { companyName: { [Op.iLike]: `%${search}%` } },
        { location: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (status) where.status = status;
    if (jobType) where.jobType = jobType;
    if (experienceLevel) where.experienceLevel = experienceLevel;
    if (location) where.location = { [Op.iLike]: `%${location}%` };
    if (companyName) where.companyName = { [Op.iLike]: `%${companyName}%` };

    const finalSortBy = JOB_SORT_FIELDS.includes(sortBy) ? sortBy : "createdAt";
    const finalSortOrder = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const { count, rows } = await Job.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email", "role"],
        },
      ],
      order: [[finalSortBy, finalSortOrder]],
      limit: currentLimit,
      offset,
    });

    return res.status(200).json({
      success: true,
      message: "Jobs fetched successfully",
      total: count,
      currentPage,
      totalPages: Math.ceil(count / currentLimit),
      data: rows,
    });
  } catch (error) {
    console.error("getAllJobs error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch jobs",
      error: error.message,
    });
  }
};

/**
 * @desc   Get all public jobs (Open only)
 * @route  GET /api/job-post/public
 * @access Public
 */
export const getPublicJobs = async (req, res) => {
  try {
    const {
      search,
      jobType,
      experienceLevel,
      location,
      companyName,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = req.query;

    const { currentPage, currentLimit, offset } = getPagination(page, limit);
    const where = { status: "Open" };

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { companyName: { [Op.iLike]: `%${search}%` } },
        { location: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (jobType) where.jobType = jobType;
    if (experienceLevel) where.experienceLevel = experienceLevel;
    if (location) where.location = { [Op.iLike]: `%${location}%` };
    if (companyName) where.companyName = { [Op.iLike]: `%${companyName}%` };

    const allowedSortFields = ["createdAt", "title", "deadline", "salaryMin", "salaryMax"];
    const finalSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const finalSortOrder = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const { count, rows } = await Job.findAndCountAll({
      where,
      attributes: { exclude: ["createdBy"] },
      order: [[finalSortBy, finalSortOrder]],
      limit: currentLimit,
      offset,
    });

    return res.status(200).json({
      success: true,
      message: "Public jobs fetched successfully",
      total: count,
      currentPage,
      totalPages: Math.ceil(count / currentLimit),
      data: rows,
    });
  } catch (error) {
    console.error("getPublicJobs error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch public jobs",
      error: error.message,
    });
  }
};

/**
 * @desc   Get single job by id
 * @route  GET /api/job-post/:id
 * @access Public / Private
 */
export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findByPk(id, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email", "role"],
        },
      ],
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Job fetched successfully",
      data: job,
    });
  } catch (error) {
    console.error("getJobById error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch job",
      error: error.message,
    });
  }
};

/**
 * @desc   Get logged-in user's own jobs
 * @route  GET /api/job-post/my/jobs
 * @access Private
 */
export const getMyJobs = async (req, res) => {
  try {
    const {
      status,
      search,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = req.query;

    const { currentPage, currentLimit, offset } = getPagination(page, limit);

    const where = {
      createdBy: req.user.userId, // ✅ was req.user.id
    };

    if (status) where.status = status;

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { companyName: { [Op.iLike]: `%${search}%` } },
        { location: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const allowedSortFields = ["createdAt", "updatedAt", "title", "deadline"];
    const finalSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const finalSortOrder = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const { count, rows } = await Job.findAndCountAll({
      where,
      order: [[finalSortBy, finalSortOrder]],
      limit: currentLimit,
      offset,
    });

    return res.status(200).json({
      success: true,
      message: "My jobs fetched successfully",
      total: count,
      currentPage,
      totalPages: Math.ceil(count / currentLimit),
      data: rows,
    });
  } catch (error) {
    console.error("getMyJobs error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch my jobs",
      error: error.message,
    });
  }
};

/**
 * @desc   Update a job
 * @route  PUT /api/job-post/:id
 * @access Private (owner or admin)
 */
export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findByPk(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const isOwner = job.createdBy === req.user.userId; // ✅ was req.user.id
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this job",
      });
    }

    const {
      title,
      description,
      companyName,
      location,
      jobType,
      experienceLevel,
      salaryMin,
      salaryMax,
      skills,
      requirements,
      responsibilities,
      deadline,
      status,
    } = req.body;

    if (salaryMin && salaryMax && Number(salaryMin) > Number(salaryMax)) {
      return res.status(400).json({
        success: false,
        message: "salaryMin cannot be greater than salaryMax",
      });
    }

    await job.update({
      title: title ?? job.title,
      description: description ?? job.description,
      companyName: companyName ?? job.companyName,
      location: location ?? job.location,
      jobType: jobType ?? job.jobType,
      experienceLevel: experienceLevel ?? job.experienceLevel,
      salaryMin: salaryMin ?? job.salaryMin,
      salaryMax: salaryMax ?? job.salaryMax,
      skills: Array.isArray(skills) ? skills : job.skills,
      requirements: requirements ?? job.requirements,
      responsibilities: responsibilities ?? job.responsibilities,
      deadline: deadline ?? job.deadline,
      status: status ?? job.status,
    });

    return res.status(200).json({
      success: true,
      message: "Job updated successfully",
      data: job,
    });
  } catch (error) {
    console.error("updateJob error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update job",
      error: error.message,
    });
  }
};

/**
 * @desc   Delete a job
 * @route  DELETE /api/job-post/:id
 * @access Private (owner or admin)
 */
export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findByPk(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const isOwner = job.createdBy === req.user.userId; // ✅ was req.user.id
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this job",
      });
    }

    // Delete all related job applications first (to handle foreign key constraint)
    await JobApplication.destroy({
      where: { jobId: id }
    });

    await job.destroy();

    return res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("deleteJob error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete job",
      error: error.message,
    });
  }
};

/**
 * @desc   Manually change job status
 * @route  PATCH /api/job-post/:id/status
 * @access Private (owner or admin)
 */
export const updateJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["Open", "Closed", "Paused"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Allowed: Open, Closed, Paused",
      });
    }

    const job = await Job.findByPk(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const isOwner = job.createdBy === req.user.userId; // ✅ was req.user.id
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to change this job's status",
      });
    }

    job.status = status;
    await job.save();

    return res.status(200).json({
      success: true,
      message: `Job status updated to ${status}`,
      data: job,
    });
  } catch (error) {
    console.error("updateJobStatus error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update job status",
      error: error.message,
    });
  }
};

/**
 * @desc   Activate a job (set status to Open)
 * @route  PATCH /api/job-post/:id/activate
 * @access Private (owner or admin)
 */
export const activateJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findByPk(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const isOwner = job.createdBy === req.user.userId; // ✅ was req.user.id
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to activate this job",
      });
    }

    if (job.status === "Open") {
      return res.status(400).json({
        success: false,
        message: "Job is already active",
      });
    }

    job.status = "Open";
    await job.save();

    return res.status(200).json({
      success: true,
      message: "Job activated successfully",
      data: job,
    });
  } catch (error) {
    console.error("activateJob error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to activate job",
      error: error.message,
    });
  }
};

/**
 * @desc   Pause / deactivate a job
 * @route  PATCH /api/job-post/:id/deactivate
 * @access Private (owner or admin)
 */
export const deactivateJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findByPk(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const isOwner = job.createdBy === req.user.userId; // ✅ was req.user.id
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to deactivate this job",
      });
    }

    if (job.status === "Paused") {
      return res.status(400).json({
        success: false,
        message: "Job is already paused",
      });
    }

    job.status = "Paused";
    await job.save();

    return res.status(200).json({
      success: true,
      message: "Job paused successfully",
      data: job,
    });
  } catch (error) {
    console.error("deactivateJob error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to deactivate job",
      error: error.message,
    });
  }
};

/**
 * @desc   Close a job
 * @route  PATCH /api/job-post/:id/close
 * @access Private (owner or admin)
 */
export const closeJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findByPk(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const isOwner = job.createdBy === req.user.userId; // ✅ was req.user.id
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to close this job",
      });
    }

    if (job.status === "Closed") {
      return res.status(400).json({
        success: false,
        message: "Job is already closed",
      });
    }

    job.status = "Closed";
    await job.save();

    return res.status(200).json({
      success: true,
      message: "Job closed successfully",
      data: job,
    });
  } catch (error) {
    console.error("closeJob error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to close job",
      error: error.message,
    });
  }
};