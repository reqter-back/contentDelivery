const {MultiLangItemType, SysType} = require('../common/index');
const {
  GraphQLID,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema
} = require("graphql");

const CategroyType = new GraphQLObjectType({
  name: "Category",
  fields: {
      sys : {type : SysType},
      name: { type: MultiLangItemType },
      shortDesc: { type: MultiLangItemType },
      code : {type:GraphQLString},
      longDesc : {type : MultiLangItemType},
      image : {type : MultiLangItemType},
      parentId : { type: GraphQLString},
  }
});

exports = CategroyType