const broker = require("./serviceBroker");
const Contents = require("../models/content");
const ContentTypes = require("../models/contentType");
const async = require("async");
function isArray(obj) {
  return Object.prototype.toString.call(obj) === "[object Array]";
}
exports.filter = function(req, res, next) {
  var c = undefined,
    ct,
    st;
  if (!req.query.contentType) throw new Error("Invalid contentType");
  if (req.query.contentType) ct = req.query.contentType;
  var flt = {
    "sys.spaceId": req.clientId,
    contentType: req.query.contentType,
    status: req.query.status
  };
  if (req.query.fields) {
    var js = JSON.parse(req.query.fields);
    if (js) {
      for (var key in js) {
        var val = js[key];
        flt["fields." + key] = val;
      }
    }
  }
  if (!req.query.fields) delete flt.fields;
  if (!req.query.status) delete flt.status;
  console.log(flt);
  Contents.find(flt)
    .select("fields sys.issuer, sys.issueDate _id, status")
    .exec((err, cts) => {
      if (err) {
        res.status(500).send({ success: false, error: err });
        return;
      }
      ContentTypes.findById(req.query.contentType).exec((err, ctype) => {
        if (err) {
          res.status(500).send({ success: false, error: err });
          return;
        }
        var relfields = [];
        for (var field in ctype.fields) {
          if (ctype.fields[field].type === "reference") {
            var references = ctype.fields[field].references;
            if (references) {
              references.forEach(ref => {
                relfields.push({
                  name: ctype.fields[field].name,
                  ctype: ref,
                  select: ref.select
                });
              });
            }
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
          })
            .select("fields _id")
            .exec((err, rels) => {
              if (err) {
                res.status(500).send({ success: false, error: err });
                return;
              }
              var result = { contents: cts, reldata: rels };
              res.send(result);
            });
        }
      });
    });
};

function loadRelations(content, callback) {
  ContentTypes.findById(content.contentType).exec((err, ctype) => {
    if (err) {
      return;
    }
    var relfields = [];
    for (var field in ctype.fields) {
      if (ctype.fields[field].type === "reference") {
        var references = ctype.fields[field].references;
        if (references) {
          references.forEach(ref => {
            relfields.push({
              name: ctype.fields[field].name,
              ctype: ref,
              select: ref.select
            });
          });
        }
      }
    }
    var reldata = [];
    if (relfields.length > 0) {
      var ids = [];
      relfields.forEach(fld => {
        if (content.fields[fld.name] && content.fields[fld.name].length > 0) {
          if (isArray(content.fields[fld.name])) {
            content.fields[fld.name].forEach(item => {
              if (item.length > 0) ids.push(item);
            });
          } else {
            ids.push(content.fields[fld.name]);
          }
        }
      });
    }
  });
}
exports.loadByTemplate = function(req, res, next) {
  if (!req.params.template) throw new Error("Invalid template name");
  if (req.params.template) ct = req.params.template;
  var ct = [];
  ContentTypes.find({ template: req.params.template }).exec((err, ctypes) => {
    if (err) {
      res.status(500).send({ success: false, error: err });
      return;
    }
    ctypes.forEach(cty => {
      ct.push(cty._id);
    });
    var flt = {
      "sys.spaceId": req.clientId,
      contentType: { $in: ct },
      status: req.query.status
    };
    Object.assign(flt, req.query);
    if (!req.query.fields) delete flt.fields;
    if (!req.query.status) delete flt.status;
    delete flt.mode;
    console.log(flt);
    Contents.find(flt)
      .select("fields sys.issuer, sys.issueDate _id, status, contentType")
      .exec((err, cts) => {
        if (err) {
          res.status(500).send({ success: false, error: err });
          return;
        }
        var result = cts;
        var reldata = [];
        cts.forEach(item => {
          var rel = loadRelations(item, () => {
            reldata.push(rels);
          });
        });
      });
  });
};
