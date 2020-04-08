// Oauth2
const auth = {
  discoveryDocs: [
    'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest',
  ],
  clientId: 'YOUR-CLIENT-ID',
  scope: 'https://www.googleapis.com/auth/youtube.force-ssl',
};

// auth
function handleClientLoad() {
  gapi.load('client:auth2', function () {
    // Init API client library and set up sign in listeners
    gapi.client.init(auth).then(() => {
      // set listener when sign in state changes
      // listen function passes true when user signs in
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
      // Handle initial sign in state
      updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    });
  });
}

// if user want type client id
const clientIdForm = document.getElementById('client-id-form');
clientIdForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const clientId = e.target[0].value;
  auth.clientId = clientId;
  console.log(
    'save your client id, but it is not save on your cookie :',
    clientId
  );
  const clientIdBlock = document.getElementById('client-id-block');
  clientIdBlock.style.display = 'block';
  clientIdBlock.innerHTML = `<p class="flow-text">${clientId}</p>`;
});

/** Step of get data
 * 1. get video data and show brief data
 * 2. then get comment -> at this time, need to signin google
 * 3. get comment thread on loading
 * 4. then show what we got.
 * 5. this time user can use searching.
 */

//  기능 수행 시작.
// get video id from the link
const searchForm = document.getElementById('search-video');
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const url = e.target[0].value;
  // url validation check
  if (validateVideoLink(url)) {
    // not signIn
    if (!signFlag) {
      gapi.auth2
        .getAuthInstance()
        .signIn()
        .then((rep) => {
          // get id from link
          const videoId = e.target[0].value.split('?v=')[1];
          // console.log(videoId);
          updateVideoInform(videoId);
        })
        .catch((err) => console.log(err));
    }
    // already signin
    else {
      // get id from link
      const videoId = e.target[0].value.split('?v=')[1];
      // console.log(videoId);
      updateVideoInform(videoId);
    }
  }
  // if not validated
  else {
    const warningText = 'wrong url ' + url;
    updateWarningText(warningText);
  }
});

// update video inform
function updateVideoInform(videoId) {
  // get video data
  gapi.client.youtube.videos
    .list({
      part: 'snippet',
      id: videoId,
    })
    .then((rep) => rep.result.items[0])
    // update
    .then((video) => {
      setVideoInform(video);
      // remove warning message
      updateWarningText(null);
    })
    .then(() => {
      showAfterVideoInform(videoId);
    })
    .catch((err) => {
      const warningText = 'we can not find video';
      updateWarningText(warningText);
    });
}

// video information
const videoInform = document.getElementById('video-inform');
function setVideoInform(video) {
  const snippet = video.snippet;
  const output = `
  <div class="row" >
  <!-- thumbnail and title -->
    <img
    class="col s6"
      src="${snippet.thumbnails.high.url}"
      alt=""
    />
    <div class="col s6  valign-wrapper">
     <h5 class="left-align">${snippet.title}</h5>
    </div>
</div>
<!-- description -->
<div class="row">
  <h4 class="col s4">${snippet.channelTitle}</h4>
  <p class="col s8">${snippet.description}</p>
</div>
<!-- tags -->
<div class="row">
  <div class="col s1"></div>
</div>
  `;

  videoInform.innerHTML = output;
}

// validate youtube url link
// https://stackoverflow.com/questions/28735459/how-to-validate-youtube-url-in-client-side-in-text-box
function validateVideoLink(url) {
  if (url != undefined || url != '') {
    var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match && match[2].length == 11) {
      return true;
    } else return false;
  }
}

// warning text
const warningBlock = document.getElementById('warning-block');
const warningText = document.getElementById('warning-text');
// Warning text
function updateWarningText(text) {
  if (!text) {
    warningBlock.style.display = 'none';
  } else {
    warningText.innerText = text;
    warningBlock.style.display = 'block';
  }
}

