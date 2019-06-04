const Asset = require('../models/asset');
const Categories = require('../models/category');
const ContentTypes = require('../models/contentType');
const Requests = require('../models/request');
const Contents = require('../models/content');
const {GraphQLJSONObject} = require('graphql-type-json');
const {
  GraphQLID,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLBoolean
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
const AssetType = new GraphQLObjectType({
  name: "Asset",
  fields: {
      _id : {type : GraphQLID},
      sys : {type : SysType},
      name: { type: GraphQLString },
      fileType: { type: GraphQLString },
      url : {type : MultiLangItemType},
      status : {type : GraphQLString}
  }
});

const CategroyType = new GraphQLObjectType({
    name: "Category",
    fields: {
        _id : {type : GraphQLID},
        sys : {type : SysType},
        name: { type: MultiLangItemType },
        shortDesc: { type: MultiLangItemType },
        code : {type:GraphQLString},
        longDesc : {type : MultiLangItemType},
        image : {type : MultiLangItemType},
        parentId : { type: GraphQLString},
    }
  });
  const ContentTypeType = new GraphQLObjectType({
    name: "ContentType",
    fields: {
        _id : {type : GraphQLID},
        sys : {type : SysType},
        name : {type : GraphQLString},
        title : {type : MultiLangItemType},
        description : {type : MultiLangItemType},
        template : {type : GraphQLString},
        media : {type : GraphQLList(MultiLangItemType)},
        fields : {type : GraphQLList(GraphQLJSONObject)},
        status : {type : GraphQLBoolean}
    }
  });

  const RequestType = new GraphQLObjectType({
    name: "Request",
    fields: {
        _id : {type : GraphQLID},
        sys : {type : SysType},
        title : {type : MultiLangItemType},
        description : {type : MultiLangItemType},
        contentType : {type: GraphQLString},
        category : {type: GraphQLString},
        thumbnail : {type : GraphQLList(MultiLangItemType)},
        attachments : {type : GraphQLList(MultiLangItemType)},
        receiver : {type : GraphQLString},
        status : {type : GraphQLString},
        settings : {type : GraphQLJSONObject}
    }
  });

  const RequestDetailsType = new GraphQLObjectType({
    name: "RequestDetails",
    fields: {
        _id : {type : GraphQLID},
        sys : {type : SysType},
        title : {type : MultiLangItemType},
        description : {type : MultiLangItemType},
        contentType : {
            type: ContentTypeType,
            resolve : (root, args, context, info)=>{
              var data = ContentTypes.findById({"_id" : root.contentType}).exec();
              return data;
            }
        },
        category : {type: CategroyType,
            resolve : (root, args, context, info)=>{
                if (root.category)
                {
                    var   data = Categories.findById({"_id" : root.category}).exec();
                    return data;
                }
                return null;
            }
        },
        thumbnail : {type : GraphQLList(MultiLangItemType)},
        attachments : {type : GraphQLList(MultiLangItemType)},
        receiver : {type : GraphQLString},
        status : {type : GraphQLString},
        settings : {type : GraphQLJSONObject}
    }
  });
  const ContentType = new GraphQLObjectType({
    name: "Content",
    fields: {
        _id : {type : GraphQLID},
      sys : {type : SysType},
      request : {type: RequestType },
      fields : {type : GraphQLJSONObject},
      status : {type : GraphQLString},
      contentType : {type: GraphQLString},
      category : {type: GraphQLString}
    }
  });

  const ContentDetailType = new GraphQLObjectType({
    name: "ContentDetail",
    fields: {
      _id : {type : GraphQLID},
      sys : {type : SysType},
      request : {type: RequestType },
      fields : {type : GraphQLJSONObject},
      status : {type : GraphQLString},
      contentType : {
          type: ContentTypeType,
          resolve : (root, args, context, info)=>{
            var data = ContentTypes.findById({"_id" : root.contentType}).exec();
            return data;
          }
    },
      category : {type: CategroyType,
        resolve : (root, args, context, info)=>{
            if (root.category)
            {
                var   data = Categories.findById({"_id" : root.category}).exec();
                return data;
            }
            return null;
        }}
    }
  });

const schema = new GraphQLSchema({
    query : new GraphQLObjectType({
        name : "Query",
        fields : {
          assets : {
            type : GraphQLList(AssetType),
            resolve : (root, args, context, info) => {
              return Asset.find({}).exec();
            }
          },
          asset : {
            type : AssetType,
            args : {
              id : {type : GraphQLNonNull(GraphQLID)}
            },
            resolve : (root, args, context, info)=>{
              var data = Asset.findOne({"_id" : args.id}).exec();
              return data;
            }
          },
          categories : {
            type : GraphQLList(CategroyType),
            resolve : (root, args, context, info) => {
              return Categories.find({}).exec();
            }
          },
          category : {
            type : CategroyType,
            args : {
              id : {type : GraphQLNonNull(GraphQLID)}
            },
            resolve : (root, args, context, info)=>{
              return Categories.findById(args.id).exec();
            }
          },
          requests : {
            type : GraphQLList(RequestType),
            resolve : (root, args, context, info) => {
              return Requests.find({}).exec();
            }
          },
          requestlist : {
            type : GraphQLList(RequestDetailsType),
            resolve : (root, args, context, info) => {
              return Requests.find({}).exec();
            }
          },
          request : {
            type : RequestDetailsType,
            args : {
              link : {type : GraphQLNonNull(GraphQLString)}
            },
            resolve : (root, args, context, info)=>{
              var data = Requests.findOne({"sys.link" : args.link}).exec();
              return data;
            }
          },
          contents : {
            type : GraphQLList(ContentType),
            args : {
                category : {type : GraphQLString},
                contentType : {type : GraphQLString},
                name : {type : GraphQLString}
              },
            resolve : (root, args, context, info) => {
              return Contents.find({}).exec();
            }
          },
          contentlist : {
            type : GraphQLList(ContentDetailType),
            resolve : (root, args, context, info) => {
              return Contents.find({}).exec();
            }
          },
          content : {
            type : ContentDetailType,
            args : {
              link : {type : GraphQLNonNull(GraphQLString)}
            },
            resolve : (root, args, context, info)=>{
              var data = Contents.findOne({"sys.link" : args.link}).exec();
              console.log(data);
              return data;
            }
          },
          contentTypes : {
            type : GraphQLList(ContentTypeType),
            resolve : (root, args, context, info) => {
              return ContentTypes.find({}).populate().exec();
            }
          },
          contentType : {
            type : ContentTypeType,
            args : {
              link : {type : GraphQLNonNull(GraphQLString)}
            },
            resolve : (root, args, context, info)=>{
              var data = ContentTypes.findOne({"sys.link" : args.link}).exec();
              console.log(data);
              return data;
            }
          }
        }
    })
});
exports.schema = schema;

