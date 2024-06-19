'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Document extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Document.belongsTo(models.Category, { foreignKey: 'categoryId' });
    }
  }
  Document.init({
    document: DataTypes.STRING,
    name: DataTypes.STRING,
    categoryId: DataTypes.INTEGER,
    tanggal: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Document',
  });
  return Document;
};