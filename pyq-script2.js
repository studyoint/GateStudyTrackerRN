/* ==========================================================
=================== SECTION 01 : DOM ELEMENTS ================
========================================================== */

/* ===================== Header ===================== */

const searchBox = document.getElementById("searchBox");

const menuBtn = document.getElementById("menuBtn");


/* ===================== Subject Panel ===================== */

const subjectList = document.getElementById("subjectList");

const subjectPanel = document.getElementById("subjectPanel");

const closeMenuBtn = document.getElementById("closeMenuBtn");

const drawerOverlay = document.getElementById("drawerOverlay");


/* ===================== PYQ Panel ===================== */

const currentSubject = document.getElementById("currentSubject");

const subjectStats = document.getElementById("subjectStats");

const pyqGrid = document.getElementById("pyqGrid");


/* ===================== Status Bar ===================== */

const progressText = document.getElementById("progressText");

const progressBar = document.getElementById("progressBar");

const prevBtn = document.getElementById("prevBtn");

const nextBtn = document.getElementById("nextBtn");


/* ===================== Video Modal ===================== */

const videoModal = document.getElementById("videoModal");

const modalContent = document.getElementById("modalContent");

const youtubePlayer = document.getElementById("youtubePlayer");

const closePlayer = document.getElementById("closePlayer");


/* ===================== Footer ===================== */

const youtubeLink = document.getElementById("youtubeLink");

const websiteLink = document.getElementById("websiteLink");

const telegramLink = document.getElementById("telegramLink");


/* ================= Player Footer ================= */

const playerSubject = document.getElementById("playerSubject");

const playerCounter = document.getElementById("playerCounter");

const playerPrev = document.getElementById("playerPrev");

const playerNext = document.getElementById("playerNext");


/* ==========================================================
================= END SECTION 01 ============================
========================================================== */
/* ==========================================================
================== SECTION 02 : GLOBAL VARIABLES ============
========================================================== */

/* ===================== Subject Data ===================== */

let subjects = {};

let subjectKeys = [];


/* ===================== Current State ===================== */

let currentSubjectKey = "";

let currentSubjectName = "";

let currentPlaylist = [];

let currentVideoIndex = -1;

/* ===================== Filter ===================== */

let currentFilter = "all";


/* ===================== Subject Progress ===================== */

/*
Structure

savedProgress={

    dbms:[...],

    os:[...],

    cn:[...]

}
*/

let savedProgress = {};


/* ===================== Application ===================== */

let isLoading = false;
let pendingVideoID = "";
let loadToken = 0;

/* ===================== Constants ===================== */

const TXT_FOLDER = "";

const STORAGE_KEY = "decoding_gate_cse_progress";

const LAST_SUBJECT_KEY = "decoding_gate_cse_last_subject";

/* ==========================================================
================ END SECTION 02 =============================
========================================================== */
/* ==========================================================
================ SECTION 03 : SUBJECT CONFIGURATION ==========
========================================================== */

/*
-------------------------------------------------------------
Subject Configuration

key      : Internal ID
name     : Display Name
file     : TXT File Path

NOTE
TXT file format:

https://youtu.be/xxxx
https://youtu.be/yyyy
https://youtu.be/zzzz

One Link Per Line
-------------------------------------------------------------
*/

