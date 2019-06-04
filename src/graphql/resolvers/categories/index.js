const Categories = require('../../models/category');
const ObjectID = require('mongodb').ObjectID;
const CategoryType = require('../../types/categories/index');
const {MultiLangItemType} = require('../../types/common/index');
const {GraphQLJSON, GraphQLJSONObject} = require('graphql-type-json');
const {
  GraphQLID,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema
} = require("graphql");

exports = {
  query : new GraphQLObjectType({
    name : "Query",
    fields : {
      categories : {
        type : GraphQLList(CategroyType),
        resolve : (root, args, context, info) => {
          return Categories.find({}).populate().exec();
        }
      },
      category : {
        type : CategroyType,
        args : {
          id : {type : GraphQLNonNull(GraphQLID)}
        },
        resolve : (root, args, context, info)=>{
          return Categories.findById(args.id).populate().exec();
        }
      }
    }
  })
};