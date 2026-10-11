/* =========================================================
   LITTLE BLOSSOMS — script.js
   FINAL FIXED VERSION
   ========================================================= */


/* =========================================================
   BASIC HELPERS
   ========================================================= */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);


/* =========================================================
   YEAR
   ========================================================= */

const yearEl = document.getElementById("year");

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}


/* =========================================================
   NAVIGATION
   ========================================================= */

const navbar = document.getElementById("navbar");
const navLinks = document.querySelectorAll(".nav-link");

const sections = document.querySelectorAll(
  "main > section, .hero, .admission"
);

function onScroll() {

  if (navbar) {
    navbar.classList.toggle(
      "scrolled",
      window.scrollY > 30
    );
  }

  let current = "home";

  const scrollPos =
    window.scrollY +
    window.innerHeight * 0.35;

  sections.forEach((section) => {

    if (
      section.offsetTop <= scrollPos &&
      section.id
    ) {
      current = section.id;
    }

  });

  navLinks.forEach((link) => {

    link.classList.toggle(
      "active",
      link.getAttribute("href") === `#${current}`
    );

  });

}

window.addEventListener(
  "scroll",
  onScroll,
  { passive: true }
);

onScroll();


/* =========================================================
   MOBILE MENU
   ========================================================= */

const navToggle =
  document.getElementById("navToggle");

const navLinksList =
  document.getElementById("navLinks");

if (navToggle && navLinksList) {

  navToggle.addEventListener("click", () => {

    const isOpen =
      navLinksList.classList.toggle("open");

    navToggle.classList.toggle(
      "open",
      isOpen
    );

    navToggle.setAttribute(
      "aria-expanded",
      String(isOpen)
    );

  });

  navLinksList
    .querySelectorAll("a")
    .forEach((link) => {

      link.addEventListener("click", () => {

        navLinksList.classList.remove("open");

        navToggle.classList.remove("open");

        navToggle.setAttribute(
          "aria-expanded",
          "false"
        );

      });

    });

}


/* =========================================================
   SCROLL REVEAL
   ========================================================= */

const revealEls =
  document.querySelectorAll("[data-reveal]");

if ("IntersectionObserver" in window) {

  const revealObserver =
    new IntersectionObserver(
      (entries) => {

        entries.forEach((entry) => {

          if (!entry.isIntersecting) return;

          const parent =
            entry.target.parentElement;

          let index = 0;

          if (parent) {

            const siblings =
              Array.from(parent.children)
                .filter((el) =>
                  el.hasAttribute("data-reveal")
                );

            index =
              siblings.indexOf(entry.target);

          }

          entry.target.style.transitionDelay =
            `${Math.min(index * 90, 360)}ms`;

          entry.target.classList.add(
            "in-view"
          );

          revealObserver.unobserve(
            entry.target
          );

        });

      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -60px 0px"
      }
    );

  revealEls.forEach((el) => {
    revealObserver.observe(el);
  });

} else {

  revealEls.forEach((el) => {
    el.classList.add("in-view");
  });

}


/* =========================================================
   GALLERY LIGHTBOX
   ========================================================= */

const lightbox =
  document.getElementById("lightbox");

const lightboxEmoji =
  document.getElementById("lightboxEmoji");

const lightboxTitle =
  document.getElementById("lightboxTitle");

const lightboxDesc =
  document.getElementById("lightboxDesc");

const lightboxMedia =
  document.getElementById("lightboxMedia");


let lastFocusedEl = null;


/* =========================================================
   MEDIA SETTINGS
   ========================================================= */

const MEDIA_SLOTS = 12;


/*
   IMPORTANT

   GitHub Pages project:

   https://littleblossom0111-droid.github.io/Test/

   Media:

   /Test/media/classroom/1.mp4
   /Test/media/classroom/lit1.mp4
*/


function getSiteBase() {

  const path =
    window.location.pathname;

  /*
     Find GitHub Pages repository path.

     Example:

     /Test/
     /Test/index.html
     /Test/about.html
  */

  const parts =
    path.split("/").filter(Boolean);

  if (
    parts.length > 0 &&
    !parts[0].includes(".")
  ) {

    return "/" + parts[0] + "/";

  }

  return "/";

}


/* =========================================================
   MEDIA PATH
   ========================================================= */

function mediaPath(
  folder,
  filename
) {

  const base =
    getSiteBase();

  return (
    base +
    "media/" +
    folder +
    "/" +
    filename
  );

}


/* =========================================================
   PROBE IMAGE
   ========================================================= */

function probeImage(src) {

  return new Promise((resolve) => {

    const img =
      new Image();

    let done = false;

    const finish = (ok) => {

      if (done) return;

      done = true;

      resolve({
        ok,
        src
      });

    };

    img.onload = () => {
      finish(true);
    };

    img.onerror = () => {
      finish(false);
    };

    img.src = src;

  });

}


/* =========================================================
   PROBE VIDEO
   ========================================================= */

function probeVideo(src) {

  return new Promise((resolve) => {

    const video =
      document.createElement("video");

    let done = false;

    const finish = (ok) => {

      if (done) return;

      done = true;

      video.removeAttribute("src");

      video.load();

      resolve({
        ok,
        src
      });

    };

    video.preload = "metadata";

    video.muted = true;

    video.playsInline = true;

    video.onloadedmetadata = () => {

      finish(true);

    };

    video.onerror = () => {

      finish(false);

    };

    video.src = src;

    video.load();

    /*
       Safety timeout
    */

    setTimeout(() => {

      if (!done) {

        if (video.readyState >= 1) {

          finish(true);

        } else {

          finish(false);

        }

      }

    }, 4000);

  });

}


/* =========================================================
   FIND MEDIA
   ========================================================= */