subjects = {

       ga:{

        name:"GA",

        file:TXT_FOLDER + "ga-gw-pyq.txt"

    },


    dbms:{

        name:"Database Management System",

        file:TXT_FOLDER + "dbms_pyq.txt"

    },

    os:{

        name:"Operating System",

        file:TXT_FOLDER + "os-pyq-gw-yt-rn.txt"

    },

    cn:{

        name:"Computer Networks",

        file:TXT_FOLDER + "cn-gw-pyq.txt"

    },

    toc:{

        name:"Theory of Computation",

        file:TXT_FOLDER + "toc-pyq-gw-yt-rn.txt"

    },

    coa:{

        name:"Computer Organization & Architecture",

        file:TXT_FOLDER + "coa-pyq-gw-yt-rn.txt"

    },

    cd:{

        name:"Compiler Design",

        file:TXT_FOLDER + "cd-pyq-gw-yt-rn.txt"

    },

    dm:{

        name:"Discrete Mathematics",

        file:TXT_FOLDER + "dm-pyq-gw-yt-rn.txt"

    },

    algo:{

        name:"Algorithms",

        file:TXT_FOLDER + "algo-pyq-gw-yt-rn.txt"

    },
        dl:{

        name:"DL",

        file:TXT_FOLDER + "dl-pyq-gw-yt-rn.txt"

    },
 cds:{

        name:"CDS",

        file:TXT_FOLDER + "cds-pyq-gw-yt-rn.txt"

    },

     em:{

        name:"EM",

        file:TXT_FOLDER + "em-pyq-gw-yt-rn.txt"

    }

    

};


/* ===================== Subject Keys ===================== */

subjectKeys = Object.keys(subjects);


/* ==========================================================
============== END SECTION 03 ===============================
========================================================== */
/* ==========================================================
================ SECTION 04 : INITIALIZATION ================
========================================================== */

/*
-------------------------------------------------------------
Application Start

1. Load Saved Progress
2. Render Subject List
3. Open Last Subject
4. Attach Event Listeners

-------------------------------------------------------------
*/

function init(){

    /* Load Local Storage */

    loadProgress();


    /* Create Sidebar */

    renderSubjects();


    /* Open Last Subject */

    if(subjectKeys.length>0){

        const lastSubject = localStorage.getItem(LAST_SUBJECT_KEY);

        if(lastSubject && subjects[lastSubject]){

            loadSubject(lastSubject);

        }

        else{

            loadSubject(subjectKeys[0]);

        }

    }


    /* Register Events */

    registerEvents();

}


/* ==========================================================
================ END SECTION 04 =============================
========================================================== */

/* ==========================================================
================ SECTION 05 : RENDER SUBJECTS ===============
========================================================== */

function renderSubjects(){

    /* Clear Old Subjects */

    subjectList.innerHTML = "";


    /* Create Subject Cards */

    subjectKeys.forEach((key,index)=>{

        const card = document.createElement("div");

        card.className = "subject-card";

        card.dataset.subject = key;


        card.textContent = `${index + 1}. ${subjects[key].name}`;


        card.addEventListener("click",()=>{

            loadSubject(key);

            /* Mobile Drawer Close */

            if(window.innerWidth<=768){

                subjectPanel.classList.remove("open");

                drawerOverlay.classList.remove("show");

            }

        });


        subjectList.appendChild(card);

    });

}


/* ==========================================================
=============== END SECTION 05 ==============================
========================================================== */
/* ==========================================================
================= SECTION 06 : LOAD SUBJECT =================
========================================================== */

async function loadSubject(subjectKey){
    const token = ++loadToken;

    /* Validate Subject */

    if(!subjects[subjectKey]){

        return;

    }


    /* Save Current Subject */

    currentSubjectKey = subjectKey;

    currentSubjectName = subjects[subjectKey].name;

    /* Save Last Opened Subject */

    localStorage.setItem(

        LAST_SUBJECT_KEY,

        subjectKey

    );


    /* Update Header */

    currentSubject.textContent = currentSubjectName;


    /* Highlight Active Subject */

    document
        .querySelectorAll(".subject-card")
        .forEach(card=>{

            card.classList.remove("active-subject");

            if(card.dataset.subject===subjectKey){

                card.classList.add("active-subject");

            }

        });


    /* Load TXT */

  const playlist = await loadTXT(
    subjects[subjectKey].file
);

if(token !== loadToken){
    return;
}

currentPlaylist = playlist;


    /* Load Saved Progress */

    loadProgress();


    if(savedProgress[currentSubjectKey]){

        currentPlaylist.forEach((pyq,index)=>{

            if(savedProgress[currentSubjectKey][index]){

                pyq.completed = savedProgress[currentSubjectKey][index].completed;

                pyq.starred = savedProgress[currentSubjectKey][index].starred;

            }

        });

    }


    /* Reset */

    currentVideoIndex = -1;


    /* Render */

    renderPYQGrid();

    updatePlayerFooter();

    updateProgress();

}


