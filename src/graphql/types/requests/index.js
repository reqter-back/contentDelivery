const {MultiLangItemType, SysType} = require('../common/index');
const CategroyType = require('../categories/index');
const ContentTypeType = require('../contentTypes/index');
const {GraphQLJSON, GraphQLJSONObject} = require('graphql-type-json');
const {
  GraphQLID,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLBoolean
} = require("graphql");

const RequestType = new GraphQLObjectType({
  name: "Request",
  fields: {
      sys : {type : SysType},
      title : {type : MultiLangItemType},
      description : {type : MultiLangItemType},
      contentType : {type: ContentTypeType},
      category : {type: CategroyType},
      thumbnail : {type : GraphQLList(GraphQLJSONObject)},
      attachments : {type : GraphQLList(GraphQLJSONObject)},
      receiver : {type : GraphQLString},
      status : {type : GraphQLString},
      settings : {type : MultiLangItemType}
  }
});

exports = RequestType;