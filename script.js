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
let currentGalleryFolder = "";

async function loadGalleryMedia(folder, token) {
  if (!lightboxMedia) return;
  currentGalleryFolder = folder;
  lightboxMedia.innerHTML = '<div class="lightbox-loading">Loading photos &amp; videos…</div>';
  try {
    if (window.LBGalleryAdminReady) await Promise.race([window.LBGalleryAdminReady,new Promise((_,reject)=>setTimeout(()=>reject(new Error("Gallery timeout")),8000))]);
    const gallery=window.LBGalleryAdmin;
    if(!gallery?.client) throw new Error("Gallery service unavailable");
    const {data,error}=await gallery.client.from("gallery_items").select("*").eq("category",folder).order("created_at",{ascending:false});
    if(error) throw error;
    if(token!==mediaLoadToken)return;
    window.LBGalleryItems=(data||[]).map(item=>({id:item.id,title:item.title||"Untitled",description:item.description||"",type:item.media_type,src:item.media_url,thumbnail:item.thumbnail_url||"",storage_path:item.storage_path||"",category:item.category,created_at:item.created_at}));
    renderGalleryMedia("image",folder,token);
  } catch(error) {
    console.error("Gallery media failed to load:",error);
    if(token===mediaLoadToken)lightboxMedia.innerHTML='<div class="lightbox-empty">Gallery is temporarily unavailable. Please refresh and try again.</div>';
  }
}
function renderGalleryMedia(filter,folder,token=mediaLoadToken) {
  if(!lightboxMedia||token!==mediaLoadToken)return;
  document.querySelectorAll("[data-media-filter]").forEach(button=>{const active=button.dataset.mediaFilter===filter;button.classList.toggle("active",active);button.setAttribute("aria-selected",String(active));});
  const items=(window.LBGalleryItems||[]).filter(item=>item.type===filter);
  if(!items.length){lightboxMedia.innerHTML='<div class="lightbox-empty">No '+(filter==="image"?"photos":"videos")+' in this category yet.</div>';return;}
  lightboxMedia.innerHTML="";
  const gallery=window.LBGalleryAdmin, canManage=!!(gallery&&gallery.isAdmin);
  const adminLink=document.getElementById("galleryModalAdminLink"); if(adminLink)adminLink.hidden=!canManage;
  items.forEach(item=>{
    const card=document.createElement("article");card.className="gallery-media-item";
    const open=document.createElement("button");open.type="button";open.className="gallery-media-open";open.setAttribute("aria-label",(filter==="video"?"Play video: ":"View photo: ")+item.title);
    if(filter==="image"){
      const img=document.createElement("img");img.src=item.thumbnail||item.src;img.alt=item.title;img.loading="lazy";img.decoding="async";open.appendChild(img);
      open.addEventListener("click",()=>{const viewer=document.createElement("div");viewer.className="gallery-viewer";const close=document.createElement("button");close.type="button";close.className="gallery-viewer-close";close.textContent="×";close.setAttribute("aria-label","Close");const full=document.createElement("img");full.src=item.src;full.alt=item.title;viewer.append(close,full);viewer.addEventListener("click",e=>{if(e.target===viewer||e.target===close)viewer.remove();});document.body.appendChild(viewer);});
    } else {
      const poster=document.createElement("div");poster.className="gallery-video-poster";
      if(item.thumbnail){const img=document.createElement("img");img.src=item.thumbnail;img.alt="";img.loading="lazy";poster.appendChild(img);}else{const fallback=document.createElement("span");fallback.className="gallery-video-symbol";fallback.textContent="▶";poster.appendChild(fallback);}
      const play=document.createElement("span");play.className="gallery-play-icon";play.textContent="▶";poster.appendChild(play);open.appendChild(poster);
      open.addEventListener("click",()=>{const viewer=document.createElement("div");viewer.className="gallery-viewer";const close=document.createElement("button");close.type="button";close.className="gallery-viewer-close";close.textContent="×";close.setAttribute("aria-label","Close");const video=document.createElement("video");video.src=item.src;video.controls=true;video.autoplay=true;video.playsInline=true;viewer.append(close,video);viewer.addEventListener("click",e=>{if(e.target===viewer||e.target===close){video.pause();viewer.remove();}});document.body.appendChild(viewer);});
    }
    card.appendChild(open);
    const title=document.createElement("p");title.className="gallery-media-title";title.textContent=item.title;card.appendChild(title);
    if(item.description){const d=document.createElement("p");d.className="gallery-media-description";d.textContent=item.description;card.appendChild(d);}
    if(item.created_at){const date=document.createElement("time");date.className="gallery-media-date";date.dateTime=item.created_at;date.textContent=new Date(item.created_at).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});card.appendChild(date);}
    if(canManage&&item.id){
      const actions=document.createElement("div");actions.className="gallery-item-admin-actions";
      const edit=document.createElement("button");edit.type="button";edit.className="btn btn-ghost gallery-edit-btn";edit.textContent="Edit";
      edit.addEventListener("click",async()=>{const t=prompt("Photo/video title:",item.title);if(t===null)return;const d=prompt("Description:",item.description);if(d===null)return;const {error}=await gallery.client.from("gallery_items").update({title:t.trim().slice(0,120),description:d.trim().slice(0,1000)}).eq("id",item.id);if(error){alert("Update failed: "+error.message);return;}await loadGalleryMedia(folder,token);});
      const del=document.createElement("button");del.type="button";del.className="btn btn-danger gallery-delete-btn";del.textContent="Delete";
      del.addEventListener("click",async()=>{if(!confirm("Delete this photo/video permanently?"))return;if(item.storage_path){const {error}=await gallery.client.storage.from("little-blossoms-gallery").remove([item.storage_path]);if(error){alert("File delete failed: "+error.message);return;}}const {error}=await gallery.client.from("gallery_items").delete().eq("id",item.id);if(error){alert("Delete failed: "+error.message);return;}await loadGalleryMedia(folder,token);});
      actions.append(edit,del);card.appendChild(actions);
    }
    lightboxMedia.appendChild(card);
  });
}
document.querySelectorAll("[data-media-filter]").forEach(button=>button.addEventListener("click",()=>renderGalleryMedia(button.dataset.mediaFilter,currentGalleryFolder,mediaLoadToken)));


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


/* Hero artwork is CSS-based 3D; no WebGL setup required. */

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


/* Shared Supabase client for public gallery viewing and admin-only edit/delete controls. */
window.LBGalleryAdminReady=(async()=>{
 const URL="https://shyxftohajgbxunfsyay.supabase.co",KEY="sb_publishable_hvisH10Zh_MlX77IVzhTag_a5sv1Nn3",ADMIN="littleblossom0111@gmail.com";
 const {createClient}=await import("https://esm.sh/@supabase/supabase-js@2");
 const client=createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 window.LBGalleryAdmin={client,isAdmin:false};
 const {data}=await client.auth.getSession();
 window.LBGalleryAdmin.isAdmin=(data.session?.user?.email||"").toLowerCase()===ADMIN;
 client.auth.onAuthStateChange((_event,session)=>{window.LBGalleryAdmin.isAdmin=(session?.user?.email||"").toLowerCase()===ADMIN;});
 return client;
})();
