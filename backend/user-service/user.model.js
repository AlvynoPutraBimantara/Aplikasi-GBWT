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
    filename: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    mimetype: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    data: {
      type: DataTypes.BLOB("long"),
      allowNull: false,
    },
    upload_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "userimages",
    timestamps: false,
    underscored: true
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
    nama_warung: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'NamaWarung' // Map to correct column name
    },
    nama: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'Nama' // Map to correct column name
    },
    telp: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'Telp' // Map to correct column name
    },
    alamat: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'Alamat' // Map to correct column name
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'Password' // Map to correct column name
    },
    role: {
      type: DataTypes.ENUM("user", "admin", "guest"),
      allowNull: false,
      defaultValue: "user",
    },
    image_url: {
      type: DataTypes.STRING(2083),
      allowNull: true,
      field: 'imageUrl' // Map to correct column name
    },
  },
  {
    tableName: "user",
    timestamps: false,
    underscored: true
  }
);

module.exports = { User, UserImages };