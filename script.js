//Declare Global variables and retrieve array of saved cities from local storage.  Loads weather info from last city searched.  If no searches have been made, then we ask the user for permission to use their location to load their local weather 
var city;
var queryUrl;
var cityArray = JSON.parse(localStorage.getItem("cityArray") || "[]");
if (cityArray[0]) {
  city = cityArray[cityArray.length - 1];
  UpdateAndGenerateCities();

  queryUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&APPID=bfc1b977d5f0ad912b3dc6c21e34e887";
  apiCall(queryUrl);
}
else {
  navigator.geolocation.getCurrentPosition(success, error);
  function success(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    queryUrl = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&units=imperial&APPID=bfc1b977d5f0ad912b3dc6c21e34e887";
    apiCall(queryUrl);
  }
  function error() {
    console.log("not given location access by user");
  }
}


//generates and updates list of previously searched cities. Stores updates in Local Stotage
function UpdateAndGenerateCities() {
  $("#cityResults").empty();
  if (cityArray) {
    for (var i = 0; i < cityArray.length; i++) {
      if (city === cityArray[i]) {
        cityArray.splice(i, 1);
      }
    }
  }
  cityArray.push(city);
  localStorage.setItem("cityArray", JSON.stringify(cityArray));

  if (cityArray) {
    for (var i = 0; i < cityArray.length; i++) {
      newDiv = $("<div>").addClass("cityDiv");
      $("#cityResults").prepend(newDiv);
      var newCity = $("<a>").text(cityArray[i]).addClass("newCity px-2");
      newDiv.prepend(newCity);
    }
  }
  if (cityArray.length > 3) {
    $("#clearBtn").removeClass("hide");
  }
}

//Click event that takes users city search and passes relevant info to the ApiCall function
$("#searchBtn").on("click", function (event) {
  event.preventDefault();
  city = $("#citySearch").val();
  $("#citySearch").val("");
  queryUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&APPID=bfc1b977d5f0ad912b3dc6c21e34e887";
  apiCall(queryUrl);
});


//sends an api get request and if successful it uses jquery to add current weather information to the page.  If it fails, then it sends an error message to the user
function apiCall(queryUrl) {

  $.ajax({
    url: queryUrl,
    method: "GET",
    success: function (response) {
      $("#alert1").addClass("hide");
      console.log(response);

      city = response.name;
      $(".currentWeatherBox").css({ "background-image": "none", "height": "auto" });
      $(".five-day").css("display", "block");

      newDiv = $("<div>").addClass("cityDiv");
      $("#cityResults").prepend(newDiv);
      var newCity = $("<a>").text(city).addClass("newCity px-2");
      newDiv.prepend(newCity);

      $("#city").text(response.name);
      $("#date").text("  ( " + moment().format('l') + ") ");
      $("#weatherImg").attr("src", "http://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png");
      $("#description").text("'" + response.weather[0].description + "'");

      var temp = response.main.temp.toFixed(1);
      $('#temperature').html("Temperature: " + temp + " &#8457;");
      $('#humidity').text("Humidity: " + response.main.humidity + "%");
      $('#windSpeed').text("Wind Speed: " + response.wind.speed + " MPH");

      lon = response.coord.lon;
      lat = response.coord.lat;

      UpdateAndGenerateCities();
      uvIndex();
      forecast();
    },
    error: function () {
      console.log("error");
      $("#alert1").removeClass("hide");
    }
  });
}


//seperate Api request to get UV index information.  Displays this value on the page and adds a background-color to demonstrate how dangerous this UV index is
function uvIndex() {
  var queryUrl = "https://api.openweathermap.org/data/2.5/uvi?lat=" + lat + "&lon=" + lon + "&units=imperial&APPID=bfc1b977d5f0ad912b3dc6c21e34e887";

  $.ajax({
    url: queryUrl,
    method: "GET"
  }).then(function (response) {
    console.log(response);
    var uv = response.value;
    uvText = "white";

    switch (true) {
      case (uv < 3):
        uvColor = "green";
        break;
      case (uv < 6):
        uvColor = "yellow";
        uvText = "blue";
        break;
      case (uv < 8):
        uvColor = "orange";
        break;
      case (uv < 11):
        uvColor = "red";
        break;
      case (uv >= 11):
        uvColor = "purple";
        break;
    }

    $('#uv').html("UV Index: <span>" + uv + "</span>");
    $('#uv span').css({ "background-color": uvColor, "color": uvText, "border-radius": "5px" }).addClass("px-2");
  });

}


//Seperate API request to get 5 day weather info
function forecast() {
  var queryUrl = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial&APPID=bfc1b977d5f0ad912b3dc6c21e34e887";

  $.ajax({
    url: queryUrl,
    method: "GET"
  }).then(function (response) {
    console.log(response);

    $("#fiveLabel").text("5 Day Forecast:");

    for (var i = 1; i < 6; i++) {
      //Gets closest weather info to current time of day for future forecast
      var j = (i * 8) - 2;
      var newDate = $("<p>").text(moment().add(i, "days").format('l'));
      var newImg = $("<img>").attr("src", "http://openweathermap.org/img/wn/" + response.list[j].weather[0].icon + "@2x.png");
      var temp = $("<p>").text("Temp: " + response.list[j].main.temp.toFixed(1) + " " + String.fromCharCode(176) + "F");
      var humidity = $("<p>").text("humidity: " + response.list[j].main.humidity + "%");

      $("#day" + i).empty();
      $("#day" + i).append(newDate, newImg, temp, humidity);
    }
  });
}


//Like a click event that works on mobile for non-button.  User can select previously searched city and make an API call to get that weather
$(document).on("mousedown touchstart", ".cityDiv", function (event) {
  city = $(this).text();
  $(this).remove();
  queryUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&APPID=bfc1b977d5f0ad912b3dc6c21e34e887";
  apiCall(queryUrl);
});


//Clears previously searched cities list and hides clear button
$("#clearBtn").on("click", function () {
  localStorage.clear();
  $("#cityResults").empty();
  $("#clearBtn").addClass("hide");
  cityArray = [];
});


//hides user error alert when they click the 'x'
function alertHide() {
  $("#alert1").addClass("hide");
}