async function findSlotMedia(
  folder,
  slot
) {

  /*
     Check:

     1.jpg
     1.png
     1.webp
     1.mp4

     Then:

     lit1.jpg
     lit1.png
     lit1.webp
     lit1.mp4
  */

  const names = [
    `${slot}`,
    `lit${slot}`
  ];


  /* =======================================================
     IMAGES
     ======================================================= */

  const imageExtensions = [
    "jpg",
    "jpeg",
    "png",
    "webp"
  ];

  for (const name of names) {

    for (
      const ext of imageExtensions
    ) {

      const src =
        mediaPath(
          folder,
          `${name}.${ext}`
        );

      const result =
        await probeImage(src);

      if (result.ok) {

        return {
          type: "image",
          src: result.src
        };

      }

    }

  }


  /* =======================================================
     VIDEOS
     ======================================================= */

  const videoExtensions = [
    "mp4",
    "webm"
  ];

  for (const name of names) {

    for (
      const ext of videoExtensions
    ) {

      const src =
        mediaPath(
          folder,
          `${name}.${ext}`
        );

      const result =
        await probeVideo(src);

      if (result.ok) {

        return {
          type: "video",
          src: result.src
        };

      }

    }

  }


  return null;

}


/* =========================================================
   LOAD GALLERY
   ========================================================= */

let mediaLoadToken = 0;

async function loadGalleryMedia(folder, token) {
  if (!lightboxMedia) return;
  lightboxMedia.innerHTML = '<div class="lightbox-loading">Loading photos &amp; videos…</div>';

  let results = [];
  try {
    if (window.LBGalleryAdminReady) await window.LBGalleryAdminReady;
    const gallery = window.LBGalleryAdmin;
    if (gallery && gallery.client) {
      let query = gallery.client.from("gallery_items").select("*").eq("category", folder).order("display_order", { ascending: true }).order("created_at", { ascending: false });
      const { data, error } = await query;
      if (!error && data && data.length) {
        results = data.map(item => ({
          id: item.id, title: item.title, description: item.description || "",
          type: item.media_type, src: item.media_url, storage_path: item.storage_path || "",
          category: item.category
        }));
      }
    }
  } catch (error) {
    console.warn("Database gallery could not load; checking legacy media files.", error);
  }

  // Retain support for any legacy media/<category>/ files already hosted in the repo.
  if (!results.length) {
    for (let i = 1; i <= MEDIA_SLOTS; i++) {
      if (token !== mediaLoadToken) return;
      const media = await findSlotMedia(folder, i);
      if (media) results.push(media);
    }
  }
  if (token !== mediaLoadToken) return;

  if (!results.length) {
    lightboxMedia.innerHTML = '<div class="lightbox-empty"><strong>No photos or videos have been uploaded here yet.</strong><br><br>Admin can sign in below the gallery to add photos or videos.</div>';
    return;
  }

  lightboxMedia.innerHTML = "";
  const gallery = window.LBGalleryAdmin;
  const canManage = !!(gallery && gallery.isAdmin);
  results.forEach(item => {
    const wrapper = document.createElement("article");
    wrapper.className = "gallery-media-item";
    if (item.type === "image") {
      const img = document.createElement("img");
      img.src = item.src;
      img.alt = item.title || "Little Blossoms gallery photo";
      img.loading = "lazy";
      img.decoding = "async";
      wrapper.appendChild(img);
    } else if (item.type === "video") {
      const video = document.createElement("video");
      video.src = item.src;
      video.controls = true;
      video.preload = "metadata";
      video.playsInline = true;
      wrapper.appendChild(video);
    }
    if (item.title) {
      const title = document.createElement("p");
      title.className = "gallery-media-title";
      title.textContent = item.title;
      wrapper.appendChild(title);
    }
    if (item.description) {
      const desc = document.createElement("p");
      desc.className = "gallery-media-description";
      desc.textContent = item.description;
      wrapper.appendChild(desc);
    }
    if (canManage && item.id) {
      const actions = document.createElement("div");
      actions.className = "gallery-item-admin-actions";
      const edit = document.createElement("button");
      edit.type = "button";
      edit.className = "btn btn-ghost gallery-edit-btn";
      edit.textContent = "Edit";
      edit.addEventListener("click", async () => {
        const nextTitle = prompt("Photo/video title:", item.title || "");
        if (nextTitle === null) return;
        const nextDescription = prompt("Description:", item.description || "");
        if (nextDescription === null) return;
        const nextCategory = prompt("Category: classroom, art-activities, outdoor-play, celebration, kids-learning", item.category || folder);
        if (nextCategory === null) return;
        const allowed = ["classroom","art-activities","outdoor-play","celebration","kids-learning"];
        if (!allowed.includes(nextCategory.trim())) { alert("Please enter one of the listed categories exactly."); return; }
        const { error } = await gallery.client.from("gallery_items").update({
          title: nextTitle.trim().slice(0,120),
          description: nextDescription.trim().slice(0,1000),
          category: nextCategory.trim()
        }).eq("id", item.id);
        if (error) { alert("Update failed: " + error.message); return; }
        await loadGalleryMedia(folder, token);
      });
      const del = document.createElement("button");
      del.type = "button";
      del.className = "btn btn-danger gallery-delete-btn";
      del.textContent = "Delete";
      del.addEventListener("click", async () => {
        if (!confirm("Delete this photo/video permanently?")) return;
        if (item.storage_path) {
          const { error: storageError } = await gallery.client.storage.from("little-blossoms-gallery").remove([item.storage_path]);
          if (storageError) { alert("File delete failed: " + storageError.message); return; }
        }
        const { error } = await gallery.client.from("gallery_items").delete().eq("id", item.id);
        if (error) { alert("Record delete failed: " + error.message); return; }
        await loadGalleryMedia(folder, token);
      });
      actions.append(edit, del);
      wrapper.appendChild(actions);
    }
    lightboxMedia.appendChild(wrapper);
  });
}


/* =========================================================
   OPEN LIGHTBOX
   ========================================================= */

function openLightbox(card) {

  if (!lightbox) return;


  lastFocusedEl =
    document.activeElement;


  /* -------------------------------------------------------
     EMOJI
     ------------------------------------------------------- */

  if (lightboxEmoji) {

    lightboxEmoji.textContent =
      card.dataset.emoji || "🌸";

  }


  /* -------------------------------------------------------
     TITLE
     ------------------------------------------------------- */

  if (lightboxTitle) {

    lightboxTitle.textContent =
      card.dataset.title || "";

  }


  /* -------------------------------------------------------
     DESCRIPTION
     ------------------------------------------------------- */

  if (lightboxDesc) {

    lightboxDesc.textContent =
      card.dataset.desc || "";

  }


  /* -------------------------------------------------------
     OPEN
     ------------------------------------------------------- */

  lightbox.classList.add(
    "open"
  );

  lightbox.setAttribute(
    "aria-hidden",
    "false"
  );


  document.body.style.overflow =
    "hidden";


  /* -------------------------------------------------------
     FOCUS CLOSE BUTTON
     ------------------------------------------------------- */

  const closeButton =
    lightbox.querySelector(
      ".lightbox-close"
    );

  if (closeButton) {

    setTimeout(() => {

      closeButton.focus();

    }, 50);

  }


  /* -------------------------------------------------------
     FOLDER
     ------------------------------------------------------- */

  const folder =
    card.dataset.folder;


  if (folder) {

    mediaLoadToken++;

    const token =
      mediaLoadToken;

    loadGalleryMedia(
      folder,
      token
    );

  }

}


