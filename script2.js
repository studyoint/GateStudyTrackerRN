/* ===================================================================
   01. IMPORTS & PDF CONFIGURATION
=================================================================== */

import * as pdfjsLib from "./pdf.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc =
"./pdf.worker.mjs";

/* ===================================================================
   END OF IMPORTS & PDF CONFIGURATION
=================================================================== */



/* ===================================================================
   02. DOM ELEMENTS
=================================================================== */

/* -----------------------------------
   FILE CONTROLS
----------------------------------- */

const pdfFile =
document.getElementById(
    "pdfFile"
);

/* -----------------------------------
   SCREENS
----------------------------------- */

const welcomeScreen =
document.getElementById(
    "welcomeScreen"
);

const viewer =
document.getElementById(
    "viewer"
);

/* -----------------------------------
   TOOLBAR BUTTONS
----------------------------------- */

const addTextBtn =
document.getElementById(
    "addTextBtn"
);

const laserBtn =
document.getElementById(
    "laserBtn"
);

const fullscreenBtn =
document.getElementById(
    "fullscreenBtn"
);

const pageNumberBtn =
document.getElementById(
    "pageNumberBtn"
);

const downloadBtn =
document.getElementById(
    "downloadBtn"
);

/* -----------------------------------
   TOOLBAR INPUTS
----------------------------------- */

const fontColorInput =
document.getElementById(
    "fontColor"
);

const fontSizeInput =
document.getElementById(
    "fontSize"
);

/* -----------------------------------
   TOOLBAR MENUS
----------------------------------- */

const laserMenu =
document.getElementById(
    "laserMenu"
);

/* -----------------------------------
   PDF CONTAINERS
----------------------------------- */

const pagesContainer =
document.getElementById(
    "pagesContainer"
);

/* ===================================================================
   END OF DOM ELEMENTS
=================================================================== */



/* ===================================================================
   03. APPLICATION STATE
=================================================================== */
/* -----------------------------------
   page number
----------------------------------- */

let pageNumberPreview = [];
/* -----------------------------------
   COMMENT SYSTEM
----------------------------------- */

let addTextMode = false;

let comments = [];

/* -----------------------------------
   LASER SYSTEM
----------------------------------- */

let laserMode = false;

let laserType = "dot";

let laserDot = null;

/* -----------------------------------
   PDF DATA
----------------------------------- */

let currentPdfName = "";

let currentPdfBytes = null;
let addPageNumbers = false;

/* -----------------------------------
   TEXT SETTINGS
----------------------------------- */

let selectedColor =
"#ff7a00";

let selectedFontSize =
18;

/* -----------------------------------
   DEBUG ACCESS
----------------------------------- */

window.comments =
comments;

/* ===================================================================
   END OF APPLICATION STATE
=================================================================== */



/* ===================================================================
   04. SETTINGS CONTROLS
=================================================================== */

/* -----------------------------------
   FONT COLOR
----------------------------------- */

fontColorInput.addEventListener(
    "input",
    (e)=>{

        selectedColor =
        e.target.value;

    }
);

/* -----------------------------------
   FONT SIZE
----------------------------------- */

fontSizeInput.addEventListener(
    "input",
    (e)=>{

        selectedFontSize =
        parseInt(
            e.target.value
        ) || 18;

    }
);

/* ===================================================================
   END OF SETTINGS CONTROLS
=================================================================== */



/* ===================================================================
   05. FULLSCREEN SYSTEM
=================================================================== */

/* -----------------------------------
   TOGGLE FULLSCREEN
----------------------------------- */

function toggleFullscreen(){

    if(
        !document.fullscreenElement
    ){

        document.documentElement
        .requestFullscreen();

        document.body.classList.add(
            "fullscreen-mode"
        );

    }
    else{

        document.exitFullscreen();

        document.body.classList.remove(
            "fullscreen-mode"
        );

    }

}

/* -----------------------------------
   FULLSCREEN CHANGE
----------------------------------- */

