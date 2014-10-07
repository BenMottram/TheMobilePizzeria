#TheMobilePizzeria
=================
The Mobile Pizzeria Mobile app is an app designed for the the Mobile Pizzeria, a small but highly sucessful well loved street food vendor that operates in the south east of the UK.


###Overview
==========
This is was created using the fantastic Ionic framework, an Angular JS implimentation of the Cordova cross platform mobile app framework.  The app's functionality is sepeated into a induivial pages and accociated controllers as per the Ionic Angular-router setup.  There is an addtional *services.js* file that contains the main functionality of the app.

The Mobile Pizzeria app makes extensive use of the [ng-Cordova libary](http://ngcordova.com/), the [cordova.file.plugin](https://github.com/apache/cordova-plugin-file), the [cordova.file-transfer.plugin](https://github.com/apache/cordova-plugin-file-transfer) and the [cordova.SQLlite.plugin](https://github.com/brodysoft/Cordova-SQLitePlugin).  All of which are implimented to dowload, store and display current menu and location data for the Mobile Pizzeria.

###On Platform Ready
====================
Upon the initalisation of the app Ionic calls the 'IonicformReady' event which sets the intial state of the app.  It is during the run block that the app conducts its most complicated actions.  Here it uses the file and SQLlite plugins with ng-Cordova to open a database to collect and store data so the various controllers can access this data to display within the app.

####Order of Setup
-----------------
1.  Opens the Database and initalises the filesytem.
2.  Checks the date from the database and compares it to now (on the first load the date is always in the past) if the date is in the past the app will begin the download procedure.  The app is designed to download content for update checking once every seven days.
3.  It will then download a content file which provides the current version of each content file.  If the version number of any of these files is higher than that stored within the database it will mark that file to be synced.
4.  The new content is downloaded and the database will delete previous entries accociated to that file and repopulate the specific table.

###Gallery and Contacts Pages
=============================
Unlike the find us, catering, and street food pages, the gallery and contacts pages do not use the database to serve it information.  This may well change in later refactoring of the code.  It was assumed that since the contact information is unlikely to change this data will rarely need updating.  While the gallery page will remain a set of static images due to the heavy download requirement for the user, as well as the diffculty of implimenting the file and file-transfer plugins.  Again this may change when the code is refactored.

These pages use $Http to serve local JSON into Angular JS directives, a realtively simple affair.  The gallery also uses '$IonicPopup' to display the images in greater detail. 

###Catering and Street Food Pages
=================================
These pages use the ng-Cordova libary and SQLlite plugin to serve data from the database into Angular JS directives.

###Find Us Page
===============
Almost exculsively uses the Angular-Google-Maps libary to display a map where users can choose the day of the week and the app will show the location and time where the Mobile Pizzeria is serving.  Like the catering and street food pages it uses ng-cordova and the SQLlite plugin to return and display the data.

###Technical Challanges and Refactoring
========================================
During the creation of this app the implimentation of the file and file-transfer plugin was particually diffcult and convoluted.  This may simply be due to my own inexperience but I feel that the documentation was muddled at best.  In addition when trying to use the ng-Cordova wrapper in conjunction with it a number of esoteric errors emerged.  This is prehaps something specific to the file wrapper for ng-Cordova (again it could just be me) but I had very few problems implimenting other aspects of that libary.

####Future updates and refactoring:
1. Code beautification and remove general redundancies.
2. There is a strange bug on the find us page, upon where updating the markers occasionally leaves artifacts of old markers on the map.  This should be the first port of call.
3. Streamline the inital setup.  It is still a bit muddled and the code is often a bit hacky.  Most of this can be resolved within *services.js*.
4. Making the data so it will update on the same day every week as opposed to once every seven days from the inital point.
5. Make an additional page so that the owner of the busniess can display any current deals or last minuite announcments (prehaps a twitter plugin).


Thank you for reading this and and if you have any further questions or suggestions, I would love to hear them.

Ben
