# Google Calendar Integration for Rocket.Chat

[![License](http://img.shields.io/badge/license-MIT-green.svg?style=flat)](https://github.com/RocketChat/Apps.Google.Calendar/blob/master/LICENSE)
[![Contact :Rocket.Chat](https://img.shields.io/badge/contact-Rocket.Chat-blue.svg?style=flat)](https://rocket.chat/)
[![GitHub stars](https://img.shields.io/github/stars/RocketChat/Apps.Google.Calendar.svg)](https://github.com/RocketChat/Apps.Google.Calendar/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/RocketChat/Apps.Google.Calendar.svg)](https://github.com/RocketChat/Apps.Google.Calendar/network/members)
[![GitHub issues](https://img.shields.io/github/issues/RocketChat/Apps.Google.Calendar.svg)](https://github.com/RocketChat/Apps.Google.Calendar/issues)

---
<p align="center">
    <a href="#features">Features</a> &bull;
    <a href="#how-to-use-it">Install</a> &bull;
    <a href="#quick-start-guide">Quick Start</a> &bull;
    <a href="#demo-for-commands">Demo</a>
</p>

---

Integrates google calendar with your Rocket.Chat server.

* **This project has been developed as part of the [Google Summer of Code 2019](https://summerofcode.withgoogle.com/) program**.

## Features 
* Authenticate to your gmail account from inside your Rocket.Chat.
* Create your private events in your google calendar fom your Rocket.Chat using just a slashcommand.
* View and update your private events using just a slashcommand.
* Create a quick event using *quickadd* slashcommand.
* View all the calendars present on your profile and can even select any one of those calendars to work with.
* Get reminders and notifications of events.
* Create public events inside a room inviting all the users inside the room.

## How to use it
* Download or clone the repository to your local system.
* Get your local Rocket.Chat server running.
* Navigate inside the folder using terminal.
* Run command `rc-apps deploy --url http://localhost:3000 --username {your_username} --password {your_password}`
* This gets the app installed in your local server, now navigate to app screen inside Options -> Administration -> Apps -> Google Calendar
* Activate the app and put in the Google API credentials and start using it inside any of your room, using these simple commands! 

## Quick Start Guide

## Getting Google API Credentials

* To use this app, you need to get API credentials such as Client ID, Secret Key and API key and put these inside your Google Calendar App settings in local rocket.chat server.
* To get these credentials, login to your account at [Google API Console](https://console.developers.google.com).
* Once you login, it will prompt you to select your country and accept terms and conditions if you are logging in for the first time.
* Next, Create a new project and go to **Credentials**. In **Credentials** page select your newly created project.
* Click on the button **Create Credentials**, you will get a warning reqiuring you to complete **OAuth Consent Screen**, complete that filling in a name.
* Once OAuth consent screen is completed, on credentials screen, Select **Web Application** in **Application Type**.
* In the field **Authorised redirect URIs**, fill in the site URL. You get site URL by going to your local rocket.chat server, go to **Options** -> **Settings** -> **General**. See the URL under the name of **Site URL**.
* Add another redirect URI from app settings. Go to **Administration** -> **Apps** -> **Google Calendar**. Copy the URL inside **Get Webhook** which is of the form of *curl -X GET http://localhost:3000/api/apps/.../webhook*. Remove **curl -X GET** from the URL and paste it in **redirect URI**.
* After completing this much, you are going to have **Client ID** and **Client Secret**. Please note these down somewhere safe and do not share it with public.
* Now that we have Client ID and Client Secret, only thing we need is API Key. 
* On the Credentials screen, click on the **Create Credentials** and select **API Key**. This will create the API key.
* This is all folks! Put these credentials in your Google Calendar API settings and start using the app!

This is an example image of the **Get Webhook** URL inside App Settings : 
![Get Webhook setting](https://github.com/RocketChat/Apps.Google.Calendar/blob/Fix_1/Images/Pic2.png "App Settings for Webhook URL")

These are the app settings where Google API Credentials should be entered : 
![Google API settings](https://github.com/RocketChat/Apps.Google.Calendar/blob/Fix_1/Images/Pic1.png)

## Useful Slashcommands
* `/calendar auth` : To authenticate to your gmail account. 

* `/calendar logout` : Once you are done with viewing, creating your calendar events and wants to log out of the gmail account, use this command and it will log you out and redirect to your home page.

* `/calendar view` : Once the authentication is successful, you can use this command to view the private events on your calendar. Events will be displayed with title, date, start time and end time. You will also get the link, which you can click on and it will take directly to your calendar where you can udpate or delete that event.

* `/calendar create "Title" "Date" "Start time" "Endtime"` : This command can be used to create a private on your primary calendar, where Title is the title of the event you are creating, and date should be in format YYYY-MM-DD and time in 24 hours format.

* `/calendar quickadd {title of the event}` - This slashcommand can be used to create an event starting from time the slashcommand is called to one hour in duration.

* `/calendar list` - Shows you the list of the calendars that are present on your user profile. For each calendar there is a button, which you can click and decide which calendar to communicate with and that calendar will be used for fetching and editing events (though this is optional, Google Calendar app uses your primary calendar by default.)

* `/calendar invite "Title" "Date" "Starttime" "Endtime" ` - This slashcommand will create public events which will include inviting all the users present inside the room (in which command is called) to this event. All the users will receive the event invite through e-mails. They can respond to that invite and the organizer will receive their response notifications via e-mails.

## Demo for Commands

Click on the image to see the demo for above mentioned commands. Link will take you to youtube demo video.

[![Demo for Calendar App](https://img.youtube.com/vi/s7_UIrW29AI/0.jpg)](https://www.youtube.com/watch?v=s7_UIrW29AI) 

## Handling Errors

Anytime the app is not behaving as expected or commands not working, try these 2 things - 

* First, check the format of the command and make sure the format is correct (for eg. create command).
* Try logging in again, by first logging out using `/calendar logout` command and again authenticating.

**If after trying these 2 methods, commands still dont work, raise an issue in the repository, explaining the current behaviour, things you have tried.**

## Want to improve the Google Calendar app?

Many of the importatnt features provided by Google Calendar API are implemented in this app, but still improvements are always possible. To contribute, you can do any of these things - 

* Solve issues in the repository.
* Soon Rocket.Chat app engine is going to be powerful enough to facilitate UI changes. Once that happens, the same functionalities can be made easier for users using UI buttons.
* If you have a feature in mind and can't find anything about it, raise an issue and let's discuss it!

## Feedback and Suggestions
Contribute to this repository by opening an issue if you have any feedback or suggestions for improvements or even some feature request!