document.addEventListener(
    "fullscreenchange",
    ()=>{

        if(
            !document.fullscreenElement
        ){

            document.body.classList.remove(
                "fullscreen-mode"
            );

        }

    }
);

/* ===================================================================
   END OF FULLSCREEN SYSTEM
=================================================================== */



/* ===================================================================
   06. TOOLBAR ACTIONS
=================================================================== */

/* -----------------------------------
   FULLSCREEN BUTTON
----------------------------------- */

fullscreenBtn.addEventListener(
    "click",
    toggleFullscreen
);

/* -----------------------------------
   EXPORT BUTTON
----------------------------------- */

downloadBtn.addEventListener(
    "click",
    exportPdf
);

/* -----------------------------------
   ADD TEXT MODE
----------------------------------- */

addTextBtn.addEventListener(
    "click",
    ()=>{

        addTextMode =
        !addTextMode;

        addTextBtn.classList.toggle(
            "active",
            addTextMode
        );

    }
);

/* -----------------------------------
   PAGE NUMBER TOGGLE
----------------------------------- */
pageNumberBtn.addEventListener(
    "click",
    ()=>{

        addPageNumbers =
        !addPageNumbers;

        pageNumberBtn.classList.toggle(
            "active",
            addPageNumbers
        );

        renderPageNumbersPreview();

    }
);

/* ===================================================================
   END OF TOOLBAR ACTIONS
=================================================================== */



/* ===================================================================
   07. LASER SYSTEM
=================================================================== */

/* -----------------------------------
   OPEN / CLOSE MENU
----------------------------------- */

laserBtn.addEventListener(
    "click",
    ()=>{

        laserMenu.classList.toggle(
            "show"
        );

    }
);

/* -----------------------------------
   LASER MODE SELECTOR
----------------------------------- */

document
.querySelectorAll(
    ".laser-option"
)
.forEach(option=>{

    option.addEventListener(
        "click",
        ()=>{

            laserType =
            option.dataset.mode;

            laserMode =
            true;

            laserMenu.classList.remove(
                "show"
            );

            console.log(
                "Laser Mode:",
                laserType
            );

        }
    );

});

/* ===================================================================
   END OF LASER SYSTEM
=================================================================== */



/* ===================================================================
   PART 1 COMPLETE

   NEXT SECTION IN PART 2:

   08. PDF LOADER
   09. PAGE RENDERER
   10. COMMENT SYSTEM
   11. PDF EXPORT SYSTEM
   12. KEYBOARD SHORTCUTS
   13. DEBUG LOGS

=================================================================== */


/* ===================================================================
   08. PDF LOADER
=================================================================== */

pdfFile.addEventListener(
    "change",
    async (e)=>{

        const file =
        e.target.files[0];

        if(!file) return;

        /* -----------------------------------
           RESET OLD PDF DATA
        ----------------------------------- */

        pagesContainer.innerHTML =
        "";

        comments = [];

        window.comments =
        comments;

        currentPdfName =
        file.name;

        /* -----------------------------------
           READ PDF FILE
        ----------------------------------- */

        const buffer =
        await file.arrayBuffer();

        currentPdfBytes =
        buffer.slice(0);

        const pdf =
        await pdfjsLib
        .getDocument({
            data:buffer
        })
        .promise;

        /* -----------------------------------
           RENDER ALL PAGES
        ----------------------------------- */

        for(
            let pageNum = 1;
            pageNum <= pdf.numPages;
            pageNum++
        ){

            const page =
            await pdf.getPage(
                pageNum
            );

            await renderPage(
                page,
                pageNum
            );

        }

        /* -----------------------------------
           SHOW VIEWER
        ----------------------------------- */

        welcomeScreen.style.display =
        "none";

        viewer.style.display =
        "block";

        renderPageNumbersPreview();

        addTextBtn.disabled =
        false;



        console.log(
            "PDF Loaded:",
            pdf.numPages,
            "Pages"
        );

        console.log(
            "PDF Name:",
            currentPdfName
        );

    }
);

/* ===================================================================
   END OF PDF LOADER
=================================================================== */



