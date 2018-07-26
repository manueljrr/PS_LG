
$(document).ready(function() {

    var allData = [];

    $(document).on('ajaxStart', function(){
        // Show loading and hide chart divs
        $("#pie-chart").hide();
        $("#line-chart").hide();
        $(this).find('.loader-circle').show();
    }).on('ajaxStop', function(){
        $(this).find('.loader-circle').hide();

        // Draw and show pie chart
        drawPieChart(allData);

        // Prepare data for the linear chart
        var gruopedData = processData(allData);

        // Draw and show linear chart
        drawLineChart(gruopedData);
    });

    // Get the data1 json file
    $.ajax({
        url : "http://s3.amazonaws.com/logtrust-static/test/test/data1.json",
        type : "GET",
        dataType: 'json',
        success : function(data) {
            allData = allData.concat(normalizeData(data));
        },
        error : function(xhr,errmsg,err) {
            console.log(xhr.status + ": " + xhr.responseText);
        }
    });


    // Get the data2 json file
    $.ajax({
        url : "http://s3.amazonaws.com/logtrust-static/test/test/data2.json",
        type : "GET",
        dataType: 'json',
        success : function(data) {
            allData = allData.concat(normalizeData(data));
        },
        error : function(xhr,errmsg,err) {
            console.log(xhr.status + ": " + xhr.responseText);
        }
    });


    // Get the data3 json file
    $.ajax({
        url : "http://s3.amazonaws.com/logtrust-static/test/test/data3.json",
        type : "GET",
        dataType: 'json',
        success : function(data) {
            allData = allData.concat(normalizeData(data));
        },
        error : function(xhr,errmsg,err) {
            console.log(xhr.status + ": " + xhr.responseText);
        }
    });


});


function drawPieChart(data) {
    /*
    *  Draw the pie chart
    *  @param data: (array) Object list with all data
    *
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


    // Group data by categories with total summarized values
    var resultData = d3.nest()
        .key(function(d) { return d.category; })
        .rollup(function(v) { return d3.sum(v, function(d) { return d.value; }); })
        .entries(data);


    var selected = false;

    // Prepare piechart data series
    resultData.forEach(function (item) {
        item.name = item.key;
        delete (item.key);
        item.y = item.value;
        delete (item.value);

        if (!selected) {
            selected = true;
            item.sliced = true;
            item.selected = true;
        }

    });

    // Order data by values
    resultData.sort(function(a, b){return b.y - a.y});


    Highcharts.chart('pie-chart', {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: null
        },
        credits: {
            enabled: false
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
            }
        },
        series: [{
            name: 'Rate',
            colorByPoint: true,
            data: resultData
        }]
    });

    $("#pie-chart").show();
}

function drawLineChart(data) {
    /*
    *  Draw the linear chart
    *  @param data: (array) Object list with all grouped data
    *
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    Highcharts.chart('line-chart', {

        title: {
            text: null
        },
        credits: {
            enabled: false
        },

        yAxis: {
            title: {
                text: null
            }
        },
        xAxis: {
            type: 'datetime'
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle'
        },
        tooltip: {
            headerFormat: '<b>{point.x:%b %e, %Y}</b><br>',
            valueDecimals: 2,
            shared: true,
        },

        plotOptions: {
            series: {
                label: {
                    connectorAllowed: false
                },
                pointStart: data[0].data[0][0],
                pointInterval: 24 * 3600 * 1000 // one day
            }
        },
        series: data,

        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    legend: {
                        layout: 'horizontal',
                        align: 'center',
                        verticalAlign: 'bottom'
                    }
                }
            }]
        }

    });

    $("#line-chart").show();
}


function normalizeData(data) {
    /*
    *  Parse the received data to a standard object for processing
    *  @param data: (array) Object list of Data1, Data2 or Data3
    *
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    var cleanedData = [];

    data.forEach(function (item) {
        var itemObj = {};

        // Normalize value for DATE
        if (item.hasOwnProperty("d")) {
            // property 'date' included in Data1 (d)
            itemObj.date = new Date(item.d);
        } else if (item.hasOwnProperty("myDate")) {
            // property 'date' included in Data2 (myDate)
            itemObj.date = new Date(item.myDate);
        } else if (item.hasOwnProperty("raw")) {
            // property 'date' included in Data3 (raw)
            var dateValue = /\d{4}-\d{1,2}-\d{1,2}/.exec(item.raw);
            itemObj.date = new Date(dateValue[0]);
        }

        // Normalize value for category
        if (item.hasOwnProperty("cat")) {
            // property 'category' included in Data1 (cat)
            itemObj.category = item.cat.toUpperCase();
        } else if (item.hasOwnProperty("categ")) {
            // property 'category' included in Data2 (categ)
            itemObj.category = item.categ.toUpperCase();
        } else if (item.hasOwnProperty("raw")) {
            // property 'category' included in Data3 (raw)
            var categoryValue = /#(.+?)#$/.exec(item.raw);
            itemObj.category = categoryValue[1].toUpperCase();
        }

        // Normalize value for VALUE
        if (item.hasOwnProperty("value")) {
            // property 'value' included in Data1 (value)
            itemObj.value = item.value;
        } else if (item.hasOwnProperty("val")) {
            // property 'value' included in Data2 or Data3 (val)
            itemObj.value = item.val;
        }

        cleanedData.push(itemObj);

    });

    return cleanedData;
}


function processData(allData) {
    /*
    *  Group all the data by category and date, and apply date ordering
    *  @param allData: (array) Object list with all data
    *
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    // Group data by category and date
    var result = d3.nest()
        .key(function(d) { return d.category; })
        .key(function(d) { return new Date(d.date); })
        .rollup(function(v) { return d3.sum(v, function(d) { return d.value; }); })
        .entries(allData);

    // Order entries by category
    result.sort(function (a, b) {
        if (a.key < b.key) { return -1; }
        if (a.key > b.key) { return 1; }
        return 0;
    })

    // Order category entries by date
    result.forEach(function (item) {
        item.values.sort(function (a, b) {
            var dateA = new Date(a.key);
            var dateB = new Date(b.key);
            if (dateA < dateB) { return -1; }
            if (dateA > dateB) { return 1; }
            return 0;
        });

        // Remane object keys according to Highcharts data series
        item.name = item.key;
        delete (item.key);
        item.data = item.values;
        delete (item.values);

        // Rename subobject keys
        item.data.forEach(function (subitem) {
           subitem.x = new Date(subitem.key);
           delete (subitem.key);
           subitem.y = subitem.value;
           delete (subitem.value);
        });

    });

    return result;
}

