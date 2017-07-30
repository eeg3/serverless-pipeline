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

  var height = $(window).height();
  var width = $(window).width();

  var game = new Phaser.Game(width, height, Phaser.AUTO, 'samfarm', {
      preload: preload,
      create: create,
      update: update
  });

  var sprites;
  var DESIRED_SAM_COUNT = 1;
  var CURRENT_SAM_COUNT = 1;
  var MAX_SAM_CHANGE = 10;
  var LAST_CHANGE_TIME = Date.now();
  var GET_SAM_COUNT_URL = _config.api.invokeUrl + '/sam';
  var TIME_BETWEEN_COUNT_UPDATE_MS = 4000;

  function preload() {
      game.load.spritesheet('spinner', '/images/squirrel.png', 64, 64);
      game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  }

  function create() {
      game.stage.disableVisibilityChange = true;
      game.stage.backgroundColor = '#967da7';
      sprites = game.add.physicsGroup(Phaser.Physics.ARCADE);
      createSprites(DESIRED_SAM_COUNT);
  }

  function createSprites(numberOfSprites) {
      for (var i = 0; i < numberOfSprites; i++) {
          var initX = game.rnd.integerInRange(100, width - 100);
          var initY = game.rnd.integerInRange(32, height - 32);
          var velX = game.rnd.integerInRange(-200, 200);
          var velY = game.rnd.integerInRange(-200, 200);

          var s = sprites.create(initX, initY, 'spinner');
          s.body.velocity.set(velX, velY);
          s.scale.setTo(1.4, 1.4);
      }

      sprites.setAll('body.collideWorldBounds', true);
      sprites.setAll('body.bounce.x', 1);
      sprites.setAll('body.bounce.y', 1);
  }

  function update() {
      game.physics.arcade.collide(sprites);

      var countToChange = DESIRED_SAM_COUNT - CURRENT_SAM_COUNT;

      samCountUpdate(countToChange);
  }

  function samCountUpdate(samCountChange) {

      var currTime = Date.now();

      // Only update the number of SAMs on the screen every second
      if (currTime - LAST_CHANGE_TIME > 1000) {

          // If we are increasing the amount of SAMs on the screen, take the min of the requested change value and
          // the max number that can be updated at a time.
          if (samCountChange > 0) {
              samCountChange = Math.min(samCountChange, MAX_SAM_CHANGE);

              createSprites(samCountChange);
              CURRENT_SAM_COUNT += samCountChange;
              LAST_CHANGE_TIME = currTime;

          } else if (samCountChange < 0) {
              // Else if we are decreasing the amount of SAMs on the screen, take the max of the negative change value and
              // the maximum that can be changed at a time
              samCountChange = Math.abs(Math.max(samCountChange, -MAX_SAM_CHANGE));

              // For each of the SAMs that are being removed, kill it's sprite
              for (var i = 0; i < samCountChange; i++) {
                  sprites.children[i].kill();
              }

              // Remove killed SAMs from the array
              sprites.children.splice(0, samCountChange);

              CURRENT_SAM_COUNT -= samCountChange;
              LAST_CHANGE_TIME = currTime;
          }
      }
  }

  // Every X seconds as defined in the variable TIME_BETWEEN_COUNT_UPDATE_MS, call our API endpoint to tell use how many
  // SAMs should be on the screen.
  setInterval(() => {
      $.ajax({
        url: GET_SAM_COUNT_URL,
        // Placeholder for Lambda authentication when CORS is better supported through SAM.
        // See: https://github.com/awslabs/serverless-application-model/issues/23
        // Currently, page is redirected back to sign-ni page based on presence of auth token.
        /* headers: {
            Authorization: authToken
        }, */
        success: function(data) {
            DESIRED_SAM_COUNT = data;
        }
      });
  }, TIME_BETWEEN_COUNT_UPDATE_MS);



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