// const signinBtn = document.getElementById('signin-btn');
const signoutBtn = document.getElementById('signout-btn');
signoutBtn.addEventListener('click', () => {
  gapi.auth2.getAuthInstance().signOut();
});

let signFlag = false;
// Update UI sign in state changes
function updateSigninStatus(isSignedIn) {
  signFlag = isSignedIn;
  if (isSignedIn) {
    signoutBtn.style.display = 'block';
  } else {
    signoutBtn.style.display = 'none';
  }
}

const searchBlock = document.getElementById('search-block');
// show login, search term after get video information
function showAfterVideoInform(videoId) {
  searchBlock.style.display = 'block';

  // commentThreads option
  const option = {
    part: 'snippet, replies',
    videoId: videoId,
    maxResults: 100,
    // order: relevance
    // searchTerms: term
  };

  getCommentThreads(option);
}

// Search event listner
const searchTerm = document.getElementById('search-term');
searchTerm.addEventListener('submit', (e) => {
  e.preventDefault();

  showComment(e.target[0].value);
});

function showComment(term) {
  // if there is no comment
  if (commentThreads.length === 0) {
    const comment = document.getElementById('comment-thread');
    const errMsg = 'There is no comment on this video.';
    const output = `
        <div class="row">
            <div class="col s12">
              <div class="card blue lighten-3">
                <div class="card-content white-text">
                  <p class="indigo-text text-darken-4 regular-text center-align">
                    ${errMsg}
                  </p>
                </div>
              </div>
            </div>
          </div>
    `;
    comment.innerHTML = output;
  } else if (term) {
    for (let i = 0; i < commentThreads.length; i++) {
      const items = commentThreads[i];
      for (let j = 0; j < items.length; j++) {
        const snippet = items[j].snippet.topLevelComment.snippet;
        // 여기
        if (snippet.textOriginal.includes(term)) {
          output += `
          <div class="row">
              <div class="col s4">
                <div class="card blue lighten-3">
                  <div class="card-content white-text">
                    <span class="card-title">${snippet.authorDisplayName}</span>
                    <p class="indigo-text text-darken-4 regular-text">
                      ${snippet.textOriginal}
                    </p>
                  </div>
                </div>
              </div>
            </div>
        `;
        }
      }
    }
    // no term
  } else {
    for (let i = 0; i < commentThreads.length; i++) {
      const items = commentThreads[i];
      for (let j = 0; j < items.length; j++) {
        const snippet = items[j].snippet.topLevelComment.snippet;
        output += `
          <div class="row">
              <div class="col s4">
                <div class="card blue lighten-3">
                  <div class="card-content white-text">
                    <span class="card-title">${snippet.authorDisplayName}</span>
                    <p class="indigo-text text-darken-4 regular-text">
                      ${snippet.textOriginal}
                    </p>
                  </div>
                </div>
              </div>
            </div>
        `;
      }
    }
  }
}

let commentThreads = [];
// get comment threads
function getCommentThreads(option) {
  return new Promise((resolve, reject) => {
    // first try
    if (commentThreads.length === 0) {
      gapi.client.youtube.commentThreads
        .list(option)
        .then((rep) => {
          commentThreads.push(rep.result.items);

          option.pageToken = rep.result.nextPageToken;
          getCommentThreads(option);
        })
        .catch((err) => console.log(err));
    }
    // end get comment
    else if (option.pageToken === undefined) resolve('end get comment');
    // pending get comment
    else {
      gapi.client.youtube.commentThreads
        .list(option)
        .then((rep) => {
          // add to array
          commentThreads.push(rep.result.items);

          option.pageToken = rep.result.nextPageToken;
          getCommentThreads(option).then((rep) => {
            endGetCommentThreads(rep);
          });
        })
        .catch((err) => console.log(err));
    }
  });
}

// add comment
function endGetCommentThreads(rep) {
  console.log(rep);

  showComment();
}
