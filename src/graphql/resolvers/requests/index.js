//Mongoose Models
const Requests = require('../../../models/request');
const Categories = require('../../../models/category');
const ContentTypes = require('../../../models/contentType');
const RequestType = require('../../types/requests/index');
//GraphQL types
const {
  GraphQLID,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLBoolean
} = require("graphql");

exports = {
  query : new GraphQLObjectType({
    name : "Query",
    fields : {
      requests : {
        type : GraphQLList(RequestType),
        resolve : (root, args, context, info) => {
          var db = mongo.get();
          var contentcoll = db.collection("requests");
          return contentcoll.find({}).toArray();
        }
      },
      request : {
        type : RequestType,
        args : {
          link : {type : GraphQLNonNull(GraphQLString)}
        },
        resolve : (root, args, context, info)=>{
          var data = Contents.findOne({"sys.link" : args.link}).populate('contentType').populate('category').exec();
          return data;
        }
      }
    }
  })
};