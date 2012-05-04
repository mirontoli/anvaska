var ko = window.ko;

var anvaska = {};
anvaska.model = {};
// Class to represent a row in the time records grid
anvaska.model.TimeRecord = function(data) {
    var self = this;
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
    }
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
        }
        self.records.unshift(new anvaska.model.TimeRecord(obj));
        self.cleanForm();
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
                time: "time2",
                date: "date2",
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
