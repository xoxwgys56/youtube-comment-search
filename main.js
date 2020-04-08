// Oauth2
const auth = {
  discoveryDocs: [
    'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest',
  ],
  clientId: 'CLIENT-ID',
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
    const videoId = e.target[0].value.split('?v=')[1].split('&')[0];
    // not signIn
    if (!signFlag) {
      gapi.auth2
        .getAuthInstance()
        .signIn()
        .then((rep) => {
          // get id from link
          updateVideoInform(videoId);
        })
        .catch((err) => console.log(err));
    }
    // already signin
    else {
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
      console.log(err);
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

  showCommentList(e.target[0].value);
});

function showCommentList(term) {
  const comment = document.getElementById('comment-thread');
  let output = ``;

  // if there is no comment
  if (commentThreads.length === 0) {
    const errMsg = 'There is no comment on this video.';
    output = `
              <div class="card blue lighten-3">
                <div class="card-content white-text">
                  <p class="indigo-text text-darken-4 regular-text center-align">
                    ${errMsg}
                  </p>
                </div>
              </div>
    `;
  } else if (term) {
    for (let i = 0; i < comments.length; i++) {
      const comment = comments[i];
      const replies = comment.replies;

      // if comment has replies, search that
      let searchFlag = false;
      if (replies) {
        for (let j = 0; j < replies.length; j++) {
          if (replies[j].text.includes(term)) {
            searchFlag = true;
            break;
          }
        }
      } else if (comment.text.includes(term)) searchFlag = true;

      if (searchFlag) output += commentCard(comment);
    }
  }
  // no search term
  else {
    for (let i = 0; i < comments.length; i++) {
      output += commentCard(comments[i]);
    }
  }
  comment.innerHTML = output;
}

function showReplyList(replies) {
  const result = [];
  for (let i = 0; i < replies.length; i++) {
    result.push(replyCard(replies[i]));
  }
  return result;
}

function commentCard(comment) {
  let output = `
    <div class="card blue lighten-3">
      <div class="card-content white-text">
        <span class="card-title"><a href=${comment.channel}>${comment.author}</a></span>
          <div class="row">
            <div class="col s4 m4 l4">
              <i class="material-icons">comment</i>
            </div>
            <div class="col s4 m4 l4">${comment.date}</div>
            <div class="col s4 m4 l4">
              <i class="material-icons preifx">thumb_up</i>${comment.like}
            </div>
          </div>
          <div class="row">
            <p class="indigo-text text-darken-4 regular-text">
              ${comment.text}
            </p>
          </div>
        </div>
    </div>
  `;
  // if has replies append it.
  if (comment.replies) {
    const replies = showReplyList(comment.replies);
    for (let i = 0; i < replies.length; i++) {
      output += replies[i];
    }
  }
  return output;
}

function getParent(id) {
  for (let i = 0; i < comments.length; i++) {
    //
  }
}

function replyCard(reply) {
  return `
  <div class="card orange lighten-1">
  <div class="card-content white-text">
    <span class="card-title"><a href=${reply.channel}>${reply.author}</a></span>
      <div class="row">
        <div class="col s3 m3 l3">
          <i class="material-icons">chat</i>
        </div>
        <div class="col s4 m4 l4">${reply.date}</div>
        <div class="col s3 m3 l3">
          <i class="material-icons preifx">thumb_up</i>${reply.like}
        </div>
      </div>
      <div class="row">
        <p class="indigo-text text-darken-4 regular-text col s10 m10 l10">
          ${reply.text}
        </p>
      </div>
    </div>
  </div>
  `;
}

// data not arranged
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
          getCommentThreads(option).then((rep) => {
            endGetCommentThreads(rep);
          });
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

  arrangeAllComments();
  showCommentList();

  console.log('end');
}

let comments = [];
function arrangeAllComments() {
  const tempThreads = [];
  for (let i = 0; i < commentThreads.length; i++) {
    const commentThread = commentThreads[i];
    for (let j = 0; j < commentThread.length; j++) {
      tempThreads.push(commentThread[j]);
    }
  }

  for (let i = 0; i < tempThreads.length; i++) {
    const snippet = tempThreads[i].snippet.topLevelComment.snippet;

    const tempReplies = tempThreads[i].replies;
    const replies = [];
    if (tempReplies) {
      // add comment's replies
      for (let j = 0; j < tempReplies.comments.length; j++) {
        const snippet = tempReplies.comments[j].snippet;
        const reply = {
          id: tempReplies.comments[j].id,
          author: snippet.authorDisplayName,
          text: snippet.textDisplay,
          parentId: snippet.parentId,
          date: snippet.publishedAt,
          channel: snippet.authorChannelUrl,
          like: snippet.likeCount,
        };
        replies.push(reply);
      }
    }
    const comment = {
      id: tempThreads[i].snippet.topLevelComment.id,
      author: snippet.authorDisplayName,
      text: snippet.textDisplay,
      replies: replies,
      date: snippet.publishedAt,
      channel: snippet.authorChannelUrl,
      like: snippet.likeCount,
    };
    comments.push(comment);
  }
}