/* =========================================================
   CLOSE LIGHTBOX
   ========================================================= */

function closeLightbox() {

  if (!lightbox) return;


  lightbox.classList.remove(
    "open"
  );


  lightbox.setAttribute(
    "aria-hidden",
    "true"
  );


  document.body.style.overflow =
    "";


  if (lightboxMedia) {

    lightboxMedia
      .querySelectorAll("video")
      .forEach((video) => {

        video.pause();

        video.currentTime = 0;

        video.removeAttribute(
          "src"
        );

        video.load();

      });

  }


  if (lastFocusedEl) {

    try {

      lastFocusedEl.focus();

    } catch (error) {}

  }

}


/* =========================================================
   GALLERY CLICK
   ========================================================= */

document
  .querySelectorAll(
    "[data-gallery-item]"
  )
  .forEach((card) => {

    card.addEventListener(
      "click",
      () => {

        openLightbox(card);

      }
    );

  });


/* =========================================================
   LIGHTBOX CLOSE BUTTON
   ========================================================= */

document
  .querySelectorAll(
    "[data-lightbox-close]"
  )
  .forEach((element) => {

    element.addEventListener(
      "click",
      closeLightbox
    );

  });


/* =========================================================
   ESCAPE KEY
   ========================================================= */

document.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key === "Escape" &&
      lightbox &&
      lightbox.classList.contains("open")
    ) {

      closeLightbox();

    }

  }
);


/* =========================================================
   WEBGL CHECK
   ========================================================= */

function supportsWebGL() {

  try {

    const canvas =
      document.createElement(
        "canvas"
      );

    return !!(
      window.WebGLRenderingContext &&
      (
        canvas.getContext(
          "webgl"
        ) ||
        canvas.getContext(
          "experimental-webgl"
        )
      )
    );

  } catch (error) {

    return false;

  }

}


/* =========================================================
   HERO
   ========================================================= */

const heroCanvas =
  document.getElementById(
    "hero-canvas"
  );

const hero =
  document.querySelector(
    ".hero"
  );


if (
  heroCanvas &&
  hero &&
  supportsWebGL()
) {

  initHeroScene();

}

else if (
  heroCanvas &&
  hero
) {

  heroCanvas.style.display =
    "none";

  hero.classList.add(
    "no-webgl"
  );

}


/* =========================================================
   THREE.JS HERO
   ========================================================= */

