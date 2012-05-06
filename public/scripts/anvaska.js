var ko = window.ko;

var anvaska = {};
anvaska.constants = { apiUrl: "/api/records" };
anvaska.utils = {
    ajax: {
        get: function(url, data, success, error) {
            success = success || function(result) { };
            error = error || function(result) { };
			$.ajax(url, {
				type: "GET", 
				data: data,
				contentType: "application/json",
				success: success,
                error: error
			});
        },
        post: function(url, data, success, error) {
            success = success || function(result) { };
            error = error || function(result) { };
			$.ajax(url, {
				type: "POST",
				data: JSON.stringify(data), 
				contentType: "application/json",
				success: success,
                error: error
			});
        },
        delete: function(url, data, success, error) {
            success = success || function(result) { };
            error = error || function(result) { };
			$.ajax(url, {
				type: "DELETE",
				data: {}, 
				contentType: "application/json",
				success: success,
                error: error
			});
        }
    }
}

// DATA and Provider
anvaska.data = {};
anvaska.data.TimeRecordProvider = function(url) {
	this.url = url; // api url
};
anvaska.data.TimeRecordProvider.prototype = {
	get: function(params) {
    },
    add: function(records) {
    },
    update: function(records) {
    },
    remove: function(record) {
    }
};

// Knockout.js VIEW MODEL
anvaska.model = {};
// Class to represent a row in the time records grid
anvaska.model.TimeRecord = function(data) {
    var self = this;
    self._id = data._id; // not visible, but needed for CRUD operations
    self.time = ko.observable(data.time);
    self.date = ko.observable(data.date);
    self.project = ko.observable(data.project);
    self.description = ko.observable(data.description);
    self.isMouseover = ko.observable(false);
    
    //operations
    self.enableDetails = function() {
        self.isMouseover(true);
    };
    self.disableDetails = function() {
        self.isMouseover(false);
    };
};

// Overall viewmodel for this screen, along with initial state
anvaska.model.RecordsViewModel = function() {
    var self = this;  
    self.records = ko.observableArray([]);
    
    //Editable data
    self.newRecordTime = ko.observable();
    self.newRecordDate = ko.observable();
    self.newRecordProject = ko.observable();
    self.newRecordDescription = ko.observable();
    
    //operations
    self.addRecord = function() {
        var obj = {
            time: self.newRecordTime(),
            date: self.newRecordDate(),
            project: self.newRecordProject(),
            description: self.newRecordDescription()
        };
        function onSuccess(results) {
            var record = results[0];
            console.log(record);
            self.records.unshift(new anvaska.model.TimeRecord(record));
            self.cleanForm();
        }
        anvaska.utils.ajax.post(anvaska.constants.apiUrl, {records: [obj]}, onSuccess);
    };
    self.removeRecord = function(record) {
        console.log(record._id);
        var data = { _id : record._id };
        var url = anvaska.constants.apiUrl + "/" + record._id;
        anvaska.utils.ajax.delete(url);
    };
    
    //helpers
    self.cleanForm = function() {
        self.newRecordTime("");
        self.newRecordDate("");
        self.newRecordProject("");
        self.newRecordDescription("");
    };
    //load initial tasks
    $.getJSON("/api/records").done(function(data) {
        var mappedRecords = $.map(data, function(item) {
            var obj = {
                _id: item._id,
                time: item.time,
                date: item.date,
                project: item.project,
                description: item.description
            }
            return new anvaska.model.TimeRecord(obj);
        });
        self.records(mappedRecords);
        $("#notif").hide();
    });
};

ko.applyBindings(new anvaska.model.RecordsViewModel());
