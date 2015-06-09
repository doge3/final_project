$(function() {
    var educationJSON = $.getJSON('/education');
    var povertyJSON = $.getJSON('/poverty');
    var employmentJSON = $.getJSON('/employment');

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

    Chart.prototype.process = function(data) {
        for (var category in data) {
            var criterion = this.criteria[category];
            var dataset = data[category];
            var mapping = {};

            for (var i = 0; i < dataset.length; i++) {
                var row = dataset[i];
                var area = row['Area'];
                var label = row[criterion.column];
                var datum = row[criterion.data];

                // Check if this row has the data we want
                if (criterion.values.indexOf(label) > -1) {

                    if (!mapping.hasOwnProperty(area)) mapping[area] = [];

                    mapping[area].push(datum);
                }
            }

            for (var area in mapping) {
                var arr = [].concat(mapping[area]);
                arr.unshift(area);
                this.data[category].push(arr);
            }
        }
    };

    Chart.prototype.getBar = function(area, category) {
        var result = this.data[category].filter(function(val) {
            return val[0] === area;
        });

        return result;
    };

    Chart.prototype.generateBarChart = function(bindto, areas, category) {
        var columns = this.data[category].filter(function(val) {
            return areas.indexOf(val[0]) > -1;
        });

        var barChart = c3.generate({
            padding: {
                bottom: 15,
            },
            size: {
                height: 400
            },
            bindto: bindto,
            data: {
                columns: columns,
                type: 'bar'
            },
            axis: {
                rotated: true,
                x: {
                    type: 'category',
                    categories: this.criteria[category].values,
                    label: {
                        text: 'Categories',
                        position: 'outer-middle'
                    }
                },
                y: {
                    label: {
                        text: '# of People',
                        position: 'outer-center'
                    }
                }
            },
        });

        return barChart;
    };

    Chart.prototype.generatePieChart = function(bindto, area, category) {
        var columns = this.data[category].filter(function(val) {
            return area === val[0];
        });

        var pieData = [];
        for (var i = 1; i < columns[0].length; i++) {
            var tuple = [];
            tuple.push(this.criteria[category].values[i - 1]);
            tuple.push(columns[0][i]);
            pieData.push(tuple);
        }

        var pieChart = c3.generate({
            bindto: bindto,
            data: {
                columns: pieData,
                type: 'pie'
            },
            legend: {
                position: 'right'
            }
        });

        return pieChart;
    };

    var chart = new Chart();
    chart.addCriterion('poverty', ["Income 50% of poverty level",
        "Income 50% to 74% of poverty level",
        "Income 75% to 99% of poverty level",
        "Income 100% to 124% of poverty level",
        "Income 125% to 149% of poverty level",
        "Income 150% to 199% of poverty level",
        "Income 200% of poverty level or higher"
    ], "Total", "Population Type");

    chart.addCriterion('education', ["Less than 9th grade (age 25 and older)",
        "9th through 12th grade, no diploma (age 25 and older)",
        "High school graduate (include equivalency (age 25 and older))",
        "Some college, no diploma (age 25 and older)",
        "Associate's degree (age 25 and older)",
        "Bachelor's degree (age 25 and older)",
        "Master's degree (age 25 and older)"
    ], "Population", "Education");

    chart.addCriterion('employment', ["Armed Forces (Residents)",
        "Civilian Employed (Residents)",
        "Civilian Unemployed (Residents)",
        "Not in Labor Force (Residents)"
    ], "Population", "Employment Status");

    $.when(educationJSON, povertyJSON, employmentJSON).done(function(eduData, povertyData, employmentData) {
        var allData = {};
        var selectedAreas = {
            'Pendleton': true
        };
        var barChart;
        var pieChart;

        allData['education'] = eduData[0];
        allData['poverty'] = povertyData[0];
        allData['employment'] = employmentData[0];

        chart.process(allData);

        init();

        $('#cd-dropdown').change(function() {
            var category = this.value;
            var areas = [];

            for (var area in selectedAreas) {
                if (selectedAreas[area] && selectedAreas[area] == true) {
                    areas.push(area);
                }
            }
            removeBar();
            barChart = chart.generateBarChart('#barChart', areas, category);

            removeAllPie();
            addPie(areas, category);
        });

        function init() {
            var category = $('#cd-dropdown').val();
            var areas = [];
            areas.push('Pendleton');
            barChart = chart.generateBarChart('#barChart', areas, category);
            addPie(areas, category);

            $('#map_img').mapster({
                fillColor: '2579be',
                fillOpacity: 0.3,
                showToolTip: true,
                mapKey: 'name',
                listKey: 'name',
                areas: mapKeytoTooltip(),
                onClick: clickHandler,
            });
        }

        function mapKeytoTooltip() {
            return $('area').map(function() {
                return {
                    key: $(this).attr('name'),
                    toolTip: $(this).attr('name'),
                    selected: $(this).attr('name') == "Pendleton"
                }
            });
        }

        function clickHandler(e) {
            var keys = [];
            keys.push(e.key);
            var category = $('#cd-dropdown').val();

            if (e.selected) {
                selectedAreas[e.key] = true;
                addBar(keys, category);
                addPie(keys, category);
            } else {
                selectedAreas[e.key] = false;
                unloadBar(keys);
                removePie(e.key);
            }
        }

        function addBar(keys, category) {
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var result = chart.getBar(key, category);

                barChart.load({
                    columns: result
                });
            }
        }

        function addPie(keys, category) {
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var pieId = 'pie' + key.replace(/ /g, '');
                $('#pies').prepend('<div id=\"' + pieId + '\" class=\"piechart\"></div>');
                var pieChart = chart.generatePieChart("#" + pieId, key, category);
                $('#' + pieId).prepend('<h3>' + key + '</h3>');
            }
        }

        function unloadBar(keys) {
            barChart.unload({
                ids: keys
            });
        }

        function removeBar() {
            $('#barChart').empty();
        }

        function removePie(key) {
            $('#pie' + key.replace(/ /g, '')).hide('slow', function() {
                $('#pie' + key.replace(/ /g, '')).remove();
            });
        }

        function removeAllPie() {
            $('#pies').empty();
        }
    });
});