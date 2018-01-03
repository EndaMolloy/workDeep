$('#data').click(()=>{
  $(this).prop('disabled', true);
  $.get('http://localhost:5000/users/getData',(chartData)=> {
    console.log('success');
  })
})

// // $(document).ready(function () {
// let loaded;
// google.load("visualization", "1", {packages:["corechart"]});
//
//
// $(document).scroll(function(e){
//
//   if(loaded)
//     return false;
//
//     // grab the scroll amount and the window height
//     var scrollAmount = $(window).scrollTop();
//     var documentHeight = $(document).height();
//
//     // calculate the percentage the user has scrolled down the page
//     var scrollPercent = (scrollAmount / documentHeight) * 100;
//
//     // do something when a user gets 50% of the way down my page
//     if(scrollPercent > 50) {
//       loaded = true;
//         // run a function called doSomething
//       $.get('http://localhost:5000/users/getData',(chartData)=> {
//
//         $('#loader').hide();
//         $('#chartArea').show();
//         drawCharts(chartData);
//
//         document.getElementById('streak-num').textContent = chartData.dailyData.currentStreak;
//         document.getElementById('longStreak').textContent = chartData.dailyData.longestStreak;
//         document.getElementById('currWeek').textContent = chartData.weeklyData.thisWeekHrs;
//         document.getElementById('lastWeek').textContent = chartData.weeklyData.lastWeekHrs;
//         document.getElementById('avgHrs').textContent = chartData.weeklyData.avgWeekHrs;
//
//         //TODO document.getElementById('compProj').textContent = chartData.completedProjs
//         //console.log(chartData);
//       });
//     }
//
// });
//
//
//
//   function drawCharts(chartData) {
//
//     var heatmap = calendarHeatmap()
//                     .data(chartData.dailyData.heatmap)
//                     .selector('#cal-heatmap')
//                     .tooltipEnabled(true)
//                     .colorRange(['#f4f7f7', '#79a8a9'])
//                     .onClick(function (data) {
//                       console.log('data', data);
//                     });
//     heatmap();  // render the chart
//
//     // pie chart data
//     var pieData = google.visualization.arrayToDataTable(chartData.pieData);
//     // pie chart options
//     var pieOptions = {
//       backgroundColor: 'transparent',
//       pieHole: 0.4,
//       colors: [ "cornflowerblue",
//                 "olivedrab",
//                 "orange",
//                 "tomato",
//                 "crimson",
//                 "purple",
//                 "turquoise",
//                 "forestgreen",
//                 "navy",
//                 "gray"],
//       pieSliceText: 'value',
//       tooltip: {
//         text: 'percentage'
//       },
//       fontName: 'Open Sans',
//       chartArea: {
//         width: '100%',
//         height: '94%'
//       },
//       legend: {
//         textStyle: {
//           fontSize: 13
//         }
//       }
//     };
//     // draw pie chart
//     var pieChart = new google.visualization.PieChart(document.getElementById('google-pie'));
//     pieChart.draw(pieData, pieOptions);
//
//     // BEGIN BAR CHART
//     var barData = google.visualization.arrayToDataTable(chartData.weeklyData.barChartData);
//     // set bar chart optionsusers
//     var barOptions = {
//       focusTarget: 'category',
//       backgroundColor: 'transparent',
//       colors: ['cornflowerblue', 'tomato'],
//       fontName: 'Open Sans',
//       chartArea: {
//         left: 50,
//         top: 10,
//         width: '100%',
//         height: '70%'
//       },
//       bar: {
//         groupWidth: '80%'
//       },
//       hAxis: {
//         textStyle: {
//           fontSize: 11
//         }
//       },
//       vAxis: {
//         viewWindowMode:'explicit',
//         viewWindow: {
//             min: 0
//         },
//         baselineColor: '#DDD',
//         gridlines: {
//           color: '#DDD',
//           count: 4
//         },
//         textStyle: {
//           fontSize: 11
//         }
//       },
//       legend: {
//         position: 'bottom',
//         textStyle: {
//           fontSize: 12
//         }
//       },
//       animation: {
//         duration: 1200,
//         easing: 'out',
//         startup: true
//       }
//     };
//     // draw bar chart twice so it animates
//     var barChart = new google.visualization.ColumnChart(document.getElementById('bar-chart'));
//     //barChart.draw(barZeroData, barOptions);
//     barChart.draw(barData, barOptions);
//
//
//
//
//     // BEGIN LINE GRAPH
//
//     // var data = google.visualization.arrayToDataTable([
//     //    ['ID', 'Life Expectancy', 'Fertility Rate', 'Project', 'Population'],
//     //    ['',    80.66,              1.67,            'a',33739900],
//     //    ['',    79.84,              1.36,            'b',81902307],
//     //    ['',    78.6,               1.84,            'c',5523095],
//     //    ['',    72.73,              2.78,            'd',79716203],
//     //    ['',    80.05,              2,               'e',61801570],
//     //    ['',    72.49,              1.7,             'f',73137148],
//     //    ['',    68.09,              4.77,            'g',31090763],
//     //    ['',    81.55,              2.96,            'h',7485600],
//     //    ['',    68.6,               1.54,            'i',141850000],
//     //    ['',    78.09,              2.05,            'k',307007000]
//     //  ]);
//     //
//     //  var options = {
//     //    hAxis: {title: 'Life Expectancy'},
//     //    vAxis: {title: 'Fertility Rate'}
//     //  };
//     //
//     //  var chart = new google.visualization.BubbleChart(document.getElementById('line-chart'));
//     //
//     //  chart.draw(data, options);
//     google.charts.load('current', {'packages':['table']});
//       google.charts.setOnLoadCallback(drawTable);
//
//
//     function drawTable() {
//         var data = new google.visualization.DataTable();
//         data.addColumn('string', 'Project');
//         data.addColumn('number', 'Hours');
//         data.addColumn('date', 'Start Date');
//         data.addColumn('date', 'Finish Date');
//         data.addRows([
//           ['Mike',  {v: 10000, f: '$10,000'}, new Date(2017, 1, 30), new Date(2017, 2, 22) ],
//           ['Jim',   {v:8000,   f: '$8,000'},  new Date(2017, 2, 4),  new Date(2017, 5, 3) ],
//           ['Alice', {v: 12500, f: '$12,500'}, new Date(2017, 5, 4),  new Date(2017, 9, 7) ],
//           ['Bob',   {v: 7000,  f: '$7,000'},  new Date(2017, 7, 30), new Date(2017, 11, 22)],
//           ['Mary',  {v: 10000, f: '$10,000'}, new Date(2017, 1, 30), new Date(2017, 2, 22)  ],
//           ['John',   {v:8000,   f: '$8,000'},  new Date(2017, 2, 4),  new Date(2017, 5, 3) ],
//           ['Mary',  {v: 10000, f: '$10,000'}, new Date(2017, 1, 30), new Date(2017, 2, 22)  ],
//           ['John',   {v:8000,   f: '$8,000'},  new Date(2017, 2, 4),  new Date(2017, 5, 3) ],
//           ['Mary',  {v: 10000, f: '$10,000'}, new Date(2017, 1, 30), new Date(2017, 2, 22)  ],
//           ['John',   {v:8000,   f: '$8,000'},  new Date(2017, 2, 4),  new Date(2017, 5, 3) ],
//           ['Mary',  {v: 10000, f: '$10,000'}, new Date(2017, 1, 30), new Date(2017, 2, 22)  ],
//           ['John',   {v:8000,   f: '$8,000'},  new Date(2017, 2, 4),  new Date(2017, 5, 3) ],
//           ['Allie', {v: 12500, f: '$12,500'}, new Date(2017, 5, 4),  new Date(2017, 9, 7) ],
//           ['Smith',   {v: 7000,  f: '$7,000'},  new Date(2017, 7, 30), new Date(2017, 11, 22)]
//         ]);
//
//         var table = new google.visualization.Table(document.getElementById('proj-table'));
//
//         var options = {
//           showRowNumber: false,
//           width: '100%',
//           height: '100%'
//         }
//
//         table.draw(data, options);
//       }
//
//   }
