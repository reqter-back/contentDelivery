const Asset = require('../../../models/asset');
const ObjectID = require('mongodb').ObjectID;
const AssetType = require('../../types/assets/index');
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
      assets : {
        type : GraphQLList(AssetType),
        resolve : (root, args, context, info) => {
          return Asset.find({}).populate().exec();
        }
      },
      asset : {
        type : AssetType,
        args : {
          id : {type : GraphQLNonNull(GraphQLID)}
        },
        resolve : (root, args, context, info)=>{
          var data = Asset.findOne({"_id" : args.id}).populate().exec();
          return data;
        }
      }
    }
  })
}