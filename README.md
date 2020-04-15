# YOUTUBE-COMMENT-SEARCH-APP
## Youtube API/Auth2 App
> App that uses Youtube API v3 to fetch and display channel data and latest videos. Uses Auth2 library to authenticate

## Quick Start
- Type youtube video's link

## App Info
  ![app-info](https://github.com/xoxwgys56/youtube-comment-search/blob/master/img/App-Screen.png)

  # Search result
  - when main comment or reply comment include term.
  - > the result include all of comment.
### Inspired from Brad's repo
### Repo link : [https://www.youtube.com/watch?v=r-yxNNO1EI8]

## App Process
  ![step](https://github.com/xoxwgys56/youtube-comment-search/blob/master/img/Step.png)
## When you take Error
- on developer tab
  * Not a valid origin for the client: http://yourAddress... this origin for your project's client ID.
    * > this case you need to add your url to your oauth2
    * > https://console.cloud.google.com/apis/credentials/

## Stack
  * HTML
  * VanillaJS
  * Youtube Data API v3
  * js-cookie
  * date-js

## To-Do
- 검색 키워드 하이라이트
- 로딩 안꺼지는 경우 확인.
- design
- 한글 추가
- 대댓글 토글 시에
  - '-' 포함된 id는 읽지 못하는 버그

## Something Learn from this
- Can not handle function, handleClientLoad()
  - Trying to customize. change called time when user signed-in
  - this function return nothing. so can not know user signin properly
  - also can not use promise.
- Maybe.. I should ues React not just vanillaJS
- If cookie is too large. can not save

### Author

Inspired by Brad Traversy
[Traversy Media](http://www.traversymedia.com)

Daewon Kim

### Version

1.0.0

### License

This project is licensed under the MIT License
