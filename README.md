JOIN US FOR THIS PROJECT !!!
===

This project is not yet stable version. But this is very interesting, potential and soft program 
as open source. We welcome you who get tired of control heavy open source. Also we want to someone 
to interest in android system, handling JSON data, writing NodeJS and javascript. 
Someone to work in test process is available to join us, too.

Thanks.




WHAT IS ACTS
---

ACTS is program for android stability test, written in Node JS, very easy install and use.
This GUI is based on browser interface and uses android SDK monkey tool.
It is best use of the monkey tool. 

During this...
Usage is 3 step, very simple.

	1. Connecting devices.

	2. Starting tests.

	3. Viewing logs.(android logcat, monkey, system information - cpu / memory / network)

Note: See also INSTALL file( install & manual documents ). 

This following is motivation for us.

	* Node.js
		(http://nodejs.org/)
		Node.js is a platform built on Chrome's JavaScript runtime for easily building fast, 
		scalable network applications. Node.js uses an event-driven, non-blocking I/O model 
		that makes it lightweight and efficient, perfect for data-intensive real-time 
		applications that run across distributed devices.

	* Android Monkey tool
		(http://developer.android.com/guide/developing/tools/monkey.html)
		The Monkey is a program that runs on your emulator or device and generates pseudo-random 
		streams of user events such as clicks, touches, or gestures, as well as a number of 
		system-level events. You can use the Monkey to stress-test applications that you are 
		developing, in a random yet repeatable manner.




### Source Roadmap

main.node.js					:main

index.html						:main view


/resource/						:view's images , libraries and stylesheets


/src/admin_manager.node.js		:initialization

/src/fu.node.js					:NodeJS server

/src/adb/						:connect external process by command line

/src/data/						:test storage managing

/src/handlers/					:handling client requests

/src/scheduler/ 				:loop process

/src/stuff/						:objects

/src/utils/						:utilities


/views/							:each view's source files(html, javascript for client).




### Coding Convention

1. Base rule is [google style guide](http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml) for javascript
  

2. File or directory name must be lowercase alphabet or '-':
	ex)  i_love_you.txt( OK ), its_cool_directory( OK )
	     I_love_you.txt( NO ), Its_Cool_Directory( NO )
	
3. Source file extension rule is as flows:
	(Because distinguish between server and client.)
	- Case by server side code( include nodeJS code ), the extension is 'xxx.node.js'.
	- Case by client side code( view code ), the extension is 'xxx.js'.
	
4. Indent is Tab to set same 4 space.




Source Code Repository
---
  - [Repositories](https://github.com/oshacker/acts) are located at github. You can get them with any git client.



	
Bugs & Issues
---
  - Please report any bugs and issues to this: [Issues page](https://github.com/oshacker/acts/issues). We welcome any comments.




Documents
---
  - Documents is located at [Wiki page](https://github.com/oshacker/acts/wiki)










