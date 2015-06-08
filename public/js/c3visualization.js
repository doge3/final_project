$(function() {
    var categories = ['education', 'poverty'];

    var educationJSON = $.getJSON('/education');
    var povertyJSON = $.getJSON('/poverty');
    var wantedRows = [];

    wantedRows.push([3, 4, 5, 6, 7]);
    $.when(educationJSON, povertyJSON).done(function(eduData, povertyData) {
        var allData = [];
        allData.push(eduData[0]);
        allData.push(povertyData[0]);

        var barChart = c3.generate({
            bindto: '#barChart',
            data: {
                columns: [
                    ['Pendleton', 10553, 17893, 9442, 23965, 15700]
                ],
                type: 'bar',
            },
            axis: {
                rotated: true,
                x: {
                    type: ' category',
                    categories: ['High School graduate', 'Some college, no diploma', 'Associate\'s degree', 'Bachelor\'s degree', 'Master\'s degree']
                }
            }
        });

        addPie('Pendleton', $('#cd-dropdown').val(), true);

        $('#map_img').mapster({
            fillColor: 'ff0000',
            fillOpacity: 0.3,
            showToolTip: true,
            mapKey: 'name',
            listKey: 'name',
            areas: mapKeytoTooltip(),
            onClick: clickHandler
        });

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
            if (e.selected) {
                var category = $('#cd-dropdown').val();
                updateBar(e.key, category, true);
                addPie(e.key, category, true);
            } else {
                updateBar(e.key, null, false);
                removePie(e.key);
            }
        }

        function updateBar(key, category, selected) {
            if (selected) {
                var data = [];
                var labels = [];

                var temp = allData[category].filter(function(row) {
                    if (row.Area == key) {
                        return row;
                    }
                });

                for (var i = 0; i < temp.length; i++) {
                    if (wantedRows[category].indexOf(i) > -1) {
                        data.push(temp[i].Population);
                        labels.push(temp[i].Education);
                    }
                }

                data.unshift(key);

                barChart.load({
                    columns: [
                        data
                    ]
                });
            } else {
                barChart.unload({
                    ids: [key]
                });
            }
        }

        function addPie(key, category, selected) {
            var pieId = 'pie' + key.replace(/ /g, '');
            $('#pies').append('<div id=\"' + pieId + '\" class=\"piechart\"></div>');

            var data = [];

            var temp = allData[category].filter(function(row) {
                if (row.Area == key) {
                    return row;
                }
            });

            for (var i = 0; i < temp.length; i++) {
                if (wantedRows[category].indexOf(i) > -1) {
                    var column = [];
                    column.push(temp[i].Education);
                    column.push(temp[i].Population);
                    data.push(column);
                }
            }

            var pieChart = c3.generate({
                bindto: '#' + pieId,
                data: {
                    columns: data,
                    type: 'pie'
                },
            });

            $('#' + pieId).prepend('<h3>' + key + '</h3>');
        }

        //TODO: add transition
        function removePie(key) {
            $('#pie' + key.replace(/ /g, '')).remove();
        }
    });
});