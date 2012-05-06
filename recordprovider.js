var mongo = require('mongodb');
var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

RecordProvider = function(mongoUri) {
  var self = this;
  function dbConnectCallback(error, db) {
    self.db = db;
  }
  mongo.connect( mongoUri, {}, dbConnectCallback );
};


RecordProvider.prototype.getCollection= function(callback) {
  this.db.collection('records', function(error, record_collection) {
    if( error ) callback(error);
    else callback(null, record_collection);
  });
};

RecordProvider.prototype.findAll = function(callback) {
    this.getCollection(function(error, record_collection) {
      if( error ) callback(error)
      else {
        record_collection.find().toArray(function(error, results) {
          if( error ) callback(error)
          else callback(null, results)
        });
      }
    });
};


RecordProvider.prototype.findById = function(id, callback) {
    this.getCollection(function(error, record_collection) {
      if( error ) callback(error)
      else {
        record_collection.findOne({_id: record_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
          if( error ) callback(error)
          else callback(null, result)
        });
      }
    });
};

RecordProvider.prototype.save = function(records, callback) {
    this.getCollection(function(error, record_collection) {
      if( error ) callback(error)
      else {
        if( typeof(records.length)=="undefined")
          records = [records];

        for( var i =0;i< records.length;i++ ) {
          article = records[i];
          article.created_at = new Date();
        }

        record_collection.insert(records, function() {
          callback(null, records);
        });
      }
    });
};

RecordProvider.prototype.deleteById = function(id, callback) {
    this.getCollection(function(error, record_collection) {
      if( error ) callback(error)
      else {
        record_collection.remove({_id: record_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
          if( error ) callback(error)
          else callback(null, result)
        });
      }
    });
};

exports.RecordProvider = RecordProvider;
