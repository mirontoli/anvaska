var ko = window.ko;

var anvaska = {};
anvaska.options = {
    apiUrl: "/api/records",
    ajax: {
        contentType: "application/json",
        onSuccess: function(result) { },
        onError: function(result) { }
    }    
};
anvaska.utils = {
    ajax: {
        get: function(url, data, success, error) {
            data = data || {};
            success = success || anvaska.options.ajax.onSuccess;
            error = error || anvaska.options.ajax.onError;
			$.ajax(url, {
				type: "GET", 
				data: data,
				contentType: anvaska.options.ajax.contentType,
				success: success,
                error: error
			});
        },
        post: function(url, data, success, error) {
            success = success || anvaska.options.ajax.onSuccess;
            error = error || anvaska.options.ajax.onError;
			$.ajax(url, {
				type: "POST",
				data: JSON.stringify(data), 
				contentType: anvaska.options.ajax.contentType,
				success: success,
                error: error
			});
        },
        delete: function(url, data, success, error) {
            success = success || anvaska.options.ajax.onSuccess;
            error = error || anvaska.options.ajax.onError;
			$.ajax(url, {
				type: "DELETE",
				data: {}, 
				contentType: anvaska.options.ajax.contentType,
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
    this.idUrl = url + "/%s";
};
anvaska.data.TimeRecordProvider.prototype = {
	get: function(params, success, error) {
       anvaska.utils.ajax.get(this.url, undefined, success, error);
    },
    add: function(records, success, error) {
       if (typeof records !== Array) {
          records = [records]; //on server an array is expected
       }
       var data = {records: records };
       anvaska.utils.ajax.post(this.url, data, success, error);
    },
    update: function(records, sucess, error) {
       throw "update not implemented yet";
    },
    remove: function(record, success, error) {
        var url = this.idUrl.replace(/%s/i, record._id); //include the id in the URL
        anvaska.utils.ajax.delete(url, {}, success, error);
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

anvaska.model.TimeStat = function(data) {
    var self = this;
    self.time = ko.observable(data.time);
    self.project = ko.observable(data.project);
    self.price = ko.observable(data.price);
    self.sum = ko.computed(function() {
       return self.time() * self.price();
    }, this);
    
    //operations
};

// Overall viewmodel for this screen, along with initial state
anvaska.model.RecordsViewModel = function() {
    var self = this;
    self.provider = new anvaska.data.TimeRecordProvider(anvaska.options.apiUrl);

    self.records = ko.observableArray([]);
    self.price = ko.observable(100);
    self.stats = ko.computed(function() {
        var projects = {};
        var records = self.records();
        for (var i = 0; i < records.length; i++) {
           
           var record = records[i];
           var project = record.project();
           var time = parseInt(record.time());
           projects[project] = projects[project] || 0;
           projects[project] += time;
        }
        var stats = [];
        for( var project in projects ) {
           var obj = { 
				time: projects[project], 
				project: project
           };
           obj.price = self.price();
           var stat = new anvaska.model.TimeStat(obj);
           stats.push(stat);
        }
		return stats; 
	}, this);
    self.statsTotalHours = ko.computed(function(){
           var stats = self.stats();
           var hours = 0;
           for(var i in stats) {
               hours += stats[i].time();
           }
           return hours;
    }, this);
    self.statsTotalSum = ko.computed(function(){
           var stats = self.stats();
           var hours = 0;
           for(var i in stats) {
               hours += stats[i].sum();
           }
           return hours;
    }, this);
    
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
            self.records.unshift(new anvaska.model.TimeRecord(record));
            self.cleanForm();
        }
        self.provider.add(obj, onSuccess);
    };
    self.removeRecord = function(record) {
        self.provider.remove(record, function(result) {
            self.records.remove(record); //reflect it in knockout array
        });
    };
    
    //helpers
    self.cleanForm = function() {
        self.newRecordTime("");
        self.newRecordDate("");
        self.newRecordProject("");
        self.newRecordDescription("");
    };
    self.sort = function(left, right, property) {
        return left[property] > right[property];
    };
    self.sortRecords = function(left, right) {
        return self.sort(left, right, "date");
    };
    self.sortRecordsAfterProject = function(left, right) {
        return self.sort(left, right, "project");
    };

    //load initial tasks
    self.provider.get(undefined, function(records) {
        var mappedRecords = $.map(records, function(item) {
            return new anvaska.model.TimeRecord(item);
        });
        mappedRecords.sort(self.sortRecords);
        self.records(mappedRecords);
        $("#notif").hide();
    });
};

ko.applyBindings(new anvaska.model.RecordsViewModel());






/* Datepicker */

anvaska.ui = {};
anvaska.ui.initDate = function() {
   $("#anvaska-date-input").datepicker({ dateFormat: 'yy-mm-dd' });
};
anvaska.ui.init = function() {
   anvaska.ui.initDate();
};
$(document).on({
   ready: anvaska.ui.init
});





