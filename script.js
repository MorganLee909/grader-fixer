// ==UserScript==
// @name         Fix BCS Grader
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Fixing things in BCS Grader that should have been fixed long ago
// @author       Lee Morgan
// @match        https://grading.bootcampspot.com/canvasSubmission/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const applyStyle = ()=>{
        const style = `
            .gradeDisplay{
                color: green;
                font-weight: bold;
            }

            .rubricFrame{
                width: 100%;
            }

            .rubricFrame span{
                font-size: 12px;
            }
        `;

        let styleElem = document.createElement("style");
        styleElem.textContent = style;
        document.body.appendChild(styleElem);
    }

    const rewriteText = (textElem, content)=>{
        textElem.textContent = "";
        let splitContent = content.split("\n");

        for(let j = 0; j < splitContent.length; j++){
            let p = document.createElement("p");
            p.textContent = splitContent[j];
            textElem.appendChild(p);
        }
    }

    const addGrade = (grade, metadataElem)=>{
        let p = document.createElement("p");
        p.classList.add("gradeDisplay");
        p.textContent = `Grade: ${grade.grade} / 100`;
        metadataElem.appendChild(p);
    }

    const getData = ()=>{
        let submissionId = window.location.pathname.split("/");
        submissionId = Number(submissionId[submissionId.length-1]);

        fetch("https://grading.bootcampspot.com/api/centralgrading/v1/submissionDetail", {
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                role: {
                    id: 1,
                    name: "Central Grader"
                },
                submissionId: submissionId
            })
        })
            .then(r=>r.json())
            .then((response)=>{
                let interval = setInterval(()=>{
                    if(document.querySelectorAll(".ui.header").length > 0){
                        clearInterval(interval);
                        let uiComments = document.querySelectorAll(".ui.comments .comment");
                        let commentIndex = 0;
                        let gradeIndex = 0;

                        for(let i = 0; i < response.data.length; i++){
                            if(response.data[i].key === "Comment"){
                                if(response.data[i].children[1].content === "Central Grader"){
                                    addGrade(response.relatedSubmissions[gradeIndex].grade, uiComments[commentIndex].querySelector(".metadata"));
                                    gradeIndex++;
                                }

                                rewriteText(uiComments[commentIndex].querySelector(".text"), response.data[i].content);
                                commentIndex++;
                            }
                        }
                    }
                }, 100)
            })
            .catch((err)=>{
                console.error(err);
            });
    }

    const addRubric = ()=>{
        let main = document.querySelector(".divided.equal.width.row");
        let module = main.querySelector("h2");
        let rubricElem = main.children[1].children[0].children[3];
        let container = document.querySelector(".ui.segment.active.tab");

        module = Number(module.textContent.split(" ")[1]);

        let frame = document.createElement("iframe");
        frame.classList.add("rubricFrame");
        frame.src = `https://leemorgan.io/2u/rubrics/${module}`;
        frame.style.height = `${container.clientHeight}px`;
        rubricElem.appendChild(frame);
    }

    let loadedInterval = setInterval(()=>{
        if(document.querySelectorAll(".ui.header").length > 0){
            clearInterval(loadedInterval);
            addRubric();
        }
    }, 100);

    getData();
    applyStyle();
})();