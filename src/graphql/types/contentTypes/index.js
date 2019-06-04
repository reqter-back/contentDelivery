const {MultiLangItemType, SysType} = require('../common/index');
const AssetType = require('../assets/index');
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

const ContentTypeType = new GraphQLObjectType({
    name: "ContentType",
    fields: {
        sys : {type : SysType},
        name : {type : GraphQLString},
        title : {type : MultiLangItemType},
        description : {type : MultiLangItemType},
        template : {type : GraphQLString},
        media : {type : GraphQLList(GraphQLJSONObject)},
        fields : {type : GraphQLList(GraphQLJSONObject)},
        status : {type : GraphQLBoolean}
    }
  });

exports = ContentTypeType;