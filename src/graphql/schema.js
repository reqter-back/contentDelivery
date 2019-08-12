const Asset = require("../models/asset");
const ContentTypes = require("../models/contentType");
const Contents = require("../models/content");
const { GraphQLJSONObject } = require("graphql-type-json");
const {
  GraphQLID,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLBoolean
} = require("graphql");

function buildTree(parent, list) {
  if (
    parent == undefined ||
    parent == null ||
    list == undefined ||
    (list != undefined && list.length == 0)
  )
    return;
  parent.items = [];
  list.forEach(cat => {
    if (cat.parentId == parent.id) {
      parent.items.push(cat);
      buildTree(cat, list);
    }
  });
}

const MultiLangItemType = new GraphQLObjectType({
  name: "MultiLangItemType",
  fields: {
    en: { type: GraphQLString },
    fa: { type: GraphQLString },
    sv: { type: GraphQLString },
    it: { type: GraphQLString },
    ar: { type: GraphQLString },
    rs: { type: GraphQLString },
    dn: { type: GraphQLString }
  }
});

const SysType = new GraphQLObjectType({
  name: "SysType",
  fields: {
    link: { type: GraphQLString },
    spaceId: { type: GraphQLString },
    issuer: { type: GraphQLJSONObject },
    issueDate: { type: GraphQLString },
    lastUpdater: { type: GraphQLJSONObject },
    lastUpdateTime: { type: GraphQLString }
  }
});
const AssetType = new GraphQLObjectType({
  name: "Asset",
  fields: {
    _id: { type: GraphQLID },
    sys: { type: SysType },
    name: { type: GraphQLString },
    fileType: { type: GraphQLString },
    url: { type: MultiLangItemType },
    status: { type: GraphQLString }
  }
});

const ContentTypeType = new GraphQLObjectType({
  name: "ContentType",
  fields: {
    _id: { type: GraphQLID },
    sys: { type: SysType },
    name: { type: GraphQLString },
    title: { type: MultiLangItemType },
    description: { type: MultiLangItemType },
    template: { type: GraphQLString },
    media: { type: GraphQLList(MultiLangItemType) },
    fields: { type: GraphQLList(GraphQLJSONObject) },
    status: { type: GraphQLBoolean }
  }
});

const ContentType = new GraphQLObjectType({
  name: "Content",
  fields: {
    _id: { type: GraphQLID },
    sys: { type: SysType },
    fields: { type: GraphQLJSONObject },
    status: { type: GraphQLString },
    contentType: { type: GraphQLString }
  }
});

const ContentFullType = new GraphQLObjectType({
  name: "ContentFull",
  fields: {
    contents: { type: GraphQLList(ContentType) },
    reldata: { type: GraphQLList(ContentType) }
  }
});

const ContentDetailType = new GraphQLObjectType({
  name: "ContentDetail",
  fields: {
    _id: { type: GraphQLID },
    sys: { type: SysType },
    fields: { type: GraphQLJSONObject },
    status: { type: GraphQLString },
    contentType: {
      type: ContentTypeType,
      resolve: (root, args, context, info) => {
        var data = ContentTypes.findById({ _id: root.contentType }).exec();
        return data;
      }
    }
  }
});

