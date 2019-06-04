const mongo = require('../../db/');
const ObjectID = require('mongodb').ObjectID;
//Mongoose Models
const Contents = require('../../models/content');
const Categories = require('../../models/category');
const ContentTypes = require('../../models/contentType');

//GraphQL types
const {MultiLangItemType, SysType} = require('../common/index');
const {AssetType} = require('../../types/assets/index');
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

exports = {
  query : new GraphQLObjectType({
    name : "Query",
    fields : {
      contents : {
        type : GraphQLList(ContentType),
        resolve : (root, args, context, info) => {
          var db = mongo.get();
          var contentcoll = db.collection("contents");
          return contentcoll.find({}).toArray();
        }
      },
      content : {
        type : ContentType,
        args : {
          link : {type : GraphQLNonNull(GraphQLString)}
        },
        resolve : (root, args, context, info)=>{
          var data = Contents.findOne({"sys.link" : args.link}).populate('contentType').populate('category').exec();
          // var db = mongo.get();
          // var contentcoll = db.collection("contents");
          // var data = contentcoll.find({"sys.link" : args.link}).toArray();
          console.log(data);
          return data;
        }
      }
    }
  })
};