/* ==========================================================
=============== END SECTION 06 ==============================
========================================================== */
/* ==========================================================
=================== SECTION 07 : LOAD TXT ===================
========================================================== */

/*
-------------------------------------------------------------
Load TXT File

Supported Formats
-----------------

https://youtu.be/xxxxx

https://www.youtube.com/watch?v=xxxxx

https://youtube.com/watch?v=xxxxx

https://m.youtube.com/watch?v=xxxxx

https://music.youtube.com/watch?v=xxxxx

https://youtube.com/live/xxxxx

https://youtube.com/embed/xxxxx

https://youtube.com/shorts/xxxxx

1- https://....

01. https://....

1) https://....

Random Text https://....

Duplicate Links ✔

Blank Lines ✔

Comments (# or //) ✔

-------------------------------------------------------------
*/

async function loadTXT(filePath){

    try{

        const response = await fetch(filePath);

        if(!response.ok){

            throw new Error("TXT File Not Found");

        }

        const text = await response.text();

        const lines = text.split(/\r?\n/);

        const seen = new Set();

        const links = [];

        const youtubeRegex =
        /(https?:\/\/(?:www\.|m\.|music\.)?(?:youtube\.com|youtu\.be)\/[^\s]+)/i;

        for(let line of lines){

            line = line.trim();

            if(!line){

                continue;

            }

            if(line.startsWith("#") || line.startsWith("//")){

                continue;

            }

            const match = line.match(youtubeRegex);

            if(!match){

                continue;

            }

            let url = match[1].trim();

            /* Remove trailing punctuation */

            url = url.replace(/[),.;]+$/,"");

            /* Remove duplicate links */

            if(seen.has(url)){

                continue;

            }

            seen.add(url);

            links.push({

                link:url,

                completed:false,

                starred:false

            });

        }

        return links;

    }

    catch(error){

        console.error("Unable To Load TXT :",error);

        return [];

    }

}


/* ==========================================================
================= END SECTION 07 ============================
========================================================== */

/* ==========================================================
=============== SECTION 08 : EXTRACT VIDEO ID ===============
========================================================== */

/*
-------------------------------------------------------------
Supported Formats

https://youtu.be/VIDEO_ID

https://www.youtube.com/watch?v=VIDEO_ID

https://youtube.com/watch?v=VIDEO_ID

https://www.youtube.com/embed/VIDEO_ID

https://www.youtube.com/live/VIDEO_ID

-------------------------------------------------------------
*/

function extractVideoID(url){

    if(!url){

        return "";

    }

    /* Remove Extra Spaces */

    url = url.trim();

    /* youtu.be */

    if(url.includes("youtu.be/")){

        return url.split("youtu.be/")[1].split("?")[0];

    }

    /* watch?v= */

    if(url.includes("watch?v=")){

        return url.split("watch?v=")[1].split("&")[0];

    }

    /* embed */

    if(url.includes("/embed/")){

        return url.split("/embed/")[1].split("?")[0];

    }

    /* live */

    if(url.includes("/live/")){

        return url.split("/live/")[1].split("?")[0];

    }

    return "";

}

/* ==========================================================
============== END SECTION 08 ===============================
========================================================== */
/* ==========================================================
================ SECTION 09 : RENDER PYQ GRID ===============
========================================================== */

