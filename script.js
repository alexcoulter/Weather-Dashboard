//Add error message if cannot find city
//add clickable 'x' to cities to remove
//mobile compatible
//implement geolocation
//find weather picture for first time load
//round 5day div borders-


var cityArray = [];
var newDiv;
var city;
var queryUrl;
var lon;
var lat;
var count = 1;
cityArray = JSON.parse(localStorage.getItem("cityArray") || "[]");
if (cityArray[0]) {
  savedSearches();
  city = cityArray[cityArray.length - 1];
  apiCall();
}

function savedSearches() {
  $("#cityResults").empty();

  if (cityArray) {
    for (var i = 0; i < cityArray.length; i++) {
      newDiv = $("<div>").addClass("cityDiv");
      $("#cityResults").prepend(newDiv);
      var newCity = $("<h4>").text(cityArray[i]).addClass("newCity px-2");
      newDiv.prepend(newCity);
    }
  }
}
// navigator.geolocation.getCurrentPosition(success, error);
// function success(position) {
//   const lat  = position.coords.latitude;
//   const lon = position.coords.longitude;
//   console.log(lat);
// }
// function error() {
// }

function pageLoad() {

}


$("#searchBtn").on("click", function (event) {
  event.preventDefault();

  //city = $("#citySearch").val();
  city = $("#citySearch").val();
  $("#citySearch").val("");
  apiCall();
});


function apiCall() {
  var queryUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&APPID=bfc1b977d5f0ad912b3dc6c21e34e887";
  //var queryUrl = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial&APPID=bfc1b977d5f0ad912b3dc6c21e34e887";
  //var queryUrl = "https://api.openweathermap.org/data/2.5/uvi?lat=37.75&lon=-122.37&units=imperial&APPID=bfc1b977d5f0ad912b3dc6c21e34e887";

  $.ajax({
    url: queryUrl,
    method: "GET"
  }).then(function (response) {
    console.log(response);


    city = response.name;
    console.log(cityArray);

    newDiv = $("<div>").addClass("cityDiv");
    $("#cityResults").prepend(newDiv);
    var newCity = $("<h4>").text(city).addClass("newCity px-2");
    newDiv.prepend(newCity);



    $("#cityAndDate").text(response.name + " " + moment().format('l'));
    $("#weatherImg").attr("src", "http://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png");
    var temp = response.main.temp.toFixed(1);

    $('#temperature').html("Temperature: " + temp + " &#8457;");
    $('#humidity').text("Humidity: " + response.main.humidity + "%");
    $('#windSpeed').text("Wind Speed: " + response.wind.speed + " MPH");

    lon = response.coord.lon;
    lat = response.coord.lat;

    if (cityArray) {
      for (var i = 0; i < cityArray.length; i++) {
        if (city === cityArray[i]) {
          cityArray.splice(i, 1);
        }
      }
    }
    cityArray.push(city);
    localStorage.setItem("cityArray", JSON.stringify(cityArray));

    savedSearches();
    uvIndex();
    forecast();
  });
}


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

function forecast() {
  var queryUrl = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial&APPID=bfc1b977d5f0ad912b3dc6c21e34e887";

  $.ajax({
    url: queryUrl,
    method: "GET"
  }).then(function (response) {
    console.log(response);


    for (var i = 1; i < 6; i++) {
      var j = (i * 8) - 1;
      var newDate = $("<p>").text(moment().add(i, "days").format('l'));
      var newImg = $("<img>").attr("src", "http://openweathermap.org/img/wn/" + response.list[j].weather[0].icon + "@2x.png");
      var temp = $("<p>").text("Temp: " + response.list[j].main.temp.toFixed(1) + " " + String.fromCharCode(176) + "F");
      var humidity =  $("<p>").text("humidity: " + response.list[j].main.humidity + "%");

      $("#day" + i).empty();
      $("#day" + i).append(newDate,newImg,temp,humidity);
    }
  });
}

$(document).on("click", ".cityDiv", function (event) {
  console.log("hey");
  city = $(this).text();
  $(this).remove();
  apiCall();
});




