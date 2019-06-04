var mongoose = require('mongoose');
var sysfld = require('./sys');
var Schema = mongoose.Schema;
 
var category = new Schema({
    sys : {type : sysfld, required : true},
    code : {type:Number},
    name : {type : Object, required:true},
    shortDesc : {type : Object},
    longDesc : {type : Object},
    image : {type : Object},
    items : [Object],
    parentId : { type: Schema.Types.ObjectId, ref: 'Category' },
});

module.exports = mongoose.model("Category", category);