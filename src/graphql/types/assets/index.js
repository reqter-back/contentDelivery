const Asset = require('../../../models/asset');
const ObjectID = require('mongodb').ObjectID;
const {MultiLangItemType, SysType} = require('../common/index');
const {GraphQLJSON, GraphQLJSONObject} = require('graphql-type-json');
const {
  GraphQLID,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema
} = require("graphql");
const AssetType = new GraphQLObjectType({
  name: "Asset",
  fields: {
      sys : {type : SysType},
      name: { type: GraphQLString },
      fileType: { type: GraphQLString },
      url : {type : MultiLangItemType},
      status : {type : GraphQLString}
  }
});
exports = AssetType;