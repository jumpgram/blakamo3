import { getPhotoURLWithFS, serverUrl } from "./helpers.js";

class HandleUserTargetsTab {
  constructor(userData) {
    this.userData = userData;

    this.$userTargetsBody = document.querySelector(
      "[user-targets='already-added']"
    );
    this.$userSearchTargetsBody = document.querySelector('div.tab-pane-users.tab-user-target-serach');
    this.$userSearchResultTab = document.querySelector('div#search-results-users');
    this.$eachUserTarget = this.$userTargetsBody
      .querySelector(".db-user")
      .cloneNode(true);

    this.$searchDB = document.querySelectorAll("#db-search");
    this.targetLength = 0
    this.init();
  }

  async init() {
    await this.getAndShowUserTargets();
    this.activateEvents();
  }

  activateEvents() {
    console.log("activating events");
    // Init a timeout variable to be used below
    let timeout = null;
    $(".target-div-loader").appendTo("#search-results-users");
    
    this.$searchDB[0].addEventListener("keyup", async(e) => {
      await clearTimeout(timeout);
      timeout = await setTimeout(async () => {
        if(e.target.value != ''){
          $('div.target-div-loader').css('display','block');
          await this.searchAndShowUsers(e.target.value)
        }
        $('.btn-pri.w-button.users').on('click', async(e) => {
          $('div.already-added-targets').css('display','block');
          this.addUserTarget(e)
        })
        $('.btn-pri.w-button.hashtag').on('click', async(e) => {
          $('div.already-added-targets').css('display','block');
          this.addHashtagTarget(e)
        })
        $('.btn-pri.w-button.location').on('click', async(e) => {
          $('div.already-added-targets').css('display','block');
          this.addLocationTarget(e)
        })
      }, 1000);
    })

    $(document).on('click','a.dd-insta-add.new-ds.already-added', async(e) => {
      $('div.already-added-targets').css('display','block');
      this.removeTarget(e)
    })

    $('#email-form-2').on('submit', (e) => {
      e.preventDefault();
      return false
    })
  }

  async fetchUserTargets() {
    const userTargetsRes = await fetch(
      `${serverUrl}/get-user-targets/${this.userData.pk}`
      // `http://localhost:5502/get-user-targets/${this.userData.pk}`
    );
    const userTargetsData = await userTargetsRes.json();
    console.log({ userTargetsData });
    if (userTargetsData && userTargetsData.length > 0) {
      return userTargetsData;
    }
    return null;
  }

  async getAndShowUserTargets() {
    console.log(this.$userSearchResultTab);
    const userTargets = await this.fetchUserTargets();
    if(userTargets != null){
      if(this.targetLength == 15 && userTargets.length == 14 ){
        $('#email-form-2').css('display', 'block');
        $('div.w-form-done').css('display', 'none');
        $('div.w-form-done').text('');
      }
      if(userTargets.length >= 15){
        $('#email-form-2').css('display', 'none');
        $('div.w-form-done').css('display', 'block');
        $('div.w-form-done').text('You have reached your target limit!');
      }
      if (userTargets) {
        this.showUserTargets(userTargets);
      }
      else{
        $('.db-body .db-user').remove()
        $('div.already-added-targets').css('display','none');
      }
      this.targetLength = userTargets.length 
    }
    else{
      $('.db-body .db-user').remove()
      $('div.already-added-targets').css('display','none');
    }
  }

