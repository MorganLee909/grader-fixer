// ==UserScript==
// @name         Assignment page pleasantries
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Display comments in a more readable manner. Add notice of Course type.
// @author       Lee Morgan
// @match        https://grading.bootcampspot.com/*
// @icon         https://grading.bootcampspot.com/favicon.png
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    let currentPage = window.location.href;

    const updateText = ()=>{
        let data = document.querySelector(".divided.equal.width.row").children[1].children[0].children[1];
        let header = data.children[0];
        let course = data.children[6].textContent;
        let type = "";
        let textColor = "";
        if(course.includes("FSF")){
            type = "Full Stack Flex";
            textColor = "blue";
        }else if(course.includes("FE") || course.includes("UK")){
            type = "Front End 16 Week";
            textColor = "green";
        }
        header.textContent = `${header.textContent} (${type})`;
        header.style.color = textColor;
        let program = data.children[4];
        program.innerHTML = `<strong>Program:</strong> ${type}`;

        let images = document.querySelectorAll("img");
        for(let i = 0; i < images.length; i++){
            images[i].style.maxWidth = "650px";
        }

        let comments = document.querySelector(".ten.wide.column .ten.wide.column").children[2].querySelectorAll(".ui.message");

        for(let i = 0; i < comments.length; i++){
            let textDiv = comments[i].children[0].children[2];
            let text = textDiv.textContent;
            text = text.split("\n");
            textDiv.textContent = "";
            for(let j = 0; j < text.length; j++){
                let p = document.createElement("p");
                p.textContent = text[j];
                p.style.marginBottom = "5px";
                textDiv.appendChild(p);
            }
        }
    }

    const handlePage = ()=>{
        if(currentPage.includes("canvasSubmission")){
            let comments = [];
            let awaitPage = setInterval(()=>{
                comments = document.querySelector(".ten.wide.column");
                if(comments !== null){
                    clearInterval(awaitPage)
                    updateText();
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