(function () {
  var PLAYLIST = [
    { title: 'Soulmate', artist: 'Kahitna', src: 'assets/audio/Soulmate - Kahitna.mp3', cover: null },
    { title: 'Mantan Terindah', artist: 'Kahitna', src: 'assets/audio/Mantan Terindah - Kahitna.mp3', cover: null },
    { title: 'Promise', artist: 'Laufey', src: 'assets/audio/Promise - Laufey.mp3', cover: null },
    { title: 'Let You Break My Heart Again', artist: 'Laufey', src: 'assets/audio/Let You Break My Heart Again - Laufey.mp3', cover: null },
    { title: 'Too Little, Too Late', artist: 'JoJo', src: 'assets/audio/Too Little, Too Late.mp3', cover: null }
  ];
  var player=document.getElementById('musicPlayer'),secretBtn=document.getElementById('secretMusicBtn'),closeBtn=document.getElementById('mpCloseBtn'),playBtn=document.getElementById('mpPlayBtn'),playIcon=document.getElementById('mpPlayIcon'),prevBtn=document.getElementById('mpPrevBtn'),nextBtn=document.getElementById('mpNextBtn'),progressWrap=document.getElementById('mpProgressWrap'),progressFill=document.getElementById('mpProgressFill'),currentTimeEl=document.getElementById('mpCurrentTime'),durationEl=document.getElementById('mpDuration'),volumeSlider=document.getElementById('mpVolume'),playlistEl=document.getElementById('mpPlaylist'),coverWrap=document.getElementById('mpCoverWrap'),coverImg=document.getElementById('mpCoverImg'),coverPlaceholder=document.getElementById('mpCoverPlaceholder'),trackTitle=document.getElementById('mpTrackTitle'),trackArtist=document.getElementById('mpTrackArtist');
  if(!player||!secretBtn)return;
  var audio=new Audio(),currentIndex=0,isPlaying=false,isDragging=false,filteredList=[],PLAY_PATH='M8 5v14l11-7z',PAUSE_PATH='M6 19h4V5H6v14zm8-14v14h4V5h-4z';
  function fmt(s){if(!isFinite(s)||isNaN(s))return'0:00';var m=Math.floor(s/60),sec=Math.floor(s%60);return m+':'+(sec<10?'0':'')+sec;}
  function esc(str){var d=document.createElement('div');d.textContent=str;return d.innerHTML;}
  function buildPlaylist(){
    playlistEl.innerHTML='';
    if(!filteredList.length){playlistEl.innerHTML='<div class="mp-no-audio">Tambahkan file audio ke <code>assets/audio/</code></div>';return;}
    filteredList.forEach(function(track,idx){
      var item=document.createElement('div');
      item.className='mp-playlist-item';item.setAttribute('role','listitem');item.setAttribute('tabindex','0');
      item.innerHTML='<span class="mp-playlist-num">'+(idx+1)+'</span><div class="mp-pl-info"><div class="mp-pl-title">'+esc(track.title)+'</div><div class="mp-pl-artist">'+esc(track.artist)+'</div></div><div class="mp-eq-bars" aria-hidden="true"><span></span><span></span><span></span></div><span class="mp-pl-duration">-:--</span>';
      (function(i){item.addEventListener('click',function(){selectTrack(i,true);});item.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();selectTrack(i,true);}});}(idx));
      playlistEl.appendChild(item);
      loadDuration(track.src,idx);
    });
  }
  function loadDuration(src,idx){var a=new Audio();a.preload='metadata';a.onloadedmetadata=function(){var items=playlistEl.querySelectorAll('.mp-playlist-item');if(items[idx]){var el=items[idx].querySelector('.mp-pl-duration');if(el)el.textContent=fmt(a.duration);}};a.src=encodeURI(src);}
  function selectTrack(index,autoPlay){
    if(!filteredList.length)return;
    currentIndex=Math.max(0,Math.min(index,filteredList.length-1));
    var track=filteredList[currentIndex];
    audio.pause();audio.currentTime=0;audio.src=encodeURI(track.src);audio.volume=parseFloat(volumeSlider.value);audio.load();
    trackTitle.textContent=track.title;trackArtist.textContent=track.artist;
    if(track.cover){coverImg.src=track.cover;coverImg.style.display='block';coverPlaceholder.style.display='none';}
    else{coverImg.style.display='none';coverPlaceholder.style.display='flex';}
    progressFill.style.width='0%';progressWrap.setAttribute('aria-valuenow',0);currentTimeEl.textContent='0:00';durationEl.textContent='0:00';
    updatePlaylistActive();
    if(autoPlay)doPlay();else setPlayState(false);
  }
  function doPlay(){var p=audio.play();if(p)p.catch(function(err){console.warn('[MusicPlayer]',err.message);setPlayState(false);});}
  function togglePlay(){if(!filteredList.length)return;if(!audio.src||audio.readyState===0){selectTrack(currentIndex,true);return;}if(isPlaying)audio.pause();else doPlay();}
  function setPlayState(state){
    isPlaying=state;
    var pathEl=playIcon?playIcon.querySelector('path'):null;
    if(pathEl)pathEl.setAttribute('d',state?PAUSE_PATH:PLAY_PATH);
    playBtn.setAttribute('aria-label',state?'Pause':'Play');
    coverWrap.classList.toggle('is-playing',state);
    updatePlaylistActive();
  }
  function prevTrack(){if(!filteredList.length)return;if(audio.currentTime>3){audio.currentTime=0;return;}selectTrack((currentIndex-1+filteredList.length)%filteredList.length,isPlaying);}
  function nextTrack(){if(!filteredList.length)return;selectTrack((currentIndex+1)%filteredList.length,isPlaying);}
  function updateProgress(){if(!audio.duration||isDragging)return;var pct=(audio.currentTime/audio.duration)*100;progressFill.style.width=pct+'%';progressWrap.setAttribute('aria-valuenow',Math.round(pct));currentTimeEl.textContent=fmt(audio.currentTime);}
  function seekFromEvent(e){if(!audio.duration)return;var rect=progressWrap.getBoundingClientRect(),cx=(e.touches&&e.touches.length)?e.touches[0].clientX:e.clientX,pct=Math.max(0,Math.min(1,(cx-rect.left)/rect.width));audio.currentTime=pct*audio.duration;progressFill.style.width=(pct*100)+'%';currentTimeEl.textContent=fmt(audio.currentTime);}
  function updatePlaylistActive(){var items=playlistEl.querySelectorAll('.mp-playlist-item');items.forEach(function(item,i){item.classList.toggle('is-active',i===currentIndex);item.classList.toggle('is-playing',i===currentIndex&&isPlaying);});}
  function openPlayer(){player.classList.add('is-visible');secretBtn.setAttribute('aria-expanded','true');}
  function closePlayer(){player.classList.remove('is-visible');secretBtn.setAttribute('aria-expanded','false');}
  function togglePlayer(){player.classList.contains('is-visible')?closePlayer():openPlayer();}
  audio.addEventListener('play',function(){setPlayState(true);});
  audio.addEventListener('pause',function(){setPlayState(false);});
  audio.addEventListener('ended',nextTrack);
  audio.addEventListener('timeupdate',updateProgress);
  audio.addEventListener('loadedmetadata',function(){durationEl.textContent=fmt(audio.duration);});
  audio.addEventListener('error',function(){setPlayState(false);});
  secretBtn.addEventListener('click',togglePlayer);
  closeBtn.addEventListener('click',closePlayer);
  playBtn.addEventListener('click',togglePlay);
  prevBtn.addEventListener('click',prevTrack);
  nextBtn.addEventListener('click',nextTrack);
  volumeSlider.addEventListener('input',function(){audio.volume=parseFloat(volumeSlider.value);});
  progressWrap.addEventListener('mousedown',function(e){isDragging=true;seekFromEvent(e);});
  document.addEventListener('mousemove',function(e){if(isDragging)seekFromEvent(e);});
  document.addEventListener('mouseup',function(){isDragging=false;});
  progressWrap.addEventListener('touchstart',function(e){isDragging=true;seekFromEvent(e);},{passive:true});
  document.addEventListener('touchmove',function(e){if(isDragging)seekFromEvent(e);},{passive:true});
  document.addEventListener('touchend',function(){isDragging=false;});
  progressWrap.addEventListener('keydown',function(e){if(!audio.duration)return;var step=audio.duration*0.05;if(e.key==='ArrowLeft')audio.currentTime=Math.max(0,audio.currentTime-step);if(e.key==='ArrowRight')audio.currentTime=Math.min(audio.duration,audio.currentTime+step);updateProgress();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&player.classList.contains('is-visible'))closePlayer();});
  filteredList=PLAYLIST.filter(function(t){return t.src&&t.src.trim()!=='';});
  buildPlaylist();
  if(filteredList.length>0)selectTrack(0,false);
}());