  showUserTargets(userTargets) {
    if (!userTargets) return;
    console.log({ userTargets }, Array.isArray(userTargets));

    $('.db-body .db-user').remove()

    userTargets.forEach((user) => {
      const $userTarget = this.$eachUserTarget.cloneNode(true);
      if(user.user){
        if(user.type == 'profile'){
          $userTarget.querySelector("[db-user-target='name']").innerText =
            user.user.full_name;
          $userTarget.querySelector("[db-user-target='username']").innerText =
            '@'+user.user.username;
          $userTarget
            .querySelector("[db-user-target='profile-pic']")
            .removeAttribute("sizes");
          $userTarget
            .querySelector("[db-user-target='profile-pic']")
            .removeAttribute("srcset");
          $userTarget.querySelector("[db-user-target='profile-pic']").src =
            getPhotoURLWithFS(user.user.profile_pic_url);
          $userTarget
            .querySelector("[db-user-target='btn']")
            .setAttribute("data-pk", user.user.pk)
            $userTarget
            .querySelector("[db-user-target='btn']")
            .classList.add('already-added')
          this.$userTargetsBody.appendChild($userTarget);
        }
      }
      else if(user.type == 'hashtag'){
        $userTarget.querySelector("[db-user-target='name']").innerText =
          user.name;
        $userTarget.querySelector("[db-user-target='username']").innerText =
        '';
        $userTarget
          .querySelector("[db-user-target='profile-pic']")
          .removeAttribute("sizes");
        $userTarget
          .querySelector("[db-user-target='profile-pic']")
          .removeAttribute("srcset");
        $userTarget.querySelector("[db-user-target='profile-pic']").src = 'https://www.instagram.com/static/images/hashtag/search-hashtag-default-avatar.png/1d8417c9a4f5.png'
          // getPhotoURLWithFS(user.extra.profile_pic_url);
        $userTarget
          .querySelector("[db-user-target='btn']")
          .setAttribute("data-pk", user.id);
          $userTarget
          .querySelector("[db-user-target='btn']")
          .classList.add('already-added')
        this.$userTargetsBody.appendChild($userTarget);
      }
      else{
        $userTarget.querySelector("[db-user-target='name']").innerText =
          user.name;
        $userTarget.querySelector("[db-user-target='username']").innerText =
        user.volume +' posts';
        $userTarget
          .querySelector("[db-user-target='profile-pic']")
          .removeAttribute("sizes");
        $userTarget
          .querySelector("[db-user-target='profile-pic']")
          .removeAttribute("srcset");
        $userTarget.querySelector("[db-user-target='profile-pic']").src = 'https://cdn-icons-png.flaticon.com/64/684/684809.png'
          // getPhotoURLWithFS(user.extra.profile_pic_url);
        $userTarget
          .querySelector("[db-user-target='btn']")
          .setAttribute("data-pk", user.value);
          $userTarget
          .querySelector("[db-user-target='btn']")
          .classList.add('already-added')
        this.$userTargetsBody.appendChild($userTarget);
      }
    });
    $('div.already-added-targets').css('display','none');
  }
  
  async searchAndShowUsers(searchText) {
    const searchUsers = await this.searchUsers(searchText)
    if(searchUsers){
      await this.showUserSearch(searchUsers)
    }
  }

