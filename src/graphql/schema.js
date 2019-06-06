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

function buildTree(parent, list)
{
    if (parent == undefined || parent == null || list == undefined || (list != undefined && list.length == 0))
        return;
    parent.items = [];
    list.forEach(cat => {
        if (cat.parentId == parent.id)
        {
            parent.items.push(cat);
            buildTree(cat, list);
        }
    });
}

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
        items : {type : GraphQLList(GraphQLJSONObject)},
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
        longDesc : {type : MultiLangItemType},
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
        longDesc : {type : MultiLangItemType},
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
            resolve : async(root, args, context, info) => {
              var rootc = [];
              var cts = await Categories.find({}).exec();
                console.log(cts);
                for(i = 0; i < cts.length;i++)
                {
                  var cat =cts[i];
                  if (cat.parentId === undefined || cat.parentId === null)
                  {
                      rootc.push(cat);
                      buildTree(cat, cts);
                  }
                  cat.longDesc = undefined;
                }

                return rootc;
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
            args : {
              category : {type : GraphQLString},
              contenttype : {type : GraphQLString},
              name : {type : GraphQLString}
            },
            resolve : async (root, args, context, info) => {
              var c= undefined, ct, st;
              if (args.category)
              {
                console.log(args.category);
                  var cat = await Categories.findOne({"sys.link" : args.category});
                  console.log(cat);
                  c =  cat._id;
              }
              if (args.contenttype)
                  ct = args.contenttype;
              var flt = {
                  'sys.spaceId' : context.clientId,
                  category : c ,
                  contentType : ct
              };
              if (!args.name)
                  delete flt.name;
              if (!args.category)
                  delete flt.category;
              if (!args.contenttype)
                  delete flt.contentType;
              console.log(flt);
              return Requests.find(flt).exec();
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
              var c= undefined, ct, st;
              if (args.category)
                  c = args.category.split(',');
              if (args.contentType)
                  ct = args.contentType.split(',');
              var flt = {
                  'sys.spaceId' : req.spaceId,
                  category : { $in : c} ,
                  contentType : { $in : ct},
              };
              if (!args.name)
                  delete flt.name;
              if (!args.category)
                  delete flt.category;
              if (!args.contentType)
                  delete flt.contentType;
              console.log(flt);
              return Contents.find(flt).exec();
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
    }),
    // mutation : {
    //   // submitrequest : (parent, {link, requestdata}, context, info)=>{
        
    //   // }
    // }
});
exports.schema = schema;