/* ===================================================================
   09. PAGE RENDERER
=================================================================== */

async function renderPage(
    page,
    pageNum
){

    /* -----------------------------------
       VIEWPORT
    ----------------------------------- */

    const originalViewport =
    page.getViewport({
        scale:1
    });

    const pageWidth =
    originalViewport.width;

    const availableWidth =
    window.innerWidth - 120;

    const scale =
    (availableWidth / pageWidth)
    * 1.05;

    const viewport =
    page.getViewport({
        scale:scale
    });

    /* -----------------------------------
       PAGE CONTAINER
    ----------------------------------- */

    const pageContainer =
    document.createElement(
        "div"
    );

    pageContainer.className =
    "pageContainer";

    pageContainer.dataset.page =
    pageNum;

    /* -----------------------------------
       CANVAS
    ----------------------------------- */

    const canvas =
    document.createElement(
        "canvas"
    );

    const ctx =
    canvas.getContext(
        "2d"
    );

    canvas.width =
    viewport.width;

    canvas.height =
    viewport.height;

    /* -----------------------------------
       ANNOTATION LAYER
    ----------------------------------- */

    const annotationLayer =
    document.createElement(
        "div"
    );

    annotationLayer.className =
    "annotationLayer";

    annotationLayer.style.width =
    viewport.width + "px";

    annotationLayer.style.height =
    viewport.height + "px";

    /* -----------------------------------
       APPEND
    ----------------------------------- */

    pageContainer.appendChild(
        canvas
    );

    pageContainer.appendChild(
        annotationLayer
    );

    pagesContainer.appendChild(
        pageContainer
    );

    /* -----------------------------------
       PDF RENDER
    ----------------------------------- */

    await page.render({

        canvasContext:ctx,

        viewport:viewport

    }).promise;

    /* -----------------------------------
       ENABLE COMMENTS
    ----------------------------------- */

    setupAnnotationLayer(
        annotationLayer,
        pageNum
    );

  
}

      /* -----------------------------------
       page number
    ----------------------------------- */
    function renderPageNumbersPreview(){

    document
    .querySelectorAll(
        ".page-number-preview"
    )
    .forEach(el=>el.remove());

    if(!addPageNumbers)
        return;

    const totalPages =
    document.querySelectorAll(
        ".pageContainer"
    ).length;

    document
    .querySelectorAll(
        ".pageContainer"
    )
    .forEach(
        (page,index)=>{

            const label =
            document.createElement(
                "div"
            );

            label.className =
            "page-number-preview";

            label.innerText =
            `[${index + 1}/${totalPages}]`;

            page.appendChild(
                label
            );

        }
    );

}


/* ===================================================================
   END OF PAGE RENDERER
=================================================================== */



/* ===================================================================
   10. COMMENT SYSTEM
=================================================================== */

function setupAnnotationLayer(
    annotationLayer,
    pageNum
){

    annotationLayer.addEventListener(
        "click",
        (e)=>{

            if(
                e.target !==
                annotationLayer
            ){
                return;
            }

            if(
                !addTextMode
            ){
                return;
            }

            const commentData = {

                page:pageNum,

                x:e.offsetX,

                y:e.offsetY,

                text:""

            };

            comments.push(
                commentData
            );

            const note =
            document.createElement(
                "div"
            );

            note.className =
            "note";

            note.contentEditable =
            true;

            note.style.color =
            selectedColor;

            note.style.fontSize =
            selectedFontSize + "px";

            note.style.left =
            e.offsetX + "px";

            note.style.top =
            e.offsetY + "px";

            annotationLayer.appendChild(
                note
            );

            note.addEventListener(
                "click",
                (e)=>{

                    e.stopPropagation();

                }
            );

            note.addEventListener(
                "input",
                ()=>{

                    commentData.text =
                    note.innerText;

                }
            );

            note.focus();

        }
    );

}

/* ===================================================================
   END OF COMMENT SYSTEM
=================================================================== */



