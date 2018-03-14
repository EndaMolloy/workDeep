# workDeep

RESTful Node.js webapp using the express framework that reads from and writes to a MongoDB database. The webapp is designed to allow users to record and view the time they have spent on their projects. 

## Demo

A working demo is available: https://workdeep.herokuapp.com 

## Technologies

* Node.js
* MongoDB
* Express
* JQuery
* Bootstrap

## Screenshots

The user can signup/login via a number of different social network platforms or locally by providing email and password.

![screenshot from social login](https://user-images.githubusercontent.com/24863798/37415836-43e1f0e8-27a4-11e8-9316-c2a6a0e81443.png)

The logged in page of a user, displays the currently selected project and modifiable countdown timer, along with inspirational quote.

![screenshot from user logged in page](https://user-images.githubusercontent.com/24863798/37415392-3cdf96e8-27a3-11e8-9699-73ffd9154ab2.png)

The user dashboard displays the users statistics and a graphical view of time spent. Charts are created using the [Google charts API](https://developers.google.com/chart/interactive/docs/quick_start) and heatmap by [DKirwin](https://github.com/DKirwan/calendar-heatmap).

![screenshot from dashboard](https://user-images.githubusercontent.com/24863798/37416179-048b5a6e-27a5-11e8-9efe-0bf56b78a24d.png)


## Why

We live in a world of endless distraction with media, social networks, messaging apps all fighting for our time. Time, itself, is our most valuable resource and yet we waste so much of it rather than work on those personal projects which in the long term will fill us with pride.

workDeep was built so that you can track the time you spend on your projects. It has been built based on principles outlined in the book [The 4 disciplines of Execution](https://www.amazon.com/Disciplines-Execution-Achieving-Wildly-Important/dp/1451627068/ref=sr_1_1?ie=UTF8&qid=1521045844&sr=8-1&keywords=4+disciplines+of+execution+book) and further popularised by the book [Deep Work](https://www.amazon.com/Deep-Work-Focused-Success-Distracted/dp/1455586692/ref=sr_1_1?s=books&ie=UTF8&qid=1521045911&sr=1-1&keywords=deep+work). The idea is that there are lead indicators and there are lag indicators, and that people tend to focus on lag indicators when they should be focusing on the former.  

For example, you might set a target of developing 4 apps this year. This would be a lag indicator as you would only be able to determine how many apps you built at the end of the year when its too late to do anything about it. Lead indicators happen early in the process so that you can adjust your process. Instead of focusing on the end goal of building apps you can focus on spending a certain number of hours per week in deep concentration developing/building/making and the apps will follow. This allows you to see empirically if you are commiting to your goals. 

Finally it is proven that we play differently when we keep score, so why not use it to your advantage?  

## Todos

* Incorporate spotify/youtube API so user can listen to their chosen music as they work.
* Git style commit messages so you have a log of what you were working on at what point.
* Graph of cumulative hours logged.
* Maybe - option to link with friends, set target hours and viewable leaderboard.

