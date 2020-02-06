
var newDiv;
var city;
var queryUrl;
var lon;
var lat;
var count = 1;
console.log(cityArray);
var cityArray = JSON.parse(localStorage.getItem("cityArray") || "[]");
console.log(cityArray);
if (cityArray[0]) {
  city = cityArray[cityArray.length - 1];
  console.log(city);
  savedSearches();
  
  queryUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&APPID=bfc1b977d5f0ad912b3dc6c21e34e887";
  apiCall(queryUrl);
}
else{

navigator.geolocation.getCurrentPosition(success, error);
function success(position) {
  const lat  = position.coords.latitude;
  const lon = position.coords.longitude;
  console.log(lat);
  queryUrl = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon +"&units=imperial&APPID=bfc1b977d5f0ad912b3dc6c21e34e887";

  apiCall(queryUrl);
}
function error() {
 
}
}



//Add error message if cannot find city
//add clickable 'x' to cities to remove
//{x}find weather picture for first time load (pixabay.com)


function savedSearches() {
  console.log(cityArray + "ayayayya");
  if (cityArray) {
    for (var i = 0; i < cityArray.length; i++) {
      if (city === cityArray[i]) {
        cityArray.splice(i, 1);
      }
    }
  }
  cityArray.push(city);
  localStorage.setItem("cityArray", JSON.stringify(cityArray));

  $("#cityResults").empty();

  if (cityArray) {
    for (var i = 0; i < cityArray.length; i++) {
      newDiv = $("<div>").addClass("cityDiv");
      $("#cityResults").prepend(newDiv);
      var newCity = $("<a>").text(cityArray[i]).addClass("newCity px-2");
      newDiv.prepend(newCity);
    }
  }
}



$("#searchBtn").on("click", function (event) {
  event.preventDefault();

  
  city = $("#citySearch").val();
  $("#citySearch").val("");
  queryUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&APPID=bfc1b977d5f0ad912b3dc6c21e34e887";
  apiCall(queryUrl);
});


function apiCall(queryUrl) {
  
console.log(queryUrl);
  $.ajax({
    url: queryUrl,
    method: "GET"
  }).then(function (response) {
    console.log(response);

    city = response.name;
    console.log(cityArray + "last");
    $(".currentWeatherBox").css({"background-image": "none", "height": "auto"});
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

    
    $("#fiveLabel").text("5 Day Forecast:");
    
    
    for (var i = 1; i < 6; i++) {
      var j = (i * 8) - 2;
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
  console.log(city);
  $(this).remove();
  queryUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&APPID=bfc1b977d5f0ad912b3dc6c21e34e887";
  apiCall(queryUrl);
});