/* ===================================================================
   11. PDF EXPORT SYSTEM
=================================================================== */

async function exportPdf(){

    try{

        if(
            !currentPdfBytes
        ){

            alert(
                "No PDF Loaded"
            );

            return;

        }

        const pdfDoc =
        await PDFLib
        .PDFDocument
        .load(
            currentPdfBytes
        );

        const pages =
        pdfDoc.getPages();

        /* -----------------------------------
   PAGE NUMBERS
----------------------------------- */

/* -----------------------------------
   PAGE NUMBERS
----------------------------------- */

if(addPageNumbers){

    const totalPages =
    pages.length;

    pages.forEach(
        (page,index)=>{

            const pageText =
            `[${index + 1}/${totalPages}]`;

            page.drawText(

                pageText,

                {

                    x:25,

                    y:20,

                    size:16,

                    color:
                    PDFLib.rgb(
                        0,
                        0.75,
                        1
                    )

                }

            );

        }
    );

}

        /* -----------------------------------
           DRAW COMMENTS
        ----------------------------------- */

        for(
            const comment
            of comments
        ){

            const page =
            pages[
                comment.page - 1
            ];

            if(!page)
                continue;

            const pageHeight =
            page.getHeight();

            page.drawText(

                comment.text || "",

                {

                    x:Number(
                        comment.x
                    ),

                    y:
                    pageHeight -
                    Number(
                        comment.y
                    ),

                    size:18,

                    color:
                    PDFLib.rgb(
                        1,
                        0.5,
                        0
                    )

                }

            );

        }

        /* -----------------------------------
           SAVE PDF
        ----------------------------------- */

        const pdfBytes =
        await pdfDoc.save();

        const blob =
        new Blob(

            [pdfBytes],

            {
                type:
                "application/pdf"
            }

        );

        const url =
        URL.createObjectURL(
            blob
        );

        const a =
        document.createElement(
            "a"
        );

        a.href = url;

        a.download =
        currentPdfName;

        document.body.appendChild(
            a
        );

        a.click();

        a.remove();

        URL.revokeObjectURL(
            url
        );

        console.log(
            "PDF EXPORTED"
        );

    }
    catch(err){

        console.error(
            "EXPORT ERROR:",
            err
        );

        alert(
            err.message
        );

    }

}

/* ===================================================================
   END OF PDF EXPORT SYSTEM
=================================================================== */



/* ===================================================================
   12. KEYBOARD SHORTCUTS
=================================================================== */

document.addEventListener(
    "keydown",
    (e)=>{

        /* -----------------------------------
           CTRL + K
           FULLSCREEN
        ----------------------------------- */

        if(

            e.ctrlKey &&

            e.key.toLowerCase()
            === "k"

        ){

            e.preventDefault();

            toggleFullscreen();

        }

        /* -----------------------------------
           CTRL + SHIFT + S
           EXPORT PDF
        ----------------------------------- */

        if(

            e.ctrlKey &&

            e.shiftKey &&

            e.key.toLowerCase()
            === "s"

        ){

            e.preventDefault();

            exportPdf();

        }

    }
);

/* ===================================================================
   END OF KEYBOARD SHORTCUTS
=================================================================== */



/* ===================================================================
   13. DEBUG LOGS
=================================================================== */

console.log(
    "COMMENTS =",
    comments
);

console.log(
    "PDFLib =",
    PDFLib
);

/* ===================================================================
   END OF DEBUG LOGS
=================================================================== */



/* ===================================================================
   FILE STRUCTURE SUMMARY
===================================================================

01. IMPORTS & PDF CONFIGURATION
02. DOM ELEMENTS
03. APPLICATION STATE
04. SETTINGS CONTROLS
05. FULLSCREEN SYSTEM
06. TOOLBAR ACTIONS
07. LASER SYSTEM
08. PDF LOADER
09. PAGE RENDERER
10. COMMENT SYSTEM
11. PDF EXPORT SYSTEM
12. KEYBOARD SHORTCUTS
13. DEBUG LOGS

=================================================================== */