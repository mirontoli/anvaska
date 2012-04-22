var ko = window.ko;

var anvaska = {};
anvaska.model = {};
// Class to represent a row in the time records grid
anvaska.model.TimeRecord = function(project, description) {
    var self = this;
    self.project = project;
    self.description = description;
};

// Overall viewmodel for this screen, along with initial state
anvaska.model.RecordsViewModel = function() {
    var self = this;  
    self.records = ko.observableArray([]);
    // Editable data
    
    //operations
    self.addRecord = function() {
        self.seats.push(new anvaska.model.TimeRecord("Added", "some desc"));
    };
    //load initial tasks
    $.getJSON("./sample.json").done(function(data) {
        var mappedRecords = $.map(data, function(item) {
            return new anvaska.model.TimeRecord(item.project, item.description);
        });
        self.records(mappedRecords);
        $("#notif").hide();
    });
};

ko.applyBindings(new anvaska.model.RecordsViewModel());

anvaska.ui = {};
anvaska.ui.load = function() {
};

$(document).on({
    ready: anvaska.ui.load
});
