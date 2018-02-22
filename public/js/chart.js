
let loaded;
const userUrl = window.location.pathname;
google.load = google.load || google.charts.load;
google.load("visualization", "1", {packages:["corechart"]});


$("#button-updateCharts").on('click',()=>{
  $('#chartArea').hide();
  $('#loader').show();
  document.getElementById('loader-msg').textContent = "Updating your data...";
  getChartData();
  document.getElementById('button-updateCharts').style.visibility = 'hidden';
})



$(document).scroll(function(e){

  if(loaded)
    return false;

    // grab the scroll amount and the window height
    var scrollAmount = $(window).scrollTop();
    var documentHeight = $(document).height();

    // calculate the percentage the user has scrolled down the page
    var scrollPercent = (scrollAmount / documentHeight) * 100;

    // do something when a user gets 50% of the way down my page
    if(scrollPercent > 50) {
      loaded = true;
      getChartData();
    }

});

function getChartData(){
  $.get('http://localhost:5000'+userUrl+'/logtime',(chartData)=> {

    if(typeof chartData === 'string'){
      $('#spinner').hide();
      document.getElementById('loader-msg').textContent = chartData;

    }
    else{
      $('#loader').hide();
      $('#chartArea').show();
      //console.log(chartData);
      drawCharts(chartData);


      document.getElementById('streak-num').textContent = chartData.dailyData.currentStreak;
      document.getElementById('longStreak').textContent = chartData.dailyData.longestStreak;
      document.getElementById('totHrs').textContent = chartData.dailyData.totalHours;
      document.getElementById('currWeek').textContent = chartData.weeklyData.thisWeekHrs;
      document.getElementById('lastWeek').textContent = chartData.weeklyData.lastWeekHrs;
      document.getElementById('avgHrs').textContent = chartData.weeklyData.avgWeekHrs;
    }

  });
}


function drawCharts(chartData) {

  var heatmap = calendarHeatmap()
                  .data(chartData.dailyData.heatmap)
                  .selector('#cal-heatmap')
                  .tooltipEnabled(true)
                  .colorRange(['#D8E6E7', '#218380'])
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

  google.charts.load('current', {'packages':['table']});
  google.charts.setOnLoadCallback(drawTable);


  function drawTable(){
      var data = google.visualization.arrayToDataTable(chartData.tableData)

      var table = new google.visualization.Table(document.getElementById('proj-table'));

      var options = {
        showRowNumber: true,
        width: '100%',
        height: '100%'
      }

      table.draw(data, options);
    }

  }
