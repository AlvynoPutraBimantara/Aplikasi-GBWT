const { DataTypes } = require("sequelize");
const sequelize = require("./db");

// Define the UserImages model
const UserImages = sequelize.define(
  "UserImages",
  {
    id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    filename: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    mimetype: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    data: {
      type: DataTypes.BLOB("long"), // Matches 'longblob'
      allowNull: false,
    },
    upload_date: {
      type: DataTypes.DATE, // Maps to 'timestamp'
      allowNull: true,
      defaultValue: DataTypes.NOW, // Matches default 'CURRENT_TIMESTAMP'
    },
  },
  {
    tableName: "userimages",
    timestamps: false, // MySQL schema does not include createdAt/updatedAt
  }
);

// Define the User model
const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    NamaWarung: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    Nama: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    Telp: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    Alamat: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    Password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("user", "admin", "guest"),
      allowNull: false,
      defaultValue: "user",
    },
    imageUrl: {
      type: DataTypes.STRING(2083),
      allowNull: true,
    },
  },
  {
    tableName: "user",
    timestamps: false,
  }
);

// Define associations
// Change this association
User.hasMany(UserImages, {
  foreignKey: "userId",
  sourceKey: "id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
  as: 'images' // Add this alias to match the include
});

UserImages.belongsTo(User, {
  foreignKey: "userId",
  targetKey: "id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
  as: 'user' // Optional: add consistent alias
});

module.exports = { User, UserImages };