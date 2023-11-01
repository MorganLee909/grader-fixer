// ==UserScript==
// @name         Rubric
// @namespace    http://tampermonkey.net/
// @version      1
// @description  Add rubric to the "Rubric" tab
// @author       Lee Morgan
// @match        https://grading.bootcampspot.com/*
// @icon         https://grading.bootcampspot.com/favicon.png
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    let currentPage = window.location.href;

    const displayRubric = ()=>{
        let main = document.querySelector(".divided.equal.width.row");
        let rubricElem = main.children[1].children[0].children[3];
        let container = document.querySelector(".ui.segment.active.tab");

        //Add style
        let style = document.createElement("style");
        style.textContent = `
            .rubricFrame{
                width: 100%;
            }
            .rubricFrame span{
                font-size: 12px;
            }
            .column > .ui.container{
                width: 90%;
            }
            .ui.container.stackable.grid{
                width: 90% !important;
            }
            #root .ten.wide.column{
                width: 700px !important;
                padding-left: 0;
            }
        `;
        document.body.insertBefore(style, document.body.firstChild);

        //Create rubric URL
        let course = document.querySelector(".divided.equal.width.row").children[1].children[0].children[1].children[6].textContent;
        course = course.includes("FSF") ? "fsf" : "fe";
        let module = main.querySelector("h2").textContent;
        module = Number(module.split(" ")[1]);
        module = `${course}${module}`;

        //Create frame with link to rubric
        let frame = document.createElement("iframe");
        frame.classList.add("rubricFrame");
        frame.src = `https://leemorgan.io/2u/rubrics/${module}`;
        frame.style.height = `${container.clientHeight}px`;
        rubricElem.appendChild(frame);
    }

    const handlePage = ()=>{
        if(currentPage.includes("canvasSubmission")){
            let comments = [];
            let awaitPage = setInterval(()=>{
                comments = document.querySelector(".ten.wide.column");
                if(comments !== null){
                    clearInterval(awaitPage)
                    displayRubric();
                }
            });
        }
    }

    setInterval(()=>{
        let newUrl = window.location.href;
        if(newUrl !== currentPage){
            currentPage = newUrl;
            handlePage();
        }
    }, 250);

    handlePage();
})();