function renderPYQGrid(){

    /* Clear Old Buttons */

    pyqGrid.innerHTML = "";

    /* No Playlist */

    if(currentPlaylist.length===0){

        pyqGrid.innerHTML="<p>No PYQs Found.</p>";

        return;

    }

    /* Create Cards */

    currentPlaylist.forEach((pyq,index)=>{

        /* ================= Card ================= */

        const card=document.createElement("div");

        card.className="pyq-button";

        if(pyq.completed){

            card.classList.add("completed");

        }

        if(index===currentVideoIndex){

            card.classList.add("current");

        }

        /* ================= Checkbox ================= */

        const checkbox=document.createElement("span");

        checkbox.className="pyq-check";

        checkbox.textContent = pyq.completed ? "✅" : "☐";

        checkbox.addEventListener("click",(e)=>{

            e.stopPropagation();

            pyq.completed = !pyq.completed;

            saveProgress();

            renderPYQGrid();

            updateProgress();

        });

        /* ================= Star ================= */

        const star=document.createElement("span");

        star.className="pyq-star";

        star.textContent = pyq.starred ? "⭐" : "☆";

        star.addEventListener("click",(e)=>{

            e.stopPropagation();

            pyq.starred = !pyq.starred;

            saveProgress();

            renderPYQGrid();

            updateProgress();

        });

        /* ================= Title ================= */

        const title=document.createElement("div");

        title.className="pyq-title";

        title.textContent = `PYQ ${index+1}`;

        /* ================= Open Video ================= */

        card.addEventListener("click",()=>{

            playVideo(index);

        });

        /* ================= Append ================= */

        card.appendChild(checkbox);

        card.appendChild(star);

        card.appendChild(title);

        pyqGrid.appendChild(card);

    });

}

/* ==========================================================
============== END SECTION 09 ===============================
========================================================== */
/* ==========================================================
    ================== SECTION 10 : PLAY VIDEO ==================
    ========================================================== */

    function playVideo(videoIndex){

        /* Validate Index */

        if(
            videoIndex < 0 ||
            videoIndex >= currentPlaylist.length
        ){
            return;
        }

     /* Save Current Index */

currentVideoIndex = videoIndex;

/* Update Player Footer */

updatePlayerFooter();

/* Refresh Current Button */

renderPYQGrid();

        /* Get Current Link */

        const videoLink = currentPlaylist[currentVideoIndex].link;

        /* Extract YouTube Video ID */

        const videoID = extractVideoID(videoLink);
        pendingVideoID = videoID;

        if(videoID===""){

            alert("Invalid YouTube Link");

            return;

        }

        /* Show Player */

        videoModal.style.display = "flex";

        /* Load Video */

       if(!player || !isPlayerReady){
    return;
}

player.stopVideo();

player.loadVideoById(videoID);

player.setPlaybackRate(1.5);

pendingVideoID = "";

    }

/* ==========================================================
================ END SECTION 10 =============================
========================================================== */


/* ==========================================================
============== SECTION 11 : YOUTUBE PLAYER API ==============
========================================================== */

/*
-------------------------------------------------------------
Official YouTube IFrame API

This function is automatically called by
YouTube API after the API script is loaded.
-------------------------------------------------------------
*/

let player = null;
let isPlayerReady = false;

function onYouTubeIframeAPIReady(){

    player = new YT.Player("youtubePlayer",{

        videoId:"",

        playerVars:{

            rel:0,

            modestbranding:1,

            playsinline:1

        },

        events:{

            onReady:onPlayerReady,

            onStateChange:onPlayerStateChange

        }

    });

}


/* ===================== Player Ready ===================== */

function onPlayerReady(){

    isPlayerReady = true;

    player.setPlaybackRate(1.5);

    if(pendingVideoID){

        player.loadVideoById(pendingVideoID);

        pendingVideoID = "";

    }

}

/* ===================== Player State ===================== */

function onPlayerStateChange(event){

    /* Video Finished */


    if(event.data===YT.PlayerState.PLAYING){
        console.log("VIDEO PLAYING");

    player.setPlaybackRate(1.5);

}
    if(event.data===YT.PlayerState.ENDED){

        /* Mark Completed */

        if(currentVideoIndex>=0){

            currentPlaylist[currentVideoIndex].completed=true;

            saveProgress();

            renderPYQGrid();

            updateProgress();

        }

        /* Auto Next */

        playNext();

    }

}


