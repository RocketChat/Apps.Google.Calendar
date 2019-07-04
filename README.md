# Google Calendar Integration for Rocket.Chat

Integrates google calendar with your Rocket.Chat server.

#### Features :
* Authenticate to your gmail account from inside your Rocket.Chat.
* Create your private events in your google calendar fom your Rocket.Chat using just a slashcommand.
* View and update your private events using just a slashcommand.
* Get reminders and notifications of events.
* Create public events inside a room inviting all the users inside the room.

## How to use it? 
* Download or clone the repository to your local system.
* Get your local Rocket.Chat server running.
* Navigate inside the folder using terminal.
* Run command `rc-apps deploy --url http://localhost:3000 --username {your_username} --password {your_password}`
* This gets the app installed in your local server, now navigate to app screen inside Options -> Administration -> Apps -> Google Calendar
* Activate the app and put in the credentials and start using it inside any of your room! 

## Quick Start Guide

#### Useful Slashcommands
* `/calendar auth` : To authenticate to your gmail account. 

* `/calendar view` : Once the authentication is successful, you can use this command to view the private events on your calendar. Events will be displayed with title, date, start time and end time. You will also get the link, which you can click on and it will take directly to your calendar where you can udpate or delete that event.

* `/calendar create "Title" "Date" "Start time" "Endtime"` : This command can be used to create a private on your primary calendar, where Title is the title of the event you are creating, and date should be in format YYYY-MM-DD and time in 24 hours format.

* `/calendar logout` : Once you are done with viewing, creating your calendar events and wants to log out of the gmail account, use this command and it will log you out and redirect to your home page.

* `/calendar view` : Once the authentication is successful, you can use this command to view the private events on your calendar. Events will be displayed with title, date, start time and end time. You will also get the link, which you can click on and it will take directly to your calendar where you can udpate or delete that event.

* `/calendar create "Title" "Date" "Start time" "Endtime"` : This command can be used to create a private on your primary calendar, where Title is the title of the event you are creating, and date should be in format YYYY-MM-DD and time in 24 hours format.

* `/calendar logout` : Once you are done with viewing, creating your calendar events and wants to log out of the gmail account, use this command and it will log you out and redirect to your home page.

* `/calendar quickadd {title of the event}` - This slashcommand can be used to create an event starting from time the slashcommand is called to one hour in duration.


### Feedback and Suggestions
Contribute to this repository by opening an issue if you have any feedback or suggestions for improvements or even some feature request!