  async searchUsers(text){
    var url = `${serverUrl}/search/${text}`
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        'X-Frame-Options': 'SAMEORIGIN'
      },
    });
    var data = await res.json()
    return data;
  }
  
  async showUserSearch(searchData){
    this.$userSearchTargetsBody = document.querySelector('div.tab-pane-users.tab-user-target-serach');
    this.$hashSearchTargetsBody = document.querySelector('div.tab-pane-hashtags.tab-hashtag-target-serach');
    this.$locationSearchTargetsBody = document.querySelector('div.tab-pane-locations.tab-location-target-serach');
    $('div.tab-pane-users.tab-user-target-serach').empty();
    $('div.tab-pane-hashtags.tab-hashtag-target-serach').empty();
    $('div.tab-pane-locations.tab-location-target-serach').empty();
    if(searchData.users.length > 0)
    {
      // console.log({ searchData.users }, Array.isArray(searchData.users));
      var userData = searchData.users;
      userData.forEach((user) => {
        const $userTarget = this.$eachUserTarget.cloneNode(true);
        $userTarget.querySelector("[db-user-target='name']").innerText =
          user.user.full_name;
        $userTarget.querySelector("[db-user-target='username']").innerText =
        '@'+user.user.username;
        $userTarget
          .querySelector("[db-user-target='profile-pic']")
          .removeAttribute("sizes");
        $userTarget
          .querySelector("[db-user-target='profile-pic']")
          .removeAttribute("srcset");
        $userTarget.querySelector("[db-user-target='profile-pic']").src =
          getPhotoURLWithFS(user.user.profile_pic_url);
        $userTarget
          .querySelector("[db-user-target='btn']").innerText='Add Target';
          $userTarget
          .querySelector("[db-user-target='btn']").classList.add('btn-pri', 'w-button', 'users');
        $userTarget
          .querySelector("[db-user-target='btn']")
          .setAttribute("data-pk", user.user.pk);
        $userTarget
          .querySelector("[db-user-target='btn']")
          .setAttribute("data-name", user.user.username);
        $userTarget
          .querySelector("[db-user-target='btn']")
          .setAttribute("data-type", 'profile');
        this.$userSearchTargetsBody.appendChild($userTarget);
      });
      
    }
    if(searchData.hashtags.length > 0)
    {
      var hashtagsData = searchData.hashtags;
      hashtagsData.forEach((hashtag) => {
        const $userTarget = this.$eachUserTarget.cloneNode(true);
        $userTarget.querySelector("[db-user-target='name']").innerText =
        hashtag.hashtag.name;
        $userTarget.querySelector("[db-user-target='username']").innerText =
        hashtag.hashtag.media_count+' posts';
        $userTarget
          .querySelector("[db-user-target='profile-pic']")
          .removeAttribute("sizes");
        $userTarget
          .querySelector("[db-user-target='profile-pic']")
          .removeAttribute("srcset");
        $userTarget.querySelector("[db-user-target='profile-pic']").src =
        'https://www.instagram.com/static/images/hashtag/search-hashtag-default-avatar.png/1d8417c9a4f5.png'
        $userTarget
          .querySelector("[db-user-target='btn']").innerText='Add Target';
          $userTarget
          .querySelector("[db-user-target='btn']").classList.add('btn-pri', 'w-button', 'hashtag');
        $userTarget
          .querySelector("[db-user-target='btn']")
          .setAttribute("data-pk", hashtag.hashtag.id);
        $userTarget
          .querySelector("[db-user-target='btn']")
          .setAttribute("data-name", hashtag.hashtag.name);
        $userTarget
          .querySelector("[db-user-target='btn']")
          .setAttribute("data-type", 'hashtag');
        this.$hashSearchTargetsBody.appendChild($userTarget);
      });
      
    }
    if(searchData.places.length > 0)
    {
      var placesData = searchData.places;
      console.log(placesData);
      placesData.forEach((place) => {
        const $userTarget = this.$eachUserTarget.cloneNode(true);
        $userTarget.querySelector("[db-user-target='name']").innerText =
        place.place.location.name;
        $userTarget.querySelector("[db-user-target='username']").innerText =
        place.place.location.address;
        $userTarget
          .querySelector("[db-user-target='profile-pic']")
          .removeAttribute("sizes");
        $userTarget
          .querySelector("[db-user-target='profile-pic']")
          .removeAttribute("srcset");
        $userTarget.querySelector("[db-user-target='profile-pic']").src =
        'https://cdn-icons-png.flaticon.com/64/684/684809.png'
        $userTarget
          .querySelector("[db-user-target='btn']").innerText='Add Target';
          $userTarget
          .querySelector("[db-user-target='btn']").classList.add('btn-pri', 'w-button', 'location');
        $userTarget
          .querySelector("[db-user-target='btn']")
          .setAttribute("data-pk",  place.place.location.pk);
        $userTarget
          .querySelector("[db-user-target='btn']")
          .setAttribute("data-name",  place.place.slug);
        $userTarget
          .querySelector("[db-user-target='btn']")
          .setAttribute("data-type", 'location');
        this.$locationSearchTargetsBody.appendChild($userTarget);
      });
      
    }
    
    $('.target-div-loader').css('display','none');

  }

  async addUserTarget(e){
    var pk = await $(e.target).attr('data-pk')
    var name = await $(e.target).attr('data-name')
    var user = this.userData.pk
    var parent = $(e.target).siblings()
    var img = $(parent).find('img').attr('src')
    if($('div.div-block-50 .db-body div.db-user').length > 14){
      $('#email-form-2').css('display', 'none');
      $('div.w-form-done').css('display', 'block');
      $('div.w-form-done').text('You have reached your target limit!');
    }
    else{
      var response = await this.addTarget(user, pk, name, 'profile')
      if(response.targets.status == 'ok' && typeof response.targets.source != 'undefined'){
        const $userTarget = this.$eachUserTarget.cloneNode(true);
        var data = response.targets.source
        $userTarget.querySelector("[db-user-target='name']").innerText =
        data.extra.full_name;
        $userTarget.querySelector("[db-user-target='username']").innerText =
          '@'+data.name;
        $userTarget
          .querySelector("[db-user-target='profile-pic']")
          .removeAttribute("sizes");
        $userTarget
          .querySelector("[db-user-target='profile-pic']")
          .removeAttribute("srcset");
        $userTarget.querySelector("[db-user-target='profile-pic']").src = img
          // getPhotoURLWithFS(data.extra.profile_pic_url);
        $userTarget
          .querySelector("[db-user-target='btn']")
          .setAttribute("data-pk", data.id)
        $userTarget
          .querySelector("[db-user-target='btn']")
          .classList.add('already-added')
        this.$userTargetsBody.appendChild($userTarget);
        $('div.already-added-targets').css('display','none');
      }
      else{
        $('div.already-added-targets').css('display','none');
      }
      this.targetLength =  $('div.div-block-50 .db-body div.db-user').length
      if($('div.div-block-50 .db-body div.db-user').length > 14){
        $('#email-form-2').css('display', 'none');
        $('div.w-form-done').css('display', 'block');
        $('div.w-form-done').text('You have reached your target limit!');
      }
    }
    
  }
  
  async addHashtagTarget(e){
    var pk = await $(e.target).attr('data-pk')
    var name = await $(e.target).attr('data-name')
    var user = this.userData.pk
    if($('div.div-block-50 .db-body div.db-user').length > 14){
      $('#email-form-2').css('display', 'none');
      $('div.w-form-done').css('display', 'block');
      $('div.w-form-done').text('You have reached your target limit!');
    }
    else{
      var response = await this.addTarget(user, pk, name, 'hashtag')
      if(response.targets.status == 'ok'){
        const $userTarget = this.$eachUserTarget.cloneNode(true);
        var data = response.targets.source
        $userTarget.querySelector("[db-user-target='name']").innerText =
            data.name;
          $userTarget.querySelector("[db-user-target='username']").innerText =
          '';
          $userTarget
            .querySelector("[db-user-target='profile-pic']")
            .removeAttribute("sizes");
          $userTarget
            .querySelector("[db-user-target='profile-pic']")
            .removeAttribute("srcset");
          $userTarget.querySelector("[db-user-target='profile-pic']").src = 'https://www.instagram.com/static/images/hashtag/search-hashtag-default-avatar.png/1d8417c9a4f5.png'
            // getPhotoURLWithFS(user.extra.profile_pic_url);
          $userTarget
            .querySelector("[db-user-target='btn']")
            .setAttribute("data-pk", user.id);
            $userTarget
            .querySelector("[db-user-target='btn']")
            .classList.add('already-added')
          this.$userTargetsBody.appendChild($userTarget);
        $('div.already-added-targets').css('display','none');
      }
      else{
        $('div.already-added-targets').css('display','none');
      }
      this.targetLength =  $('div.div-block-50 .db-body div.db-user').length
      if($('div.div-block-50 .db-body div.db-user').length > 14){
        $('#email-form-2').css('display', 'none');
        $('div.w-form-done').css('display', 'block');
        $('div.w-form-done').text('You have reached your target limit!');
      }
    }
  }
  
  async addLocationTarget(e){
    var pk = await $(e.target).attr('data-pk')
    var name = await $(e.target).attr('data-name')
    var user = this.userData.pk
    if($('div.div-block-50 .db-body div.db-user').length > 14){
      $('#email-form-2').css('display', 'none');
      $('div.w-form-done').css('display', 'block');
      $('div.w-form-done').text('You have reached your target limit!');
    }
    else{
      var response = await this.addTarget(user, pk, name, 'location')
      if(response.targets.status == 'ok'){
        const $userTarget = this.$eachUserTarget.cloneNode(true);
        var data = response.targets.source
        $userTarget.querySelector("[db-user-target='name']").innerText =
          data.name;
        $userTarget.querySelector("[db-user-target='username']").innerText =
        '';
        $userTarget
          .querySelector("[db-user-target='profile-pic']")
          .removeAttribute("sizes");
        $userTarget
          .querySelector("[db-user-target='profile-pic']")
          .removeAttribute("srcset");
        $userTarget.querySelector("[db-user-target='profile-pic']").src = 'https://cdn-icons-png.flaticon.com/64/684/684809.png'
          // getPhotoURLWithFS(user.extra.profile_pic_url);
        $userTarget
          .querySelector("[db-user-target='btn']")
          .setAttribute("data-pk", data.value);
          $userTarget
          .querySelector("[db-user-target='btn']")
          .classList.add('already-added')
        this.$userTargetsBody.appendChild($userTarget);
        $('div.already-added-targets').css('display','none');
      }
      else{
        $('div.already-added-targets').css('display','none');
      }
      this.targetLength =  $('div.div-block-50 .db-body div.db-user').length
      if($('div.div-block-50 .db-body div.db-user').length > 14){
        $('#email-form-2').css('display', 'none');
        $('div.w-form-done').css('display', 'block');
        $('div.w-form-done').text('You have reached your target limit!');
      }
    }
  }

  async addTarget(uId, pk, name, type){
    var url = `${serverUrl}/add-target`
    // var url = `http://localhost:5502/add-target`
    const res = await fetch(url, {
      method: "POST",
      body:JSON.stringify({"uId":`${uId}`,"pk":`${pk}`,"name":`${name}`,"type":`${type}`}),
      headers: {
        "Content-Type": "application/json",
        'X-Frame-Options': 'SAMEORIGIN'
      },
    });

    const response = await res.json()
    console.log(response);
    return response
  }
  
  async removeTarget(e){
    var id = e.target.dataset.pk
    var user = this.userData.pk
    var url = `${serverUrl}/remove-target`
    // var url = `http://localhost:5502/remove-target`

    const res = await fetch(url, {
      method: "POST",
      body:JSON.stringify({"user":`${user}`,"id":`${id}`}),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const response = await res.json()
    console.log(response);
    if(response.targets.status == 'ok'){
      $(e.target).parent().remove()
      $('div.already-added-targets').css('display','none');
      if(this.targetLength == 15 && $('div.div-block-50 .db-body div.db-user').length == 14 ){
        $('#email-form-2').css('display', 'block');
        $('div.w-form-done').css('display', 'none');
        $('div.w-form-done').text('');
      }
      this.targetLength = $('div.div-block-50 .db-body div.db-user').length
    }
    return response
  }

}

export { HandleUserTargetsTab };