/* ==========================================================
============== END SECTION 11 ===============================
========================================================== */
/* ==========================================================
============= SECTION 12 : PREVIOUS / NEXT VIDEO ============
========================================================== */

function playNext(){

    if(currentVideoIndex >= currentPlaylist.length-1){

        return;

    }

    playVideo(currentVideoIndex+1);

    updatePlayerFooter();

}

function playPrevious(){

    if(currentVideoIndex<=0){

        return;

    }

    playVideo(currentVideoIndex-1);

    updatePlayerFooter();

}

/* ==========================================================
============= END SECTION 12 ================================
========================================================== */
/* ==========================================================
========== SECTION 13 : MARK COMPLETED VIDEO ================
========================================================== */
/* ==========================================================
================ SECTION 14 : UPDATE PROGRESS ===============
========================================================== */

function updateProgress(){

    /* No Subject */

    if(currentSubjectKey===""){

        progressText.textContent="Completed : 0 / 0";

        progressBar.style.width="0%";

        subjectStats.innerHTML="";

        return;

    }

    /* ================= Statistics ================= */

    const total = currentPlaylist.length;

    const completed = currentPlaylist.filter(pyq=>pyq.completed).length;

    const pending = total - completed;

    const starred = currentPlaylist.filter(pyq=>pyq.starred).length;

    /* ================= Progress ================= */

    const percentage =
        total===0
        ? 0
        : (completed/total)*100;

    progressText.textContent =
        `Completed : ${completed} / ${total}`;

    progressBar.style.width =
        `${percentage}%`;

    /* ================= Subject Summary ================= */

    subjectStats.innerHTML = `

        <div class="stats-item">

            <span>Total</span>

            <strong>${total}</strong>

        </div>

        <div class="stats-item">

            <span>Completed</span>

            <strong>${completed}</strong>

        </div>

        <div class="stats-item">

            <span>Pending</span>

            <strong>${pending}</strong>

        </div>

        <div class="stats-item">

            <span>⭐ Starred</span>

            <strong>${starred}</strong>

        </div>

    `;

}

/* ==========================================================
================ END SECTION 14 =============================
========================================================== */
/* ==========================================================
=============== SECTION 15 : SAVE PROGRESS ==================
========================================================== */

function saveProgress(){

    try{

        /* Save Current Subject */

        savedProgress[currentSubjectKey]=currentPlaylist;


        /* Save All Subjects */

        localStorage.setItem(

            STORAGE_KEY,

            JSON.stringify(savedProgress)

        );

    }

    catch(error){

        console.error(

            "Unable To Save Progress",

            error

        );

    }

}


/* ==========================================================
================ END SECTION 15 =============================
========================================================== */
/* ==========================================================
=============== SECTION 16 : LOAD PROGRESS ==================
========================================================== */

function loadProgress(){

    try{

        const savedData = localStorage.getItem(

            STORAGE_KEY

        );


        if(!savedData){

            savedProgress = {};

            return;

        }


        savedProgress = JSON.parse(

            savedData

        ) || {};

    }

    catch(error){

        console.error(

            "Unable To Load Progress",

            error

        );

        savedProgress = {};

    }

}


/* ==========================================================
================ END SECTION 16 =============================
========================================================== *//* ==========================================================
================ SECTION 17 : SEARCH SUBJECT ================
========================================================== */

function searchSubject(searchText){

    const keyword = searchText

        .trim()

        .toLowerCase();


    const cards = document.querySelectorAll(

        ".subject-card"

    );


    cards.forEach(card=>{

        const text = card.textContent

            .toLowerCase();


        if(text.includes(keyword)){

            card.style.display = "";

        }

        else{

            card.style.display = "none";

        }

    });

}


/* ==========================================================
================ END SECTION 17 =============================
========================================================== */