async function initHeroScene() {

  let THREE;


  try {

    THREE = await import(
      "https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js"
    );

  } catch (error) {

    console.error(
      "Three.js failed to load:",
      error
    );

    if (heroCanvas) {

      heroCanvas.style.display =
        "none";

    }

    if (hero) {

      hero.classList.add(
        "no-webgl"
      );

    }

    return;

  }


  /* =======================================================
     SIZE
     ======================================================= */

  let width =
    hero.clientWidth ||
    window.innerWidth;

  let height =
    hero.clientHeight ||
    700;


  const pixelRatio =
    Math.min(
      window.devicePixelRatio || 1,
      1.8
    );


  /* =======================================================
     SCENE
     ======================================================= */

  const scene =
    new THREE.Scene();


  scene.fog =
    new THREE.Fog(
      0xfff3e0,
      14,
      34
    );


  /* =======================================================
     CAMERA
     ======================================================= */

  const camera =
    new THREE.PerspectiveCamera(
      42,
      width / height,
      0.1,
      100
    );


  camera.position.set(
    0,
    3.6,
    13
  );


  camera.lookAt(
    0,
    1.6,
    0
  );


  /* =======================================================
     RENDERER
     ======================================================= */

  let renderer;


  try {

    renderer =
      new THREE.WebGLRenderer({

        canvas: heroCanvas,

        antialias: true,

        alpha: true,

        powerPreference:
          "high-performance"

      });

  } catch (error) {

    console.error(
      "WebGL renderer error:",
      error
    );

    heroCanvas.style.display =
      "none";

    hero.classList.add(
      "no-webgl"
    );

    return;

  }


  renderer.setPixelRatio(
    pixelRatio
  );


  renderer.setSize(
    width,
    height,
    false
  );


  renderer.shadowMap.enabled =
    true;


  renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;


  if (
    "outputColorSpace" in renderer
  ) {

    renderer.outputColorSpace =
      THREE.SRGBColorSpace;

  }


  /* =======================================================
     LIGHTING
     ======================================================= */

  const hemi =
    new THREE.HemisphereLight(
      0xfff3d6,
      0xf3c9c9,
      1.05
    );

  scene.add(
    hemi
  );


  const sun =
    new THREE.DirectionalLight(
      0xfff0d0,
      1.6
    );


  sun.position.set(
    6,
    10,
    6
  );


  sun.castShadow =
    true;


  sun.shadow.mapSize.set(
    1024,
    1024
  );


  sun.shadow.camera.left =
    -10;

  sun.shadow.camera.right =
    10;

  sun.shadow.camera.top =
    10;

  sun.shadow.camera.bottom =
    -10;

  sun.shadow.camera.far =
    30;

  sun.shadow.bias =
    -0.0025;


  scene.add(
    sun
  );


  const fill =
    new THREE.PointLight(
      0xffd9e8,
      0.6,
      20
    );


  fill.position.set(
    -6,
    4,
    4
  );


  scene.add(
    fill
  );


  /* =======================================================
     MATERIAL HELPER
     ======================================================= */

  const mat = (
    color,
    roughness = 0.75,
    metalness = 0.05
  ) => {

    return new THREE.MeshStandardMaterial({

      color,

      roughness,

      metalness

    });

  };


  const matWall =
    mat(
      0xfff3e2,
      0.9
    );


  const matRoof =
    mat(
      0xff8fa3,
      0.6
    );


  const matRoofDeep =
    mat(
      0xe8536b,
      0.6
    );


  const matDoor =
    mat(
      0x7fb685,
      0.7
    );


  const matWindow =
    mat(
      0xbfe3f5,
      0.35,
      0.1
    );


  const matGrass =
    mat(
      0x9fd6a6,
      0.95
    );


  const matGrassDeep =
    mat(
      0x7fb685,
      0.95
    );


  const matTrunk =
    mat(
      0xb08463,
      0.9
    );


  const matLeaf =
    mat(
      0x6fbf7a,
      0.8
    );


  const matLeafDeep =
    mat(
      0x4f9d5c,
      0.8
    );


  const matPath =
    mat(
      0xffe2b8,
      0.9
    );


  const matCloud =
    new THREE.MeshStandardMaterial({

      color:
        0xffffff,

      roughness:
        1,

      transparent:
        true,

      opacity:
        0.92

    });


  const balloonColors = [

    0xff6f81,

    0xffc259,

    0x8fcbe8,

    0x9fd6a6,

    0xd9bff5

  ];


  /* =======================================================
     WORLD
     ======================================================= */

  const world =
    new THREE.Group();


  scene.add(
    world
  );


  /* =======================================================
     GROUND
     ======================================================= */

  const ground =
    new THREE.Mesh(

      new THREE.CircleGeometry(
        14,
        48
      ),

      matGrass

    );


  ground.rotation.x =
    -Math.PI / 2;


  ground.receiveShadow =
    true;


  world.add(
    ground
  );


  const groundRing =
    new THREE.Mesh(

      new THREE.RingGeometry(
        6.6,
        14,
        48
      ),

      matGrassDeep

    );


  groundRing.rotation.x =
    -Math.PI / 2;


  groundRing.position.y =
    -0.02;


  world.add(
    groundRing
  );


  /* =======================================================
     PATH
     ======================================================= */

  const path =
    new THREE.Mesh(

      new THREE.PlaneGeometry(
        1.6,
        4.2
      ),

      matPath

    );


  path.rotation.x =
    -Math.PI / 2;


  path.position.set(
    0,
    0.01,
    4.6
  );


  world.add(
    path
  );


  /* =======================================================
     BUILDING
     ======================================================= */

  const building =
    new THREE.Group();


  building.position.set(
    0,
    0,
    -1
  );


  const base =
    new THREE.Mesh(

      new THREE.BoxGeometry(
        5.2,
        2.6,
        3.6
      ),

      matWall

    );


  base.position.y =
    1.3;


  base.castShadow =
    true;


  base.receiveShadow =
    true;


  building.add(
    base
  );


  const roof =
    new THREE.Mesh(

      new THREE.ConeGeometry(
        3.9,
        1.8,
        4
      ),

      matRoof

    );


  roof.position.y =
    3.5;


  roof.rotation.y =
    Math.PI / 4;


  roof.castShadow =
    true;


  building.add(
    roof
  );


  const roofTrim =
    new THREE.Mesh(

      new THREE.TorusGeometry(
        0.18,
        0.08,
        8,
        24
      ),

      matRoofDeep

    );


  roofTrim.position.y =
    2.62;


  roofTrim.rotation.x =
    Math.PI / 2;


  building.add(
    roofTrim
  );


  /* =======================================================
     DOOR
     ======================================================= */

  const door =
    new THREE.Mesh(

      new THREE.CylinderGeometry(
        0.55,
        0.55,
        1.5,
        16,
        1,
        false,
        0,
        Math.PI
      ),

      matDoor

    );


  door.rotation.z =
    Math.PI;


  door.rotation.y =
    Math.PI / 2;


  door.position.set(
    0,
    0.75,
    1.81
  );


  building.add(
    door
  );


  /* =======================================================
     WINDOWS
     ======================================================= */

  const windowGeo =
    new THREE.CircleGeometry(
      0.45,
      20
    );


  [-1.55, 1.55].forEach(
    (x) => {

      const win =
        new THREE.Mesh(
          windowGeo,
          matWindow
        );


      win.position.set(
        x,
        1.55,
        1.81
      );


      building.add(
        win
      );


      const frame =
        new THREE.Mesh(

          new THREE.RingGeometry(
            0.45,
            0.53,
            20
          ),

          matRoofDeep

        );


      frame.position.set(
        x,
        1.55,
        1.815
      );


      building.add(
        frame
      );

    }
  );


  /* =======================================================
     CHIMNEY
     ======================================================= */

  const chimney =
    new THREE.Mesh(

      new THREE.BoxGeometry(
        0.45,
        1.1,
        0.45
      ),

      matRoofDeep

    );


  chimney.position.set(
    1.6,
    3.5,
    -0.6
  );


  chimney.castShadow =
    true;


  building.add(
    chimney
  );


  /* =======================================================
     SIGN
     ======================================================= */

  const signPost =
    new THREE.Mesh(

      new THREE.CylinderGeometry(
        0.05,
        0.05,
        1
      ),

      matTrunk

    );


  signPost.position.set(
    -2.6,
    3.1,
    1.9
  );


  building.add(
    signPost
  );


  const signBoard =
    new THREE.Mesh(

      new THREE.CircleGeometry(
        0.42,
        24
      ),

      matRoof

    );


  signBoard.position.set(
    -2.6,
    3.6,
    1.9
  );


  building.add(
    signBoard
  );


  world.add(
    building
  );


  /* =======================================================
     PLAYGROUND
     ======================================================= */

  const playground =
    new THREE.Group();


  playground.position.set(
    4.6,
    0,
    1.4
  );


  const slideFrameMat =
    mat(
      0xffc259,
      0.6
    );


  const slideBoardMat =
    mat(
      0xff6f81,
      0.5
    );


  const slideLeg1 =
    new THREE.Mesh(

      new THREE.CylinderGeometry(
        0.06,
        0.06,
        1.6
      ),

      slideFrameMat

    );


  slideLeg1.position.set(
    -0.6,
    0.8,
    0
  );


  playground.add(
    slideLeg1
  );


  const slideLeg2 =
    slideLeg1.clone();


  slideLeg2.position.set(
    0.6,
    0.8,
    0
  );


  playground.add(
    slideLeg2
  );


  const slideBoard =
    new THREE.Mesh(

      new THREE.BoxGeometry(
        1.3,
        0.08,
        2.1
      ),

      slideBoardMat

    );


  slideBoard.position.set(
    0,
    1.55,
    0.6
  );


  slideBoard.rotation.x =
    -0.55;


  slideBoard.castShadow =
    true;


  playground.add(
    slideBoard
  );


  playground.children.forEach(
    (child) => {

      child.castShadow =
        true;

    }
  );


  world.add(
    playground
  );


  /* =======================================================
     SWING
     ======================================================= */

  const swing =
    new THREE.Group();


  swing.position.set(
    4.9,
    0,
    -1.6
  );


  const swingMat =
    mat(
      0x8fcbe8,
      0.6
    );


  const barGeo =
    new THREE.CylinderGeometry(
      0.05,
      0.05,
      1.8
    );


  const barL =
    new THREE.Mesh(
      barGeo,
      swingMat
    );


  barL.position.set(
    -0.9,
    0.9,
    0
  );


  swing.add(
    barL
  );


  const barR =
    new THREE.Mesh(
      barGeo,
      swingMat
    );


  barR.position.set(
    0.9,
    0.9,
    0
  );


  swing.add(
    barR
  );


  const barTop =
    new THREE.Mesh(

      new THREE.CylinderGeometry(
        0.05,
        0.05,
        1.9
      ),

      swingMat

    );


  barTop.rotation.z =
    Math.PI / 2;


  barTop.position.set(
    0,
    1.8,
    0
  );


  swing.add(
    barTop
  );


  const seat =
    new THREE.Mesh(

      new THREE.BoxGeometry(
        0.5,
        0.06,
        0.25
      ),

      mat(
        0xff8fa3,
        0.6
      )

    );


  seat.position.set(
    0,
    0.9,
    0
  );


  swing.add(
    seat
  );


  swing.children.forEach(
    (child) => {

      child.castShadow =
        true;

    }
  );


  world.add(
    swing
  );


  /* =======================================================
     TREES
     ======================================================= */

  function makeTree(
    scale = 1
  ) {

    const group =
      new THREE.Group();


    const trunk =
      new THREE.Mesh(

        new THREE.CylinderGeometry(
          0.12,
          0.16,
          1.1,
          8
        ),

        matTrunk

      );


    trunk.position.y =
      0.55;


    trunk.castShadow =
      true;


    group.add(
      trunk
    );


    const leafA =
      new THREE.Mesh(

        new THREE.SphereGeometry(
          0.75,
          12,
          10
        ),

        matLeaf

      );


    leafA.position.y =
      1.35;


    leafA.castShadow =
      true;


    group.add(
      leafA
    );


    const leafB =
      new THREE.Mesh(

        new THREE.SphereGeometry(
          0.55,
          12,
          10
        ),

        matLeafDeep

      );


    leafB.position.set(
      0.45,
      1.7,
      0.15
    );


    leafB.castShadow =
      true;


    group.add(
      leafB
    );


    const leafC =
      new THREE.Mesh(

        new THREE.SphereGeometry(
          0.5,
          12,
          10
        ),

        matLeafDeep

      );


    leafC.position.set(
      -0.4,
      1.55,
      -0.25
    );


    leafC.castShadow =
      true;


    group.add(
      leafC
    );


    group.scale.setScalar(
      scale
    );


    return group;

  }


  const treePositions = [

    [-5.4, 0, 2.2, 1.1],

    [-6.4, 0, -1.4, 0.9],

    [-4.4, 0, -3.2, 0.75],

    [6.4, 0, -3.6, 0.95],

    [5.6, 0, 3.8, 0.8],

    [-2.2, 0, -4.6, 0.7]

  ];


  treePositions.forEach(
    ([x, y, z, scale]) => {

      const tree =
        makeTree(
          scale
        );


      tree.position.set(
        x,
        y,
        z
      );


      world.add(
        tree
      );

    }
  );


  /* =======================================================
     FLOWERS
     ======================================================= */

  function makeFlower(color) {

    const group =
      new THREE.Group();


    const stem =
      new THREE.Mesh(

        new THREE.CylinderGeometry(
          0.025,
          0.025,
          0.4,
          6
        ),

        matLeafDeep

      );


    stem.position.y =
      0.2;


    group.add(
      stem
    );


    const petalMat =
      mat(
        color,
        0.5
      );


    for (
      let i = 0;
      i < 5;
      i++
    ) {

      const petal =
        new THREE.Mesh(

          new THREE.SphereGeometry(
            0.09,
            8,
            8
          ),

          petalMat

        );


      const angle =
        (
          i / 5
        ) *
        Math.PI *
        2;


      petal.position.set(

        Math.cos(angle) *
          0.12,

        0.42,

        Math.sin(angle) *
          0.12

      );


      group.add(
        petal
      );

    }


    const center =
      new THREE.Mesh(

        new THREE.SphereGeometry(
          0.07,
          8,
          8
        ),

        mat(
          0xffc259,
          0.5
        )

      );


    center.position.y =
      0.42;


    group.add(
      center
    );


    return group;

  }


  const flowerColors = [

    0xff6f81,

    0xffc259,

    0xd9bff5,

    0xffffff

  ];


  for (
    let i = 0;
    i < 22;
    i++
  ) {

    const angle =
      Math.random() *
      Math.PI *
      2;


    const radius =
      3.4 +
      Math.random() *
      6.2;


    const x =
      Math.cos(angle) *
      radius;


    const z =
      Math.sin(angle) *
      radius;


    if (
      Math.abs(x) < 2.6 &&
      z > 2.5 &&
      z < 6
    ) {

      continue;

    }


    const flower =
      makeFlower(
        flowerColors[
          i %
          flowerColors.length
        ]
      );


    flower.position.set(
      x,
      0,
      z
    );


    flower.scale.setScalar(
      0.8 +
      Math.random() *
      0.5
    );


    world.add(
      flower
    );

  }


  /* =======================================================
     CLOUDS
     ======================================================= */

  function makeCloud(
    scale = 1
  ) {

    const group =
      new THREE.Group();


    const puffs = [

      [0, 0, 0, 0.55],

      [0.55, 0.08, 0, 0.4],

      [-0.55, 0.05, 0, 0.42],

      [0.2, 0.32, 0, 0.38],

      [-0.25, 0.28, 0, 0.34]

    ];


    puffs.forEach(
      ([x, y, z, radius]) => {

        const puff =
          new THREE.Mesh(

            new THREE.SphereGeometry(
              radius,
              10,
              8
            ),

            matCloud

          );


        puff.position.set(
          x,
          y,
          z
        );


        group.add(
          puff
        );

      }
    );


    group.scale.setScalar(
      scale
    );


    return group;

  }


  const clouds = [];


  const cloudSpecs = [

    [-6, 6.4, -6, 1.1],

    [5.5, 7.2, -5, 0.9],

    [0.5, 8, -8, 1.3],

    [-3, 5.6, 4, 0.6]

  ];


  cloudSpecs.forEach(
    ([x, y, z, scale]) => {

      const cloud =
        makeCloud(
          scale
        );


      cloud.position.set(
        x,
        y,
        z
      );


      world.add(
        cloud
      );


      clouds.push(
        cloud
      );

    }
  );


  /* =======================================================
     BALLOONS
     ======================================================= */

  const balloons = [];


  function makeBalloon(color) {

    const group =
      new THREE.Group();


    const body =
      new THREE.Mesh(

        new THREE.SphereGeometry(
          0.4,
          16,
          16
        ),

        mat(
          color,
          0.35,
          0.05
        )

      );


    body.scale.set(
      0.9,
      1.15,
      0.9
    );


    body.castShadow =
      true;


    group.add(
      body
    );


    const knot =
      new THREE.Mesh(

        new THREE.ConeGeometry(
          0.06,
          0.1,
          8
        ),

        mat(
          color,
          0.35
        )

      );


    knot.position.y =
      -0.5;


    group.add(
      knot
    );


    const stringGeo =
      new THREE.BufferGeometry()
        .setFromPoints([

          new THREE.Vector3(
            0,
            -0.55,
            0
          ),

          new THREE.Vector3(
            0,
            -1.7,
            0
          )

        ]);


    const stringMat =
      new THREE.LineBasicMaterial({

        color:
          0x8a7a72,

        transparent:
          true,

        opacity:
          0.6

      });


    const line =
      new THREE.Line(
        stringGeo,
        stringMat
      );


    group.add(
      line
    );


    return group;

  }


  const balloonSpecs = [

    [-3.2, 3.2, 3.6],

    [3.6, 3.7, 3.2],

    [-1.6, 4.4, 4.4],

    [2.2, 4.9, 4.0],

    [0, 5.4, 3.2]

  ];


  balloonSpecs.forEach(
    ([x, y, z], index) => {

      const balloon =
        makeBalloon(
          balloonColors[
            index %
            balloonColors.length
          ]
        );


      balloon.position.set(
        x,
        y,
        z
      );


      world.add(
        balloon
      );


      balloons.push({

        mesh:
          balloon,

        baseY:
          y,

        phase:
          Math.random() *
          Math.PI *
          2,

        speed:
          0.6 +
          Math.random() *
          0.4

      });

    }
  );


  /* =======================================================
     RESIZE
     ======================================================= */

  function handleResize() {

    width =
      hero.clientWidth ||
      window.innerWidth;


    height =
      hero.clientHeight ||
      700;


    camera.aspect =
      width / height;


    camera.updateProjectionMatrix();


    renderer.setSize(
      width,
      height,
      false
    );

  }


  window.addEventListener(
    "resize",
    handleResize
  );


  /* =======================================================
     PARALLAX
     ======================================================= */

  let targetRotY = 0;

  let targetRotX = 0;

  let currentRotY = 0;

  let currentRotX = 0;


  function setPointer(
    x,
    y
  ) {

    targetRotY =
      x * 0.28;


    targetRotX =
      y * 0.08;

  }


  window.addEventListener(
    "pointermove",
    (event) => {

      const rect =
        hero.getBoundingClientRect();


      const nx =
        (
          (
            event.clientX -
            rect.left
          ) /
          rect.width
        ) *
        2 -
        1;


      const ny =
        (
          (
            event.clientY -
            rect.top
          ) /
          rect.height
        ) *
        2 -
        1;


      setPointer(
        nx,
        ny
      );

    },
    {
      passive: true
    }
  );


  /* =======================================================
     SCROLL
     ======================================================= */

  let scrollFactor = 0;


  function onHeroScroll() {

    const rect =
      hero.getBoundingClientRect();


    scrollFactor =
      Math.min(
        Math.max(
          -rect.top /
          rect.height,
          0
        ),
        1
      );

  }


  window.addEventListener(
    "scroll",
    onHeroScroll,
    {
      passive: true
    }
  );


  /* =======================================================
     VISIBILITY
     ======================================================= */

  let isVisible = true;


  const visibilityObserver =
    new IntersectionObserver(
      (entries) => {

        entries.forEach(
          (entry) => {

            isVisible =
              entry.isIntersecting;

          }
        );

      },
      {
        threshold: 0
      }
    );


  visibilityObserver.observe(
    hero
  );


  /* =======================================================
     ANIMATION
     ======================================================= */

  const clock =
    new THREE.Clock();


  let idleAngle = 0;


  function animate() {

    requestAnimationFrame(
      animate
    );


    if (!isVisible) {
      return;
    }


    const dt =
      Math.min(
        clock.getDelta(),
        0.05
      );


    const time =
      clock.elapsedTime;


    /* -----------------------------------------------------
       IDLE
       ----------------------------------------------------- */

    idleAngle +=
      dt * 0.05;


    const idleRotation =
      Math.sin(
        idleAngle
      ) *
      0.12;


    currentRotY +=
      (
        idleRotation -
        currentRotY
      ) *
      0.015;


    currentRotX +=
      (
        targetRotX -
        currentRotX
      ) *
      0.04;


    world.rotation.y =
      currentRotY +
      Math.sin(
        time * 0.05
      ) *
      0.03;


    world.rotation.x =
      currentRotX *
      0.3;


    /* -----------------------------------------------------
       BOB
       ----------------------------------------------------- */

    world.position.y =
      -1.4 -
      scrollFactor *
      1.6 +
      Math.sin(
        time * 0.6
      ) *
      0.03;


    camera.position.y =
      3.6 +
      scrollFactor *
      0.6;


    scene.fog.near =
      14 -
      scrollFactor *
      4;


    /* -----------------------------------------------------
       BALLOONS
       ----------------------------------------------------- */

    balloons.forEach(
      (balloon) => {

        balloon.mesh.position.y =
          balloon.baseY +
          Math.sin(
            time *
            balloon.speed +
            balloon.phase
          ) *
          0.18;


        balloon.mesh.rotation.z =
          Math.sin(
            time *
            balloon.speed *
            0.5 +
            balloon.phase
          ) *
          0.05;

      }
    );


    /* -----------------------------------------------------
       CLOUDS
       ----------------------------------------------------- */

    clouds.forEach(
      (cloud, index) => {

        cloud.position.x +=
          Math.sin(
            time *
            0.05 +
            index
          ) *
          0.0006;


        cloud.position.y +=
          Math.sin(
            time *
            0.3 +
            index
          ) *
          0.0004;

      }
    );


    /* -----------------------------------------------------
       SWING
       ----------------------------------------------------- */

    seat.rotation.x =
      Math.sin(
        time *
        0.8
      ) *
      0.05;


    /* -----------------------------------------------------
       RENDER
       ----------------------------------------------------- */

    renderer.render(
      scene,
      camera
    );

  }


  /* =======================================================
     START
     ======================================================= */

  handleResize();

  onHeroScroll();

  animate();

}

