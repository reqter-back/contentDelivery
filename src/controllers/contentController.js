const broker = require("./serviceBroker");
const Contents = require("../models/content");
const ContentTypes = require("../models/contentType");
const mongoose = require("mongoose");
const async = require("async");
function isArray(obj) {
  return Object.prototype.toString.call(obj) === "[object Array]";
}
exports.filter = function(req, res, next) {
  if (!req.query.contentType) throw new Error("Invalid contentType");
  console.log(req.query);
  delete req.query.loadrelations;
  var skip = parseInt(req.query.skip) || 0;
  delete req.query.skip;
  var limit = parseInt(req.query.limit) || 100;
  delete req.query.limit;
  var sort = req.query.sort || "-sys.issueDate";
  delete req.query.sort;
  Contents.find(req.query)
    .select("fields sys.issuer, sys.issueDate _id, status")
    .populate("contentType", "_id title")
    .skip(skip)
    .limit(limit)
    .sort(sort)
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
                  select: ctype.fields[field].fields
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
                    if (
                      item.length > 0 &&
                      mongoose.Types.ObjectId.isValid(item)
                    )
                      ids.push(item);
                  });
                } else {
                  if (mongoose.Types.ObjectId.isValid(content.fields[fld.name]))
                    ids.push(content.fields[fld.name]);
                }
              }
            });
          });
          Contents.find({
            _id: { $in: ids }
          })
            .select("fields _id contentType")
            .exec((err, rels) => {
              if (err) {
                console.log(err);
                res.send(cts);
                return;
              }
              relfields.forEach(fld => {
                cts.forEach(content => {
                  if (
                    content.fields[fld.name] &&
                    content.fields[fld.name].length > 0
                  ) {
                    if (isArray(content.fields[fld.name])) {
                      for (i = 0; i < content.fields[fld.name].length; i++) {
                        var item = content.fields[fld.name][i];
                        var row = rels.filter(
                          a => a._id.toString() === item.toString()
                        );
                        if (row.length > 0) {
                          content.fields[fld.name][i] = row[0];
                        }
                      }
                    } else {
                      var row = rels.filter(
                        a =>
                          a._id.toString() ===
                          content.fields[fld.name].toString()
                      );
                      if (row.length > 0) {
                        content.fields[fld.name] = row[0];
                      }
                    }
                  }
                });
              });
              res.send(cts);
            });
        }
      });
    });
};
exports.test = function(req, res, next) {
  res.send({ hello: "world" });
};
exports.querytest = function(req) {
  console.log(req.query);
  var loadrelations = req.query.loadrelations == "false" ? false : true;
  delete req.query.loadrelations;
  var skip = parseInt(req.query.skip) || 0;
  delete req.query.skip;
  var limit = parseInt(req.query.limit) || 100;
  delete req.query.limit;
  var sort = req.query.sort || "-sys.issueDate";
  delete req.query.sort;
  Contents.find(req.query)
    .select("fields sys.issuer, sys.issueDate _id, status")
    .populate("contentType", "_id title")
    .skip(skip)
    .limit(limit)
    .sort(sort)
    .exec((err, cts) => {
      if (err) {
        console.log({ success: false, error: err });
        return;
      }
      if (loadrelations) {
        try {
          var ctypes = [];
          for (var i = 0; i < cts.length; i++) {
            var ct = cts[i].contentType._id.toString();
            if (ctypes.indexOf(ct) == -1) ctypes.push(ct);
          }
          var relfieldarr = {};
          var ids = [];
          ContentTypes.find({ _id: { $in: ctypes } }).exec((err, ttypes) => {
            if (err) {
              console.log(cts);
              return;
            } else {
              ttypes.forEach(ctype => {
                var relfields = [];
                for (var field in ctype.fields) {
                  if (ctype.fields[field].type === "reference") {
                    var references = ctype.fields[field].references;
                    if (references) {
                      references.forEach(ref => {
                        relfields.push({
                          name: ctype.fields[field].name,
                          ctype: ref,
                          select: ctype.fields[field].fields
                        });
                      });
                    } else {
                      relfields.push({
                        name: ctype.fields[field].name,
                        ctype: undefined,
                        select: undefined
                      });
                    }
                  }
                }
                relfieldarr[ctype._id.toString()] = relfields;
                for (var i = 0; i < cts.length; i++) {
                  content = cts[i];
                  if (
                    content.contentType._id.toString() == ctype._id.toString()
                  ) {
                    if (relfields.length > 0) {
                      relfields.forEach(fld => {
                        if (
                          content.fields[fld.name] &&
                          content.fields[fld.name].length > 0
                        ) {
                          if (isArray(content.fields[fld.name])) {
                            content.fields[fld.name].forEach(item => {
                              if (
                                item.length > 0 &&
                                ids.indexOf(item) == -1 &&
                                mongoose.Types.ObjectId.isValid(item)
                              )
                                ids.push(item);
                            });
                          } else {
                            if (
                              mongoose.Types.ObjectId.isValid(
                                content.fields[fld.name]
                              )
                            ) {
                              if (ids.indexOf(content.fields[fld.name]) == -1)
                                ids.push(content.fields[fld.name]);
                            }
                          }
                        }
                      });
                    }
                  }
                }
              });
              Contents.find({
                _id: { $in: ids }
              })
                .select("fields _id contentType")
                .exec((err, rels) => {
                  if (err) {
                    console.log(cts);
                    return;
                  }
                  for (var l = 0; l < ttypes.length; l++) {
                    var ctype = ttypes[l];
                    relfields = relfieldarr[ctype._id.toString()];
                    console.log(relfields);
                    relfields.forEach(fld => {
                      for (var s = 0; s < cts.length; s++) {
                        content = cts[s];
                        if (
                          content.contentType._id.toString() ==
                          ctype._id.toString()
                        ) {
                          if (
                            content.fields[fld.name] &&
                            content.fields[fld.name].length > 0
                          ) {
                            if (isArray(content.fields[fld.name])) {
                              for (
                                i = 0;
                                i < content.fields[fld.name].length;
                                i++
                              ) {
                                var item = content.fields[fld.name][i];
                                var row = rels.filter(
                                  a => a._id.toString() === item.toString()
                                );
                                if (row.length > 0) {
                                  var rw = {};
                                  rw._id = row[0]._id;
                                  rw.fields = {};
                                  if (fld.select && fld.select.length > 0) {
                                    for (
                                      var j = 0;
                                      j < fld.select.length;
                                      j++
                                    ) {
                                      f = fld.select[j];
                                      var c = row[0].fields[f];
                                      rw.fields[f] = c;
                                    }
                                    content.fields[fld.name][i] = rw;
                                  } else {
                                    content.fields[fld.name][i] = row[0];
                                  }
                                }
                              }
                            } else {
                              var row = rels.filter(
                                a =>
                                  a._id.toString() ===
                                  content.fields[fld.name].toString()
                              );
                              if (row.length > 0) {
                                var rw = {};
                                rw.fields = {};

                                rw._id = row[0]._id;
                                if (fld.select && fld.select.length > 0) {
                                  for (var j = 0; j < fld.select.length; j++) {
                                    f = fld.select[j];
                                    rw.fields[f] = row[0].fields[f];
                                  }
                                  console.log(rw);
                                  content.fields[fld.name] = rw;
                                } else {
                                  content.fields[fld.name] = row[0];
                                }
                              }
                            }
                          }
                        }
                      }
                    });
                  }
                  console.log(cts);
                });
            }
          });
        } catch (e) {
          console.log(e);
          console.log(cts);
        }
      } else {
        console.log(cts);
      }
    });
};
exports.query = function(req, res, next) {
  console.log(req.query);
  var loadrelations = req.query.loadrelations == "false" ? false : true;
  delete req.query.loadrelations;
  var skip = parseInt(req.query.skip) || 0;
  delete req.query.skip;
  var limit = parseInt(req.query.limit) || 100;
  delete req.query.limit;
  var sort = req.query.sort || "-sys.issueDate";
  delete req.query.sort;
  Contents.find(req.query)
    .select("fields sys.issuer, sys.issueDate _id, status")
    .populate("contentType", "_id title")
    .skip(skip)
    .limit(limit)
    .sort(sort)
    .exec((err, cts) => {
      if (err) {
        res.status(500).send({ success: false, error: err });
        return;
      }
      if (loadrelations) {
        try {
          var ctypes = [];
          for (var i = 0; i < cts.length; i++) {
            var ct = cts[i].contentType._id.toString();
            if (ctypes.indexOf(ct) == -1) ctypes.push(ct);
          }
          var relfieldarr = {};
          var ids = [];
          ContentTypes.find({ _id: { $in: ctypes } }).exec((err, ttypes) => {
            if (err) {
              res.send(cts);
              return;
            } else {
              ttypes.forEach(ctype => {
                var relfields = [];
                for (var field in ctype.fields) {
                  if (ctype.fields[field].type === "reference") {
                    var references = ctype.fields[field].references;
                    if (references) {
                      references.forEach(ref => {
                        relfields.push({
                          name: ctype.fields[field].name,
                          ctype: ref,
                          select: ctype.fields[field].fields
                        });
                      });
                    } else {
                      relfields.push({
                        name: ctype.fields[field].name,
                        ctype: undefined,
                        select: undefined
                      });
                    }
                  }
                }
                relfieldarr[ctype._id.toString()] = relfields;
                for (var i = 0; i < cts.length; i++) {
                  content = cts[i];
                  if (
                    content.contentType._id.toString() == ctype._id.toString()
                  ) {
                    if (relfields.length > 0) {
                      relfields.forEach(fld => {
                        if (
                          content.fields[fld.name] &&
                          content.fields[fld.name].length > 0
                        ) {
                          if (isArray(content.fields[fld.name])) {
                            content.fields[fld.name].forEach(item => {
                              if (
                                item.length > 0 &&
                                ids.indexOf(item) == -1 &&
                                mongoose.Types.ObjectId.isValid(item)
                              )
                                ids.push(item);
                            });
                          } else {
                            if (
                              mongoose.Types.ObjectId.isValid(
                                content.fields[fld.name]
                              )
                            ) {
                              if (ids.indexOf(content.fields[fld.name]) == -1)
                                ids.push(content.fields[fld.name]);
                            }
                          }
                        }
                      });
                    }
                  }
                }
              });
              Contents.find({
                _id: { $in: ids }
              })
                .select("fields _id contentType")
                .exec((err, rels) => {
                  if (err) {
                    res.send(cts);
                    return;
                  }
                  for (var l = 0; l < ttypes.length; l++) {
                    var ctype = ttypes[l];
                    relfields = relfieldarr[ctype._id.toString()];
                    console.log(relfields);
                    relfields.forEach(fld => {
                      for (var s = 0; s < cts.length; s++) {
                        content = cts[s];
                        if (
                          content.contentType._id.toString() ==
                          ctype._id.toString()
                        ) {
                          if (
                            content.fields[fld.name] &&
                            content.fields[fld.name].length > 0
                          ) {
                            if (isArray(content.fields[fld.name])) {
                              for (
                                i = 0;
                                i < content.fields[fld.name].length;
                                i++
                              ) {
                                var item = content.fields[fld.name][i];
                                var row = rels.filter(
                                  a => a._id.toString() === item.toString()
                                );
                                if (row.length > 0) {
                                  var rw = {};
                                  rw._id = row[0]._id;
                                  rw.fields = {};
                                  if (fld.select && fld.select.length > 0) {
                                    for (
                                      var j = 0;
                                      j < fld.select.length;
                                      j++
                                    ) {
                                      f = fld.select[j];
                                      var c = row[0].fields[f];
                                      rw.fields[f] = c;
                                    }
                                    content.fields[fld.name][i] = rw;
                                  } else {
                                    content.fields[fld.name][i] = row[0];
                                  }
                                }
                              }
                            } else {
                              var row = rels.filter(
                                a =>
                                  a._id.toString() ===
                                  content.fields[fld.name].toString()
                              );
                              if (row.length > 0) {
                                var rw = {};
                                rw.fields = {};

                                rw._id = row[0]._id;
                                if (fld.select && fld.select.length > 0) {
                                  for (var j = 0; j < fld.select.length; j++) {
                                    f = fld.select[j];
                                    rw.fields[f] = row[0].fields[f];
                                  }
                                  console.log(rw);
                                  content.fields[fld.name] = rw;
                                } else {
                                  content.fields[fld.name] = row[0];
                                }
                              }
                            }
                          }
                        }
                      }
                    });
                  }
                  res.send(cts);
                });
            }
          });
        } catch (e) {
          console.log(e);
          res.send(cts);
        }
      } else {
        res.send(cts);
      }
    });
};
function loadRelationFields(content, ids, callback) {}
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