function isArray(obj) {
  return Object.prototype.toString.call(obj) === "[object Array]";
}

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: {
      assets: {
        type: GraphQLList(AssetType),
        resolve: (root, args, context, info) => {
          return Asset.find({ "sys.spaceId": context.clientId }).exec();
        }
      },
      asset: {
        type: AssetType,
        args: {
          id: { type: GraphQLNonNull(GraphQLID) }
        },
        resolve: (root, args, context, info) => {
          var data = Asset.findOne({ _id: args.id }).exec();
          return data;
        }
      },
      contentsfull: {
        type: GraphQLList(ContentFullType),
        args: {
          contentType: { type: GraphQLString },
          fields: { type: GraphQLJSONObject },
          status: { type: GraphQLString }
        },
        resolve: (root, args, context, info) => {
          var c = undefined,
            ct,
            st;
          if (!args.contentType) throw new Error("Invalid contentType");
          if (args.contentType) ct = args.contentType;
          var flt = {
            "sys.spaceId": context.clientId,
            contentType: args.contentType,
            status: args.status
          };
          if (args.fields) {
            Object.keys(args.fields).forEach(function(key) {
              var val = args.fields[key];
              flt["fields." + key] = val;
            });
          }
          if (!args.fields) delete flt.fields;
          if (!args.status) delete flt.status;
          if (!args.contentType) delete flt.contentType;
          console.log(flt);
          Contents.find(flt).exec((err, cts) => {
            ContentTypes.findById(args.contentType).exec((err, ctype) => {
              var relfields = [];
              for (var field in ctype.fields) {
                if (ctype.fields[field].type === "reference") {
                  var references = ctype.fields[field].references;
                  references.forEach(ref => {
                    relfields.push({
                      name: ctype.fields[field].name,
                      ctype: ref,
                      select: ref.select
                    });
                  });
                }
              }
              var reldata = [];
              if (relfields.length > 0) {
                var ids = [];
                relfields.forEach(fld => {
                  cts.forEach(content => {
                    if (
                      content.fields[fld.name] &&
                      content.fields[fld.name].length > 0
                    ) {
                      if (isArray(content.fields[fld.name])) {
                        content.fields[fld.name].forEach(item => {
                          if (item.length > 0) ids.push(item);
                        });
                      } else {
                        ids.push(content.fields[fld.name]);
                      }
                    }
                  });
                });
                Contents.find({
                  _id: { $in: ids }
                }).exec((err, rels) => {
                  var result = { contents: cts, reldata: rels };
                  return result;
                });
              }
            });
          });
        }
      },
      contents: {
        type: GraphQLList(ContentType),
        args: {
          contentType: { type: GraphQLString },
          fields: { type: GraphQLJSONObject },
          status: { type: GraphQLString }
        },
        resolve: (root, args, context, info) => {
          var c = undefined,
            ct,
            st;
          if (args.contentType) ct = args.contentType.split(",");
          var flt = {
            "sys.spaceId": context.clientId,
            contentType: { $in: ct },
            status: args.status
          };
          if (args.fields) {
            Object.keys(args.fields).forEach(function(key) {
              var val = args.fields[key];
              flt['"fields.' + key + '"'] = val;
            });
          }
          if (!args.fields) delete flt.fields;
          if (!args.status) delete flt.status;
          if (!args.contentType) delete flt.contentType;
          console.log(JSON.stringify(flt));
          return Contents.find(flt).exec();
        }
      },
      contentlist: {
        type: GraphQLList(ContentDetailType),
        resolve: (root, args, context, info) => {
          return Contents.find({ "sys.spaceId": context.clientId }).exec();
        }
      },
      content: {
        type: ContentDetailType,
        args: {
          link: { type: GraphQLNonNull(GraphQLString) }
        },
        resolve: (root, args, context, info) => {
          var data = Contents.findOne({ "sys.link": args.link }).exec();
          console.log(data);
          return data;
        }
      },
      contentTypes: {
        type: GraphQLList(ContentTypeType),
        resolve: (root, args, context, info) => {
          return ContentTypes.find({ "sys.spaceId": context.clientId })
            .populate()
            .exec();
        }
      },
      contentType: {
        type: ContentTypeType,
        args: {
          link: { type: GraphQLNonNull(GraphQLString) }
        },
        resolve: (root, args, context, info) => {
          var data = ContentTypes.findOne({ "sys.link": args.link }).exec();
          console.log(data);
          return data;
        }
      },
      contentTypeByID: {
        type: ContentTypeType,
        args: {
          id: { type: GraphQLNonNull(GraphQLString) }
        },
        resolve: (root, args, context, info) => {
          var data = ContentTypes.findById(args.id).exec();
          console.log(data);
          return data;
        }
      }
    }
  }),
  mutation: new GraphQLObjectType({
    name: "Mutation",
    fields: {
      submit: {
        type: ContentType,
        args: {},
        resolve: async function(root, args, context, info) {
          // console.log('start saving request : ' + JSON.stringify(args));
          // await controller.submitRequest({userId : context.userId, spaceid : context.clientId, body : args.input}, (result)=>{
          //   if (result.success)
          //   {
          //     return result.data;
          //   }
          //   return undefined;
          // });
        }
      }
    }
  })
});
exports.schema = schema;
