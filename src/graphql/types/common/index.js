const {GraphQLJSON, GraphQLJSONObject} = require('graphql-type-json');
const {
  GraphQLID,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema
} = require("graphql");
const MultiLangItemType = new GraphQLObjectType({
  name : "MultiLangItemType",
  fields : {
    en : {type : GraphQLString},
    fa : {type : GraphQLString},
    sv : {type : GraphQLString},
    it : {type : GraphQLString},
    ar : {type : GraphQLString},
    rs : {type : GraphQLString},
    dn : {type : GraphQLString},
  }
})

const SysType = new GraphQLObjectType({
    name : "SysType",
    fields : {
      link : {type : GraphQLString},
      spaceId : {type : GraphQLString},
      issuer : {type: GraphQLJSONObject},
      issueDate : {type : GraphQLString},
      lastUpdater : {type : GraphQLJSONObject},
      lastUpdateTime : {type : GraphQLString}
    }
});

exports = {
    MultiLangItemType, SysType
  }