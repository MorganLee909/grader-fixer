// ==UserScript==
// @name         Graded assignments
// @namespace    http://tampermonkey.net/
// @version      1
// @description  Records assignments that are graded
// @author       Lee Morgan
// @match        https://grading.bootcampspot.com/*
// @icon         https://grading.bootcampspot.com/favicon.png
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    let currentPage = window.location.href;

    const addSaveAssignment = ()=>{
        let button = document.querySelector(".ui.green.icon.positive.right.labeled.button");
        button.addEventListener("click", ()=>{
            let info = document.querySelector(".divided.equal.width.row").children[1].children[0].children[1];

            let url = window.location.href.split("/");
            url = url[url.length-1];

            let module = info.children[0].innerText;
            module = module.split(" ");
            module = module[1];

            let grade = "";
            let gradeOptions = document.querySelectorAll(".ui.toggle.checkbox input");
            if(gradeOptions[0].checked){
                grade = "plagiarism";
            }else if(gradeOptions[1].checked){
                grade = "incomplete";
            }else{
                grade = document.querySelector(".gradeInputBoxForCanvas").children[0].value;
            }

            let time = new Date();
            time = time.toISOString();

            let graded = localStorage.getItem("graded");
            graded = graded ? graded : "";
            graded += `${url},${module},${grade},${time}\n`;

            localStorage.setItem("graded", graded);
        });
    }

    const downloadGraded = ()=>{
        //Add style
        let style = document.createElement("style");
        style.textContent = `
            #downloadGraded{
                height: 50%;
                background: green;
                border: none;
                z-index: 999;
                cursor: pointer;
                color: white;
                padding: 5px;
                margin: auto 0;
                box-shadow: 0 0 5px black;
            }
        `;
        document.body.insertBefore(style, document.body.firstChild);

        let button = document.createElement("button");
        button.textContent = "Download Graded";
        button.id = "downloadGraded";
        let header = document.querySelector(".ui.top.fixed.menu").children[0];
        header.insertBefore(button, header.children[1]);

        button.addEventListener("click", ()=>{
            let header = "urlId,module,grade,timestamp\n";

            let graded = localStorage.getItem("graded");
            graded = graded ? graded : "";
            let file = new Blob([header, graded]);
            let a = document.createElement("a");
            let url = URL.createObjectURL(file);
            a.href = url;
            a.download = "gradedAssignments.csv";
            document.body.appendChild(a);
            a.click();
        });
    }

    const handlePage = ()=>{
        if(currentPage.includes("canvasSubmission")){
            let comments = [];
            let awaitPage = setInterval(()=>{
                comments = document.querySelector(".ten.wide.column");
                if(comments !== null){
                    clearInterval(awaitPage)
                    addSaveAssignment();
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
    downloadGraded();
})();