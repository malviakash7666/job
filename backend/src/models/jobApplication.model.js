export default (sequelize, DataTypes) => {
  const JobApplication = sequelize.define(
    "JobApplication",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      jobId: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      applicantId: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: {
            msg: "Invalid email format",
          },
        },
      },

      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      resumeUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      coverLetter: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      status: {
        type: DataTypes.ENUM(
          "Applied",
          "Reviewed",
          "Shortlisted",
          "Rejected",
          "Hired"
        ),
        defaultValue: "Applied",
      },
    },
    {
      tableName: "job_applications",
      timestamps: true,
    }
  );

  JobApplication.associate = (models) => {
    JobApplication.belongsTo(models.User, {
      foreignKey: "applicantId",
      as: "applicant",
    });

    JobApplication.belongsTo(models.Job, {
      foreignKey: "jobId",
      as: "job",
    });
  };

  return JobApplication;
};