/* ==========================================================
=================== SECTION 01 : DOM ELEMENTS ================
========================================================== */

/* ===================== Header ===================== */

const searchBox = document.getElementById("searchBox");


/* ===================== Subject Panel ===================== */

const subjectList = document.getElementById("subjectList");


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


/* ===================== Constants ===================== */

const TXT_FOLDER = "pyq_txt/";

const STORAGE_KEY = "decoding_gate_cse_progress";


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

    dbms:{

        name:"Database Management System",

        file:TXT_FOLDER + "dbms_pyq.txt"

    },

    os:{

        name:"Operating System",

        file:TXT_FOLDER + "os_pyq.txt"

    },

    cn:{

        name:"Computer Networks",

        file:TXT_FOLDER + "cn_pyq.txt"

    },

    toc:{

        name:"Theory of Computation",

        file:TXT_FOLDER + "toc_pyq.txt"

    },

    coa:{

        name:"Computer Organization & Architecture",

        file:TXT_FOLDER + "coa_pyq.txt"

    },

    cd:{

        name:"Compiler Design",

        file:TXT_FOLDER + "cd_pyq.txt"

    },

    dm:{

        name:"Discrete Mathematics",

        file:TXT_FOLDER + "dm_pyq.txt"

    },

    algo:{

        name:"Algorithms",

        file:TXT_FOLDER + "algo_pyq.txt"

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
3. Select First Subject
4. Attach Event Listeners

-------------------------------------------------------------
*/

function init(){

    /* Load Local Storage */

    loadProgress();


    /* Create Sidebar */

    renderSubjects();


    /* Open First Subject */

    if(subjectKeys.length>0){

        loadSubject(subjectKeys[0]);

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

    /* Validate Subject */

    if(!subjects[subjectKey]){

        return;

    }


    /* Save Current Subject */

    currentSubjectKey = subjectKey;

    currentSubjectName = subjects[subjectKey].name;


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

    currentPlaylist = await loadTXT(

        subjects[subjectKey].file

    );


    /* Load Saved Progress */

    loadProgress();


    if(savedProgress[currentSubjectKey]){

        currentPlaylist.forEach((pyq,index)=>{

            if(savedProgress[currentSubjectKey][index]){

                pyq.completed = savedProgress[currentSubjectKey][index].completed;

                pyq.starred = savedProgress[currentSubjectKey][index].starred;

                pyq.marks = savedProgress[currentSubjectKey][index].marks;

            }

        });

    }


    /* Reset */

    currentVideoIndex = -1;


    /* Render */

    renderPYQGrid();

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

Input
-----
TXT File Path

Output
------
Array Of YouTube Links

Example
-------
[
    "https://youtu.be/xxxxx",
    "https://youtu.be/yyyyy"
]

-------------------------------------------------------------
*/

async function loadTXT(filePath){

    try{

        const response = await fetch(filePath);

        if(!response.ok){

            throw new Error("TXT File Not Found");

        }

        const text = await response.text();


  const links = text

    .split(/\r?\n/)

    .map(link => link.trim())

    .map(link => {

        const match = link.match(/https?:\/\/.+$/);

        return match ? match[0] : "";

    })

    .filter(link => link !== "")

    .map(link => {

        return{

            link:link,

            completed:false,

            starred:false,

            marks:1

        };

    });


return links;

    }

    catch(error){

        console.error(error);

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

// function extractVideoID(url){

//     if(!url){

//         return "";

//     }


//     /* Remove Extra Spaces */

//     url = url.trim();


//     /* youtu.be */

//     if(url.includes("youtu.be/")){

//         return url.split("youtu.be/")[1].split("?")[0];

//     }


//     /* watch?v= */

//     if(url.includes("watch?v=")){

//         return url.split("watch?v=")[1].split("&")[0];

//     }


//     /* embed */

//     if(url.includes("/embed/")){

//         return url.split("/embed/")[1].split("?")[0];

//     }


//     /* live */

//     if(url.includes("/live/")){

//         return url.split("/live/")[1].split("?")[0];

//     }


//     /* Unsupported */

//     return "";

// }


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

checkbox.textContent=pyq.completed ? "✅" : "☐";

        checkbox.addEventListener("click",(e)=>{

            e.stopPropagation();

            pyq.completed=!pyq.completed;

            saveProgress();

            renderPYQGrid();

            updateProgress();

        });


        /* ================= Star ================= */

        const star=document.createElement("span");

        star.className="pyq-star";

        star.textContent=pyq.starred ? "⭐" : "☆";


        star.addEventListener("click",(e)=>{

            e.stopPropagation();

            pyq.starred=!pyq.starred;

            saveProgress();

            renderPYQGrid();

            updateProgress();

        });


        /* ================= Title ================= */

        const title=document.createElement("div");

        title.className="pyq-title";

        title.textContent=`PYQ ${index+1}`;


        /* ================= Marks Container ================= */

        const marksContainer=document.createElement("div");

        marksContainer.className="pyq-marks";


        /* ================= 1M Button ================= */

        const oneMark=document.createElement("button");

        oneMark.className="pyq-mark-btn";

        oneMark.textContent="1M";


        /* ================= 2M Button ================= */

        const twoMark=document.createElement("button");

        twoMark.className="pyq-mark-btn";

        twoMark.textContent="2M";


        /* Initial State */

        if(pyq.marks===1){

            oneMark.classList.add("active");

            twoMark.style.display="none";

        }

        else if(pyq.marks===2){

            twoMark.classList.add("active");

            oneMark.style.display="none";

        }


        /* 1M Click */

        oneMark.addEventListener("click",(e)=>{

            e.stopPropagation();

            if(pyq.marks===1){

                pyq.marks=0;

            }

            else{

                pyq.marks=1;

            }

            saveProgress();

            renderPYQGrid();

            updateProgress();

        });


        /* 2M Click */

        twoMark.addEventListener("click",(e)=>{

            e.stopPropagation();

            if(pyq.marks===2){

                pyq.marks=0;

            }

            else{

                pyq.marks=2;

            }

            saveProgress();

            renderPYQGrid();

            updateProgress();

        });


        marksContainer.appendChild(oneMark);

        marksContainer.appendChild(twoMark);


        /* ================= Open Video ================= */

        card.addEventListener("click",()=>{

            window.open(

                pyq.link,

                "_blank"

            );

        });


        /* ================= Append ================= */

        card.appendChild(checkbox);

        card.appendChild(star);

        card.appendChild(title);

        card.appendChild(marksContainer);

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


    /* Refresh Button State */

    renderPYQGrid();


    /* Open Player */

    videoModal.style.display = "flex";


    // /* Get Video ID */

    // const videoID = extractVideoID(

    //     currentPlaylist[currentVideoIndex]

    // );


    /* Player Ready */

    if(

        player &&

        isPlayerReady

    ){

        player.loadVideoById(videoID);

    }

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

}


/* ===================== Player State ===================== */

function onPlayerStateChange(event){

    /* Video Finished */

    if(event.data===YT.PlayerState.ENDED){

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

    /* Last Video */

    if(currentVideoIndex >= currentPlaylist.length - 1){

        return;

    }

    playVideo(currentVideoIndex + 1);

}



function playPrevious(){

    /* First Video */

    if(currentVideoIndex <= 0){

        return;

    }

    playVideo(currentVideoIndex - 1);

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

    const total=currentPlaylist.length;

    const completed=currentPlaylist.filter(pyq=>pyq.completed).length;

    const pending=total-completed;

    const starred=currentPlaylist.filter(pyq=>pyq.starred).length;

    const oneMark=currentPlaylist.filter(pyq=>pyq.marks===1).length;

    const twoMarks=currentPlaylist.filter(pyq=>pyq.marks===2).length;


    /* ================= Progress ================= */

    const percentage=

        total===0

        ?0

        :(completed/total)*100;


    progressText.textContent=

        `Completed : ${completed} / ${total}`;


    progressBar.style.width=

        `${percentage}%`;


    /* ================= Subject Summary ================= */

    subjectStats.innerHTML=`

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

        <div class="stats-item">

            <span>1 Mark</span>

            <strong>${oneMark}</strong>

        </div>

        <div class="stats-item">

            <span>2 Marks</span>

            <strong>${twoMarks}</strong>

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

    searchBox.addEventListener(

        "input",

        function(){

            searchSubject(

                this.value

            );

        }

    );


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
Update Player State

Video End

↓

Mark Completed

↓

Play Next

-------------------------------------------------------------
*/

function onPlayerStateChange(event){

    if(event.data===YT.PlayerState.ENDED){

        markCurrentVideoCompleted();

        playNext();

    }

}


/*
-------------------------------------------------------------
Close Player

-------------------------------------------------------------
*/

function closeVideoPlayer(){

    videoModal.style.display="none";

    if(player && isPlayerReady){

        player.stopVideo();

    }

}


/* ==========================================================
================ END SECTION 20 =============================
========================================================== */