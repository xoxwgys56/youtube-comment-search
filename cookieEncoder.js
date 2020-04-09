/**
 * This script not used
 *
 * this is what i got but did nothing.
 */

const commentDelimeter = '/';
const innerDelimeter = ',';

// encode comment cookie
function setCommentCookies(comments) {
  Cookies.set('comments-length', comments.length);
  let commentCookies;
  for (let i = 0; i < comments.length; i++) {
    const _comment = comments[i];
    const _result =
      'commentThreads' +
      innerDelimeter +
      _comment.id +
      innerDelimeter +
      _comment.author +
      innerDelimeter +
      _comment.text +
      innerDelimeter +
      _comment.replies.length +
      innerDelimeter +
      _comment.date +
      innerDelimeter +
      _comment.channel +
      innerDelimeter +
      _comment.like +
      commentDelimeter;
    commentCookies += _result;
    if (_comment.replies.length > 0) {
      commentCookies += setRepliesCookie(_comment.replies);
    }
  }

  console.log(commentCookies);
  Cookies.set('comment', commentCookies);
}

function setRepliesCookie(replies, index) {
  let result = ``;
  for (let i = 0; i < replies.length; i++) {
    const _reply = replies[i];
    const _result =
      'reply' +
      innerDelimeter +
      _reply.id +
      innerDelimeter +
      _reply.author +
      innerDelimeter +
      _reply.tempThreads +
      innerDelimeter +
      _reply.parentId +
      innerDelimeter +
      _reply.date +
      innerDelimeter +
      _reply.channel +
      innerDelimeter +
      _reply.like +
      commentDelimeter;
    result += _result;
  }
  return result;
}

//       id: tempThreads[i].snippet.topLevelComment.id,
//       author: snippet.authorDisplayName,
//       text: snippet.textDisplay,
//       replies: replies,
//       date: snippet.publishedAt,
//       channel: snippet.authorChannelUrl,
//       like: snippet.likeCount,

function getCommentCookies() {
  const commentLength = Cookies.get('comments-length');
  for (let i = 0; i < commentLength; i++) {
    const comment = Cookies.get('comment-' + i).split(delimeter);
    let result = {
      id: comment[0],
      author: comment[1],
      text: comment[2],
      date: comment[4],
      channel: comment[5],
      like: comment[6],
    };
    if (comment[3] > 0) result.replies = getRepliesCookie(comment[3], i);
    comments.push(result);
  }
}

//          id: tempReplies.comments[j].id,
//           author: snippet.authorDisplayName,
//           text: snippet.textDisplay,
//           parentId: snippet.parentId,
//           date: snippet.publishedAt,
//           channel: snippet.authorChannelUrl,
//           like: snippet.likeCount,

function getRepliesCookie(length, parentIndex) {
  let result = [];
  for (let i = 0; i < length; i++) {
    const reply = Cookies.get('reply-' + parentIndex + i).split(delimeter);
    const temp = {
      id: reply[0],
      author: reply[1],
      text: reply[2],
      parentId: reply[3],
      date: reply[4],
      channel: reply[5],
      like: reply[6],
    };
    result.push(temp);
  }
  return result;
}
