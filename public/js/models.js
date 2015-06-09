$(function() {
    var Chart = function() {
        this.criteria = {};
        this.data = {};
    };

    Chart.prototype.addCriterion = function(category, values, data, label) {
        var criterion = {
            column: label,
            values: values,
            data: data
        };

        this.criteria[category] = criterion;
        this.data[category] = [];
    };

    Chart.prototype.getCriterion = function(category) {
        return this.criteria[category];
    }

    Chart.prototype.processData = function(data) {
        for (var category in data) {
            var criterion = this.criteria[category];
            var dataset = data[category];
            var mapping = {};

            for (var i = 0; i < dataset.length; i++) {
                var row = dataset[i];
                var area = row['Area'];
                var label = row[criterion.column];
                var data = row[criterion.data];

                // Check if this row has the data we want
                if (criterion.values.indexOf(row[criterion.column]) > -1) {
                    if (!mapping.hasOwnProperty(area)) mapping[area] = [];

                    mapping[area].push(row[criterion.column]);
                }
            }
        }
    }

});

// var BarChart = function() {
//     this.data = {};
// };

// BarChart.prototype = Object.create(Chart.prototype);
// BarChart.prototype.constructor = BarChart;

// BarChart.prototype.process = function(data) {