/* ==========================================================
=============== SECTION 18 : EVENT LISTENERS ================
========================================================== */

function registerEvents(){

    /* ===================== Search ===================== */

    if(searchBox){

        searchBox.addEventListener(

            "input",

            function(){

                searchSubject(

                    this.value

                );

            }

        );

    }


    /* ===================== Mobile Menu ===================== */

    if(menuBtn){

        menuBtn.addEventListener(

            "click",

            function(){

                subjectPanel.classList.add("open");

                drawerOverlay.classList.add("show");

            }

        );

    }


    if(closeMenuBtn){

        closeMenuBtn.addEventListener(

            "click",

            function(){

                subjectPanel.classList.remove("open");

                drawerOverlay.classList.remove("show");

            }

        );

    }


    if(drawerOverlay){

        drawerOverlay.addEventListener(

            "click",

            function(){

                subjectPanel.classList.remove("open");

                drawerOverlay.classList.remove("show");

            }

        );

    }


    /* ===================== Previous ===================== */

    prevBtn.addEventListener(

        "click",

        function(){

            playPrevious();

        }

    );


    /* ===================== Next ===================== */

    nextBtn.addEventListener(

        "click",

        function(){

            playNext();

        }

    );


    /* ===================== Close Player ===================== */

    closePlayer.addEventListener(

        "click",

        function(){

           closeVideoPlayer();

        }

    );


    /* ===================== ESC Key ===================== */

    document.addEventListener(

        "keydown",

        function(event){

            if(event.key==="Escape"){

                closeVideoPlayer();

                subjectPanel.classList.remove("open");

                drawerOverlay.classList.remove("show");

            }

        }

    );


    /* ===================== Outside Click ===================== */

    videoModal.addEventListener(

        "click",

        function(event){

            if(event.target===videoModal){

                closeVideoPlayer();

            }

        }

    );

}


/* ==========================================================
================ END SECTION 18 =============================
========================================================== */
/* ==========================================================
=============== SECTION 19 : START APPLICATION ===============
========================================================== */

/*
-------------------------------------------------------------
Application Entry Point
-------------------------------------------------------------
*/

document.addEventListener(

    "DOMContentLoaded",

    function(){

        init();

    }

);


/* ==========================================================
================ END SECTION 19 =============================
========================================================== */

/* ==========================================================
============== SECTION 20 : FINAL INTEGRATION ===============
========================================================== */

/*
-------------------------------------------------------------
Close Player
-------------------------------------------------------------
*/

function closeVideoPlayer(){

    videoModal.style.display = "none";

    if(player && isPlayerReady){

       player.stopVideo();

pendingVideoID = "";

    }

}


/*
-------------------------------------------------------------
Mark Current Video Completed
-------------------------------------------------------------
*/

function markCurrentVideoCompleted(){

    if(currentVideoIndex < 0){

        return;

    }

    currentPlaylist[currentVideoIndex].completed = true;

    saveProgress();

    renderPYQGrid();

    updateProgress();

}

/* ==========================================================
================ END SECTION 20 =============================
========================================================== */

/* ==========================================================
============= SECTION 23 : PLAYER FOOTER ====================
========================================================== */

function updatePlayerFooter(){

    if(currentPlaylist.length===0){

        playerSubject.textContent="";

        playerCounter.textContent="";

        return;

    }

    /* Subject Name */

    playerSubject.textContent=currentSubjectName;

    /* Counter */

    if(currentVideoIndex<0){

        playerCounter.textContent=`1 / ${currentPlaylist.length}`;

    }

    else{

        playerCounter.textContent=
        `${currentVideoIndex+1} / ${currentPlaylist.length}`;

    }

}

/* ================= Previous Button ================= */

playerPrev.addEventListener("click",()=>{

    playPrevious();

});

/* ================= Next Button ================= */

playerNext.addEventListener("click",()=>{

    playNext();

});

/* ==========================================================
================ END SECTION 23 =============================
========================================================== */