/* =========================================================
   SUPABASE ENQUIRY FORMS
   Uses the public publishable key; database RLS protects writes.
   ========================================================= */
(() => {
  const SUPABASE_URL = "https://shyxftohajgbxunfsyay.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_hvisH10Zh_MlX77IVzhTag_a5sv1Nn3";
  const sendRow = async (table, row) => {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_PUBLISHABLE_KEY,
        "Authorization": `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        "Prefer": "return=minimal"
      },
      body: JSON.stringify(row)
    });
    if (!response.ok) {
      let detail = "";
      try { detail = await response.text(); } catch (_) {}
      throw new Error(detail || "Could not submit the form.");
    }
  };
  const wireForm = (formId, table, feedbackId, fields) => {
    const form = document.getElementById(formId);
    const feedback = document.getElementById(feedbackId);
    if (!form || !feedback) return;
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const button = form.querySelector('button[type="submit"]');
      const data = new FormData(form);
      const row = {};
      fields.forEach((field) => {
        const value = String(data.get(field) || "").trim();
        if (value) row[field] = value;
      });
      feedback.textContent = "Sending…";
      feedback.style.color = "var(--ink-soft)";
      if (button) button.disabled = true;
      try {
        await sendRow(table, row);
        form.reset();
        feedback.textContent = "Thank you! Your details have been received. Our team will contact you soon.";
        feedback.style.color = "var(--leaf-deep)";
      } catch (error) {
        console.error("Form submission failed:", error);
        feedback.textContent = "Sorry, the message could not be sent right now. Please contact us on WhatsApp or call.";
        feedback.style.color = "var(--coral-deep)";
      } finally {
        if (button) button.disabled = false;
      }
    });
  };
  document.addEventListener("DOMContentLoaded", () => {
    wireForm("admissionForm", "admission_enquiries", "admissionFeedback",
      ["child_name", "parent_name", "phone", "email", "child_age", "program", "message"]);
    wireForm("contactForm", "contact_messages", "contactFeedback",
      ["name", "phone", "email", "subject", "message"]);
    const certificate = document.getElementById("certificatePhoto");
    if (certificate) {
      certificate.addEventListener("click", () => {
        const image = certificate.querySelector("img");
        if (!image || certificate.classList.contains("is-missing")) return;
        const overlay = document.createElement("div");
        overlay.className = "certificate-lightbox active";
        overlay.setAttribute("role", "dialog");
        overlay.setAttribute("aria-modal", "true");
        overlay.innerHTML = '<button type="button" class="certificate-close" aria-label="Close certificate">✕</button><img alt="Little Blossoms certificate">';
        overlay.querySelector("img").src = image.src;
        const close = () => { overlay.remove(); document.body.style.overflow = ""; };
        overlay.querySelector("button").addEventListener("click", close);
        overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
        document.addEventListener("keydown", function esc(e) {
          if (e.key === "Escape" && document.body.contains(overlay)) { close(); document.removeEventListener("keydown", esc); }
        });
        document.body.appendChild(overlay);
        document.body.style.overflow = "hidden";
      });
    }
  });
})();


/* =========================================================
   SECURE GALLERY ADMIN + SUPABASE STORAGE
   ========================================================= */
window.LBGalleryAdminReady = (async () => {
  const SUPABASE_URL = "https://shyxftohajgbxunfsyay.supabase.co";
  const SUPABASE_KEY = "sb_publishable_hvisH10Zh_MlX77IVzhTag_a5sv1Nn3";
  const ADMIN_EMAIL = "littleblossom0111@gmail.com";
  const BUCKET = "little-blossoms-gallery";
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  const client = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
  const panel = document.getElementById("galleryAdminPanel");
  const toggle = document.getElementById("galleryAdminToggle");
  const authForm = document.getElementById("galleryAuthForm");
  const authFeedback = document.getElementById("galleryAuthFeedback");
  const createButton = document.getElementById("galleryAdminCreate");
  const forgotButton = document.getElementById("galleryAdminForgot");
  const logoutButton = document.getElementById("galleryAdminLogout");
  const uploadForm = document.getElementById("galleryUploadForm");
  const uploadFeedback = document.getElementById("galleryUploadFeedback");
  const setMessage = (el, message, bad = false) => {
    if (!el) return;
    el.textContent = message;
    el.style.color = bad ? "var(--coral-deep)" : "var(--leaf-deep)";
  };
  const currentEmail = (session) => (session?.user?.email || "").toLowerCase();
  let isAdmin = false;
  window.LBGalleryAdmin = { client, get isAdmin() { return isAdmin; } };

  const refreshRole = async (session) => {
    isAdmin = currentEmail(session) === ADMIN_EMAIL;
    window.LBGalleryAdmin.isAdmin = isAdmin;
    if (authForm) authForm.hidden = isAdmin;
    if (uploadForm) uploadForm.hidden = !isAdmin;
    if (logoutButton) logoutButton.hidden = !isAdmin;
    if (toggle) toggle.textContent = isAdmin ? "Admin Gallery: Signed In" : "Admin Login";
    if (panel) panel.classList.toggle("is-admin", isAdmin);
    if (!isAdmin && session) {
      await client.auth.signOut();
      setMessage(authFeedback, "This account is not authorised for gallery management.", true);
    } else if (isAdmin) {
      setMessage(authFeedback, "Admin signed in. Upload, edit and delete controls are enabled.");
      document.querySelectorAll(".gallery-card").forEach(card => {
        if (card.getAttribute("aria-expanded") === "true") card.click();
      });
    }
  };

  if (toggle && panel) {
    toggle.addEventListener("click", () => {
      panel.hidden = !panel.hidden;
      if (!panel.hidden) panel.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (authForm) {
    authForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(authForm);
      const email = String(data.get("email") || "").trim().toLowerCase();
      const password = String(data.get("password") || "");
      if (email !== ADMIN_EMAIL) {
        setMessage(authFeedback, "Only the authorised Little Blossoms admin email can sign in here.", true);
        return;
      }
      const submit = authForm.querySelector('button[type="submit"]');
      if (submit) submit.disabled = true;
      setMessage(authFeedback, "Signing in…");
      const { data: result, error } = await client.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(authFeedback, error.message, true);
      } else {
        await refreshRole(result.session);
        if (isAdmin) {
          setMessage(authFeedback, "Signed in successfully. Admin tools are now available.");
          document.querySelectorAll(".gallery-card").forEach(card => {
            if (card.getAttribute("aria-expanded") === "true") card.click();
          });
        }
      }
      if (submit) submit.disabled = false;
    });
  }

  if (createButton && authForm) {
    createButton.addEventListener("click", async () => {
      const data = new FormData(authForm);
      const email = String(data.get("email") || "").trim().toLowerCase();
      const password = String(data.get("password") || "");
      if (email !== ADMIN_EMAIL) { setMessage(authFeedback, "Use the authorised admin email only.", true); return; }
      if (password.length < 8) { setMessage(authFeedback, "Please enter a password with at least 8 characters first.", true); return; }
      setMessage(authFeedback, "Creating admin account…");
      const { error } = await client.auth.signUp({ email, password, options: { emailRedirectTo: location.origin + location.pathname + "#gallery" } });
      if (error) setMessage(authFeedback, error.message, true);
      else setMessage(authFeedback, "Account request sent. Check the admin email inbox and confirm the verification link, then sign in.");
    });
  }

  if (forgotButton && authForm) {
    forgotButton.addEventListener("click", async () => {
      const email = String(new FormData(authForm).get("email") || "").trim().toLowerCase();
      if (email !== ADMIN_EMAIL) { setMessage(authFeedback, "Enter the authorised admin email first.", true); return; }
      const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname + "#gallery" });
      setMessage(authFeedback, error ? error.message : "Password reset link sent to the admin email inbox.", !!error);
    });
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
      await client.auth.signOut();
      isAdmin = false;
      window.LBGalleryAdmin.isAdmin = false;
      if (uploadForm) uploadForm.hidden = true;
      if (authForm) authForm.hidden = false;
      logoutButton.hidden = true;
      toggle.textContent = "Admin Login";
      setMessage(authFeedback, "You are signed out.");
      document.querySelectorAll(".gallery-card").forEach(card => {
        if (card.getAttribute("aria-expanded") === "true") card.click();
      });
    });
  }

  if (uploadForm) {
    uploadForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!isAdmin) { setMessage(uploadFeedback, "Please sign in as admin first.", true); return; }
      const data = new FormData(uploadForm);
      const files = Array.from(data.getAll("media_files")).filter(file => file && file.size);
      if (!files.length) { setMessage(uploadFeedback, "Choose at least one photo or video.", true); return; }
      const title = String(data.get("title") || "").trim();
      const category = String(data.get("category") || "classroom");
      const description = String(data.get("description") || "").trim();
      const submit = uploadForm.querySelector('button[type="submit"]');
      if (submit) submit.disabled = true;
      let completed = 0;
      setMessage(uploadFeedback, "Uploading 0 of " + files.length + "…");
      for (const file of files) {
        if (file.size > 100 * 1024 * 1024) { setMessage(uploadFeedback, file.name + " exceeds 100 MB.", true); continue; }
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");
        if (!isImage && !isVideo) { setMessage(uploadFeedback, file.name + " is not a supported image/video.", true); continue; }
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
        const path = category + "/" + crypto.randomUUID() + "-" + safeName;
        const { error: uploadError } = await client.storage.from(BUCKET).upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
        if (uploadError) { setMessage(uploadFeedback, "Upload failed for " + file.name + ": " + uploadError.message, true); continue; }
        const { data: urlData } = client.storage.from(BUCKET).getPublicUrl(path);
        const { error: insertError } = await client.from("gallery_items").insert({
          title: title || file.name,
          category,
          media_type: isImage ? "image" : "video",
          media_url: urlData.publicUrl,
          thumbnail_url: isImage ? urlData.publicUrl : null,
          storage_path: path,
          description: description || null,
          display_order: Date.now(),
          is_published: true
        });
        if (insertError) {
          await client.storage.from(BUCKET).remove([path]);
          setMessage(uploadFeedback, "Database save failed for " + file.name + ": " + insertError.message, true);
          continue;
        }
        completed++;
        setMessage(uploadFeedback, "Uploading " + completed + " of " + files.length + "…");
      }
      if (completed) {
        setMessage(uploadFeedback, "Done! " + completed + " file(s) added to the gallery.");
        uploadForm.reset();
        const category = uploadForm.querySelector('[name="category"]').value;
        document.querySelectorAll(".gallery-card").forEach(card => {
          if (card.dataset.folder === category) {
            card.click();
          }
        });
      }
      if (submit) submit.disabled = false;
    });
  }

  const { data: sessionData } = await client.auth.getSession();
  await refreshRole(sessionData.session);
  client.auth.onAuthStateChange((_event, session) => {
    refreshRole(session);
  });
})();
