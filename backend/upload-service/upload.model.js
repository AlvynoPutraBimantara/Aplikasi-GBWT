const db = require("./db");

const addImage = (userId, imageUrl) => {
  return db.query("INSERT INTO userimages (userId, imageUrl) VALUES (?, ?)", [
    userId,
    imageUrl,
  ]);
};

const getImagesByUser = (userId) => {
  return db.query("SELECT id, imageUrl FROM userimages WHERE userId = ?", [
    userId,
  ]);
};

const deleteImageById = (id) => {
  return db.query("DELETE FROM userimages WHERE id = ?", [id]);
};

module.exports = { addImage, getImagesByUser, deleteImageById };
