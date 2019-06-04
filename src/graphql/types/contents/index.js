const {SysType} = require('../categories/index');
const ContentTypeType = require('../assets/index');
const CategroyType = require('../categories/index');
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

const ContentType = new GraphQLObjectType({
  name: "Content",
  fields: {
    sys : {type : SysType},
    request : {type: GraphQLJSONObject },
    fields : {type : GraphQLJSONObject},
    status : {type : GraphQLString},
    contentType : {type: ContentTypeType},
    category : {type: CategroyType}
  }
});

exports = ContentType;