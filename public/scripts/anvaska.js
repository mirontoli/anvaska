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

// Overall viewmodel for this screen, along with initial state
anvaska.model.RecordsViewModel = function() {
    var self = this;
    self.provider = new anvaska.data.TimeRecordProvider(anvaska.options.apiUrl);
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
    self.sortRecords = function(left, right) {
        return left.date > right.date;
    }

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
