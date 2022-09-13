(function(){
    var script = {
 "scripts": {
  "setStartTimeVideo": function(video, time){  var items = this.getPlayListItems(video); var startTimeBackup = []; var restoreStartTimeFunc = function() { for(var i = 0; i<items.length; ++i){ var item = items[i]; item.set('startTime', startTimeBackup[i]); item.unbind('stop', restoreStartTimeFunc, this); } }; for(var i = 0; i<items.length; ++i) { var item = items[i]; var player = item.get('player'); if(player.get('video') == video && player.get('state') == 'playing') { player.seek(time); } else { startTimeBackup.push(item.get('startTime')); item.set('startTime', time); item.bind('stop', restoreStartTimeFunc, this); } } },
  "getMediaByName": function(name){  var list = this.getByClassName('Media'); for(var i = 0, count = list.length; i<count; ++i){ var media = list[i]; if((media.get('class') == 'Audio' && media.get('data').label == name) || media.get('label') == name){ return media; } } return undefined; },
  "loadFromCurrentMediaPlayList": function(playList, delta){  var currentIndex = playList.get('selectedIndex'); var totalItems = playList.get('items').length; var newIndex = (currentIndex + delta) % totalItems; while(newIndex < 0){ newIndex = totalItems + newIndex; }; if(currentIndex != newIndex){ playList.set('selectedIndex', newIndex); } },
  "resumeGlobalAudios": function(caller){  if (window.pauseGlobalAudiosState == undefined || !(caller in window.pauseGlobalAudiosState)) return; var audiosPaused = window.pauseGlobalAudiosState[caller]; delete window.pauseGlobalAudiosState[caller]; var values = Object.values(window.pauseGlobalAudiosState); for (var i = 0, count = values.length; i<count; ++i) { var objAudios = values[i]; for (var j = audiosPaused.length-1; j>=0; --j) { var a = audiosPaused[j]; if(objAudios.indexOf(a) != -1) audiosPaused.splice(j, 1); } } for (var i = 0, count = audiosPaused.length; i<count; ++i) { var a = audiosPaused[i]; if (a.get('state') == 'paused') a.play(); } },
  "stopGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios){ audio = audios[audio.get('id')]; if(audio){ delete audios[audio.get('id')]; if(Object.keys(audios).length == 0){ window.currentGlobalAudios = undefined; } } } if(audio) audio.stop(); },
  "updateVideoCues": function(playList, index){  var playListItem = playList.get('items')[index]; var video = playListItem.get('media'); if(video.get('cues').length == 0) return; var player = playListItem.get('player'); var cues = []; var changeFunction = function(){ if(playList.get('selectedIndex') != index){ video.unbind('cueChange', cueChangeFunction, this); playList.unbind('change', changeFunction, this); } }; var cueChangeFunction = function(event){ var activeCues = event.data.activeCues; for(var i = 0, count = cues.length; i<count; ++i){ var cue = cues[i]; if(activeCues.indexOf(cue) == -1 && (cue.get('startTime') > player.get('currentTime') || cue.get('endTime') < player.get('currentTime')+0.5)){ cue.trigger('end'); } } cues = activeCues; }; video.bind('cueChange', cueChangeFunction, this); playList.bind('change', changeFunction, this); },
  "startPanoramaWithCamera": function(media, camera){  if(window.currentPanoramasWithCameraChanged != undefined && window.currentPanoramasWithCameraChanged.indexOf(media) != -1){ return; } var playLists = this.getByClassName('PlayList'); if(playLists.length == 0) return; var restoreItems = []; for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ var item = items[j]; if(item.get('media') == media && (item.get('class') == 'PanoramaPlayListItem' || item.get('class') == 'Video360PlayListItem')){ restoreItems.push({camera: item.get('camera'), item: item}); item.set('camera', camera); } } } if(restoreItems.length > 0) { if(window.currentPanoramasWithCameraChanged == undefined) { window.currentPanoramasWithCameraChanged = [media]; } else { window.currentPanoramasWithCameraChanged.push(media); } var restoreCameraOnStop = function(){ var index = window.currentPanoramasWithCameraChanged.indexOf(media); if(index != -1) { window.currentPanoramasWithCameraChanged.splice(index, 1); } for (var i = 0; i < restoreItems.length; i++) { restoreItems[i].item.set('camera', restoreItems[i].camera); restoreItems[i].item.unbind('stop', restoreCameraOnStop, this); } }; for (var i = 0; i < restoreItems.length; i++) { restoreItems[i].item.bind('stop', restoreCameraOnStop, this); } } },
  "pauseGlobalAudios": function(caller, exclude){  if (window.pauseGlobalAudiosState == undefined) window.pauseGlobalAudiosState = {}; if (window.pauseGlobalAudiosList == undefined) window.pauseGlobalAudiosList = []; if (caller in window.pauseGlobalAudiosState) { return; } var audios = this.getByClassName('Audio').concat(this.getByClassName('VideoPanoramaOverlay')); if (window.currentGlobalAudios != undefined) audios = audios.concat(Object.values(window.currentGlobalAudios)); var audiosPaused = []; var values = Object.values(window.pauseGlobalAudiosState); for (var i = 0, count = values.length; i<count; ++i) { var objAudios = values[i]; for (var j = 0; j<objAudios.length; ++j) { var a = objAudios[j]; if(audiosPaused.indexOf(a) == -1) audiosPaused.push(a); } } window.pauseGlobalAudiosState[caller] = audiosPaused; for (var i = 0, count = audios.length; i < count; ++i) { var a = audios[i]; if (a.get('state') == 'playing' && (exclude == undefined || exclude.indexOf(a) == -1)) { a.pause(); audiosPaused.push(a); } } },
  "setMainMediaByName": function(name){  var items = this.mainPlayList.get('items'); for(var i = 0; i<items.length; ++i){ var item = items[i]; if(item.get('media').get('label') == name) { this.mainPlayList.set('selectedIndex', i); return item; } } },
  "getMediaFromPlayer": function(player){  switch(player.get('class')){ case 'PanoramaPlayer': return player.get('panorama') || player.get('video'); case 'VideoPlayer': case 'Video360Player': return player.get('video'); case 'PhotoAlbumPlayer': return player.get('photoAlbum'); case 'MapPlayer': return player.get('map'); } },
  "fixTogglePlayPauseButton": function(player){  var state = player.get('state'); var buttons = player.get('buttonPlayPause'); if(typeof buttons !== 'undefined' && player.get('state') == 'playing'){ if(!Array.isArray(buttons)) buttons = [buttons]; for(var i = 0; i<buttons.length; ++i) buttons[i].set('pressed', true); } },
  "getPanoramaOverlayByName": function(panorama, name){  var overlays = this.getOverlays(panorama); for(var i = 0, count = overlays.length; i<count; ++i){ var overlay = overlays[i]; var data = overlay.get('data'); if(data != undefined && data.label == name){ return overlay; } } return undefined; },
  "setPanoramaCameraWithCurrentSpot": function(playListItem){  var currentPlayer = this.getActivePlayerWithViewer(this.MainViewer); if(currentPlayer == undefined){ return; } var playerClass = currentPlayer.get('class'); if(playerClass != 'PanoramaPlayer' && playerClass != 'Video360Player'){ return; } var fromMedia = currentPlayer.get('panorama'); if(fromMedia == undefined) { fromMedia = currentPlayer.get('video'); } var panorama = playListItem.get('media'); var newCamera = this.cloneCamera(playListItem.get('camera')); this.setCameraSameSpotAsMedia(newCamera, fromMedia); this.startPanoramaWithCamera(panorama, newCamera); },
  "changeBackgroundWhilePlay": function(playList, index, color){  var stopFunction = function(event){ playListItem.unbind('stop', stopFunction, this); if((color == viewerArea.get('backgroundColor')) && (colorRatios == viewerArea.get('backgroundColorRatios'))){ viewerArea.set('backgroundColor', backgroundColorBackup); viewerArea.set('backgroundColorRatios', backgroundColorRatiosBackup); } }; var playListItem = playList.get('items')[index]; var player = playListItem.get('player'); var viewerArea = player.get('viewerArea'); var backgroundColorBackup = viewerArea.get('backgroundColor'); var backgroundColorRatiosBackup = viewerArea.get('backgroundColorRatios'); var colorRatios = [0]; if((color != backgroundColorBackup) || (colorRatios != backgroundColorRatiosBackup)){ viewerArea.set('backgroundColor', color); viewerArea.set('backgroundColorRatios', colorRatios); playListItem.bind('stop', stopFunction, this); } },
  "changePlayListWithSameSpot": function(playList, newIndex){  var currentIndex = playList.get('selectedIndex'); if (currentIndex >= 0 && newIndex >= 0 && currentIndex != newIndex) { var currentItem = playList.get('items')[currentIndex]; var newItem = playList.get('items')[newIndex]; var currentPlayer = currentItem.get('player'); var newPlayer = newItem.get('player'); if ((currentPlayer.get('class') == 'PanoramaPlayer' || currentPlayer.get('class') == 'Video360Player') && (newPlayer.get('class') == 'PanoramaPlayer' || newPlayer.get('class') == 'Video360Player')) { var newCamera = this.cloneCamera(newItem.get('camera')); this.setCameraSameSpotAsMedia(newCamera, currentItem.get('media')); this.startPanoramaWithCamera(newItem.get('media'), newCamera); } } },
  "showPopupPanoramaOverlay": function(popupPanoramaOverlay, closeButtonProperties, imageHD, toggleImage, toggleImageHD, autoCloseMilliSeconds, audio, stopBackgroundAudio){  var self = this; this.MainViewer.set('toolTipEnabled', false); var cardboardEnabled = this.isCardboardViewMode(); if(!cardboardEnabled) { var zoomImage = this.zoomImagePopupPanorama; var showDuration = popupPanoramaOverlay.get('showDuration'); var hideDuration = popupPanoramaOverlay.get('hideDuration'); var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); var popupMaxWidthBackup = popupPanoramaOverlay.get('popupMaxWidth'); var popupMaxHeightBackup = popupPanoramaOverlay.get('popupMaxHeight'); var showEndFunction = function() { var loadedFunction = function(){ if(!self.isCardboardViewMode()) popupPanoramaOverlay.set('visible', false); }; popupPanoramaOverlay.unbind('showEnd', showEndFunction, self); popupPanoramaOverlay.set('showDuration', 1); popupPanoramaOverlay.set('hideDuration', 1); self.showPopupImage(imageHD, toggleImageHD, popupPanoramaOverlay.get('popupMaxWidth'), popupPanoramaOverlay.get('popupMaxHeight'), null, null, closeButtonProperties, autoCloseMilliSeconds, audio, stopBackgroundAudio, loadedFunction, hideFunction); }; var hideFunction = function() { var restoreShowDurationFunction = function(){ popupPanoramaOverlay.unbind('showEnd', restoreShowDurationFunction, self); popupPanoramaOverlay.set('visible', false); popupPanoramaOverlay.set('showDuration', showDuration); popupPanoramaOverlay.set('popupMaxWidth', popupMaxWidthBackup); popupPanoramaOverlay.set('popupMaxHeight', popupMaxHeightBackup); }; self.resumePlayers(playersPaused, audio == null || !stopBackgroundAudio); var currentWidth = zoomImage.get('imageWidth'); var currentHeight = zoomImage.get('imageHeight'); popupPanoramaOverlay.bind('showEnd', restoreShowDurationFunction, self, true); popupPanoramaOverlay.set('showDuration', 1); popupPanoramaOverlay.set('hideDuration', hideDuration); popupPanoramaOverlay.set('popupMaxWidth', currentWidth); popupPanoramaOverlay.set('popupMaxHeight', currentHeight); if(popupPanoramaOverlay.get('visible')) restoreShowDurationFunction(); else popupPanoramaOverlay.set('visible', true); self.MainViewer.set('toolTipEnabled', true); }; if(!imageHD){ imageHD = popupPanoramaOverlay.get('image'); } if(!toggleImageHD && toggleImage){ toggleImageHD = toggleImage; } popupPanoramaOverlay.bind('showEnd', showEndFunction, this, true); } else { var hideEndFunction = function() { self.resumePlayers(playersPaused, audio == null || stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ self.resumeGlobalAudios(); } self.stopGlobalAudio(audio); } popupPanoramaOverlay.unbind('hideEnd', hideEndFunction, self); self.MainViewer.set('toolTipEnabled', true); }; var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ this.pauseGlobalAudios(); } this.playGlobalAudio(audio); } popupPanoramaOverlay.bind('hideEnd', hideEndFunction, this, true); } popupPanoramaOverlay.set('visible', true); },
  "shareTwitter": function(url){  window.open('https://twitter.com/intent/tweet?source=webclient&url=' + url, '_blank'); },
  "setPanoramaCameraWithSpot": function(playListItem, yaw, pitch){  var panorama = playListItem.get('media'); var newCamera = this.cloneCamera(playListItem.get('camera')); var initialPosition = newCamera.get('initialPosition'); initialPosition.set('yaw', yaw); initialPosition.set('pitch', pitch); this.startPanoramaWithCamera(panorama, newCamera); },
  "setMainMediaByIndex": function(index){  var item = undefined; if(index >= 0 && index < this.mainPlayList.get('items').length){ this.mainPlayList.set('selectedIndex', index); item = this.mainPlayList.get('items')[index]; } return item; },
  "setComponentVisibility": function(component, visible, applyAt, effect, propertyEffect, ignoreClearTimeout){  var keepVisibility = this.getKey('keepVisibility_' + component.get('id')); if(keepVisibility) return; this.unregisterKey('visibility_'+component.get('id')); var changeVisibility = function(){ if(effect && propertyEffect){ component.set(propertyEffect, effect); } component.set('visible', visible); if(component.get('class') == 'ViewerArea'){ try{ if(visible) component.restart(); else if(component.get('playbackState') == 'playing') component.pause(); } catch(e){}; } }; var effectTimeoutName = 'effectTimeout_'+component.get('id'); if(!ignoreClearTimeout && window.hasOwnProperty(effectTimeoutName)){ var effectTimeout = window[effectTimeoutName]; if(effectTimeout instanceof Array){ for(var i=0; i<effectTimeout.length; i++){ clearTimeout(effectTimeout[i]) } }else{ clearTimeout(effectTimeout); } delete window[effectTimeoutName]; } else if(visible == component.get('visible') && !ignoreClearTimeout) return; if(applyAt && applyAt > 0){ var effectTimeout = setTimeout(function(){ if(window[effectTimeoutName] instanceof Array) { var arrayTimeoutVal = window[effectTimeoutName]; var index = arrayTimeoutVal.indexOf(effectTimeout); arrayTimeoutVal.splice(index, 1); if(arrayTimeoutVal.length == 0){ delete window[effectTimeoutName]; } }else{ delete window[effectTimeoutName]; } changeVisibility(); }, applyAt); if(window.hasOwnProperty(effectTimeoutName)){ window[effectTimeoutName] = [window[effectTimeoutName], effectTimeout]; }else{ window[effectTimeoutName] = effectTimeout; } } else{ changeVisibility(); } },
  "showPopupImage": function(image, toggleImage, customWidth, customHeight, showEffect, hideEffect, closeButtonProperties, autoCloseMilliSeconds, audio, stopBackgroundAudio, loadedCallback, hideCallback){  var self = this; var closed = false; var playerClickFunction = function() { zoomImage.unbind('loaded', loadedFunction, self); hideFunction(); }; var clearAutoClose = function(){ zoomImage.unbind('click', clearAutoClose, this); if(timeoutID != undefined){ clearTimeout(timeoutID); } }; var resizeFunction = function(){ setTimeout(setCloseButtonPosition, 0); }; var loadedFunction = function(){ self.unbind('click', playerClickFunction, self); veil.set('visible', true); setCloseButtonPosition(); closeButton.set('visible', true); zoomImage.unbind('loaded', loadedFunction, this); zoomImage.bind('userInteractionStart', userInteractionStartFunction, this); zoomImage.bind('userInteractionEnd', userInteractionEndFunction, this); zoomImage.bind('resize', resizeFunction, this); timeoutID = setTimeout(timeoutFunction, 200); }; var timeoutFunction = function(){ timeoutID = undefined; if(autoCloseMilliSeconds){ var autoCloseFunction = function(){ hideFunction(); }; zoomImage.bind('click', clearAutoClose, this); timeoutID = setTimeout(autoCloseFunction, autoCloseMilliSeconds); } zoomImage.bind('backgroundClick', hideFunction, this); if(toggleImage) { zoomImage.bind('click', toggleFunction, this); zoomImage.set('imageCursor', 'hand'); } closeButton.bind('click', hideFunction, this); if(loadedCallback) loadedCallback(); }; var hideFunction = function() { self.MainViewer.set('toolTipEnabled', true); closed = true; if(timeoutID) clearTimeout(timeoutID); if (timeoutUserInteractionID) clearTimeout(timeoutUserInteractionID); if(autoCloseMilliSeconds) clearAutoClose(); if(hideCallback) hideCallback(); zoomImage.set('visible', false); if(hideEffect && hideEffect.get('duration') > 0){ hideEffect.bind('end', endEffectFunction, this); } else{ zoomImage.set('image', null); } closeButton.set('visible', false); veil.set('visible', false); self.unbind('click', playerClickFunction, self); zoomImage.unbind('backgroundClick', hideFunction, this); zoomImage.unbind('userInteractionStart', userInteractionStartFunction, this); zoomImage.unbind('userInteractionEnd', userInteractionEndFunction, this, true); zoomImage.unbind('resize', resizeFunction, this); if(toggleImage) { zoomImage.unbind('click', toggleFunction, this); zoomImage.set('cursor', 'default'); } closeButton.unbind('click', hideFunction, this); self.resumePlayers(playersPaused, audio == null || stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ self.resumeGlobalAudios(); } self.stopGlobalAudio(audio); } }; var endEffectFunction = function() { zoomImage.set('image', null); hideEffect.unbind('end', endEffectFunction, this); }; var toggleFunction = function() { zoomImage.set('image', isToggleVisible() ? image : toggleImage); }; var isToggleVisible = function() { return zoomImage.get('image') == toggleImage; }; var setCloseButtonPosition = function() { var right = zoomImage.get('actualWidth') - zoomImage.get('imageLeft') - zoomImage.get('imageWidth') + 10; var top = zoomImage.get('imageTop') + 10; if(right < 10) right = 10; if(top < 10) top = 10; closeButton.set('right', right); closeButton.set('top', top); }; var userInteractionStartFunction = function() { if(timeoutUserInteractionID){ clearTimeout(timeoutUserInteractionID); timeoutUserInteractionID = undefined; } else{ closeButton.set('visible', false); } }; var userInteractionEndFunction = function() { if(!closed){ timeoutUserInteractionID = setTimeout(userInteractionTimeoutFunction, 300); } }; var userInteractionTimeoutFunction = function() { timeoutUserInteractionID = undefined; closeButton.set('visible', true); setCloseButtonPosition(); }; this.MainViewer.set('toolTipEnabled', false); var veil = this.veilPopupPanorama; var zoomImage = this.zoomImagePopupPanorama; var closeButton = this.closeButtonPopupPanorama; if(closeButtonProperties){ for(var key in closeButtonProperties){ closeButton.set(key, closeButtonProperties[key]); } } var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ this.pauseGlobalAudios(); } this.playGlobalAudio(audio); } var timeoutID = undefined; var timeoutUserInteractionID = undefined; zoomImage.bind('loaded', loadedFunction, this); setTimeout(function(){ self.bind('click', playerClickFunction, self, false); }, 0); zoomImage.set('image', image); zoomImage.set('customWidth', customWidth); zoomImage.set('customHeight', customHeight); zoomImage.set('showEffect', showEffect); zoomImage.set('hideEffect', hideEffect); zoomImage.set('visible', true); return zoomImage; },
  "visibleComponentsIfPlayerFlagEnabled": function(components, playerFlag){  var enabled = this.get(playerFlag); for(var i in components){ components[i].set('visible', enabled); } },
  "setEndToItemIndex": function(playList, fromIndex, toIndex){  var endFunction = function(){ if(playList.get('selectedIndex') == fromIndex) playList.set('selectedIndex', toIndex); }; this.executeFunctionWhenChange(playList, fromIndex, endFunction); },
  "getCurrentPlayerWithMedia": function(media){  var playerClass = undefined; var mediaPropertyName = undefined; switch(media.get('class')) { case 'Panorama': case 'LivePanorama': case 'HDRPanorama': playerClass = 'PanoramaPlayer'; mediaPropertyName = 'panorama'; break; case 'Video360': playerClass = 'PanoramaPlayer'; mediaPropertyName = 'video'; break; case 'PhotoAlbum': playerClass = 'PhotoAlbumPlayer'; mediaPropertyName = 'photoAlbum'; break; case 'Map': playerClass = 'MapPlayer'; mediaPropertyName = 'map'; break; case 'Video': playerClass = 'VideoPlayer'; mediaPropertyName = 'video'; break; }; if(playerClass != undefined) { var players = this.getByClassName(playerClass); for(var i = 0; i<players.length; ++i){ var player = players[i]; if(player.get(mediaPropertyName) == media) { return player; } } } else { return undefined; } },
  "historyGoBack": function(playList){  var history = this.get('data')['history'][playList.get('id')]; if(history != undefined) { history.back(); } },
  "cloneCamera": function(camera){  var newCamera = this.rootPlayer.createInstance(camera.get('class')); newCamera.set('id', camera.get('id') + '_copy'); newCamera.set('idleSequence', camera.get('initialSequence')); return newCamera; },
  "getPixels": function(value){  var result = new RegExp('((\\+|\\-)?\\d+(\\.\\d*)?)(px|vw|vh|vmin|vmax)?', 'i').exec(value); if (result == undefined) { return 0; } var num = parseFloat(result[1]); var unit = result[4]; var vw = this.rootPlayer.get('actualWidth') / 100; var vh = this.rootPlayer.get('actualHeight') / 100; switch(unit) { case 'vw': return num * vw; case 'vh': return num * vh; case 'vmin': return num * Math.min(vw, vh); case 'vmax': return num * Math.max(vw, vh); default: return num; } },
  "existsKey": function(key){  return key in window; },
  "pauseGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios){ audio = audios[audio.get('id')]; } if(audio.get('state') == 'playing') audio.pause(); },
  "init": function(){  if(!Object.hasOwnProperty('values')) { Object.values = function(o){ return Object.keys(o).map(function(e) { return o[e]; }); }; } var history = this.get('data')['history']; var playListChangeFunc = function(e){ var playList = e.source; var index = playList.get('selectedIndex'); if(index < 0) return; var id = playList.get('id'); if(!history.hasOwnProperty(id)) history[id] = new HistoryData(playList); history[id].add(index); }; var playLists = this.getByClassName('PlayList'); for(var i = 0, count = playLists.length; i<count; ++i) { var playList = playLists[i]; playList.bind('change', playListChangeFunc, this); } },
  "getMediaHeight": function(media){  switch(media.get('class')){ case 'Video360': var res = media.get('video'); if(res instanceof Array){ var maxH=0; for(var i=0; i<res.length; i++){ var r = res[i]; if(r.get('height') > maxH) maxH = r.get('height'); } return maxH; }else{ return r.get('height') } default: return media.get('height'); } },
  "executeFunctionWhenChange": function(playList, index, endFunction, changeFunction){  var endObject = undefined; var changePlayListFunction = function(event){ if(event.data.previousSelectedIndex == index){ if(changeFunction) changeFunction.call(this); if(endFunction && endObject) endObject.unbind('end', endFunction, this); playList.unbind('change', changePlayListFunction, this); } }; if(endFunction){ var playListItem = playList.get('items')[index]; if(playListItem.get('class') == 'PanoramaPlayListItem'){ var camera = playListItem.get('camera'); if(camera != undefined) endObject = camera.get('initialSequence'); if(endObject == undefined) endObject = camera.get('idleSequence'); } else{ endObject = playListItem.get('media'); } if(endObject){ endObject.bind('end', endFunction, this); } } playList.bind('change', changePlayListFunction, this); },
  "setMediaBehaviour": function(playList, index, mediaDispatcher){  var self = this; var stateChangeFunction = function(event){ if(event.data.state == 'stopped'){ dispose.call(this, true); } }; var onBeginFunction = function() { item.unbind('begin', onBeginFunction, self); var media = item.get('media'); if(media.get('class') != 'Panorama' || (media.get('camera') != undefined && media.get('camera').get('initialSequence') != undefined)){ player.bind('stateChange', stateChangeFunction, self); } }; var changeFunction = function(){ var index = playListDispatcher.get('selectedIndex'); if(index != -1){ indexDispatcher = index; dispose.call(this, false); } }; var disposeCallback = function(){ dispose.call(this, false); }; var dispose = function(forceDispose){ if(!playListDispatcher) return; var media = item.get('media'); if((media.get('class') == 'Video360' || media.get('class') == 'Video') && media.get('loop') == true && !forceDispose) return; playList.set('selectedIndex', -1); if(panoramaSequence && panoramaSequenceIndex != -1){ if(panoramaSequence) { if(panoramaSequenceIndex > 0 && panoramaSequence.get('movements')[panoramaSequenceIndex-1].get('class') == 'TargetPanoramaCameraMovement'){ var initialPosition = camera.get('initialPosition'); var oldYaw = initialPosition.get('yaw'); var oldPitch = initialPosition.get('pitch'); var oldHfov = initialPosition.get('hfov'); var previousMovement = panoramaSequence.get('movements')[panoramaSequenceIndex-1]; initialPosition.set('yaw', previousMovement.get('targetYaw')); initialPosition.set('pitch', previousMovement.get('targetPitch')); initialPosition.set('hfov', previousMovement.get('targetHfov')); var restoreInitialPositionFunction = function(event){ initialPosition.set('yaw', oldYaw); initialPosition.set('pitch', oldPitch); initialPosition.set('hfov', oldHfov); itemDispatcher.unbind('end', restoreInitialPositionFunction, this); }; itemDispatcher.bind('end', restoreInitialPositionFunction, this); } panoramaSequence.set('movementIndex', panoramaSequenceIndex); } } if(player){ item.unbind('begin', onBeginFunction, this); player.unbind('stateChange', stateChangeFunction, this); for(var i = 0; i<buttons.length; ++i) { buttons[i].unbind('click', disposeCallback, this); } } if(sameViewerArea){ var currentMedia = this.getMediaFromPlayer(player); if(currentMedia == undefined || currentMedia == item.get('media')){ playListDispatcher.set('selectedIndex', indexDispatcher); } if(playList != playListDispatcher) playListDispatcher.unbind('change', changeFunction, this); } else{ viewerArea.set('visible', viewerVisibility); } playListDispatcher = undefined; }; var mediaDispatcherByParam = mediaDispatcher != undefined; if(!mediaDispatcher){ var currentIndex = playList.get('selectedIndex'); var currentPlayer = (currentIndex != -1) ? playList.get('items')[playList.get('selectedIndex')].get('player') : this.getActivePlayerWithViewer(this.MainViewer); if(currentPlayer) { mediaDispatcher = this.getMediaFromPlayer(currentPlayer); } } var playListDispatcher = mediaDispatcher ? this.getPlayListWithMedia(mediaDispatcher, true) : undefined; if(!playListDispatcher){ playList.set('selectedIndex', index); return; } var indexDispatcher = playListDispatcher.get('selectedIndex'); if(playList.get('selectedIndex') == index || indexDispatcher == -1){ return; } var item = playList.get('items')[index]; var itemDispatcher = playListDispatcher.get('items')[indexDispatcher]; var player = item.get('player'); var viewerArea = player.get('viewerArea'); var viewerVisibility = viewerArea.get('visible'); var sameViewerArea = viewerArea == itemDispatcher.get('player').get('viewerArea'); if(sameViewerArea){ if(playList != playListDispatcher){ playListDispatcher.set('selectedIndex', -1); playListDispatcher.bind('change', changeFunction, this); } } else{ viewerArea.set('visible', true); } var panoramaSequenceIndex = -1; var panoramaSequence = undefined; var camera = itemDispatcher.get('camera'); if(camera){ panoramaSequence = camera.get('initialSequence'); if(panoramaSequence) { panoramaSequenceIndex = panoramaSequence.get('movementIndex'); } } playList.set('selectedIndex', index); var buttons = []; var addButtons = function(property){ var value = player.get(property); if(value == undefined) return; if(Array.isArray(value)) buttons = buttons.concat(value); else buttons.push(value); }; addButtons('buttonStop'); for(var i = 0; i<buttons.length; ++i) { buttons[i].bind('click', disposeCallback, this); } if(player != itemDispatcher.get('player') || !mediaDispatcherByParam){ item.bind('begin', onBeginFunction, self); } this.executeFunctionWhenChange(playList, index, disposeCallback); },
  "getPlayListItemByMedia": function(playList, media){  var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ var item = items[j]; if(item.get('media') == media) return item; } return undefined; },
  "getPlayListWithMedia": function(media, onlySelected){  var playLists = this.getByClassName('PlayList'); for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; if(onlySelected && playList.get('selectedIndex') == -1) continue; if(this.getPlayListItemByMedia(playList, media) != undefined) return playList; } return undefined; },
  "getOverlays": function(media){  switch(media.get('class')){ case 'Panorama': var overlays = media.get('overlays').concat() || []; var frames = media.get('frames'); for(var j = 0; j<frames.length; ++j){ overlays = overlays.concat(frames[j].get('overlays') || []); } return overlays; case 'Video360': case 'Map': return media.get('overlays') || []; default: return []; } },
  "getPlayListItems": function(media, player){  var itemClass = (function() { switch(media.get('class')) { case 'Panorama': case 'LivePanorama': case 'HDRPanorama': return 'PanoramaPlayListItem'; case 'Video360': return 'Video360PlayListItem'; case 'PhotoAlbum': return 'PhotoAlbumPlayListItem'; case 'Map': return 'MapPlayListItem'; case 'Video': return 'VideoPlayListItem'; } })(); if (itemClass != undefined) { var items = this.getByClassName(itemClass); for (var i = items.length-1; i>=0; --i) { var item = items[i]; if(item.get('media') != media || (player != undefined && item.get('player') != player)) { items.splice(i, 1); } } return items; } else { return []; } },
  "playAudioList": function(audios){  if(audios.length == 0) return; var currentAudioCount = -1; var currentAudio; var playGlobalAudioFunction = this.playGlobalAudio; var playNext = function(){ if(++currentAudioCount >= audios.length) currentAudioCount = 0; currentAudio = audios[currentAudioCount]; playGlobalAudioFunction(currentAudio, playNext); }; playNext(); },
  "pauseGlobalAudiosWhilePlayItem": function(playList, index, exclude){  var self = this; var item = playList.get('items')[index]; var media = item.get('media'); var player = item.get('player'); var caller = media.get('id'); var endFunc = function(){ if(playList.get('selectedIndex') != index) { if(hasState){ player.unbind('stateChange', stateChangeFunc, self); } self.resumeGlobalAudios(caller); } }; var stateChangeFunc = function(event){ var state = event.data.state; if(state == 'stopped'){ this.resumeGlobalAudios(caller); } else if(state == 'playing'){ this.pauseGlobalAudios(caller, exclude); } }; var mediaClass = media.get('class'); var hasState = mediaClass == 'Video360' || mediaClass == 'Video'; if(hasState){ player.bind('stateChange', stateChangeFunc, this); } this.pauseGlobalAudios(caller, exclude); this.executeFunctionWhenChange(playList, index, endFunc, endFunc); },
  "getGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios != undefined && audio.get('id') in audios){ audio = audios[audio.get('id')]; } return audio; },
  "shareFacebook": function(url){  window.open('https://www.facebook.com/sharer/sharer.php?u=' + url, '_blank'); },
  "setMapLocation": function(panoramaPlayListItem, mapPlayer){  var resetFunction = function(){ panoramaPlayListItem.unbind('stop', resetFunction, this); player.set('mapPlayer', null); }; panoramaPlayListItem.bind('stop', resetFunction, this); var player = panoramaPlayListItem.get('player'); player.set('mapPlayer', mapPlayer); },
  "resumePlayers": function(players, onlyResumeCameraIfPanorama){  for(var i = 0; i<players.length; ++i){ var player = players[i]; if(onlyResumeCameraIfPanorama && player.get('class') == 'PanoramaPlayer' && typeof player.get('video') === 'undefined'){ player.resumeCamera(); } else{ player.play(); } } },
  "getKey": function(key){  return window[key]; },
  "setCameraSameSpotAsMedia": function(camera, media){  var player = this.getCurrentPlayerWithMedia(media); if(player != undefined) { var position = camera.get('initialPosition'); position.set('yaw', player.get('yaw')); position.set('pitch', player.get('pitch')); position.set('hfov', player.get('hfov')); } },
  "showPopupMedia": function(w, media, playList, popupMaxWidth, popupMaxHeight, autoCloseWhenFinished, stopAudios){  var self = this; var closeFunction = function(){ playList.set('selectedIndex', -1); self.MainViewer.set('toolTipEnabled', true); if(stopAudios) { self.resumeGlobalAudios(); } this.resumePlayers(playersPaused, !stopAudios); if(isVideo) { this.unbind('resize', resizeFunction, this); } w.unbind('close', closeFunction, this); }; var endFunction = function(){ w.hide(); }; var resizeFunction = function(){ var getWinValue = function(property){ return w.get(property) || 0; }; var parentWidth = self.get('actualWidth'); var parentHeight = self.get('actualHeight'); var mediaWidth = self.getMediaWidth(media); var mediaHeight = self.getMediaHeight(media); var popupMaxWidthNumber = parseFloat(popupMaxWidth) / 100; var popupMaxHeightNumber = parseFloat(popupMaxHeight) / 100; var windowWidth = popupMaxWidthNumber * parentWidth; var windowHeight = popupMaxHeightNumber * parentHeight; var footerHeight = getWinValue('footerHeight'); var headerHeight = getWinValue('headerHeight'); if(!headerHeight) { var closeButtonHeight = getWinValue('closeButtonIconHeight') + getWinValue('closeButtonPaddingTop') + getWinValue('closeButtonPaddingBottom'); var titleHeight = self.getPixels(getWinValue('titleFontSize')) + getWinValue('titlePaddingTop') + getWinValue('titlePaddingBottom'); headerHeight = closeButtonHeight > titleHeight ? closeButtonHeight : titleHeight; headerHeight += getWinValue('headerPaddingTop') + getWinValue('headerPaddingBottom'); } var contentWindowWidth = windowWidth - getWinValue('bodyPaddingLeft') - getWinValue('bodyPaddingRight') - getWinValue('paddingLeft') - getWinValue('paddingRight'); var contentWindowHeight = windowHeight - headerHeight - footerHeight - getWinValue('bodyPaddingTop') - getWinValue('bodyPaddingBottom') - getWinValue('paddingTop') - getWinValue('paddingBottom'); var parentAspectRatio = contentWindowWidth / contentWindowHeight; var mediaAspectRatio = mediaWidth / mediaHeight; if(parentAspectRatio > mediaAspectRatio) { windowWidth = contentWindowHeight * mediaAspectRatio + getWinValue('bodyPaddingLeft') + getWinValue('bodyPaddingRight') + getWinValue('paddingLeft') + getWinValue('paddingRight'); } else { windowHeight = contentWindowWidth / mediaAspectRatio + headerHeight + footerHeight + getWinValue('bodyPaddingTop') + getWinValue('bodyPaddingBottom') + getWinValue('paddingTop') + getWinValue('paddingBottom'); } if(windowWidth > parentWidth * popupMaxWidthNumber) { windowWidth = parentWidth * popupMaxWidthNumber; } if(windowHeight > parentHeight * popupMaxHeightNumber) { windowHeight = parentHeight * popupMaxHeightNumber; } w.set('width', windowWidth); w.set('height', windowHeight); w.set('x', (parentWidth - getWinValue('actualWidth')) * 0.5); w.set('y', (parentHeight - getWinValue('actualHeight')) * 0.5); }; if(autoCloseWhenFinished){ this.executeFunctionWhenChange(playList, 0, endFunction); } var mediaClass = media.get('class'); var isVideo = mediaClass == 'Video' || mediaClass == 'Video360'; playList.set('selectedIndex', 0); if(isVideo){ this.bind('resize', resizeFunction, this); resizeFunction(); playList.get('items')[0].get('player').play(); } else { w.set('width', popupMaxWidth); w.set('height', popupMaxHeight); } this.MainViewer.set('toolTipEnabled', false); if(stopAudios) { this.pauseGlobalAudios(); } var playersPaused = this.pauseCurrentPlayers(!stopAudios); w.bind('close', closeFunction, this); w.show(this, true); },
  "setStartTimeVideoSync": function(video, player){  this.setStartTimeVideo(video, player.get('currentTime')); },
  "pauseCurrentPlayers": function(onlyPauseCameraIfPanorama){  var players = this.getCurrentPlayers(); var i = players.length; while(i-- > 0){ var player = players[i]; if(player.get('state') == 'playing') { if(onlyPauseCameraIfPanorama && player.get('class') == 'PanoramaPlayer' && typeof player.get('video') === 'undefined'){ player.pauseCamera(); } else { player.pause(); } } else { players.splice(i, 1); } } return players; },
  "showWindow": function(w, autoCloseMilliSeconds, containsAudio){  if(w.get('visible') == true){ return; } var closeFunction = function(){ clearAutoClose(); this.resumePlayers(playersPaused, !containsAudio); w.unbind('close', closeFunction, this); }; var clearAutoClose = function(){ w.unbind('click', clearAutoClose, this); if(timeoutID != undefined){ clearTimeout(timeoutID); } }; var timeoutID = undefined; if(autoCloseMilliSeconds){ var autoCloseFunction = function(){ w.hide(); }; w.bind('click', clearAutoClose, this); timeoutID = setTimeout(autoCloseFunction, autoCloseMilliSeconds); } var playersPaused = this.pauseCurrentPlayers(!containsAudio); w.bind('close', closeFunction, this); w.show(this, true); },
  "triggerOverlay": function(overlay, eventName){  if(overlay.get('areas') != undefined) { var areas = overlay.get('areas'); for(var i = 0; i<areas.length; ++i) { areas[i].trigger(eventName); } } else { overlay.trigger(eventName); } },
  "setOverlayBehaviour": function(overlay, media, action){  var executeFunc = function() { switch(action){ case 'triggerClick': this.triggerOverlay(overlay, 'click'); break; case 'stop': case 'play': case 'pause': overlay[action](); break; case 'togglePlayPause': case 'togglePlayStop': if(overlay.get('state') == 'playing') overlay[action == 'togglePlayPause' ? 'pause' : 'stop'](); else overlay.play(); break; } if(window.overlaysDispatched == undefined) window.overlaysDispatched = {}; var id = overlay.get('id'); window.overlaysDispatched[id] = true; setTimeout(function(){ delete window.overlaysDispatched[id]; }, 2000); }; if(window.overlaysDispatched != undefined && overlay.get('id') in window.overlaysDispatched) return; var playList = this.getPlayListWithMedia(media, true); if(playList != undefined){ var item = this.getPlayListItemByMedia(playList, media); if(playList.get('items').indexOf(item) != playList.get('selectedIndex')){ var beginFunc = function(e){ item.unbind('begin', beginFunc, this); executeFunc.call(this); }; item.bind('begin', beginFunc, this); return; } } executeFunc.call(this); },
  "playGlobalAudioWhilePlay": function(playList, index, audio, endCallback){  var changeFunction = function(event){ if(event.data.previousSelectedIndex == index){ this.stopGlobalAudio(audio); if(isPanorama) { var media = playListItem.get('media'); var audios = media.get('audios'); audios.splice(audios.indexOf(audio), 1); media.set('audios', audios); } playList.unbind('change', changeFunction, this); if(endCallback) endCallback(); } }; var audios = window.currentGlobalAudios; if(audios && audio.get('id') in audios){ audio = audios[audio.get('id')]; if(audio.get('state') != 'playing'){ audio.play(); } return audio; } playList.bind('change', changeFunction, this); var playListItem = playList.get('items')[index]; var isPanorama = playListItem.get('class') == 'PanoramaPlayListItem'; if(isPanorama) { var media = playListItem.get('media'); var audios = (media.get('audios') || []).slice(); if(audio.get('class') == 'MediaAudio') { var panoramaAudio = this.rootPlayer.createInstance('PanoramaAudio'); panoramaAudio.set('autoplay', false); panoramaAudio.set('audio', audio.get('audio')); panoramaAudio.set('loop', audio.get('loop')); panoramaAudio.set('id', audio.get('id')); var stateChangeFunctions = audio.getBindings('stateChange'); for(var i = 0; i<stateChangeFunctions.length; ++i){ var f = stateChangeFunctions[i]; if(typeof f == 'string') f = new Function('event', f); panoramaAudio.bind('stateChange', f, this); } audio = panoramaAudio; } audios.push(audio); media.set('audios', audios); } return this.playGlobalAudio(audio, endCallback); },
  "getComponentByName": function(name){  var list = this.getByClassName('UIComponent'); for(var i = 0, count = list.length; i<count; ++i){ var component = list[i]; var data = component.get('data'); if(data != undefined && data.name == name){ return component; } } return undefined; },
  "historyGoForward": function(playList){  var history = this.get('data')['history'][playList.get('id')]; if(history != undefined) { history.forward(); } },
  "syncPlaylists": function(playLists){  var changeToMedia = function(media, playListDispatched){ for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; if(playList != playListDispatched){ var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ if(items[j].get('media') == media){ if(playList.get('selectedIndex') != j){ playList.set('selectedIndex', j); } break; } } } } }; var changeFunction = function(event){ var playListDispatched = event.source; var selectedIndex = playListDispatched.get('selectedIndex'); if(selectedIndex < 0) return; var media = playListDispatched.get('items')[selectedIndex].get('media'); changeToMedia(media, playListDispatched); }; var mapPlayerChangeFunction = function(event){ var panoramaMapLocation = event.source.get('panoramaMapLocation'); if(panoramaMapLocation){ var map = panoramaMapLocation.get('map'); changeToMedia(map); } }; for(var i = 0, count = playLists.length; i<count; ++i){ playLists[i].bind('change', changeFunction, this); } var mapPlayers = this.getByClassName('MapPlayer'); for(var i = 0, count = mapPlayers.length; i<count; ++i){ mapPlayers[i].bind('panoramaMapLocation_change', mapPlayerChangeFunction, this); } },
  "autotriggerAtStart": function(playList, callback, once){  var onChange = function(event){ callback(); if(once == true) playList.unbind('change', onChange, this); }; playList.bind('change', onChange, this); },
  "stopAndGoCamera": function(camera, ms){  var sequence = camera.get('initialSequence'); sequence.pause(); var timeoutFunction = function(){ sequence.play(); }; setTimeout(timeoutFunction, ms); },
  "unregisterKey": function(key){  delete window[key]; },
  "playGlobalAudio": function(audio, endCallback){  var endFunction = function(){ audio.unbind('end', endFunction, this); this.stopGlobalAudio(audio); if(endCallback) endCallback(); }; audio = this.getGlobalAudio(audio); var audios = window.currentGlobalAudios; if(!audios){ audios = window.currentGlobalAudios = {}; } audios[audio.get('id')] = audio; if(audio.get('state') == 'playing'){ return audio; } if(!audio.get('loop')){ audio.bind('end', endFunction, this); } audio.play(); return audio; },
  "initGA": function(){  var sendFunc = function(category, event, label) { ga('send', 'event', category, event, label); }; var media = this.getByClassName('Panorama'); media = media.concat(this.getByClassName('Video360')); media = media.concat(this.getByClassName('Map')); for(var i = 0, countI = media.length; i<countI; ++i){ var m = media[i]; var mediaLabel = m.get('label'); var overlays = this.getOverlays(m); for(var j = 0, countJ = overlays.length; j<countJ; ++j){ var overlay = overlays[j]; var overlayLabel = overlay.get('data') != undefined ? mediaLabel + ' - ' + overlay.get('data')['label'] : mediaLabel; switch(overlay.get('class')) { case 'HotspotPanoramaOverlay': case 'HotspotMapOverlay': var areas = overlay.get('areas'); for (var z = 0; z<areas.length; ++z) { areas[z].bind('click', sendFunc.bind(this, 'Hotspot', 'click', overlayLabel), this); } break; case 'CeilingCapPanoramaOverlay': case 'TripodCapPanoramaOverlay': overlay.bind('click', sendFunc.bind(this, 'Cap', 'click', overlayLabel), this); break; } } } var components = this.getByClassName('Button'); components = components.concat(this.getByClassName('IconButton')); for(var i = 0, countI = components.length; i<countI; ++i){ var c = components[i]; var componentLabel = c.get('data')['name']; c.bind('click', sendFunc.bind(this, 'Skin', 'click', componentLabel), this); } var items = this.getByClassName('PlayListItem'); var media2Item = {}; for(var i = 0, countI = items.length; i<countI; ++i) { var item = items[i]; var media = item.get('media'); if(!(media.get('id') in media2Item)) { item.bind('begin', sendFunc.bind(this, 'Media', 'play', media.get('label')), this); media2Item[media.get('id')] = item; } } },
  "showComponentsWhileMouseOver": function(parentComponent, components, durationVisibleWhileOut){  var setVisibility = function(visible){ for(var i = 0, length = components.length; i<length; i++){ var component = components[i]; if(component.get('class') == 'HTMLText' && (component.get('html') == '' || component.get('html') == undefined)) { continue; } component.set('visible', visible); } }; if (this.rootPlayer.get('touchDevice') == true){ setVisibility(true); } else { var timeoutID = -1; var rollOverFunction = function(){ setVisibility(true); if(timeoutID >= 0) clearTimeout(timeoutID); parentComponent.unbind('rollOver', rollOverFunction, this); parentComponent.bind('rollOut', rollOutFunction, this); }; var rollOutFunction = function(){ var timeoutFunction = function(){ setVisibility(false); parentComponent.unbind('rollOver', rollOverFunction, this); }; parentComponent.unbind('rollOut', rollOutFunction, this); parentComponent.bind('rollOver', rollOverFunction, this); timeoutID = setTimeout(timeoutFunction, durationVisibleWhileOut); }; parentComponent.bind('rollOver', rollOverFunction, this); } },
  "registerKey": function(key, value){  window[key] = value; },
  "getCurrentPlayers": function(){  var players = this.getByClassName('PanoramaPlayer'); players = players.concat(this.getByClassName('VideoPlayer')); players = players.concat(this.getByClassName('Video360Player')); players = players.concat(this.getByClassName('PhotoAlbumPlayer')); return players; },
  "keepComponentVisibility": function(component, keep){  var key = 'keepVisibility_' + component.get('id'); var value = this.getKey(key); if(value == undefined && keep) { this.registerKey(key, keep); } else if(value != undefined && !keep) { this.unregisterKey(key); } },
  "isCardboardViewMode": function(){  var players = this.getByClassName('PanoramaPlayer'); return players.length > 0 && players[0].get('viewMode') == 'cardboard'; },
  "updateMediaLabelFromPlayList": function(playList, htmlText, playListItemStopToDispose){  var changeFunction = function(){ var index = playList.get('selectedIndex'); if(index >= 0){ var beginFunction = function(){ playListItem.unbind('begin', beginFunction); setMediaLabel(index); }; var setMediaLabel = function(index){ var media = playListItem.get('media'); var text = media.get('data'); if(!text) text = media.get('label'); setHtml(text); }; var setHtml = function(text){ if(text !== undefined) { htmlText.set('html', '<div style=\"text-align:left\"><SPAN STYLE=\"color:#FFFFFF;font-size:12px;font-family:Verdana\"><span color=\"white\" font-family=\"Verdana\" font-size=\"12px\">' + text + '</SPAN></div>'); } else { htmlText.set('html', ''); } }; var playListItem = playList.get('items')[index]; if(htmlText.get('html')){ setHtml('Loading...'); playListItem.bind('begin', beginFunction); } else{ setMediaLabel(index); } } }; var disposeFunction = function(){ htmlText.set('html', undefined); playList.unbind('change', changeFunction, this); playListItemStopToDispose.unbind('stop', disposeFunction, this); }; if(playListItemStopToDispose){ playListItemStopToDispose.bind('stop', disposeFunction, this); } playList.bind('change', changeFunction, this); changeFunction(); },
  "shareWhatsapp": function(url){  window.open('https://api.whatsapp.com/send/?text=' + encodeURIComponent(url), '_blank'); },
  "loopAlbum": function(playList, index){  var playListItem = playList.get('items')[index]; var player = playListItem.get('player'); var loopFunction = function(){ player.play(); }; this.executeFunctionWhenChange(playList, index, loopFunction); },
  "showPopupPanoramaVideoOverlay": function(popupPanoramaOverlay, closeButtonProperties, stopAudios){  var self = this; var showEndFunction = function() { popupPanoramaOverlay.unbind('showEnd', showEndFunction); closeButton.bind('click', hideFunction, this); setCloseButtonPosition(); closeButton.set('visible', true); }; var endFunction = function() { if(!popupPanoramaOverlay.get('loop')) hideFunction(); }; var hideFunction = function() { self.MainViewer.set('toolTipEnabled', true); popupPanoramaOverlay.set('visible', false); closeButton.set('visible', false); closeButton.unbind('click', hideFunction, self); popupPanoramaOverlay.unbind('end', endFunction, self); popupPanoramaOverlay.unbind('hideEnd', hideFunction, self, true); self.resumePlayers(playersPaused, true); if(stopAudios) { self.resumeGlobalAudios(); } }; var setCloseButtonPosition = function() { var right = 10; var top = 10; closeButton.set('right', right); closeButton.set('top', top); }; this.MainViewer.set('toolTipEnabled', false); var closeButton = this.closeButtonPopupPanorama; if(closeButtonProperties){ for(var key in closeButtonProperties){ closeButton.set(key, closeButtonProperties[key]); } } var playersPaused = this.pauseCurrentPlayers(true); if(stopAudios) { this.pauseGlobalAudios(); } popupPanoramaOverlay.bind('end', endFunction, this, true); popupPanoramaOverlay.bind('showEnd', showEndFunction, this, true); popupPanoramaOverlay.bind('hideEnd', hideFunction, this, true); popupPanoramaOverlay.set('visible', true); },
  "getMediaWidth": function(media){  switch(media.get('class')){ case 'Video360': var res = media.get('video'); if(res instanceof Array){ var maxW=0; for(var i=0; i<res.length; i++){ var r = res[i]; if(r.get('width') > maxW) maxW = r.get('width'); } return maxW; }else{ return r.get('width') } default: return media.get('width'); } },
  "getActivePlayerWithViewer": function(viewerArea){  var players = this.getByClassName('PanoramaPlayer'); players = players.concat(this.getByClassName('VideoPlayer')); players = players.concat(this.getByClassName('Video360Player')); players = players.concat(this.getByClassName('PhotoAlbumPlayer')); players = players.concat(this.getByClassName('MapPlayer')); var i = players.length; while(i-- > 0){ var player = players[i]; if(player.get('viewerArea') == viewerArea) { var playerClass = player.get('class'); if(playerClass == 'PanoramaPlayer' && (player.get('panorama') != undefined || player.get('video') != undefined)) return player; else if((playerClass == 'VideoPlayer' || playerClass == 'Video360Player') && player.get('video') != undefined) return player; else if(playerClass == 'PhotoAlbumPlayer' && player.get('photoAlbum') != undefined) return player; else if(playerClass == 'MapPlayer' && player.get('map') != undefined) return player; } } return undefined; },
  "openLink": function(url, name){  if(url == location.href) { return; } var isElectron = (window && window.process && window.process.versions && window.process.versions['electron']) || (navigator && navigator.userAgent && navigator.userAgent.indexOf('Electron') >= 0); if (name == '_blank' && isElectron) { if (url.startsWith('/')) { var r = window.location.href.split('/'); r.pop(); url = r.join('/') + url; } var extension = url.split('.').pop().toLowerCase(); if(extension != 'pdf' || url.startsWith('file://')) { var shell = window.require('electron').shell; shell.openExternal(url); } else { window.open(url, name); } } else if(isElectron && (name == '_top' || name == '_self')) { window.location = url; } else { var newWindow = window.open(url, name); newWindow.focus(); } }
 },
 "children": [
  "this.MainViewer",
  "this.Container_0C5F33A8_3BA0_A6FF_41C3_2A6652E2CE94",
  "this.Container_0A760F11_3BA1_BFAE_41CD_32268FCAF8B4",
  "this.Container_3BC21CE4_2DFA_DDD9_41B4_83EF3C2B9F70",
  "this.Container_062AB830_1140_E215_41AF_6C9D65345420",
  "this.Container_39DE87B1_0C06_62AF_417B_8CB0FB5C9D15",
  "this.Container_221B1648_0C06_E5FD_417F_E6FCCCB4A6D7",
  "this.Container_2A1A5C4D_0D3B_DFF0_41A9_8FC811D03C8E",
  "this.Container_06C41BA5_1140_A63F_41AE_B0CBD78DEFDC"
 ],
 "id": "rootPlayer",
 "buttonToggleFullscreen": "this.Button_4CF1FD24_5A86_3DF2_41B3_7CDBA2E3D44A",
 "backgroundPreloadEnabled": true,
 "defaultVRPointer": "laser",
 "start": "this.init(); this.visibleComponentsIfPlayerFlagEnabled([this.Button_485BFF41_598E_3DB2_41A9_33F36E014467], 'gyroscopeAvailable'); this.syncPlaylists([this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist,this.mainPlayList]); if(!this.get('fullscreenAvailable')) { [this.Button_4CF1FD24_5A86_3DF2_41B3_7CDBA2E3D44A].forEach(function(component) { component.set('visible', false); }) }",
 "paddingLeft": 0,
 "borderSize": 0,
 "downloadEnabled": false,
 "scrollBarColor": "#000000",
 "creationPolicy": "inAdvance",
 "width": "100%",
 "minHeight": 20,
 "borderRadius": 0,
 "overflow": "visible",
 "paddingRight": 0,
 "propagateClick": true,
 "horizontalAlign": "left",
 "minWidth": 20,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "desktopMipmappingEnabled": false,
 "height": "100%",
 "definitions": [{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 0,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "panorama_26B6FC37_2C4A_7CA7_41BE_C6265F38D480_camera",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 0,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "panorama_26B73861_2C4A_44DB_4199_31BC46CA7F25_camera",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -158.9,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "camera_135B8686_3712_5BA6_41CA_6E2A1DF5D6EA",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 96.71,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "camera_1393F61C_3712_5AAB_41C7_C71C58D297D7",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 57.43,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "camera_1338C6C8_3712_5BAA_41BD_AB4FC3FC5101",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 18.26,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "camera_1386D648_3712_5AAA_41B3_9C26F9BEDC62",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "hfovMin": "135%",
 "hfov": 360,
 "label": "2ndFloor",
 "id": "panorama_271A82F5_2C4A_C5BB_41C0_FD507DB02B43",
 "pitch": 0,
 "hfovMax": 130,
 "frames": [
  {
   "front": {
    "levels": [
     {
      "url": "media/panorama_271A82F5_2C4A_C5BB_41C0_FD507DB02B43_0/f/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 2048,
      "colCount": 4,
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_271A82F5_2C4A_C5BB_41C0_FD507DB02B43_0/f/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_271A82F5_2C4A_C5BB_41C0_FD507DB02B43_0/f/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "top": {
    "levels": [
     {
      "url": "media/panorama_271A82F5_2C4A_C5BB_41C0_FD507DB02B43_0/u/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 2048,
      "colCount": 4,
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_271A82F5_2C4A_C5BB_41C0_FD507DB02B43_0/u/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_271A82F5_2C4A_C5BB_41C0_FD507DB02B43_0/u/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "right": {
    "levels": [
     {
      "url": "media/panorama_271A82F5_2C4A_C5BB_41C0_FD507DB02B43_0/r/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 2048,
      "colCount": 4,
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_271A82F5_2C4A_C5BB_41C0_FD507DB02B43_0/r/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_271A82F5_2C4A_C5BB_41C0_FD507DB02B43_0/r/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "class": "CubicPanoramaFrame",
   "back": {
    "levels": [
     {
      "url": "media/panorama_271A82F5_2C4A_C5BB_41C0_FD507DB02B43_0/b/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 2048,
      "colCount": 4,
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_271A82F5_2C4A_C5BB_41C0_FD507DB02B43_0/b/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_271A82F5_2C4A_C5BB_41C0_FD507DB02B43_0/b/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "bottom": {
    "levels": [
     {
      "url": "media/panorama_271A82F5_2C4A_C5BB_41C0_FD507DB02B43_0/d/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 2048,
      "colCount": 4,
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_271A82F5_2C4A_C5BB_41C0_FD507DB02B43_0/d/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_271A82F5_2C4A_C5BB_41C0_FD507DB02B43_0/d/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "left": {
    "levels": [
     {
      "url": "media/panorama_271A82F5_2C4A_C5BB_41C0_FD507DB02B43_0/l/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 2048,
      "colCount": 4,
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_271A82F5_2C4A_C5BB_41C0_FD507DB02B43_0/l/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_271A82F5_2C4A_C5BB_41C0_FD507DB02B43_0/l/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "thumbnailUrl": "media/panorama_271A82F5_2C4A_C5BB_41C0_FD507DB02B43_t.jpg"
  }
 ],
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_26B73861_2C4A_44DB_4199_31BC46CA7F25",
   "yaw": -10.74,
   "distance": 1,
   "backwardYaw": 3.47,
   "class": "AdjacentPanorama"
  }
 ],
 "thumbnailUrl": "media/panorama_271A82F5_2C4A_C5BB_41C0_FD507DB02B43_t.jpg",
 "vfov": 180,
 "class": "Panorama",
 "overlays": [
  "this.overlay_3DC7D148_2C5A_44E9_41B2_0167037F23B5"
 ],
 "partial": false
},
{
 "hfovMin": "135%",
 "hfov": 360,
 "label": "2ndFloorEntrance",
 "id": "panorama_26B6E15D_2C4A_44EA_41C0_85CFF7FB25FE",
 "pitch": 0,
 "hfovMax": 130,
 "frames": [
  {
   "front": {
    "levels": [
     {
      "url": "media/panorama_26B6E15D_2C4A_44EA_41C0_85CFF7FB25FE_0/f/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 2048,
      "colCount": 4,
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_26B6E15D_2C4A_44EA_41C0_85CFF7FB25FE_0/f/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_26B6E15D_2C4A_44EA_41C0_85CFF7FB25FE_0/f/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "top": {
    "levels": [
     {
      "url": "media/panorama_26B6E15D_2C4A_44EA_41C0_85CFF7FB25FE_0/u/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 2048,
      "colCount": 4,
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_26B6E15D_2C4A_44EA_41C0_85CFF7FB25FE_0/u/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_26B6E15D_2C4A_44EA_41C0_85CFF7FB25FE_0/u/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "right": {
    "levels": [
     {
      "url": "media/panorama_26B6E15D_2C4A_44EA_41C0_85CFF7FB25FE_0/r/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 2048,
      "colCount": 4,
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_26B6E15D_2C4A_44EA_41C0_85CFF7FB25FE_0/r/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_26B6E15D_2C4A_44EA_41C0_85CFF7FB25FE_0/r/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "class": "CubicPanoramaFrame",
   "back": {
    "levels": [
     {
      "url": "media/panorama_26B6E15D_2C4A_44EA_41C0_85CFF7FB25FE_0/b/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 2048,
      "colCount": 4,
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_26B6E15D_2C4A_44EA_41C0_85CFF7FB25FE_0/b/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_26B6E15D_2C4A_44EA_41C0_85CFF7FB25FE_0/b/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "bottom": {
    "levels": [
     {
      "url": "media/panorama_26B6E15D_2C4A_44EA_41C0_85CFF7FB25FE_0/d/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 2048,
      "colCount": 4,
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_26B6E15D_2C4A_44EA_41C0_85CFF7FB25FE_0/d/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_26B6E15D_2C4A_44EA_41C0_85CFF7FB25FE_0/d/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "left": {
    "levels": [
     {
      "url": "media/panorama_26B6E15D_2C4A_44EA_41C0_85CFF7FB25FE_0/l/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 2048,
      "colCount": 4,
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_26B6E15D_2C4A_44EA_41C0_85CFF7FB25FE_0/l/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_26B6E15D_2C4A_44EA_41C0_85CFF7FB25FE_0/l/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "thumbnailUrl": "media/panorama_26B6E15D_2C4A_44EA_41C0_85CFF7FB25FE_t.jpg"
  }
 ],
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_26B73861_2C4A_44DB_4199_31BC46CA7F25",
   "yaw": -172.79,
   "distance": 1,
   "backwardYaw": -83.29,
   "class": "AdjacentPanorama"
  },
  {
   "panorama": "this.panorama_26B6FC37_2C4A_7CA7_41BE_C6265F38D480",
   "yaw": 2.92,
   "distance": 1,
   "backwardYaw": 175.16,
   "class": "AdjacentPanorama"
  }
 ],
 "thumbnailUrl": "media/panorama_26B6E15D_2C4A_44EA_41C0_85CFF7FB25FE_t.jpg",
 "vfov": 180,
 "class": "Panorama",
 "overlays": [
  "this.overlay_3CAF62E5_2C4D_C5DA_41B4_230ECE3C7447",
  "this.overlay_3D300BE2_2C4F_DBD9_41B0_78531746F24B"
 ],
 "partial": false
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 0,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "panorama_26B6E15D_2C4A_44EA_41C0_85CFF7FB25FE_camera",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "hfovMin": "135%",
 "hfov": 360,
 "label": "2ndFloorInside",
 "id": "panorama_26B73861_2C4A_44DB_4199_31BC46CA7F25",
 "pitch": 0,
 "hfovMax": 130,
 "frames": [
  {
   "front": {
    "levels": [
     {
      "url": "media/panorama_26B73861_2C4A_44DB_4199_31BC46CA7F25_0/f/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 2048,
      "colCount": 4,
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_26B73861_2C4A_44DB_4199_31BC46CA7F25_0/f/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_26B73861_2C4A_44DB_4199_31BC46CA7F25_0/f/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "top": {
    "levels": [
     {
      "url": "media/panorama_26B73861_2C4A_44DB_4199_31BC46CA7F25_0/u/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 2048,
      "colCount": 4,
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_26B73861_2C4A_44DB_4199_31BC46CA7F25_0/u/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_26B73861_2C4A_44DB_4199_31BC46CA7F25_0/u/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "right": {
    "levels": [
     {
      "url": "media/panorama_26B73861_2C4A_44DB_4199_31BC46CA7F25_0/r/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 2048,
      "colCount": 4,
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_26B73861_2C4A_44DB_4199_31BC46CA7F25_0/r/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_26B73861_2C4A_44DB_4199_31BC46CA7F25_0/r/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "class": "CubicPanoramaFrame",
   "back": {
    "levels": [
     {
      "url": "media/panorama_26B73861_2C4A_44DB_4199_31BC46CA7F25_0/b/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 2048,
      "colCount": 4,
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_26B73861_2C4A_44DB_4199_31BC46CA7F25_0/b/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_26B73861_2C4A_44DB_4199_31BC46CA7F25_0/b/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "bottom": {
    "levels": [
     {
      "url": "media/panorama_26B73861_2C4A_44DB_4199_31BC46CA7F25_0/d/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 2048,
      "colCount": 4,
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_26B73861_2C4A_44DB_4199_31BC46CA7F25_0/d/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_26B73861_2C4A_44DB_4199_31BC46CA7F25_0/d/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "left": {
    "levels": [
     {
      "url": "media/panorama_26B73861_2C4A_44DB_4199_31BC46CA7F25_0/l/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 2048,
      "colCount": 4,
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_26B73861_2C4A_44DB_4199_31BC46CA7F25_0/l/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_26B73861_2C4A_44DB_4199_31BC46CA7F25_0/l/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "thumbnailUrl": "media/panorama_26B73861_2C4A_44DB_4199_31BC46CA7F25_t.jpg"
  }
 ],
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_274BAF44_2C4A_3CD9_41BE_EE4EF87EE126",
   "yaw": 119.1,
   "distance": 1,
   "backwardYaw": -161.74,
   "class": "AdjacentPanorama"
  },
  {
   "panorama": "this.panorama_26B6E15D_2C4A_44EA_41C0_85CFF7FB25FE",
   "yaw": -83.29,
   "distance": 1,
   "backwardYaw": -172.79,
   "class": "AdjacentPanorama"
  },
  {
   "panorama": "this.panorama_271A82F5_2C4A_C5BB_41C0_FD507DB02B43",
   "yaw": 3.47,
   "distance": 1,
   "backwardYaw": -10.74,
   "class": "AdjacentPanorama"
  }
 ],
 "thumbnailUrl": "media/panorama_26B73861_2C4A_44DB_4199_31BC46CA7F25_t.jpg",
 "vfov": 180,
 "class": "Panorama",
 "overlays": [
  "this.overlay_3D039739_2C4A_4CAB_417F_787FE086A502",
  "this.overlay_3D187CFD_2C56_3DAB_41BB_B9959EF86DE5",
  "this.overlay_3E453B19_2C56_C46B_41A1_A15F5DB758AF",
  "this.overlay_2D40C332_3775_DAFE_41C3_59BC8093F197"
 ],
 "partial": false
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -60.9,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "camera_134CB6B0_3712_5BFA_41B7_CC8F71EBAE60",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 169.26,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "camera_136FC673_3712_5B7E_4198_71B801F6B26F",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "hfovMin": "135%",
 "hfov": 360,
 "label": "MeetingRoom",
 "id": "panorama_274BAF44_2C4A_3CD9_41BE_EE4EF87EE126",
 "pitch": 0,
 "hfovMax": 130,
 "frames": [
  {
   "front": {
    "levels": [
     {
      "url": "media/panorama_274BAF44_2C4A_3CD9_41BE_EE4EF87EE126_0/f/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 2048,
      "colCount": 4,
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_274BAF44_2C4A_3CD9_41BE_EE4EF87EE126_0/f/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_274BAF44_2C4A_3CD9_41BE_EE4EF87EE126_0/f/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "top": {
    "levels": [
     {
      "url": "media/panorama_274BAF44_2C4A_3CD9_41BE_EE4EF87EE126_0/u/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 2048,
      "colCount": 4,
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_274BAF44_2C4A_3CD9_41BE_EE4EF87EE126_0/u/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_274BAF44_2C4A_3CD9_41BE_EE4EF87EE126_0/u/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "right": {
    "levels": [
     {
      "url": "media/panorama_274BAF44_2C4A_3CD9_41BE_EE4EF87EE126_0/r/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 2048,
      "colCount": 4,
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_274BAF44_2C4A_3CD9_41BE_EE4EF87EE126_0/r/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_274BAF44_2C4A_3CD9_41BE_EE4EF87EE126_0/r/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "class": "CubicPanoramaFrame",
   "back": {
    "levels": [
     {
      "url": "media/panorama_274BAF44_2C4A_3CD9_41BE_EE4EF87EE126_0/b/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 2048,
      "colCount": 4,
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_274BAF44_2C4A_3CD9_41BE_EE4EF87EE126_0/b/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_274BAF44_2C4A_3CD9_41BE_EE4EF87EE126_0/b/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "bottom": {
    "levels": [
     {
      "url": "media/panorama_274BAF44_2C4A_3CD9_41BE_EE4EF87EE126_0/d/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 2048,
      "colCount": 4,
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_274BAF44_2C4A_3CD9_41BE_EE4EF87EE126_0/d/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_274BAF44_2C4A_3CD9_41BE_EE4EF87EE126_0/d/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "left": {
    "levels": [
     {
      "url": "media/panorama_274BAF44_2C4A_3CD9_41BE_EE4EF87EE126_0/l/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 2048,
      "colCount": 4,
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_274BAF44_2C4A_3CD9_41BE_EE4EF87EE126_0/l/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_274BAF44_2C4A_3CD9_41BE_EE4EF87EE126_0/l/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "thumbnailUrl": "media/panorama_274BAF44_2C4A_3CD9_41BE_EE4EF87EE126_t.jpg"
  }
 ],
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_26B73861_2C4A_44DB_4199_31BC46CA7F25",
   "yaw": -161.74,
   "distance": 1,
   "backwardYaw": 119.1,
   "class": "AdjacentPanorama"
  }
 ],
 "thumbnailUrl": "media/panorama_274BAF44_2C4A_3CD9_41BE_EE4EF87EE126_t.jpg",
 "vfov": 180,
 "class": "Panorama",
 "overlays": [
  "this.overlay_3DDDDBFB_2C5A_7BAE_4193_8082DDBBAEFA"
 ],
 "partial": false
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 7.21,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "camera_1373465B_3712_5AAE_41C9_536D31A7F574",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 0,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "panorama_26B62ED2_2C4A_5DF9_41AD_9342E9FAC80E_camera",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "hfovMin": "135%",
 "hfov": 360,
 "label": "stairs",
 "id": "panorama_26B6FC37_2C4A_7CA7_41BE_C6265F38D480",
 "pitch": 0,
 "hfovMax": 130,
 "frames": [
  {
   "front": {
    "levels": [
     {
      "url": "media/panorama_26B6FC37_2C4A_7CA7_41BE_C6265F38D480_0/f/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 2048,
      "colCount": 4,
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_26B6FC37_2C4A_7CA7_41BE_C6265F38D480_0/f/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_26B6FC37_2C4A_7CA7_41BE_C6265F38D480_0/f/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "top": {
    "levels": [
     {
      "url": "media/panorama_26B6FC37_2C4A_7CA7_41BE_C6265F38D480_0/u/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 2048,
      "colCount": 4,
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_26B6FC37_2C4A_7CA7_41BE_C6265F38D480_0/u/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_26B6FC37_2C4A_7CA7_41BE_C6265F38D480_0/u/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "right": {
    "levels": [
     {
      "url": "media/panorama_26B6FC37_2C4A_7CA7_41BE_C6265F38D480_0/r/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 2048,
      "colCount": 4,
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_26B6FC37_2C4A_7CA7_41BE_C6265F38D480_0/r/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_26B6FC37_2C4A_7CA7_41BE_C6265F38D480_0/r/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "class": "CubicPanoramaFrame",
   "back": {
    "levels": [
     {
      "url": "media/panorama_26B6FC37_2C4A_7CA7_41BE_C6265F38D480_0/b/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 2048,
      "colCount": 4,
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_26B6FC37_2C4A_7CA7_41BE_C6265F38D480_0/b/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_26B6FC37_2C4A_7CA7_41BE_C6265F38D480_0/b/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "bottom": {
    "levels": [
     {
      "url": "media/panorama_26B6FC37_2C4A_7CA7_41BE_C6265F38D480_0/d/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 2048,
      "colCount": 4,
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_26B6FC37_2C4A_7CA7_41BE_C6265F38D480_0/d/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_26B6FC37_2C4A_7CA7_41BE_C6265F38D480_0/d/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "left": {
    "levels": [
     {
      "url": "media/panorama_26B6FC37_2C4A_7CA7_41BE_C6265F38D480_0/l/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 2048,
      "colCount": 4,
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_26B6FC37_2C4A_7CA7_41BE_C6265F38D480_0/l/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_26B6FC37_2C4A_7CA7_41BE_C6265F38D480_0/l/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "thumbnailUrl": "media/panorama_26B6FC37_2C4A_7CA7_41BE_C6265F38D480_t.jpg"
  }
 ],
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_26B73581_2C4A_4C5B_41AA_0726EDA9CBB5",
   "yaw": -6.55,
   "distance": 1,
   "backwardYaw": 21.1,
   "class": "AdjacentPanorama"
  },
  {
   "panorama": "this.panorama_26B6E15D_2C4A_44EA_41C0_85CFF7FB25FE",
   "yaw": 175.16,
   "distance": 1,
   "backwardYaw": 2.92,
   "class": "AdjacentPanorama"
  }
 ],
 "thumbnailUrl": "media/panorama_26B6FC37_2C4A_7CA7_41BE_C6265F38D480_t.jpg",
 "vfov": 180,
 "class": "Panorama",
 "overlays": [
  "this.overlay_3D483A1D_2C76_C46A_41BC_AD7818F71C02",
  "this.overlay_3CB0EDAD_2C4A_DFAA_41AB_89E3A2067EF3"
 ],
 "partial": false
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 0,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "panorama_26B73581_2C4A_4C5B_41AA_0726EDA9CBB5_camera",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 0,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "panorama_274BAF44_2C4A_3CD9_41BE_EE4EF87EE126_camera",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -176.53,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "camera_1334A6D9_3712_5BAA_41A9_E33C0A6CE875",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 0,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "panorama_271A82F5_2C4A_C5BB_41C0_FD507DB02B43_camera",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -173.34,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "camera_13AC05E9_3712_596A_41BC_75AF8A484C76",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "items": [
  {
   "media": "this.panorama_26B73581_2C4A_4C5B_41AA_0726EDA9CBB5",
   "camera": "this.panorama_26B73581_2C4A_4C5B_41AA_0726EDA9CBB5_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 0, 1)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_26B62ED2_2C4A_5DF9_41AD_9342E9FAC80E",
   "camera": "this.panorama_26B62ED2_2C4A_5DF9_41AD_9342E9FAC80E_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 1, 2)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_26B6FC37_2C4A_7CA7_41BE_C6265F38D480",
   "camera": "this.panorama_26B6FC37_2C4A_7CA7_41BE_C6265F38D480_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 2, 3)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_26B6E15D_2C4A_44EA_41C0_85CFF7FB25FE",
   "camera": "this.panorama_26B6E15D_2C4A_44EA_41C0_85CFF7FB25FE_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 3, 4)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_26B73861_2C4A_44DB_4199_31BC46CA7F25",
   "camera": "this.panorama_26B73861_2C4A_44DB_4199_31BC46CA7F25_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 4, 5)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_271A82F5_2C4A_C5BB_41C0_FD507DB02B43",
   "camera": "this.panorama_271A82F5_2C4A_C5BB_41C0_FD507DB02B43_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 5, 6)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_274BAF44_2C4A_3CD9_41BE_EE4EF87EE126",
   "camera": "this.panorama_274BAF44_2C4A_3CD9_41BE_EE4EF87EE126_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 6, 0)",
   "player": "this.MainViewerPanoramaPlayer"
  }
 ],
 "id": "ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist",
 "class": "PlayList"
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -177.08,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "camera_1350969E_3712_5BA6_41C9_26D91EFBC9C8",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "hfovMin": "135%",
 "hfov": 360,
 "label": "Entrance",
 "id": "panorama_26B73581_2C4A_4C5B_41AA_0726EDA9CBB5",
 "pitch": 0,
 "hfovMax": 130,
 "frames": [
  {
   "front": {
    "levels": [
     {
      "url": "media/panorama_26B73581_2C4A_4C5B_41AA_0726EDA9CBB5_0/f/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 2048,
      "colCount": 4,
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_26B73581_2C4A_4C5B_41AA_0726EDA9CBB5_0/f/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_26B73581_2C4A_4C5B_41AA_0726EDA9CBB5_0/f/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "top": {
    "levels": [
     {
      "url": "media/panorama_26B73581_2C4A_4C5B_41AA_0726EDA9CBB5_0/u/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 2048,
      "colCount": 4,
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_26B73581_2C4A_4C5B_41AA_0726EDA9CBB5_0/u/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_26B73581_2C4A_4C5B_41AA_0726EDA9CBB5_0/u/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "right": {
    "levels": [
     {
      "url": "media/panorama_26B73581_2C4A_4C5B_41AA_0726EDA9CBB5_0/r/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 2048,
      "colCount": 4,
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_26B73581_2C4A_4C5B_41AA_0726EDA9CBB5_0/r/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_26B73581_2C4A_4C5B_41AA_0726EDA9CBB5_0/r/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "class": "CubicPanoramaFrame",
   "back": {
    "levels": [
     {
      "url": "media/panorama_26B73581_2C4A_4C5B_41AA_0726EDA9CBB5_0/b/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 2048,
      "colCount": 4,
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_26B73581_2C4A_4C5B_41AA_0726EDA9CBB5_0/b/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_26B73581_2C4A_4C5B_41AA_0726EDA9CBB5_0/b/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "bottom": {
    "levels": [
     {
      "url": "media/panorama_26B73581_2C4A_4C5B_41AA_0726EDA9CBB5_0/d/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 2048,
      "colCount": 4,
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_26B73581_2C4A_4C5B_41AA_0726EDA9CBB5_0/d/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_26B73581_2C4A_4C5B_41AA_0726EDA9CBB5_0/d/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "left": {
    "levels": [
     {
      "url": "media/panorama_26B73581_2C4A_4C5B_41AA_0726EDA9CBB5_0/l/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 2048,
      "colCount": 4,
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_26B73581_2C4A_4C5B_41AA_0726EDA9CBB5_0/l/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_26B73581_2C4A_4C5B_41AA_0726EDA9CBB5_0/l/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "thumbnailUrl": "media/panorama_26B73581_2C4A_4C5B_41AA_0726EDA9CBB5_t.jpg"
  }
 ],
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_26B62ED2_2C4A_5DF9_41AD_9342E9FAC80E",
   "yaw": -122.57,
   "distance": 1,
   "backwardYaw": 6.66,
   "class": "AdjacentPanorama"
  },
  {
   "panorama": "this.panorama_26B6FC37_2C4A_7CA7_41BE_C6265F38D480",
   "yaw": 21.1,
   "distance": 1,
   "backwardYaw": -6.55,
   "class": "AdjacentPanorama"
  }
 ],
 "thumbnailUrl": "media/panorama_26B73581_2C4A_4C5B_41AA_0726EDA9CBB5_t.jpg",
 "vfov": 180,
 "class": "Panorama",
 "overlays": [
  "this.overlay_23F16E55_2C4A_DCFB_41C2_9F9B25B598E2",
  "this.overlay_232EB7C1_2C4B_CBDB_41C2_8382418CB5E1"
 ],
 "partial": false
},
{
 "hfovMin": "135%",
 "hfov": 360,
 "label": "1stFloor",
 "id": "panorama_26B62ED2_2C4A_5DF9_41AD_9342E9FAC80E",
 "pitch": 0,
 "hfovMax": 130,
 "frames": [
  {
   "front": {
    "levels": [
     {
      "url": "media/panorama_26B62ED2_2C4A_5DF9_41AD_9342E9FAC80E_0/f/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 2048,
      "colCount": 4,
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_26B62ED2_2C4A_5DF9_41AD_9342E9FAC80E_0/f/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_26B62ED2_2C4A_5DF9_41AD_9342E9FAC80E_0/f/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "top": {
    "levels": [
     {
      "url": "media/panorama_26B62ED2_2C4A_5DF9_41AD_9342E9FAC80E_0/u/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 2048,
      "colCount": 4,
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_26B62ED2_2C4A_5DF9_41AD_9342E9FAC80E_0/u/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_26B62ED2_2C4A_5DF9_41AD_9342E9FAC80E_0/u/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "right": {
    "levels": [
     {
      "url": "media/panorama_26B62ED2_2C4A_5DF9_41AD_9342E9FAC80E_0/r/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 2048,
      "colCount": 4,
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_26B62ED2_2C4A_5DF9_41AD_9342E9FAC80E_0/r/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_26B62ED2_2C4A_5DF9_41AD_9342E9FAC80E_0/r/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "class": "CubicPanoramaFrame",
   "back": {
    "levels": [
     {
      "url": "media/panorama_26B62ED2_2C4A_5DF9_41AD_9342E9FAC80E_0/b/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 2048,
      "colCount": 4,
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_26B62ED2_2C4A_5DF9_41AD_9342E9FAC80E_0/b/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_26B62ED2_2C4A_5DF9_41AD_9342E9FAC80E_0/b/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "bottom": {
    "levels": [
     {
      "url": "media/panorama_26B62ED2_2C4A_5DF9_41AD_9342E9FAC80E_0/d/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 2048,
      "colCount": 4,
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_26B62ED2_2C4A_5DF9_41AD_9342E9FAC80E_0/d/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_26B62ED2_2C4A_5DF9_41AD_9342E9FAC80E_0/d/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "left": {
    "levels": [
     {
      "url": "media/panorama_26B62ED2_2C4A_5DF9_41AD_9342E9FAC80E_0/l/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 2048,
      "colCount": 4,
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_26B62ED2_2C4A_5DF9_41AD_9342E9FAC80E_0/l/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_26B62ED2_2C4A_5DF9_41AD_9342E9FAC80E_0/l/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "thumbnailUrl": "media/panorama_26B62ED2_2C4A_5DF9_41AD_9342E9FAC80E_t.jpg"
  }
 ],
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_26B73581_2C4A_4C5B_41AA_0726EDA9CBB5",
   "yaw": 6.66,
   "distance": 1,
   "backwardYaw": -122.57,
   "class": "AdjacentPanorama"
  }
 ],
 "thumbnailUrl": "media/panorama_26B62ED2_2C4A_5DF9_41AD_9342E9FAC80E_t.jpg",
 "vfov": 180,
 "class": "Panorama",
 "overlays": [
  "this.overlay_3C55B272_2C7A_44B9_41C2_3C2DE1CE1287"
 ],
 "partial": false
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -4.84,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "camera_138AE62F_3712_5AE5_41B0_13E9AF2E320B",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "items": [
  {
   "media": "this.panorama_26B73581_2C4A_4C5B_41AA_0726EDA9CBB5",
   "camera": "this.panorama_26B73581_2C4A_4C5B_41AA_0726EDA9CBB5_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 0, 1)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_26B62ED2_2C4A_5DF9_41AD_9342E9FAC80E",
   "camera": "this.panorama_26B62ED2_2C4A_5DF9_41AD_9342E9FAC80E_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 1, 2)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_26B6FC37_2C4A_7CA7_41BE_C6265F38D480",
   "camera": "this.panorama_26B6FC37_2C4A_7CA7_41BE_C6265F38D480_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 2, 3)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_26B6E15D_2C4A_44EA_41C0_85CFF7FB25FE",
   "camera": "this.panorama_26B6E15D_2C4A_44EA_41C0_85CFF7FB25FE_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 3, 4)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_26B73861_2C4A_44DB_4199_31BC46CA7F25",
   "camera": "this.panorama_26B73861_2C4A_44DB_4199_31BC46CA7F25_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 4, 5)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_271A82F5_2C4A_C5BB_41C0_FD507DB02B43",
   "camera": "this.panorama_271A82F5_2C4A_C5BB_41C0_FD507DB02B43_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 5, 6)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_274BAF44_2C4A_3CD9_41BE_EE4EF87EE126",
   "camera": "this.panorama_274BAF44_2C4A_3CD9_41BE_EE4EF87EE126_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 6, 0)",
   "player": "this.MainViewerPanoramaPlayer",
   "end": "this.trigger('tourEnded')"
  }
 ],
 "id": "mainPlayList",
 "class": "PlayList"
},
{
 "mouseControlMode": "drag_acceleration",
 "buttonToggleGyroscope": "this.Button_485BFF41_598E_3DB2_41A9_33F36E014467",
 "viewerArea": "this.MainViewer",
 "class": "PanoramaPlayer",
 "buttonCardboardView": "this.Button_4D1C404A_5A87_C3B6_41BC_63B811C40CD0",
 "touchControlMode": "drag_rotation",
 "id": "MainViewerPanoramaPlayer",
 "displayPlaybackBar": true,
 "gyroscopeVerticalDraggingEnabled": true
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 173.45,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "camera_13A45603_3712_5A9E_41C4_1D0539FBFBF3",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "toolTipFontWeight": "normal",
 "playbackBarBackgroundColorDirection": "vertical",
 "id": "MainViewer",
 "left": 0,
 "playbackBarRight": 0,
 "playbackBarProgressBorderSize": 0,
 "playbackBarProgressBorderRadius": 0,
 "progressBarBorderSize": 0,
 "paddingLeft": 0,
 "progressBarBorderRadius": 0,
 "width": "100%",
 "playbackBarBorderRadius": 0,
 "toolTipShadowOpacity": 0,
 "minHeight": 50,
 "playbackBarProgressBorderColor": "#000000",
 "toolTipFontStyle": "normal",
 "playbackBarHeadBorderColor": "#000000",
 "toolTipFontFamily": "Georgia",
 "progressLeft": 0,
 "paddingRight": 0,
 "propagateClick": true,
 "toolTipTextShadowOpacity": 0,
 "playbackBarHeadBorderRadius": 0,
 "height": "100%",
 "minWidth": 100,
 "playbackBarBorderSize": 0,
 "playbackBarHeadBorderSize": 0,
 "playbackBarProgressOpacity": 1,
 "vrPointerSelectionColor": "#FF6600",
 "playbackBarBackgroundOpacity": 1,
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "playbackBarHeadShadowColor": "#000000",
 "progressRight": 0,
 "firstTransitionDuration": 0,
 "toolTipFontColor": "#FFFFFF",
 "toolTipBackgroundColor": "#000000",
 "progressBarBackgroundColorDirection": "vertical",
 "progressOpacity": 1,
 "vrPointerSelectionTime": 2000,
 "progressHeight": 10,
 "playbackBarHeadShadow": true,
 "progressBottom": 0,
 "shadow": false,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "progressBackgroundOpacity": 1,
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarOpacity": 1,
 "playbackBarHeadShadowOpacity": 0.7,
 "vrPointerColor": "#FFFFFF",
 "toolTipPaddingRight": 10,
 "toolTipBorderSize": 1,
 "progressBarOpacity": 1,
 "borderSize": 0,
 "toolTipPaddingTop": 7,
 "toolTipDisplayTime": 600,
 "toolTipPaddingLeft": 10,
 "progressBorderSize": 0,
 "displayTooltipInTouchScreens": true,
 "progressBorderRadius": 0,
 "playbackBarBorderColor": "#FFFFFF",
 "toolTipBorderRadius": 3,
 "borderRadius": 0,
 "playbackBarHeadShadowVerticalLength": 0,
 "transitionMode": "blending",
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "progressBackgroundColorRatios": [
  0.01
 ],
 "playbackBarHeadHeight": 15,
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "top": 0,
 "playbackBarHeadShadowBlurRadius": 3,
 "progressBarBorderColor": "#0066FF",
 "playbackBarHeadShadowHorizontalLength": 0,
 "progressBarBackgroundColorRatios": [
  0
 ],
 "progressBackgroundColorDirection": "vertical",
 "transitionDuration": 500,
 "playbackBarHeadOpacity": 1,
 "playbackBarBottom": 5,
 "progressBorderColor": "#FFFFFF",
 "playbackBarLeft": 0,
 "toolTipShadowSpread": 0,
 "toolTipShadowBlurRadius": 3,
 "paddingBottom": 5,
 "toolTipTextShadowColor": "#000000",
 "toolTipOpacity": 0.5,
 "toolTipBorderColor": "#767676",
 "class": "ViewerArea",
 "toolTipFontSize": 13,
 "paddingTop": 0,
 "toolTipPaddingBottom": 7,
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "toolTipTextShadowBlurRadius": 3,
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "data": {
  "name": "Main Viewer"
 },
 "toolTipShadowColor": "#333333",
 "playbackBarHeight": 10,
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "playbackBarHeadWidth": 6
},
{
 "children": [
  "this.Label_0C5F13A8_3BA0_A6FF_41BD_E3D21CFCE151",
  "this.Label_0C5F23A8_3BA0_A6FF_419F_468451E37918"
 ],
 "id": "Container_0C5F33A8_3BA0_A6FF_41C3_2A6652E2CE94",
 "left": 30,
 "width": 271,
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "scrollBarColor": "#000000",
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "visible",
 "paddingRight": 0,
 "scrollBarVisible": "rollOver",
 "propagateClick": false,
 "horizontalAlign": "left",
 "minWidth": 1,
 "bottom": 20,
 "scrollBarOpacity": 0.5,
 "height": 97,
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "visible": false,
 "contentOpaque": false,
 "shadow": false,
 "data": {
  "name": "--STICKER"
 },
 "layout": "absolute"
},
{
 "children": [
  "this.Button_4D1C404A_5A87_C3B6_41BC_63B811C40CD0",
  "this.Button_485BFF41_598E_3DB2_41A9_33F36E014467",
  "this.Button_4CF1FD24_5A86_3DF2_41B3_7CDBA2E3D44A"
 ],
 "id": "Container_0A760F11_3BA1_BFAE_41CD_32268FCAF8B4",
 "width": 60,
 "paddingLeft": 0,
 "borderSize": 0,
 "right": 15,
 "backgroundOpacity": 1,
 "scrollBarColor": "#000000",
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "height": 184,
 "backgroundColorRatios": [
  0.02
 ],
 "propagateClick": false,
 "horizontalAlign": "center",
 "backgroundColor": [
  "#666666"
 ],
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "top": 62,
 "gap": 0,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "middle",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "visible": false,
 "shadow": false,
 "contentOpaque": false,
 "data": {
  "name": "-button set"
 },
 "layout": "vertical"
},
{
 "children": [
  "this.Label_3BC53CE3_2DFA_DDDF_41BF_C9EAC82286F4",
  "this.Image_3BC55CE3_2DFA_DDDF_41C5_141F9DD3DC57",
  "this.Container_3BC57CE3_2DFA_DDDF_41C5_DC919F3BF9DE"
 ],
 "id": "Container_3BC21CE4_2DFA_DDD9_41B4_83EF3C2B9F70",
 "left": "0%",
 "paddingLeft": 0,
 "borderSize": 0,
 "right": "0%",
 "backgroundOpacity": 1,
 "scrollBarColor": "#000000",
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "visible",
 "paddingRight": 0,
 "backgroundColorRatios": [
  0
 ],
 "propagateClick": true,
 "horizontalAlign": "left",
 "backgroundColor": [
  "#666666"
 ],
 "top": "0%",
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "height": "8.584%",
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "contentOpaque": false,
 "data": {
  "name": "--BUTTON SET"
 },
 "layout": "absolute"
},
{
 "children": [
  "this.Container_062A782F_1140_E20B_41AF_B3E5DE341773",
  "this.Container_062A9830_1140_E215_41A7_5F2BBE5C20E4"
 ],
 "id": "Container_062AB830_1140_E215_41AF_6C9D65345420",
 "left": "0%",
 "paddingLeft": 0,
 "borderSize": 0,
 "right": "0%",
 "backgroundOpacity": 0.6,
 "scrollBarColor": "#000000",
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": true,
 "horizontalAlign": "left",
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "top": "0%",
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "click": "this.setComponentVisibility(this.Container_062AB830_1140_E215_41AF_6C9D65345420, false, 0, null, null, false)",
 "bottom": "0%",
 "scrollBarOpacity": 0.5,
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "visible": false,
 "shadow": false,
 "contentOpaque": false,
 "data": {
  "name": "---INFO Thesaurus"
 },
 "layout": "absolute"
},
{
 "children": [
  "this.Container_39A197B1_0C06_62AF_419A_D15E4DDD2528"
 ],
 "id": "Container_39DE87B1_0C06_62AF_417B_8CB0FB5C9D15",
 "left": "0%",
 "paddingLeft": 0,
 "borderSize": 0,
 "right": "0%",
 "backgroundOpacity": 0.6,
 "scrollBarColor": "#000000",
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": true,
 "horizontalAlign": "left",
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "top": "0%",
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "click": "this.setComponentVisibility(this.Container_39DE87B1_0C06_62AF_417B_8CB0FB5C9D15, false, 0, null, null, false)",
 "bottom": "0%",
 "scrollBarOpacity": 0.5,
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "visible": false,
 "shadow": false,
 "contentOpaque": false,
 "data": {
  "name": "---PANORAMA LIST"
 },
 "layout": "absolute"
},
{
 "children": [
  "this.Container_221C1648_0C06_E5FD_4180_8A2E8B66315E",
  "this.Container_221B3648_0C06_E5FD_4199_FCE031AE003B"
 ],
 "id": "Container_221B1648_0C06_E5FD_417F_E6FCCCB4A6D7",
 "left": "0%",
 "paddingLeft": 0,
 "borderSize": 0,
 "right": "0%",
 "backgroundOpacity": 0.6,
 "scrollBarColor": "#000000",
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": true,
 "horizontalAlign": "left",
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "top": "0%",
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "click": "this.setComponentVisibility(this.Container_221B1648_0C06_E5FD_417F_E6FCCCB4A6D7, false, 0, null, null, false)",
 "bottom": "0%",
 "scrollBarOpacity": 0.5,
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "visible": false,
 "shadow": false,
 "contentOpaque": false,
 "data": {
  "name": "---LOCATION"
 },
 "layout": "absolute"
},
{
 "children": [
  "this.Container_2A193C4C_0D3B_DFF0_4161_A2CD128EF536"
 ],
 "id": "Container_2A1A5C4D_0D3B_DFF0_41A9_8FC811D03C8E",
 "left": "0%",
 "paddingLeft": 0,
 "borderSize": 0,
 "right": "0%",
 "backgroundOpacity": 0.6,
 "scrollBarColor": "#000000",
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": true,
 "horizontalAlign": "left",
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "top": "0%",
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "click": "this.setComponentVisibility(this.Container_2A1A5C4D_0D3B_DFF0_41A9_8FC811D03C8E, false, 0, null, null, false)",
 "bottom": "0%",
 "scrollBarOpacity": 0.5,
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "visible": false,
 "shadow": false,
 "contentOpaque": false,
 "data": {
  "name": "---PHOTOALBUM"
 },
 "layout": "absolute"
},
{
 "children": [
  "this.Container_06C5DBA5_1140_A63F_41AD_1D83A33F1255",
  "this.Container_06C43BA5_1140_A63F_41A1_96DC8F4CAD2F"
 ],
 "id": "Container_06C41BA5_1140_A63F_41AE_B0CBD78DEFDC",
 "left": "0%",
 "paddingLeft": 0,
 "borderSize": 0,
 "right": "0%",
 "backgroundOpacity": 0.6,
 "scrollBarColor": "#04A3E1",
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": true,
 "horizontalAlign": "left",
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "top": "0%",
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "click": "this.setComponentVisibility(this.Container_06C41BA5_1140_A63F_41AE_B0CBD78DEFDC, false, 0, null, null, false)",
 "bottom": "0%",
 "scrollBarOpacity": 0.5,
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "visible": false,
 "shadow": false,
 "contentOpaque": false,
 "data": {
  "name": "---REALTOR"
 },
 "layout": "absolute"
},
{
 "fontFamily": "Arial",
 "fontColor": "#FFFFFF",
 "data": {
  "name": "Button Settings Fullscreen"
 },
 "shadowBlurRadius": 6,
 "id": "Button_4CF1FD24_5A86_3DF2_41B3_7CDBA2E3D44A",
 "rollOverBackgroundColor": [
  "#CE6700"
 ],
 "fontStyle": "normal",
 "width": 60,
 "pressedIconHeight": 30,
 "paddingLeft": 0,
 "borderSize": 0,
 "pressedIconWidth": 30,
 "backgroundOpacity": 1,
 "iconHeight": 30,
 "shadowSpread": 1,
 "rollOverBackgroundOpacity": 1,
 "minHeight": 1,
 "borderRadius": 0,
 "borderColor": "#000000",
 "paddingRight": 0,
 "pressedRollOverBackgroundColorRatios": [
  0
 ],
 "height": 60,
 "rollOverBackgroundColorRatios": [
  0
 ],
 "backgroundColorRatios": [
  0
 ],
 "propagateClick": false,
 "verticalAlign": "middle",
 "backgroundColor": [
  "#666666"
 ],
 "minWidth": 1,
 "mode": "toggle",
 "pressedIconURL": "skin/Button_4CF1FD24_5A86_3DF2_41B3_7CDBA2E3D44A_pressed.png",
 "shadowColor": "#000000",
 "gap": 5,
 "iconBeforeLabel": true,
 "fontSize": 12,
 "paddingBottom": 0,
 "horizontalAlign": "center",
 "paddingTop": 0,
 "iconURL": "skin/Button_4CF1FD24_5A86_3DF2_41B3_7CDBA2E3D44A.png",
 "class": "Button",
 "iconWidth": 30,
 "backgroundColorDirection": "vertical",
 "fontWeight": "normal",
 "textDecoration": "none",
 "cursor": "hand",
 "shadow": false,
 "pressedRollOverBackgroundColor": [
  "#CE6700"
 ],
 "layout": "horizontal"
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_26B73861_2C4A_44DB_4199_31BC46CA7F25, this.camera_1334A6D9_3712_5BAA_41A9_E33C0A6CE875); this.mainPlayList.set('selectedIndex', 4)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Arrow 06a Left"
 },
 "maps": [
  {
   "hfov": 15.04,
   "yaw": -10.74,
   "image": {
    "levels": [
     {
      "url": "media/panorama_271A82F5_2C4A_C5BB_41C0_FD507DB02B43_0_HS_0_0_0_map.gif",
      "width": 51,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -46.79,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "hfov": 15.04,
   "image": "this.AnimatedImageResource_3E2DD18A_2C5E_C46E_41B8_42B715DA8683",
   "pitch": -46.79,
   "yaw": -10.74,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "id": "overlay_3DC7D148_2C5A_44E9_41B2_0167037F23B5",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_26B6FC37_2C4A_7CA7_41BE_C6265F38D480, this.camera_138AE62F_3712_5AE5_41B0_13E9AF2E320B); this.mainPlayList.set('selectedIndex', 2)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Arrow 06b Right"
 },
 "maps": [
  {
   "hfov": 19.89,
   "yaw": 2.92,
   "image": {
    "levels": [
     {
      "url": "media/panorama_26B6E15D_2C4A_44EA_41C0_85CFF7FB25FE_0_HS_0_0_0_map.gif",
      "width": 51,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -34.58,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "hfov": 19.89,
   "image": "this.AnimatedImageResource_3E23518A_2C5E_C46E_41B7_E7DAC0A55218",
   "pitch": -34.58,
   "yaw": 2.92,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "id": "overlay_3CAF62E5_2C4D_C5DA_41B4_230ECE3C7447",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_26B73861_2C4A_44DB_4199_31BC46CA7F25, this.camera_1393F61C_3712_5AAB_41C7_C71C58D297D7); this.mainPlayList.set('selectedIndex', 4)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Arrow 06a Left"
 },
 "maps": [
  {
   "hfov": 14.92,
   "yaw": -172.79,
   "image": {
    "levels": [
     {
      "url": "media/panorama_26B6E15D_2C4A_44EA_41C0_85CFF7FB25FE_0_HS_1_0_0_map.gif",
      "width": 51,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -25.1,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "hfov": 14.92,
   "image": "this.AnimatedImageResource_3E2CB18A_2C5E_C46E_4177_0DDAC971A615",
   "pitch": -25.1,
   "yaw": -172.79,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "id": "overlay_3D300BE2_2C4F_DBD9_41B0_78531746F24B",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_26B6E15D_2C4A_44EA_41C0_85CFF7FB25FE, this.camera_1373465B_3712_5AAE_41C9_536D31A7F574); this.mainPlayList.set('selectedIndex', 3)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Image"
 },
 "maps": [
  {
   "hfov": 28.14,
   "yaw": -83.29,
   "image": {
    "levels": [
     {
      "url": "media/panorama_26B73861_2C4A_44DB_4199_31BC46CA7F25_0_HS_0_0_0_map.gif",
      "width": 16,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0.77,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 28.14,
   "distance": 50,
   "image": {
    "levels": [
     {
      "url": "media/panorama_26B73861_2C4A_44DB_4199_31BC46CA7F25_0_HS_0_0.png",
      "width": 475,
      "height": 503,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "yaw": -83.29,
   "pitch": 0.77
  }
 ],
 "id": "overlay_3D039739_2C4A_4CAB_417F_787FE086A502",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_274BAF44_2C4A_3CD9_41BE_EE4EF87EE126, this.camera_1386D648_3712_5AAA_41B3_9C26F9BEDC62); this.mainPlayList.set('selectedIndex', 6)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Image"
 },
 "maps": [
  {
   "hfov": 23.55,
   "yaw": 119.1,
   "image": {
    "levels": [
     {
      "url": "media/panorama_26B73861_2C4A_44DB_4199_31BC46CA7F25_0_HS_1_0_0_map.gif",
      "width": 16,
      "height": 22,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -26.06,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 23.55,
   "distance": 50,
   "image": {
    "levels": [
     {
      "url": "media/panorama_26B73861_2C4A_44DB_4199_31BC46CA7F25_0_HS_1_0.png",
      "width": 442,
      "height": 628,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "yaw": 119.1,
   "pitch": -26.06
  }
 ],
 "id": "overlay_3D187CFD_2C56_3DAB_41BB_B9959EF86DE5",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_271A82F5_2C4A_C5BB_41C0_FD507DB02B43, this.camera_136FC673_3712_5B7E_4198_71B801F6B26F); this.mainPlayList.set('selectedIndex', 5)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Arrow 06a Right"
 },
 "maps": [
  {
   "hfov": 16.11,
   "yaw": 3.47,
   "image": {
    "levels": [
     {
      "url": "media/panorama_26B73861_2C4A_44DB_4199_31BC46CA7F25_0_HS_2_0_0_map.gif",
      "width": 51,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -31.76,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "hfov": 16.11,
   "image": "this.AnimatedImageResource_3E2C718A_2C5E_C46E_41B3_07F892159339",
   "pitch": -31.76,
   "yaw": 3.47,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "id": "overlay_3E453B19_2C56_C46B_41A1_A15F5DB758AF",
 "rollOverDisplay": false
},
{
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.setComponentVisibility(this.Container_062AB830_1140_E215_41AF_6C9D65345420, true, 0, null, null, false)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Info 02"
 },
 "maps": [
  {
   "hfov": 6.79,
   "yaw": 50.45,
   "image": {
    "levels": [
     {
      "url": "media/panorama_26B73861_2C4A_44DB_4199_31BC46CA7F25_0_HS_3_0_0_map.gif",
      "width": 16,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 3.95,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "hfov": 6.79,
   "image": "this.AnimatedImageResource_281F3586_3772_59A6_41BA_015B6ED2C667",
   "pitch": 3.95,
   "yaw": 50.45,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 100
  }
 ],
 "id": "overlay_2D40C332_3775_DAFE_41C3_59BC8093F197",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_26B73861_2C4A_44DB_4199_31BC46CA7F25, this.camera_134CB6B0_3712_5BFA_41B7_CC8F71EBAE60); this.mainPlayList.set('selectedIndex', 4)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Image"
 },
 "maps": [
  {
   "hfov": 22.95,
   "yaw": -161.74,
   "image": {
    "levels": [
     {
      "url": "media/panorama_274BAF44_2C4A_3CD9_41BE_EE4EF87EE126_0_HS_0_0_0_map.gif",
      "width": 16,
      "height": 18,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -12.13,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 22.95,
   "distance": 50,
   "image": {
    "levels": [
     {
      "url": "media/panorama_274BAF44_2C4A_3CD9_41BE_EE4EF87EE126_0_HS_0_0.png",
      "width": 396,
      "height": 465,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "yaw": -161.74,
   "pitch": -12.13
  }
 ],
 "id": "overlay_3DDDDBFB_2C5A_7BAE_4193_8082DDBBAEFA",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_26B73581_2C4A_4C5B_41AA_0726EDA9CBB5, this.camera_135B8686_3712_5BA6_41CA_6E2A1DF5D6EA); this.mainPlayList.set('selectedIndex', 0)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Arrow 06b Right"
 },
 "maps": [
  {
   "hfov": 12.57,
   "yaw": -6.55,
   "image": {
    "levels": [
     {
      "url": "media/panorama_26B6FC37_2C4A_7CA7_41BE_C6265F38D480_0_HS_0_0_0_map.gif",
      "width": 51,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -37.87,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "hfov": 12.57,
   "image": "this.AnimatedImageResource_3E23D189_2C5E_C46A_4192_D15AE9C4043F",
   "pitch": -37.87,
   "yaw": -6.55,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "id": "overlay_3D483A1D_2C76_C46A_41BC_AD7818F71C02",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_26B6E15D_2C4A_44EA_41C0_85CFF7FB25FE, this.camera_1350969E_3712_5BA6_41C9_26D91EFBC9C8); this.mainPlayList.set('selectedIndex', 3)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Arrow 06a"
 },
 "maps": [
  {
   "hfov": 17.81,
   "yaw": 175.16,
   "image": {
    "levels": [
     {
      "url": "media/panorama_26B6FC37_2C4A_7CA7_41BE_C6265F38D480_0_HS_1_0_0_map.gif",
      "width": 27,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 6.25,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "hfov": 17.81,
   "image": "this.AnimatedImageResource_3E23018A_2C5E_C46E_418C_CBF9FD6FC7AE",
   "pitch": 6.25,
   "yaw": 175.16,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 100
  }
 ],
 "id": "overlay_3CB0EDAD_2C4A_DFAA_41AB_89E3A2067EF3",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_26B62ED2_2C4A_5DF9_41AD_9342E9FAC80E, this.camera_13AC05E9_3712_596A_41BC_75AF8A484C76); this.mainPlayList.set('selectedIndex', 1)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Circle 01b"
 },
 "maps": [
  {
   "hfov": 14.79,
   "yaw": -122.57,
   "image": {
    "levels": [
     {
      "url": "media/panorama_26B73581_2C4A_4C5B_41AA_0726EDA9CBB5_0_HS_0_0_0_map.gif",
      "width": 36,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -20.16,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "hfov": 14.79,
   "image": "this.AnimatedImageResource_3F016D3C_2C7B_DCAA_41C3_88541006DB18",
   "pitch": -20.16,
   "yaw": -122.57,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 100
  }
 ],
 "id": "overlay_23F16E55_2C4A_DCFB_41C2_9F9B25B598E2",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_26B6FC37_2C4A_7CA7_41BE_C6265F38D480, this.camera_13A45603_3712_5A9E_41C4_1D0539FBFBF3); this.mainPlayList.set('selectedIndex', 2)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Arrow 08a"
 },
 "maps": [
  {
   "hfov": 17.7,
   "yaw": 21.1,
   "image": {
    "levels": [
     {
      "url": "media/panorama_26B73581_2C4A_4C5B_41AA_0726EDA9CBB5_0_HS_1_0_0_map.gif",
      "width": 24,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -39.6,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "hfov": 17.7,
   "image": "this.AnimatedImageResource_3F01DD3D_2C7B_DCAA_417C_3749EF9C631F",
   "pitch": -39.6,
   "yaw": 21.1,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 100
  }
 ],
 "id": "overlay_232EB7C1_2C4B_CBDB_41C2_8382418CB5E1",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_26B73581_2C4A_4C5B_41AA_0726EDA9CBB5, this.camera_1338C6C8_3712_5BAA_41BD_AB4FC3FC5101); this.mainPlayList.set('selectedIndex', 0)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Circle 01b"
 },
 "maps": [
  {
   "hfov": 11.49,
   "yaw": 6.66,
   "image": {
    "levels": [
     {
      "url": "media/panorama_26B62ED2_2C4A_5DF9_41AD_9342E9FAC80E_0_HS_0_0_0_map.gif",
      "width": 36,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -19.48,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "hfov": 11.49,
   "image": "this.AnimatedImageResource_3E226189_2C5E_C46A_41BE_429FA21E0902",
   "pitch": -19.48,
   "yaw": 6.66,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 100
  }
 ],
 "id": "overlay_3C55B272_2C7A_44B9_41C2_3C2DE1CE1287",
 "rollOverDisplay": false
},
{
 "fontFamily": "Arial",
 "fontColor": "#FFFFFF",
 "data": {
  "name": "Button Settings Gyro"
 },
 "rollOverIconHeight": 30,
 "shadowBlurRadius": 6,
 "id": "Button_485BFF41_598E_3DB2_41A9_33F36E014467",
 "rollOverBackgroundColor": [
  "#CE6700"
 ],
 "fontStyle": "normal",
 "width": 60,
 "pressedIconHeight": 30,
 "paddingLeft": 0,
 "borderSize": 0,
 "pressedIconWidth": 30,
 "backgroundOpacity": 1,
 "iconHeight": 30,
 "shadowSpread": 1,
 "rollOverBackgroundOpacity": 1,
 "minHeight": 1,
 "borderRadius": 0,
 "borderColor": "#000000",
 "paddingRight": 0,
 "pressedRollOverBackgroundColorRatios": [
  0
 ],
 "height": 60,
 "rollOverBackgroundColorRatios": [
  0
 ],
 "backgroundColorRatios": [
  0
 ],
 "propagateClick": false,
 "verticalAlign": "middle",
 "backgroundColor": [
  "#666666"
 ],
 "minWidth": 1,
 "mode": "toggle",
 "rollOverIconWidth": 30,
 "shadowColor": "#000000",
 "gap": 5,
 "iconBeforeLabel": true,
 "fontSize": 12,
 "paddingBottom": 0,
 "pressedIconURL": "skin/Button_485BFF41_598E_3DB2_41A9_33F36E014467_pressed.png",
 "horizontalAlign": "center",
 "paddingTop": 0,
 "iconURL": "skin/Button_485BFF41_598E_3DB2_41A9_33F36E014467.png",
 "class": "Button",
 "iconWidth": 30,
 "backgroundColorDirection": "vertical",
 "fontWeight": "normal",
 "textDecoration": "none",
 "cursor": "hand",
 "shadow": false,
 "pressedRollOverBackgroundColor": [
  "#CE6700"
 ],
 "layout": "horizontal"
},
{
 "fontFamily": "Arial",
 "fontColor": "#FFFFFF",
 "shadowBlurRadius": 6,
 "id": "Button_4D1C404A_5A87_C3B6_41BC_63B811C40CD0",
 "rollOverBackgroundColor": [
  "#CE6700"
 ],
 "fontStyle": "normal",
 "width": 60,
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 1,
 "iconHeight": 30,
 "shadowSpread": 1,
 "rollOverBackgroundOpacity": 1,
 "minHeight": 1,
 "borderRadius": 0,
 "borderColor": "#000000",
 "paddingRight": 0,
 "height": 60,
 "rollOverBackgroundColorRatios": [
  0
 ],
 "backgroundColorRatios": [
  0
 ],
 "propagateClick": false,
 "verticalAlign": "middle",
 "backgroundColor": [
  "#666666"
 ],
 "minWidth": 1,
 "mode": "push",
 "pressedIconURL": "skin/Button_4D1C404A_5A87_C3B6_41BC_63B811C40CD0_pressed.png",
 "shadowColor": "#000000",
 "gap": 5,
 "iconBeforeLabel": true,
 "fontSize": 12,
 "paddingBottom": 0,
 "horizontalAlign": "center",
 "paddingTop": 0,
 "iconURL": "skin/Button_4D1C404A_5A87_C3B6_41BC_63B811C40CD0.png",
 "class": "Button",
 "iconWidth": 30,
 "backgroundColorDirection": "vertical",
 "fontWeight": "normal",
 "textDecoration": "none",
 "cursor": "hand",
 "shadow": false,
 "data": {
  "name": "Button settings VR"
 },
 "layout": "horizontal"
},
{
 "fontFamily": "Montserrat",
 "fontColor": "#FFFFFF",
 "id": "Label_0C5F13A8_3BA0_A6FF_41BD_E3D21CFCE151",
 "left": 0,
 "textShadowBlurRadius": 10,
 "width": 239,
 "verticalAlign": "top",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "textShadowColor": "#000000",
 "text": "LOREM",
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 0,
 "textShadowHorizontalLength": 0,
 "propagateClick": false,
 "horizontalAlign": "left",
 "height": 67,
 "top": 5,
 "minWidth": 1,
 "textShadowOpacity": 1,
 "textShadowVerticalLength": 0,
 "fontSize": 54,
 "paddingBottom": 0,
 "fontStyle": "normal",
 "paddingTop": 0,
 "class": "Label",
 "textDecoration": "none",
 "fontWeight": "bold",
 "shadow": false,
 "data": {
  "name": "text 1"
 }
},
{
 "fontFamily": "Montserrat",
 "fontColor": "#FFFFFF",
 "id": "Label_0C5F23A8_3BA0_A6FF_419F_468451E37918",
 "left": 0,
 "textShadowBlurRadius": 10,
 "width": 236,
 "verticalAlign": "top",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "textShadowColor": "#000000",
 "text": "DOLOR SIT AMET",
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 0,
 "textShadowHorizontalLength": 0,
 "propagateClick": false,
 "horizontalAlign": "left",
 "height": 32,
 "top": 66,
 "minWidth": 1,
 "textShadowOpacity": 1,
 "textShadowVerticalLength": 0,
 "fontSize": 18,
 "paddingBottom": 0,
 "fontStyle": "normal",
 "paddingTop": 0,
 "class": "Label",
 "textDecoration": "none",
 "fontWeight": "normal",
 "shadow": false,
 "data": {
  "name": "text 2"
 }
},
{
 "fontFamily": "Yu Gothic UI Semibold",
 "fontColor": "#FFFFFF",
 "id": "Label_3BC53CE3_2DFA_DDDF_41BF_C9EAC82286F4",
 "left": 90.05,
 "width": 156.75,
 "verticalAlign": "middle",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "text": "Thesaurus",
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 0,
 "propagateClick": false,
 "horizontalAlign": "left",
 "height": 60,
 "top": "0%",
 "minWidth": 1,
 "fontSize": 31,
 "paddingBottom": 0,
 "fontStyle": "normal",
 "paddingTop": 0,
 "class": "Label",
 "textDecoration": "none",
 "fontWeight": "normal",
 "shadow": false,
 "data": {
  "name": "Label Company Name"
 }
},
{
 "maxWidth": 40,
 "id": "Image_3BC55CE3_2DFA_DDDF_41C5_141F9DD3DC57",
 "left": "2.35%",
 "maxHeight": 30,
 "width": "3.061%",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "url": "skin/Image_3BC55CE3_2DFA_DDDF_41C5_141F9DD3DC57.png",
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 0,
 "top": "25%",
 "propagateClick": false,
 "horizontalAlign": "center",
 "minWidth": 1,
 "click": "this.openLink('http://thesaurus.co.jp/', '_blank')",
 "bottom": "25%",
 "paddingBottom": 0,
 "verticalAlign": "middle",
 "paddingTop": 0,
 "class": "Image",
 "scaleMode": "fit_inside",
 "shadow": false,
 "cursor": "hand",
 "data": {
  "name": "logo"
 }
},
{
 "children": [
  "this.Button_3BC20CE4_2DFA_DDD9_41C5_8BC770B761FC"
 ],
 "id": "Container_3BC57CE3_2DFA_DDDF_41C5_DC919F3BF9DE",
 "width": 1199,
 "paddingLeft": 0,
 "borderSize": 0,
 "right": "0%",
 "backgroundOpacity": 0,
 "scrollBarColor": "#000000",
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 15,
 "scrollBarVisible": "rollOver",
 "propagateClick": true,
 "horizontalAlign": "right",
 "top": "0%",
 "minWidth": 1,
 "scrollBarOpacity": 0.5,
 "height": 60,
 "gap": 3,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "middle",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "contentOpaque": false,
 "shadow": false,
 "data": {
  "name": "-button set container"
 },
 "layout": "horizontal"
},
{
 "children": [
  "this.Container_062A682F_1140_E20B_41B0_3071FCBF3DC9",
  "this.Container_26D3A42C_3F86_BA30_419B_2C6BE84D2718",
  "this.Container_062A082F_1140_E20A_4193_DF1A4391DC79"
 ],
 "shadowBlurRadius": 25,
 "shadowSpread": 1,
 "left": "15%",
 "right": "15%",
 "shadowHorizontalLength": 0,
 "shadowColor": "#000000",
 "id": "Container_062A782F_1140_E20B_41AF_B3E5DE341773",
 "backgroundOpacity": 1,
 "paddingLeft": 0,
 "borderSize": 0,
 "shadowOpacity": 0.3,
 "minHeight": 1,
 "creationPolicy": "inAdvance",
 "borderRadius": 0,
 "overflow": "scroll",
 "scrollBarColor": "#000000",
 "paddingRight": 0,
 "top": "10%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "horizontalAlign": "left",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "bottom": "10%",
 "scrollBarOpacity": 0.5,
 "gap": 0,
 "shadowVerticalLength": 0,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "shadow": true,
 "contentOpaque": false,
 "data": {
  "name": "Global"
 },
 "layout": "horizontal"
},
{
 "verticalAlign": "top",
 "children": [
  "this.IconButton_062A8830_1140_E215_419D_3439F16CCB3E"
 ],
 "id": "Container_062A9830_1140_E215_41A7_5F2BBE5C20E4",
 "left": "15%",
 "paddingLeft": 0,
 "borderSize": 0,
 "right": "15%",
 "backgroundOpacity": 0,
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "visible",
 "scrollBarColor": "#000000",
 "paddingRight": 20,
 "top": "10%",
 "scrollBarVisible": "rollOver",
 "propagateClick": false,
 "minWidth": 1,
 "bottom": "80%",
 "scrollBarOpacity": 0.5,
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "horizontalAlign": "right",
 "paddingTop": 20,
 "scrollBarWidth": 10,
 "class": "Container",
 "contentOpaque": false,
 "shadow": false,
 "data": {
  "name": "Container X global"
 },
 "layout": "vertical"
},
{
 "children": [
  "this.Container_3A67552A_0C3A_67BD_4195_ECE46CCB34EA",
  "this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0"
 ],
 "shadowBlurRadius": 25,
 "shadowSpread": 1,
 "left": "15%",
 "right": "15%",
 "shadowHorizontalLength": 0,
 "shadowColor": "#000000",
 "id": "Container_39A197B1_0C06_62AF_419A_D15E4DDD2528",
 "backgroundOpacity": 1,
 "paddingLeft": 0,
 "borderSize": 0,
 "shadowOpacity": 0.3,
 "minHeight": 1,
 "creationPolicy": "inAdvance",
 "borderRadius": 0,
 "overflow": "visible",
 "scrollBarColor": "#000000",
 "paddingRight": 0,
 "top": "10%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "horizontalAlign": "center",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "bottom": "10%",
 "scrollBarOpacity": 0.5,
 "gap": 10,
 "shadowVerticalLength": 0,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "shadow": true,
 "contentOpaque": false,
 "data": {
  "name": "Global"
 },
 "layout": "absolute"
},
{
 "children": [
  "this.WebFrame_22F9EEFF_0C1A_2293_4165_411D4444EFEA"
 ],
 "shadowBlurRadius": 25,
 "shadowSpread": 1,
 "left": "15%",
 "right": "15%",
 "shadowHorizontalLength": 0,
 "shadowColor": "#000000",
 "id": "Container_221C1648_0C06_E5FD_4180_8A2E8B66315E",
 "backgroundOpacity": 1,
 "paddingLeft": 0,
 "borderSize": 0,
 "shadowOpacity": 0.3,
 "minHeight": 1,
 "creationPolicy": "inAdvance",
 "borderRadius": 0,
 "overflow": "scroll",
 "scrollBarColor": "#000000",
 "paddingRight": 0,
 "top": "10%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "horizontalAlign": "left",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "bottom": "10%",
 "scrollBarOpacity": 0.5,
 "gap": 10,
 "shadowVerticalLength": 0,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "shadow": true,
 "contentOpaque": false,
 "data": {
  "name": "Global"
 },
 "layout": "horizontal"
},
{
 "verticalAlign": "top",
 "children": [
  "this.IconButton_221B2648_0C06_E5FD_41A6_F9E27CDB95AF"
 ],
 "id": "Container_221B3648_0C06_E5FD_4199_FCE031AE003B",
 "left": "15%",
 "paddingLeft": 0,
 "borderSize": 0,
 "right": "15%",
 "backgroundOpacity": 0,
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "visible",
 "scrollBarColor": "#000000",
 "paddingRight": 20,
 "top": "10%",
 "scrollBarVisible": "rollOver",
 "propagateClick": false,
 "minWidth": 1,
 "bottom": "80%",
 "scrollBarOpacity": 0.5,
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "horizontalAlign": "right",
 "paddingTop": 20,
 "scrollBarWidth": 10,
 "class": "Container",
 "contentOpaque": false,
 "shadow": false,
 "data": {
  "name": "Container X global"
 },
 "layout": "vertical"
},
{
 "children": [
  "this.Container_2A19EC4C_0D3B_DFF0_414D_37145C22C5BC"
 ],
 "shadowBlurRadius": 25,
 "id": "Container_2A193C4C_0D3B_DFF0_4161_A2CD128EF536",
 "left": "15%",
 "right": "15%",
 "shadowHorizontalLength": 0,
 "shadowColor": "#000000",
 "borderSize": 0,
 "backgroundOpacity": 1,
 "paddingLeft": 0,
 "shadowSpread": 1,
 "shadowOpacity": 0.3,
 "minHeight": 1,
 "creationPolicy": "inAdvance",
 "borderRadius": 0,
 "overflow": "visible",
 "scrollBarColor": "#000000",
 "paddingRight": 0,
 "shadowVerticalLength": 0,
 "top": "10%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "horizontalAlign": "center",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "bottom": "10%",
 "scrollBarOpacity": 0.5,
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "shadow": true,
 "contentOpaque": false,
 "data": {
  "name": "Global"
 },
 "layout": "vertical"
},
{
 "children": [
  "this.Container_06C5ABA5_1140_A63F_41A9_850CF958D0DB",
  "this.Container_27875147_3F82_7A70_41CC_C0FFBB32BEFD",
  "this.Container_06C58BA5_1140_A63F_419D_EC83F94F8C54"
 ],
 "shadowBlurRadius": 25,
 "shadowSpread": 1,
 "left": "15%",
 "right": "15%",
 "shadowHorizontalLength": 0,
 "shadowColor": "#000000",
 "id": "Container_06C5DBA5_1140_A63F_41AD_1D83A33F1255",
 "backgroundOpacity": 1,
 "paddingLeft": 0,
 "borderSize": 0,
 "shadowOpacity": 0.3,
 "minHeight": 1,
 "creationPolicy": "inAdvance",
 "borderRadius": 0,
 "overflow": "scroll",
 "scrollBarColor": "#000000",
 "paddingRight": 0,
 "top": "10%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "horizontalAlign": "left",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "bottom": "10%",
 "scrollBarOpacity": 0.5,
 "gap": 0,
 "shadowVerticalLength": 0,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "shadow": true,
 "contentOpaque": false,
 "data": {
  "name": "Global"
 },
 "layout": "horizontal"
},
{
 "verticalAlign": "top",
 "children": [
  "this.IconButton_06C40BA5_1140_A63F_41AC_FA560325FD81"
 ],
 "id": "Container_06C43BA5_1140_A63F_41A1_96DC8F4CAD2F",
 "left": "15%",
 "paddingLeft": 0,
 "borderSize": 0,
 "right": "15%",
 "backgroundOpacity": 0,
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "visible",
 "scrollBarColor": "#000000",
 "paddingRight": 20,
 "top": "10%",
 "scrollBarVisible": "rollOver",
 "propagateClick": false,
 "minWidth": 1,
 "bottom": "80%",
 "scrollBarOpacity": 0.5,
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "horizontalAlign": "right",
 "paddingTop": 20,
 "scrollBarWidth": 10,
 "class": "Container",
 "contentOpaque": false,
 "shadow": false,
 "data": {
  "name": "Container X global"
 },
 "layout": "vertical"
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_3E2DD18A_2C5E_C46E_41B8_42B715DA8683",
 "levels": [
  {
   "url": "media/panorama_271A82F5_2C4A_C5BB_41C0_FD507DB02B43_0_HS_0_0.png",
   "width": 640,
   "height": 300,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_3E23518A_2C5E_C46E_41B7_E7DAC0A55218",
 "levels": [
  {
   "url": "media/panorama_26B6E15D_2C4A_44EA_41C0_85CFF7FB25FE_0_HS_0_0.png",
   "width": 640,
   "height": 300,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_3E2CB18A_2C5E_C46E_4177_0DDAC971A615",
 "levels": [
  {
   "url": "media/panorama_26B6E15D_2C4A_44EA_41C0_85CFF7FB25FE_0_HS_1_0.png",
   "width": 640,
   "height": 300,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_3E2C718A_2C5E_C46E_41B3_07F892159339",
 "levels": [
  {
   "url": "media/panorama_26B73861_2C4A_44DB_4199_31BC46CA7F25_0_HS_2_0.png",
   "width": 640,
   "height": 300,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_281F3586_3772_59A6_41BA_015B6ED2C667",
 "levels": [
  {
   "url": "media/panorama_26B73861_2C4A_44DB_4199_31BC46CA7F25_0_HS_3_0.png",
   "width": 460,
   "height": 690,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_3E23D189_2C5E_C46A_4192_D15AE9C4043F",
 "levels": [
  {
   "url": "media/panorama_26B6FC37_2C4A_7CA7_41BE_C6265F38D480_0_HS_0_0.png",
   "width": 640,
   "height": 300,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_3E23018A_2C5E_C46E_418C_CBF9FD6FC7AE",
 "levels": [
  {
   "url": "media/panorama_26B6FC37_2C4A_7CA7_41BE_C6265F38D480_0_HS_1_0.png",
   "width": 480,
   "height": 420,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 5,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_3F016D3C_2C7B_DCAA_41C3_88541006DB18",
 "levels": [
  {
   "url": "media/panorama_26B73581_2C4A_4C5B_41AA_0726EDA9CBB5_0_HS_0_0.png",
   "width": 1080,
   "height": 600,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 20
},
{
 "rowCount": 7,
 "class": "AnimatedImageResource",
 "colCount": 5,
 "frameDuration": 41,
 "id": "AnimatedImageResource_3F01DD3D_2C7B_DCAA_417C_3749EF9C631F",
 "levels": [
  {
   "url": "media/panorama_26B73581_2C4A_4C5B_41AA_0726EDA9CBB5_0_HS_1_0.png",
   "width": 600,
   "height": 560,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 32
},
{
 "rowCount": 5,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_3E226189_2C5E_C46A_41BE_429FA21E0902",
 "levels": [
  {
   "url": "media/panorama_26B62ED2_2C4A_5DF9_41AD_9342E9FAC80E_0_HS_0_0.png",
   "width": 1080,
   "height": 600,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 20
},
{
 "fontFamily": "Arial",
 "fontColor": "#FFFFFF",
 "shadowBlurRadius": 6,
 "id": "Button_3BC20CE4_2DFA_DDD9_41C5_8BC770B761FC",
 "rollOverBackgroundColor": [
  "#CE6700"
 ],
 "fontStyle": "normal",
 "width": 60,
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 1,
 "iconHeight": 17,
 "shadowSpread": 1,
 "rollOverBackgroundOpacity": 1,
 "minHeight": 1,
 "borderRadius": 0,
 "borderColor": "#000000",
 "paddingRight": 0,
 "height": 60,
 "rollOverBackgroundColorRatios": [
  0
 ],
 "backgroundColorRatios": [
  0
 ],
 "propagateClick": false,
 "verticalAlign": "middle",
 "backgroundColor": [
  "#666666"
 ],
 "minWidth": 1,
 "mode": "toggle",
 "pressedIconURL": "skin/Button_3BC20CE4_2DFA_DDD9_41C5_8BC770B761FC_pressed.png",
 "shadowColor": "#000000",
 "gap": 5,
 "iconBeforeLabel": true,
 "fontSize": 12,
 "paddingBottom": 5,
 "click": "if(!this.Container_0A760F11_3BA1_BFAE_41CD_32268FCAF8B4.get('visible')){ this.setComponentVisibility(this.Container_0A760F11_3BA1_BFAE_41CD_32268FCAF8B4, true, 0, null, null, false) } else { this.setComponentVisibility(this.Container_0A760F11_3BA1_BFAE_41CD_32268FCAF8B4, false, 0, null, null, false) }",
 "horizontalAlign": "center",
 "paddingTop": 0,
 "iconURL": "skin/Button_3BC20CE4_2DFA_DDD9_41C5_8BC770B761FC.png",
 "class": "Button",
 "iconWidth": 20,
 "backgroundColorDirection": "vertical",
 "fontWeight": "normal",
 "textDecoration": "none",
 "cursor": "hand",
 "shadow": false,
 "data": {
  "name": "Button Settings"
 },
 "layout": "horizontal"
},
{
 "children": [
  "this.Image_062A182F_1140_E20B_41B0_9CB8FFD6AA5A"
 ],
 "id": "Container_062A682F_1140_E20B_41B0_3071FCBF3DC9",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 1,
 "scrollBarColor": "#000000",
 "creationPolicy": "inAdvance",
 "width": "85%",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "backgroundColorRatios": [
  0
 ],
 "propagateClick": false,
 "horizontalAlign": "center",
 "backgroundColor": [
  "#FFFFFF"
 ],
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "height": "100%",
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "middle",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "contentOpaque": false,
 "shadow": false,
 "data": {
  "name": "-left"
 },
 "layout": "absolute"
},
{
 "id": "Container_26D3A42C_3F86_BA30_419B_2C6BE84D2718",
 "width": 8,
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 1,
 "scrollBarColor": "#000000",
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "backgroundColorRatios": [
  0
 ],
 "propagateClick": false,
 "horizontalAlign": "left",
 "backgroundColor": [
  "#F7931E"
 ],
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "height": "100%",
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "contentOpaque": false,
 "shadow": false,
 "data": {
  "name": "orange line"
 },
 "layout": "absolute"
},
{
 "children": [
  "this.Container_062A3830_1140_E215_4195_1698933FE51C",
  "this.Container_062A2830_1140_E215_41AA_EB25B7BD381C",
  "this.Container_062AE830_1140_E215_4180_196ED689F4BD"
 ],
 "id": "Container_062A082F_1140_E20A_4193_DF1A4391DC79",
 "paddingLeft": 50,
 "borderSize": 0,
 "backgroundOpacity": 1,
 "scrollBarColor": "#0069A3",
 "creationPolicy": "inAdvance",
 "width": "50%",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "visible",
 "paddingRight": 50,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "horizontalAlign": "left",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 460,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.51,
 "height": "100%",
 "gap": 0,
 "scrollBarMargin": 2,
 "paddingBottom": 20,
 "verticalAlign": "top",
 "paddingTop": 20,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "contentOpaque": false,
 "shadow": false,
 "data": {
  "name": "-right"
 },
 "layout": "vertical"
},
{
 "maxWidth": 60,
 "id": "IconButton_062A8830_1140_E215_419D_3439F16CCB3E",
 "maxHeight": 60,
 "width": "25%",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "minHeight": 50,
 "borderRadius": 0,
 "paddingRight": 0,
 "transparencyActive": false,
 "propagateClick": false,
 "verticalAlign": "middle",
 "height": "75%",
 "rollOverIconURL": "skin/IconButton_062A8830_1140_E215_419D_3439F16CCB3E_rollover.jpg",
 "minWidth": 50,
 "pressedIconURL": "skin/IconButton_062A8830_1140_E215_419D_3439F16CCB3E_pressed.jpg",
 "mode": "push",
 "click": "this.setComponentVisibility(this.Container_062AB830_1140_E215_41AF_6C9D65345420, false, 0, null, null, false)",
 "paddingBottom": 0,
 "horizontalAlign": "center",
 "paddingTop": 0,
 "iconURL": "skin/IconButton_062A8830_1140_E215_419D_3439F16CCB3E.jpg",
 "class": "IconButton",
 "cursor": "hand",
 "shadow": false,
 "data": {
  "name": "X"
 }
},
{
 "children": [
  "this.IconButton_38922473_0C06_2593_4199_C585853A1AB3"
 ],
 "id": "Container_3A67552A_0C3A_67BD_4195_ECE46CCB34EA",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0.3,
 "scrollBarColor": "#000000",
 "creationPolicy": "inAdvance",
 "width": "100%",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "height": 140,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "horizontalAlign": "left",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "contentOpaque": false,
 "data": {
  "name": "header"
 },
 "layout": "absolute"
},
{
 "itemMaxHeight": 1000,
 "itemMaxWidth": 1000,
 "rollOverItemThumbnailShadowColor": "#F7931E",
 "left": 0,
 "itemHorizontalAlign": "center",
 "itemLabelFontFamily": "Montserrat",
 "data": {
  "name": "ThumbnailList"
 },
 "id": "ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0",
 "itemThumbnailOpacity": 1,
 "rollOverItemThumbnailShadowVerticalLength": 0,
 "width": "100%",
 "itemWidth": 220,
 "paddingLeft": 70,
 "selectedItemThumbnailShadow": true,
 "itemBorderRadius": 0,
 "backgroundOpacity": 0,
 "itemLabelGap": 7,
 "itemLabelPosition": "bottom",
 "minHeight": 1,
 "itemThumbnailBorderRadius": 0,
 "horizontalAlign": "center",
 "selectedItemThumbnailShadowBlurRadius": 16,
 "paddingRight": 70,
 "verticalAlign": "middle",
 "height": "92%",
 "itemMinHeight": 50,
 "propagateClick": false,
 "itemPaddingLeft": 3,
 "minWidth": 1,
 "itemPaddingRight": 3,
 "selectedItemThumbnailShadowHorizontalLength": 0,
 "selectedItemLabelFontColor": "#F7931E",
 "scrollBarMargin": 2,
 "itemBackgroundColor": [],
 "scrollBarWidth": 10,
 "itemVerticalAlign": "top",
 "itemPaddingTop": 3,
 "itemBackgroundColorRatios": [],
 "itemMinWidth": 50,
 "itemThumbnailShadow": false,
 "shadow": false,
 "selectedItemLabelFontWeight": "bold",
 "rollOverItemThumbnailShadowBlurRadius": 0,
 "itemLabelTextDecoration": "none",
 "itemHeight": 160,
 "itemLabelFontWeight": "normal",
 "borderSize": 0,
 "playList": "this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist",
 "scrollBarColor": "#F7931E",
 "itemLabelFontSize": 13,
 "rollOverItemThumbnailShadow": true,
 "itemThumbnailScaleMode": "fit_outside",
 "borderRadius": 5,
 "itemThumbnailHeight": 125,
 "scrollBarOpacity": 0.5,
 "rollOverItemLabelFontColor": "#F7931E",
 "scrollBarVisible": "rollOver",
 "bottom": -0.2,
 "itemBackgroundColorDirection": "vertical",
 "itemLabelFontColor": "#666666",
 "gap": 26,
 "paddingBottom": 70,
 "selectedItemThumbnailShadowVerticalLength": 0,
 "paddingTop": 10,
 "itemThumbnailWidth": 220,
 "itemPaddingBottom": 3,
 "class": "ThumbnailGrid",
 "itemBackgroundOpacity": 0,
 "rollOverItemThumbnailShadowHorizontalLength": 8,
 "itemLabelHorizontalAlign": "center",
 "itemMode": "normal",
 "itemOpacity": 1,
 "itemLabelFontStyle": "normal"
},
{
 "scrollEnabled": true,
 "id": "WebFrame_22F9EEFF_0C1A_2293_4165_411D4444EFEA",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 1,
 "url": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14377.55330038866!2d-73.99492968084243!3d40.75084469078082!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9f775f259%3A0x999668d0d7c3fd7d!2s400+5th+Ave%2C+New+York%2C+NY+10018!5e0!3m2!1ses!2sus!4v1467271743182\" width=\"600\" height=\"450\" frameborder=\"0\" style=\"border:0\" allowfullscreen>",
 "width": "100%",
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 0,
 "backgroundColorRatios": [
  0
 ],
 "propagateClick": false,
 "backgroundColor": [
  "#FFFFFF"
 ],
 "minWidth": 1,
 "height": "100%",
 "paddingBottom": 0,
 "paddingTop": 0,
 "insetBorder": false,
 "class": "WebFrame",
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "data": {
  "name": "WebFrame48191"
 }
},
{
 "maxWidth": 60,
 "id": "IconButton_221B2648_0C06_E5FD_41A6_F9E27CDB95AF",
 "maxHeight": 60,
 "width": "25%",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "minHeight": 50,
 "borderRadius": 0,
 "paddingRight": 0,
 "transparencyActive": false,
 "propagateClick": false,
 "verticalAlign": "middle",
 "height": "75%",
 "rollOverIconURL": "skin/IconButton_221B2648_0C06_E5FD_41A6_F9E27CDB95AF_rollover.jpg",
 "minWidth": 50,
 "pressedIconURL": "skin/IconButton_221B2648_0C06_E5FD_41A6_F9E27CDB95AF_pressed.jpg",
 "mode": "push",
 "click": "this.setComponentVisibility(this.Container_221B1648_0C06_E5FD_417F_E6FCCCB4A6D7, false, 0, null, null, false)",
 "paddingBottom": 0,
 "horizontalAlign": "center",
 "paddingTop": 0,
 "iconURL": "skin/IconButton_221B2648_0C06_E5FD_41A6_F9E27CDB95AF.jpg",
 "class": "IconButton",
 "cursor": "hand",
 "shadow": false,
 "data": {
  "name": "X"
 }
},
{
 "children": [
  "this.ViewerAreaLabeled_2A198C4C_0D3B_DFF0_419F_C9A785406D9C",
  "this.IconButton_2A19BC4C_0D3B_DFF0_419F_D0DCB12FF482",
  "this.IconButton_2A19AC4C_0D3B_DFF0_4181_A2C230C2E510",
  "this.IconButton_2A19CC4C_0D3B_DFF0_41AA_D2AC34177CF1"
 ],
 "id": "Container_2A19EC4C_0D3B_DFF0_414D_37145C22C5BC",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0.3,
 "scrollBarColor": "#000000",
 "creationPolicy": "inAdvance",
 "width": "100%",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "visible",
 "paddingRight": 0,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "horizontalAlign": "left",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "height": "100%",
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "contentOpaque": false,
 "shadow": false,
 "data": {
  "name": "Container photo"
 },
 "layout": "absolute"
},
{
 "children": [
  "this.Image_06C5BBA5_1140_A63F_41A7_E6D01D4CC397"
 ],
 "id": "Container_06C5ABA5_1140_A63F_41A9_850CF958D0DB",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 1,
 "scrollBarColor": "#000000",
 "creationPolicy": "inAdvance",
 "width": "55%",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "backgroundColorRatios": [
  0
 ],
 "propagateClick": false,
 "horizontalAlign": "center",
 "backgroundColor": [
  "#000000"
 ],
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "height": "100%",
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "middle",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "contentOpaque": false,
 "shadow": false,
 "data": {
  "name": "-left"
 },
 "layout": "absolute"
},
{
 "id": "Container_27875147_3F82_7A70_41CC_C0FFBB32BEFD",
 "width": 8,
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 1,
 "scrollBarColor": "#000000",
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "backgroundColorRatios": [
  0
 ],
 "propagateClick": false,
 "horizontalAlign": "left",
 "backgroundColor": [
  "#F7931E"
 ],
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "height": "100%",
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "contentOpaque": false,
 "shadow": false,
 "data": {
  "name": "orange line"
 },
 "layout": "absolute"
},
{
 "children": [
  "this.Container_06C59BA5_1140_A63F_41B1_4B41E3B7D98D",
  "this.Container_06C46BA5_1140_A63F_4151_B5A20B4EA86A",
  "this.Container_06C42BA5_1140_A63F_4195_037A0687532F"
 ],
 "id": "Container_06C58BA5_1140_A63F_419D_EC83F94F8C54",
 "paddingLeft": 60,
 "borderSize": 0,
 "backgroundOpacity": 1,
 "scrollBarColor": "#0069A3",
 "creationPolicy": "inAdvance",
 "width": "45%",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "visible",
 "paddingRight": 60,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "horizontalAlign": "left",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 460,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.51,
 "height": "100%",
 "gap": 0,
 "scrollBarMargin": 2,
 "paddingBottom": 20,
 "verticalAlign": "top",
 "paddingTop": 20,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "contentOpaque": false,
 "shadow": false,
 "data": {
  "name": "-right"
 },
 "layout": "vertical"
},
{
 "maxWidth": 60,
 "id": "IconButton_06C40BA5_1140_A63F_41AC_FA560325FD81",
 "maxHeight": 60,
 "width": "25%",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "minHeight": 50,
 "borderRadius": 0,
 "paddingRight": 0,
 "transparencyActive": false,
 "propagateClick": false,
 "verticalAlign": "middle",
 "height": "75%",
 "rollOverIconURL": "skin/IconButton_06C40BA5_1140_A63F_41AC_FA560325FD81_rollover.jpg",
 "minWidth": 50,
 "pressedIconURL": "skin/IconButton_06C40BA5_1140_A63F_41AC_FA560325FD81_pressed.jpg",
 "mode": "push",
 "click": "this.setComponentVisibility(this.Container_06C41BA5_1140_A63F_41AE_B0CBD78DEFDC, false, 0, null, null, false)",
 "paddingBottom": 0,
 "horizontalAlign": "center",
 "paddingTop": 0,
 "iconURL": "skin/IconButton_06C40BA5_1140_A63F_41AC_FA560325FD81.jpg",
 "class": "IconButton",
 "cursor": "hand",
 "shadow": false,
 "data": {
  "name": "X"
 }
},
{
 "maxWidth": 2000,
 "id": "Image_062A182F_1140_E20B_41B0_9CB8FFD6AA5A",
 "left": "0%",
 "maxHeight": 1000,
 "width": "99.057%",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "url": "skin/Image_062A182F_1140_E20B_41B0_9CB8FFD6AA5A.png",
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 0,
 "top": "6.94%",
 "propagateClick": false,
 "horizontalAlign": "center",
 "height": "82.862%",
 "minWidth": 1,
 "paddingBottom": 0,
 "verticalAlign": "middle",
 "paddingTop": 0,
 "class": "Image",
 "scaleMode": "fit_outside",
 "shadow": false,
 "data": {
  "name": "photo"
 }
},
{
 "id": "Container_062A3830_1140_E215_4195_1698933FE51C",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0.3,
 "scrollBarColor": "#000000",
 "creationPolicy": "inAdvance",
 "width": "100%",
 "minHeight": 0,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "height": 60,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "horizontalAlign": "right",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "gap": 0,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 20,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "contentOpaque": false,
 "data": {
  "name": "Container space"
 },
 "layout": "horizontal"
},
{
 "children": [
  "this.HTMLText_062AD830_1140_E215_41B0_321699661E7F"
 ],
 "id": "Container_062A2830_1140_E215_41AA_EB25B7BD381C",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0.3,
 "scrollBarColor": "#E73B2C",
 "creationPolicy": "inAdvance",
 "width": "100%",
 "minHeight": 520,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "horizontalAlign": "left",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 100,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.79,
 "height": "100%",
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 30,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "contentOpaque": false,
 "shadow": false,
 "data": {
  "name": "Container text"
 },
 "layout": "vertical"
},
{
 "id": "Container_062AE830_1140_E215_4180_196ED689F4BD",
 "width": 370,
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0.3,
 "scrollBarColor": "#000000",
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "height": 40,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "horizontalAlign": "left",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "contentOpaque": false,
 "shadow": false,
 "data": {
  "name": "Container space"
 },
 "layout": "horizontal"
},
{
 "maxWidth": 60,
 "id": "IconButton_38922473_0C06_2593_4199_C585853A1AB3",
 "maxHeight": 60,
 "width": "100%",
 "paddingLeft": 0,
 "borderSize": 0,
 "right": 20,
 "backgroundOpacity": 0,
 "minHeight": 50,
 "borderRadius": 0,
 "paddingRight": 0,
 "top": 20,
 "transparencyActive": false,
 "propagateClick": false,
 "verticalAlign": "top",
 "height": "36.14%",
 "minWidth": 50,
 "pressedIconURL": "skin/IconButton_38922473_0C06_2593_4199_C585853A1AB3_pressed.jpg",
 "mode": "push",
 "rollOverIconURL": "skin/IconButton_38922473_0C06_2593_4199_C585853A1AB3_rollover.jpg",
 "click": "this.setComponentVisibility(this.Container_39DE87B1_0C06_62AF_417B_8CB0FB5C9D15, false, 0, null, null, false)",
 "paddingBottom": 0,
 "horizontalAlign": "right",
 "paddingTop": 0,
 "iconURL": "skin/IconButton_38922473_0C06_2593_4199_C585853A1AB3.jpg",
 "class": "IconButton",
 "cursor": "hand",
 "shadow": false,
 "data": {
  "name": "IconButton X"
 }
},
{
 "toolTipFontWeight": "normal",
 "playbackBarBackgroundColorDirection": "vertical",
 "id": "ViewerAreaLabeled_2A198C4C_0D3B_DFF0_419F_C9A785406D9C",
 "left": "0%",
 "playbackBarRight": 0,
 "playbackBarProgressBorderSize": 0,
 "playbackBarProgressBorderRadius": 0,
 "progressBarBorderSize": 0,
 "paddingLeft": 0,
 "progressBarBorderRadius": 0,
 "width": "100%",
 "playbackBarBorderRadius": 0,
 "toolTipShadowOpacity": 1,
 "minHeight": 1,
 "playbackBarProgressBorderColor": "#000000",
 "toolTipFontStyle": "normal",
 "playbackBarHeadBorderColor": "#000000",
 "toolTipFontFamily": "Arial",
 "progressLeft": 0,
 "paddingRight": 0,
 "propagateClick": false,
 "toolTipTextShadowOpacity": 0,
 "playbackBarHeadBorderRadius": 0,
 "height": "100%",
 "minWidth": 1,
 "playbackBarBorderSize": 0,
 "playbackBarHeadBorderSize": 0,
 "playbackBarProgressOpacity": 1,
 "vrPointerSelectionColor": "#FF6600",
 "playbackBarBackgroundOpacity": 1,
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "toolTipShadowHorizontalLength": 0,
 "playbackBarHeadShadowColor": "#000000",
 "progressRight": 0,
 "toolTipShadowVerticalLength": 0,
 "firstTransitionDuration": 0,
 "toolTipFontColor": "#606060",
 "toolTipBackgroundColor": "#F6F6F6",
 "progressBarBackgroundColorDirection": "vertical",
 "progressOpacity": 1,
 "vrPointerSelectionTime": 2000,
 "progressHeight": 10,
 "playbackBarHeadShadow": true,
 "progressBottom": 2,
 "shadow": false,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "progressBackgroundOpacity": 1,
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarOpacity": 1,
 "playbackBarHeadShadowOpacity": 0.7,
 "vrPointerColor": "#FFFFFF",
 "toolTipPaddingRight": 6,
 "toolTipBorderSize": 1,
 "progressBarOpacity": 1,
 "borderSize": 0,
 "toolTipPaddingTop": 4,
 "toolTipDisplayTime": 600,
 "toolTipPaddingLeft": 6,
 "progressBorderSize": 0,
 "displayTooltipInTouchScreens": true,
 "progressBorderRadius": 0,
 "playbackBarBorderColor": "#FFFFFF",
 "toolTipBorderRadius": 3,
 "borderRadius": 0,
 "playbackBarHeadShadowVerticalLength": 0,
 "transitionMode": "blending",
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "progressBackgroundColorRatios": [
  0.01
 ],
 "playbackBarHeadHeight": 15,
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "top": "0%",
 "playbackBarHeadShadowBlurRadius": 3,
 "progressBarBorderColor": "#0066FF",
 "playbackBarHeadShadowHorizontalLength": 0,
 "progressBarBackgroundColorRatios": [
  0
 ],
 "progressBackgroundColorDirection": "vertical",
 "transitionDuration": 500,
 "playbackBarHeadOpacity": 1,
 "playbackBarBottom": 0,
 "progressBorderColor": "#FFFFFF",
 "playbackBarLeft": 0,
 "toolTipShadowSpread": 0,
 "toolTipShadowBlurRadius": 3,
 "paddingBottom": 0,
 "toolTipTextShadowColor": "#000000",
 "toolTipOpacity": 1,
 "toolTipBorderColor": "#767676",
 "class": "ViewerArea",
 "toolTipFontSize": 12,
 "paddingTop": 0,
 "toolTipPaddingBottom": 4,
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "toolTipTextShadowBlurRadius": 3,
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "data": {
  "name": "Viewer photoalbum 1"
 },
 "toolTipShadowColor": "#333333",
 "playbackBarHeight": 10,
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "playbackBarHeadWidth": 6
},
{
 "maxWidth": 60,
 "id": "IconButton_2A19BC4C_0D3B_DFF0_419F_D0DCB12FF482",
 "left": 10,
 "maxHeight": 60,
 "width": "14.22%",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "minHeight": 50,
 "borderRadius": 0,
 "paddingRight": 0,
 "top": "20%",
 "transparencyActive": false,
 "propagateClick": false,
 "verticalAlign": "middle",
 "minWidth": 50,
 "pressedIconURL": "skin/IconButton_2A19BC4C_0D3B_DFF0_419F_D0DCB12FF482_pressed.png",
 "bottom": "20%",
 "rollOverIconURL": "skin/IconButton_2A19BC4C_0D3B_DFF0_419F_D0DCB12FF482_rollover.png",
 "paddingBottom": 0,
 "horizontalAlign": "center",
 "mode": "push",
 "paddingTop": 0,
 "iconURL": "skin/IconButton_2A19BC4C_0D3B_DFF0_419F_D0DCB12FF482.png",
 "class": "IconButton",
 "shadow": false,
 "cursor": "hand",
 "data": {
  "name": "IconButton <"
 }
},
{
 "maxWidth": 60,
 "id": "IconButton_2A19AC4C_0D3B_DFF0_4181_A2C230C2E510",
 "maxHeight": 60,
 "width": "14.22%",
 "paddingLeft": 0,
 "borderSize": 0,
 "right": 10,
 "backgroundOpacity": 0,
 "minHeight": 50,
 "borderRadius": 0,
 "paddingRight": 0,
 "top": "20%",
 "transparencyActive": false,
 "propagateClick": false,
 "verticalAlign": "middle",
 "minWidth": 50,
 "pressedIconURL": "skin/IconButton_2A19AC4C_0D3B_DFF0_4181_A2C230C2E510_pressed.png",
 "bottom": "20%",
 "rollOverIconURL": "skin/IconButton_2A19AC4C_0D3B_DFF0_4181_A2C230C2E510_rollover.png",
 "paddingBottom": 0,
 "horizontalAlign": "center",
 "mode": "push",
 "paddingTop": 0,
 "iconURL": "skin/IconButton_2A19AC4C_0D3B_DFF0_4181_A2C230C2E510.png",
 "class": "IconButton",
 "shadow": false,
 "cursor": "hand",
 "data": {
  "name": "IconButton >"
 }
},
{
 "maxWidth": 60,
 "id": "IconButton_2A19CC4C_0D3B_DFF0_41AA_D2AC34177CF1",
 "maxHeight": 60,
 "width": "10%",
 "paddingLeft": 0,
 "borderSize": 0,
 "right": 20,
 "backgroundOpacity": 0,
 "minHeight": 50,
 "borderRadius": 0,
 "paddingRight": 0,
 "top": 20,
 "transparencyActive": false,
 "propagateClick": false,
 "verticalAlign": "top",
 "height": "10%",
 "minWidth": 50,
 "pressedIconURL": "skin/IconButton_2A19CC4C_0D3B_DFF0_41AA_D2AC34177CF1_pressed.jpg",
 "mode": "push",
 "rollOverIconURL": "skin/IconButton_2A19CC4C_0D3B_DFF0_41AA_D2AC34177CF1_rollover.jpg",
 "click": "this.setComponentVisibility(this.Container_2A1A5C4D_0D3B_DFF0_41A9_8FC811D03C8E, false, 0, null, null, false)",
 "paddingBottom": 0,
 "horizontalAlign": "right",
 "paddingTop": 0,
 "iconURL": "skin/IconButton_2A19CC4C_0D3B_DFF0_41AA_D2AC34177CF1.jpg",
 "class": "IconButton",
 "cursor": "hand",
 "shadow": false,
 "data": {
  "name": "IconButton X"
 }
},
{
 "maxWidth": 2000,
 "id": "Image_06C5BBA5_1140_A63F_41A7_E6D01D4CC397",
 "left": "0%",
 "maxHeight": 1000,
 "width": "100%",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "url": "skin/Image_06C5BBA5_1140_A63F_41A7_E6D01D4CC397.jpg",
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 0,
 "top": "0%",
 "propagateClick": false,
 "horizontalAlign": "center",
 "height": "100%",
 "minWidth": 1,
 "paddingBottom": 0,
 "verticalAlign": "bottom",
 "paddingTop": 0,
 "class": "Image",
 "scaleMode": "fit_outside",
 "shadow": false,
 "data": {
  "name": "Image"
 }
},
{
 "id": "Container_06C59BA5_1140_A63F_41B1_4B41E3B7D98D",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0.3,
 "scrollBarColor": "#000000",
 "creationPolicy": "inAdvance",
 "width": "100%",
 "minHeight": 0,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "height": 60,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "horizontalAlign": "right",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "gap": 0,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 20,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "contentOpaque": false,
 "data": {
  "name": "Container space"
 },
 "layout": "horizontal"
},
{
 "children": [
  "this.HTMLText_0B42C466_11C0_623D_4193_9FAB57A5AC33",
  "this.Container_0D9BF47A_11C0_E215_41A4_A63C8527FF9C"
 ],
 "id": "Container_06C46BA5_1140_A63F_4151_B5A20B4EA86A",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0.3,
 "scrollBarColor": "#E73B2C",
 "creationPolicy": "inAdvance",
 "width": "100%",
 "minHeight": 520,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "horizontalAlign": "left",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 100,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.79,
 "height": "100%",
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 30,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "contentOpaque": false,
 "shadow": false,
 "data": {
  "name": "Container text"
 },
 "layout": "vertical"
},
{
 "id": "Container_06C42BA5_1140_A63F_4195_037A0687532F",
 "width": 370,
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0.3,
 "scrollBarColor": "#000000",
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "height": 40,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "horizontalAlign": "left",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "contentOpaque": false,
 "shadow": false,
 "data": {
  "name": "Container space"
 },
 "layout": "horizontal"
},
{
 "id": "HTMLText_062AD830_1140_E215_41B0_321699661E7F",
 "paddingLeft": 10,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "scrollBarColor": "#F7931E",
 "width": "100%",
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 10,
 "propagateClick": false,
 "height": "100%",
 "scrollBarMargin": 2,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "paddingBottom": 20,
 "scrollBarWidth": 10,
 "paddingTop": 0,
 "class": "HTMLText",
 "html": "<div style=\"text-align:left; color:#000; \"><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#f7931e;font-size:7.44vh;font-family:'Bebas Neue Bold';\">___</SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:3.58vh;font-family:'Montserrat';\"><B>About Thesaurus</B></SPAN></SPAN></DIV><p STYLE=\"margin:0; line-height:1.86vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#f7931e;font-size:1.86vh;font-family:'Montserrat';\"><B>Profile</B></SPAN></SPAN></DIV><p STYLE=\"margin:0; line-height:0.86vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\"/></p><p STYLE=\"margin:0; line-height:0.86vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\">Company name</SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\">Thesaurus inc.</SPAN></DIV><p STYLE=\"margin:0; line-height:0.86vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\">CEO</SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\">Takehiko Arai</SPAN></DIV><p STYLE=\"margin:0; line-height:0.86vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\">Director</SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\">Yusuke Arai</SPAN></DIV><p STYLE=\"margin:0; line-height:0.86vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\">Shin Tanaka</SPAN></DIV><p STYLE=\"margin:0; line-height:0.86vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\">Founding</SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\">3/8/2004</SPAN></DIV><p STYLE=\"margin:0; line-height:0.86vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\">Address</SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\">DX center</SPAN></DIV><p STYLE=\"margin:0; line-height:0.86vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\">2312-1, Tsuruga Gondoncho, Nagano City, Nagano Prefecture, 3800833</SPAN></DIV><p STYLE=\"margin:0; line-height:0.86vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\">DESIGN studio</SPAN></DIV><p STYLE=\"margin:0; line-height:0.86vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\">Junkei Building 610,2-2-18 Minami-Semba Chuo Ward, Osaka City, Osaka Prefecture, 5420081</SPAN></DIV><p STYLE=\"margin:0; line-height:0.86vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\">Business Content</SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\">Multi-faceted business environment analysis by a team of consultant \u00d7 designer</SPAN></DIV><p STYLE=\"margin:0; line-height:0.86vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\">Agile IT strategy execution project</SPAN></DIV><p STYLE=\"margin:0; line-height:0.86vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\">High cost performance development through collaboration with Bangladesh IT companies</SPAN></DIV><p STYLE=\"margin:0; line-height:0.86vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\">Sales and maintenance of system development infrastructure software</SPAN></DIV><p STYLE=\"margin:0; line-height:0.86vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\">Consulting on service development, branding, marketing communication</SPAN></DIV><p STYLE=\"margin:0; line-height:0.86vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\">History</SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\">8/2004</SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\">e Security Cube Co., Ltd. established</SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\">4/2012</SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\">IT consulting started</SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\">4/2013</SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\">Creative consulting started</SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\">8/2014</SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\">Changed company name to Thesaurus inc.</SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\">4/2019</SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\">Nagano DX Center opened.</SPAN></DIV><p STYLE=\"margin:0; line-height:2.72vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\"/></p></div>",
 "shadow": false,
 "data": {
  "name": "HTMLText"
 }
},
{
 "id": "HTMLText_0B42C466_11C0_623D_4193_9FAB57A5AC33",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "scrollBarColor": "#04A3E1",
 "width": "100%",
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 0,
 "propagateClick": false,
 "height": "45%",
 "scrollBarMargin": 2,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "paddingBottom": 10,
 "scrollBarWidth": 10,
 "paddingTop": 0,
 "class": "HTMLText",
 "html": "<div style=\"text-align:left; color:#000; \"><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#f7931e;font-size:7.44vh;font-family:'Bebas Neue Bold';\">___</SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:3.58vh;font-family:'Montserrat';\"><B>LOREM IPSUM</B></SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:3.58vh;font-family:'Montserrat';\"><B>DOLOR SIT AMET</B></SPAN></SPAN></DIV></div>",
 "shadow": false,
 "data": {
  "name": "HTMLText18899"
 }
},
{
 "children": [
  "this.Image_0B48D65D_11C0_6E0F_41A2_4D6F373BABA0",
  "this.HTMLText_0B4B0DC1_11C0_6277_41A4_201A5BB3F7AE"
 ],
 "id": "Container_0D9BF47A_11C0_E215_41A4_A63C8527FF9C",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0.3,
 "scrollBarColor": "#000000",
 "creationPolicy": "inAdvance",
 "width": "100%",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "horizontalAlign": "left",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "height": "80%",
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "contentOpaque": false,
 "shadow": false,
 "data": {
  "name": "- content"
 },
 "layout": "horizontal"
},
{
 "maxWidth": 200,
 "id": "Image_0B48D65D_11C0_6E0F_41A2_4D6F373BABA0",
 "maxHeight": 200,
 "width": "25%",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "url": "skin/Image_0B48D65D_11C0_6E0F_41A2_4D6F373BABA0.jpg",
 "horizontalAlign": "left",
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 0,
 "propagateClick": false,
 "verticalAlign": "top",
 "height": "100%",
 "minWidth": 1,
 "paddingBottom": 0,
 "paddingTop": 0,
 "class": "Image",
 "scaleMode": "fit_inside",
 "shadow": false,
 "data": {
  "name": "agent photo"
 }
},
{
 "id": "HTMLText_0B4B0DC1_11C0_6277_41A4_201A5BB3F7AE",
 "paddingLeft": 10,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "scrollBarColor": "#F7931E",
 "width": "75%",
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 10,
 "propagateClick": false,
 "height": "100%",
 "scrollBarMargin": 2,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "paddingBottom": 10,
 "scrollBarWidth": 10,
 "paddingTop": 0,
 "class": "HTMLText",
 "html": "<div style=\"text-align:left; color:#000; \"><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#f7931e;font-size:1.86vh;font-family:'Montserrat';\"><B>JOHN DOE</B></SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:1.72vh;font-family:'Montserrat';\">LICENSED REAL ESTATE SALESPERSON</SPAN></SPAN></DIV><p STYLE=\"margin:0; line-height:0.86vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#999999;font-family:'Montserrat';\">Tlf.: +11 111 111 111</SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#999999;font-family:'Montserrat';\">jhondoe@realestate.com</SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#999999;font-family:'Montserrat';\">www.loremipsum.com</SPAN></SPAN></DIV><p STYLE=\"margin:0; line-height:0.86vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\"/></p><p STYLE=\"margin:0; line-height:0.86vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\">Mauris aliquet neque quis libero consequat vestibulum. Donec lacinia consequat dolor viverra sagittis. Praesent consequat porttitor risus, eu condimentum nunc. Proin et velit ac sapien luctus efficitur egestas ac augue. Nunc dictum, augue eget eleifend interdum, quam libero imperdiet lectus, vel scelerisque turpis lectus vel ligula. Duis a porta sem. Maecenas sollicitudin nunc id risus fringilla, a pharetra orci iaculis. Aliquam turpis ligula, tincidunt sit amet consequat ac, imperdiet non dolor.</SPAN></DIV></div>",
 "shadow": false,
 "data": {
  "name": "HTMLText19460"
 }
}],
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "mouseWheelEnabled": true,
 "class": "Player",
 "vrPolyfillScale": 0.5,
 "mobileMipmappingEnabled": false,
 "contentOpaque": false,
 "shadow": false,
 "data": {
  "name": "Player468"
 },
 "layout": "absolute"
};

    
    function HistoryData(playList) {
        this.playList = playList;
        this.list = [];
        this.pointer = -1;
    }

    HistoryData.prototype.add = function(index){
        if(this.pointer < this.list.length && this.list[this.pointer] == index) {
            return;
        }
        ++this.pointer;
        this.list.splice(this.pointer, this.list.length - this.pointer, index);
    };

    HistoryData.prototype.back = function(){
        if(!this.canBack()) return;
        this.playList.set('selectedIndex', this.list[--this.pointer]);
    };

    HistoryData.prototype.forward = function(){
        if(!this.canForward()) return;
        this.playList.set('selectedIndex', this.list[++this.pointer]);
    };

    HistoryData.prototype.canBack = function(){
        return this.pointer > 0;
    };

    HistoryData.prototype.canForward = function(){
        return this.pointer >= 0 && this.pointer < this.list.length-1;
    };
    //

    if(script.data == undefined)
        script.data = {};
    script.data["history"] = {};    //playListID -> HistoryData

    TDV.PlayerAPI.defineScript(script);
})();
