// $(document).ready(function () {

google.load("visualization", "1", {packages:["corechart"]});
//google.setOnLoadCallback(drawCharts);


$("#data").on('click',()=>{

  $.get('http://localhost:5000/users/getData',(chartData)=> {

    drawCharts(chartData);
    document.getElementById('streak-num').textContent = chartData.dailyData.currentStreak;
    document.getElementById('longStreak').textContent = chartData.dailyData.longestStreak;
    document.getElementById('currWeek').textContent = chartData.weeklyData.thisWeekHrs;
    document.getElementById('lastWeek').textContent = chartData.weeklyData.lastWeekHrs;
    document.getElementById('avgHrs').textContent = chartData.weeklyData.avgWeekHrs;

    //TODO document.getElementById('compProj').textContent = chartData.completedProjs
    //console.log(chartData);
  });

});

// });

  function drawCharts(chartData) {

    var heatmap = calendarHeatmap()
                    .data(chartData.dailyData.heatmap)
                    .selector('#cal-heatmap')
                    .tooltipEnabled(true)
                    .colorRange(['#f4f7f7', '#79a8a9'])
                    .onClick(function (data) {
                      console.log('data', data);
                    });
    heatmap();  // render the chart

    // pie chart data
    var pieData = google.visualization.arrayToDataTable(chartData.pieData);
    // pie chart options
    var pieOptions = {
      backgroundColor: 'transparent',
      pieHole: 0.4,
      colors: [ "cornflowerblue",
                "olivedrab",
                "orange",
                "tomato",
                "crimson",
                "purple",
                "turquoise",
                "forestgreen",
                "navy",
                "gray"],
      pieSliceText: 'value',
      tooltip: {
        text: 'percentage'
      },
      fontName: 'Open Sans',
      chartArea: {
        width: '100%',
        height: '94%'
      },
      legend: {
        textStyle: {
          fontSize: 13
        }
      }
    };
    // draw pie chart
    var pieChart = new google.visualization.PieChart(document.getElementById('google-pie'));
    pieChart.draw(pieData, pieOptions);

    // BEGIN BAR CHART
    var barData = google.visualization.arrayToDataTable(chartData.weeklyData.barChartData);
    // set bar chart optionsusers
    var barOptions = {
      focusTarget: 'category',
      backgroundColor: 'transparent',
      colors: ['cornflowerblue', 'tomato'],
      fontName: 'Open Sans',
      chartArea: {
        left: 50,
        top: 10,
        width: '100%',
        height: '70%'
      },
      bar: {
        groupWidth: '80%'
      },
      hAxis: {
        textStyle: {
          fontSize: 11
        }
      },
      vAxis: {
        viewWindowMode:'explicit',
        viewWindow: {
            min: 0
        },
        baselineColor: '#DDD',
        gridlines: {
          color: '#DDD',
          count: 4
        },
        textStyle: {
          fontSize: 11
        }
      },
      legend: {
        position: 'bottom',
        textStyle: {
          fontSize: 12
        }
      },
      animation: {
        duration: 1200,
        easing: 'out',
        startup: true
      }
    };
    // draw bar chart twice so it animates
    var barChart = new google.visualization.ColumnChart(document.getElementById('bar-chart'));
    //barChart.draw(barZeroData, barOptions);
    barChart.draw(barData, barOptions);




    // BEGIN LINE GRAPH

    function randomNumber(base, step) {
      return Math.floor((Math.random()*step)+base);
    }
    function createData(year, start1, start2, step, offset) {
      var ar = [];
      for (var i = 0; i < 12; i++) {
        ar.push([new Date(year, i), randomNumber(start1, step)+offset, randomNumber(start2, step)+offset]);
      }
      return ar;
    }
    var randomLineData = [
      ['Year', 'Page Views', 'Unique Views']
    ];
    for (var x = 0; x < 7; x++) {
      var newYear = createData(2007+x, 10000, 5000, 4000, 800*Math.pow(x,2));
      for (var n = 0; n < 12; n++) {
        randomLineData.push(newYear.shift());
      }
    }
    var lineData = google.visualization.arrayToDataTable(randomLineData);

  	/*
    var animLineData = [
      ['Year', 'Page Views', 'Unique Views']
    ];
    for (var x = 0; x < 7; x++) {
      var zeroYear = createData(2007+x, 0, 0, 0, 0);
      for (var n = 0; n < 12; n++) {
        animLineData.push(zeroYear.shift());
      }
    }
    var zeroLineData = google.visualization.arrayToDataTable(animLineData);
  	*/

    var lineOptions = {
      backgroundColor: 'transparent',
      colors: ['cornflowerblue', 'tomato'],
      fontName: 'Open Sans',
      focusTarget: 'category',
      chartArea: {
        left: 50,
        top: 10,
        width: '100%',
        height: '70%'
      },
      hAxis: {
        //showTextEvery: 12,
        textStyle: {
          fontSize: 11
        },
        baselineColor: 'transparent',
        gridlines: {
          color: 'transparent'
        }
      },
      vAxis: {
        minValue: 0,
        maxValue: 50000,
        baselineColor: '#DDD',
        gridlines: {
          color: '#DDD',
          count: 4
        },
        textStyle: {
          fontSize: 11
        }
      },
      legend: {
        position: 'bottom',
        textStyle: {
          fontSize: 12
        }
      },
      animation: {
        duration: 1200,
        easing: 'out',
  			startup: true
      }
    };

    var lineChart = new google.visualization.LineChart(document.getElementById('line-chart'));
    //lineChart.draw(zeroLineData, lineOptions);
    lineChart.draw(lineData, lineOptions);

  }
