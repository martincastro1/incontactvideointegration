$(function() {
    /** Settings **/
    var apiURL = 'https://tokbox.com/embed';
    var apiKey = "46167552";
    var secret = "cc4bb45997e21a7fc09473c541e9305f56ba709a";
    var application = "Tokbox-demo";
    var vendor = "Tokbox";
    var businessunit = "46167552";
    var user = "tejas@tokbox.com";
    var pass = "T0kb0x!!!";

    /** Local variables */
    var dispositionData = {};
    var interval;

    /** Global functions **/

    function getParameterByName(name, url) {
      if (!url) url = window.location.href;
      name = name.replace(/[\[\]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
          results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    /* create a meeting */
    function createMeeting() {
      return new Promise((resolve, reject) => {
        var startTime = location === 'support' ? Date.now() : '';
        var endTime = location === 'support' ? startTime + (604800 * 1000) : '';
        var requestConfig = {
          url: [apiURL, '/integration/', apiKey,'/create?secret=', secret, '&videoEnabledByDefault=false&startTime=', startTime, '&endTime=', endTime].join(''),
          method: 'POST',
          secure: true
        };
        $.post(requestConfig, function(response) {
          $('#clientUrl').val(response.urls.customer);
          const tag = document.createElement('iframe');
          tag.src = response.urls.agent;
          tag.width = '100%';
          tag.height = '70%';
          tag.scrolling = 'no';
          tag.allow = 'microphone, camera'
          $('#agentScreen').append(tag);
          document.getElementById('calendar').src = response.urls.agent;
          startInterval();
          resolve();
        });
      });
    }

    function getToken() {
      return new Promise((resolve, reject) => {
        var authCode = window.btoa(application + "@" + vendor + ":" + businessunit);
        $.ajax({
            "url": 'https://api.incontact.com/InContactAuthorizationServer/Token',
            "type": 'post',
            "contentType": 'application/json',
            "dataType": 'json',
            "headers": {
                'Authorization': 'basic ' + authCode
            },
            "data": JSON.stringify({
            "grant_type": 'password',
            "username": user,
            "password" : pass,
            "scope": 'AdminApi AgentApi AuthenticationApi PatronApi RealTimeApi'
            }),
            "success": function (resp) {
              resolve(resp);
            },
            "error": function (xhr, textStatus, errorThrown) {
              reject(xhr.status + " - " + xhr.statusText);
            }
        });
      });
    }

    function getSessionId(result) {
      return new Promise((resolve, reject) => {
        /* BEGIN join session */
        var joinSessionPayload = {
            'asAgentId': 'string',
        }
        $.ajax({
            //The baseURI variable is created by the result.base_server_base_uri
            //which is returned when getting a token and should be used to create the URL base
            'url': result.resource_server_base_uri + 'services/v11.0/agent-sessions/join',
            'type': 'POST',
            'headers': {
                //Use access_token previously retrieved from inContact token service
                'Authorization': 'bearer ' + result.access_token,
                'content-Type': 'application/json'
            },
            'data': JSON.stringify(joinSessionPayload),
            'success': function (data) {
                data.access_token = result.access_token;
                data.resource_server_base_uri = result.resource_server_base_uri;
                resolve(data);
            },
            'error': function (xhr, textStatus, errorThrown) {
              reject(xhr.status + " - " + xhr.statusText);
            }
        });
        /* END join session */
      })
    }

  function setDispositionData(results) {
    dispositionData.access_token = results.access_token;
    dispositionData.resource_server_base_uri = results.resource_server_base_uri;
    dispositionData.sessionId = results.sessionId;
  }

  function setDispositionNote() {
    return new Promise((resolve, reject) => {
      var accessToken = dispositionData.access_token;
      var baseURI = dispositionData.resource_server_base_uri;
      var contactId = getParameterByName('contactId');
      var sessionId = dispositionData.sessionId;
      var setDispositionPayload = {
        'primaryDispositionId': 3477,
        'primaryDispositionNotes': 'Video session',
      }
      $.ajax({
        //The baseURI variable is created by the result.base_server_base_uri,
        //which is returned when getting a token and should be used to create the URL base
        'url': baseURI + 'services/v11.0/agent-sessions/' + sessionId + '/interactions/' + contactId + '/disposition',
        'type': 'POST',
        'headers': {
            //Use access_token previously retrieved from inContact token service
            'Authorization': 'bearer ' + accessToken,
            'content-Type': 'application/json'
        },
        'data': JSON.stringify(setDispositionPayload),
        'success': function (result, status, statusCode) {
            //Process success actions
            alert('Call ended');
            console.log('Disposition sent!');
            return result;
        },
        'error': function (xhr, textStatus, errorThrown) {
          setTimeout(function(){
            setDispositionNote();
          }, 5000);
        }
      });
    });
  }

  function endContact() {
    return new Promise((resolve, reject) => {
      var accessToken = dispositionData.access_token;
      var baseURI = dispositionData.resource_server_base_uri;
      var contactId = getParameterByName('contactId');

      $.ajax({
        //The baseURI variable is created by the result.base_server_base_uri,
        //which is returned when getting a token and should be used to create the URL base
        'url': baseURI + 'services/v11.0/contacts/' + contactId + '/end',
        'type': 'POST',
        'headers': {
            //Use access_token previously retrieved from inContact token service
            'Authorization': 'bearer ' + accessToken,
            'content-Type': 'application/json'
        },
        'success': function (result, status, statusCode) {
            //Process success actions
            console.log('contact ended');
            resolve();
        },
        'error': function (xhr, textStatus, errorThrown) {
          reject(xhr.status + " - " + xhr.statusText);
        }
      });
    });
  }

  /* Open agent link */
  $('#open').click(function() {
      window.open($('#agentUrl').val(), '_blank', 'location=yes,height=570,width=1040,scrollbars=no,status=yes,top=50,left=50');
  });

  /* toggle client video */
  $('#toggleClientVideo').change(function() {
    toggleVideo('client', this.checked);
  });

  /* toggle agent video */
  $('#toggleAgentVideo').change(function() {
    toggleVideo('agent', this.checked);
  });

  function toggleVideo(role, enableVideo) {
    var url = $('#' + role + 'Url').val();
    url = url.replace('videoEnabledByDefault=' + !enableVideo, 'videoEnabledByDefault=' + enableVideo);
    $('#' + role + 'Url').val(url);
    $('#' + role + 'VideoStatus').text(enableVideo ? 'disable video' : 'enable video');
  }

  function startInterval() {
    interval = setInterval(function () {
      verifyToken();
    }, 5000);
  }

  function stopInverval() {
    clearInterval(interval);
    endContact().
      then(setDispositionNote);
  }

  function verifyToken() {
    var requestConfig = {
      url: $('#clientUrl').val()
    };
    $.get(requestConfig)
    .catch(function() {
      stopInverval();
    });
  }


  createMeeting()
    .then(getToken)
    .then(getSessionId)
    .then(setDispositionData)
    .catch(function(error){
      console.log('Error found =>', error);
    });

});
