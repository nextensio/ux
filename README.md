# UI Code flow

The UI code is written using the ReactJS infrastructure using the open source 'coreio' admin template. 
coreio is a very simple template and adheres to the fundamental reactjs principles/coding model, so it
doesnt come in the way of anything. The code flow is like any reactjs application, just listing out the
fundamentals below for those who are not familiar to reactjs

The basic principle is that this entire javascript is downloaded as one big javascript to the person who
browses to the site, and then the javascript makes REST calls to the Nextensio controller and uses the
results of the call to render the webpages. So unlike a traditional web app where the server renders the
html and sends it down to the browser which just displays it, in this case the server sends all the 
html/javascript in one shot and then the client browswer keeps rendering pages based on the data that is
obtained from various rest calls.

## src/index.js and src/App.js

The reactjs world starts with index.js which defines an App class that defines the entire javascript that
corresponds to this site/application

Inside App.js, we break it further down into two broad 'containers' - a home page container which basically
shows summary of ALL the nextensio tenants and gateways and stuff, and a tenant page container which shows
all information pertaining to one single tenant

## src/containers

Like explained in the previous section, the container defines the overall structure/layout of a particular
part of the application - home page and tenant page being two sample parts of the larger app.

The layout is defined using a sidebar, header, footer, and the actual content itself. And here, we use 
coreui templates to define all these elements, and whatever content gets displayed, coreui ensures that
the sidebar,header,footer always remains constant.

The contents of the sidebar are defined in nav.js - which also gives a link "to" that says where to go to
if someone clicks on that sidebar element. 

Within a container, the "content" page of course can have different contents based on what link a user 
clicks. And all these links related to this container and what gets displayed when they are clicked etc..
are defined inside routes.js

## src/views

The views define various "contents" that go inside each container. The src/views/home/ define what contents
are in the home page/home container and src/views/tenant define what contents are in the per-tenant page.
The view objects are referred to by the route.js file inside each container/ directory.

Beyond the above layout, everything else in the code base is standard reactjs, google for "thinking in react"
to get a good starting point on react principles. In reactjs thinkgs can be written as class objects with
methods or just function objects, coreui examples all use the function objects and hence thats what we have
used too. So certain stuff like "states" are handled differently in a class object Vs function object, so 
when you google for react questions, look at the function object way of doing things. In general people seem
to prefer function objects over class objects, so we are on the right track








