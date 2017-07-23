/*global Dashboard _config*/

var Dashboard = window.Dashboard || {};
var authToken;

(function($) {
  Dashboard.authToken.then(function setAuthToken(token) {
      if (token) {
          authToken = token;
      } else {
          window.location.href = '/signin.html';
      }
  }).catch(function handleTokenError(error) {
      alert(error);
      window.location.href = '/signin.html';
  });

  // GET
  $("#reqButton").click(function(){
      $.ajax({
        url: _config.api.invokeUrl + '/projects',
        headers: {
            Authorization: authToken
        },
        success: function(result){
          console.log(result);
          displayUpdate(result.Project);
        }
      });
  });

  // POST
  $("#postButton").click(function() {
    $.ajax({
        method: 'POST',
        url: _config.api.invokeUrl + '/projects',
        headers: {
            Authorization: authToken
        },
        data: JSON.stringify({
            PickupLocation: {
                Latitude: "abc",
                Longitude: "123"
            }
        }),
        contentType: 'application/json',
        success: function(result) {
          console.log(result);
          displayUpdate(result);
        },
        error: function ajaxError(jqXHR, textStatus, errorThrown) {
            console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
            console.error('Response: ', jqXHR.responseText);
            alert('An error occured when requesting:\n' + jqXHR.responseText);
        }
    });
  });


  function displayUpdate(text) {
      $('#updates').append($('<li>' + text + '</li>'));
  }

  $(function init() {
      $('#signOut').click(function() {
        Dashboard.signOut();
        window.location.href = '/signin.html';
      });

      Dashboard.authToken.then(function updateAuthMessage(token) {
          if (token) {
              displayUpdate('You are authenticated. Click to see your <a href="#authTokenModal" data-toggle="modal">auth token</a>.');
              $('.authToken').text(token);
          } else {
            console.log("No auth token!");
          }
      });

      if (!_config.api.invokeUrl) {
          $('#noApiMessage').show();
      }
  });

}(jQuery));
