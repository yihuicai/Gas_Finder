# Local Gas Station Map

**New Feature (2017.10.27)**: "Save Place" implemented! You can add new places of your own now. Besides, It utilizes **real-time database** so that you can also see what other people have added to the map!

**New Feature (2017.07.29)**: Scroll bar added to prevent overflow. Modified the navigation bar. Add place filter to default display.

#### Summary:

- This is a simple front end web application that uses Google Maps API and Yelp Fusion API to retreive gas stations around a certain neighborhood. It has some default locations set by me. You can add your own locations and search automatically the gas stations around.  :blush:
- The `main.js` uses `JQuery` and `Knockout.JS` to call functions, bind data and run AJAX requests.
- See demo [here](https://d3dek89duzor21.cloudfront.net/).

![Demo](https://s3-us-west-1.amazonaws.com/portfolioalan/demo2.PNG)

------

#### For Developers:

- Clone and pull this repository to your own computer.
- Just simply open the index.html. Be sure to have access to internet.
- Click the mark on the map to see 3 nearest gas stations found by Yelp. They are marked by green color and the detailed information is shown below the map.
- Note that sometimes not all the gas stations are shown in the map just because Yelp doesn't have Latitude and Longitude info for all the entries.
- You can add places and let them be shown in the map.

#### To be completed: :fearful:

- [ ] **About Author:** To render an interactive block to tell users about the author.
- [x] ~~**Save Places:** To save added places to firebase so that even after closing the browser, the newly added places can be restored.~~