const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

document.querySelectorAll('[data-year]').forEach(el => {
  el.textContent = new Date().getFullYear();
});

const modal = document.getElementById('videoModal');
const player = document.getElementById('videoPlayer');
const closeButton = document.getElementById('videoModalClose');
const videoTiles = document.querySelectorAll('[data-youtube]');

function closeVideo() {
  if (!modal || !player) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  player.src = '';
  document.body.style.overflow = '';
}

videoTiles.forEach(tile => {
  tile.addEventListener('click', () => {
    if (!modal || !player) return;
    const id = tile.dataset.youtube;
    player.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  });
});

if (closeButton) closeButton.addEventListener('click', closeVideo);

if (modal) {
  modal.addEventListener('click', event => {
    if (event.target === modal) closeVideo();
  });
}

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeVideo();
});

// Music carousel — seamless infinite loop
const musicTrack = document.querySelector('[data-music-track]');
const musicSlides = Array.from(document.querySelectorAll('[data-music-slide]'));
const musicPrev = document.querySelector('[data-music-prev]');
const musicNext = document.querySelector('[data-music-next]');
const musicCurrent = document.querySelector('[data-music-current]');
const musicTotal = document.querySelector('[data-music-total]');

if (musicTrack && musicSlides.length) {
  let musicIndex = 0;
  let touchStartX = null;
  let touchDeltaX = 0;
  let animating = false;

  const setTransition = enabled => {
    musicTrack.style.transition = enabled
      ? 'transform .56s cubic-bezier(.22,.61,.36,1)'
      : 'none';
  };

  const refreshMusicState = () => {
    if (musicCurrent) musicCurrent.textContent = String(musicIndex + 1);
    if (musicTotal) musicTotal.textContent = String(musicSlides.length);

    const currentSlide = musicTrack.firstElementChild;

    musicSlides.forEach(slide => {
      const active = slide === currentSlide;
      slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      slide.querySelectorAll('a, button').forEach(control => {
        control.tabIndex = active ? 0 : -1;
      });
    });
  };

  const afterTransform = callback => {
    let done = false;
    let timer = null;

    const finish = event => {
      if (done) return;
      if (event && (event.target !== musicTrack || event.propertyName !== 'transform')) return;
      done = true;
      musicTrack.removeEventListener('transitionend', finish);
      if (timer) clearTimeout(timer);
      callback();
    };

    musicTrack.addEventListener('transitionend', finish);

    // Fallback also handles reduced-motion environments where transitionend may not fire.
    timer = setTimeout(() => finish(), 650);
  };

  const goNext = () => {
    if (animating || musicSlides.length < 2) return;
    animating = true;
    setTransition(true);
    musicTrack.style.transform = 'translate3d(-100%, 0, 0)';

    afterTransform(() => {
      setTransition(false);
      musicTrack.appendChild(musicTrack.firstElementChild);
      musicTrack.style.transform = 'translate3d(0, 0, 0)';

      // Force the zero-position reset to render before transitions are restored.
      void musicTrack.offsetWidth;

      setTransition(true);
      musicIndex = (musicIndex + 1) % musicSlides.length;
      refreshMusicState();
      animating = false;
    });
  };

  const goPrev = () => {
    if (animating || musicSlides.length < 2) return;
    animating = true;
    setTransition(false);
    musicTrack.insertBefore(musicTrack.lastElementChild, musicTrack.firstElementChild);
    musicTrack.style.transform = 'translate3d(-100%, 0, 0)';
    void musicTrack.offsetWidth;
    setTransition(true);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        musicTrack.style.transform = 'translate3d(0, 0, 0)';
      });
    });

    afterTransform(() => {
      musicIndex = (musicIndex - 1 + musicSlides.length) % musicSlides.length;
      refreshMusicState();
      animating = false;
    });
  };

  if (musicPrev) musicPrev.addEventListener('click', goPrev);
  if (musicNext) musicNext.addEventListener('click', goNext);

  musicTrack.addEventListener('touchstart', event => {
    if (animating) return;
    touchStartX = event.touches[0].clientX;
    touchDeltaX = 0;
  }, { passive: true });

  musicTrack.addEventListener('touchmove', event => {
    if (touchStartX === null || animating) return;
    touchDeltaX = event.touches[0].clientX - touchStartX;
  }, { passive: true });

  musicTrack.addEventListener('touchend', () => {
    if (touchStartX === null) return;

    if (Math.abs(touchDeltaX) > 45) {
      if (touchDeltaX < 0) goNext();
      else goPrev();
    }

    touchStartX = null;
    touchDeltaX = 0;
  });

  document.addEventListener('keydown', event => {
    if (!document.body.classList.contains('music-page')) return;
    if (event.key === 'ArrowLeft') goPrev();
    if (event.key === 'ArrowRight') goNext();
  });

  setTransition(true);
  musicTrack.style.transform = 'translate3d(0, 0, 0)';
  refreshMusicState();
}
