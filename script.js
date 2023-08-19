// ==UserScript==
// @name         Fix BCS Grader
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Fixing things in BCS Grader that should have been fixed long ago
// @author       Lee Morgan
// @match        https://grading.bootcampspot.com/*
// @icon         https://grading.bootcampspot.com/favicon.png
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    let currentPage = window.location.href;
    let ungraded = [];
    let waitingReview = [];
    let pastDue = [];

    //CREATE CLONABLE ASSIGNMENTCARD
    let clonableAssCard = document.createElement("div");
    clonableAssCard.innerHTML = '<div style="padding: 10px; border: 1px solid rgb(222, 222, 223); border-radius: 5px;" class="item queue-item canvas"><div style="position: relative;" class="content"><a href="https://grading.bootcampspot.com/canvasSubmission/820697"><div style="font-size: 20px; font-weight: bold; color: black; width: 50%;" class="header">Module 21 Challenge</div></a><div style="display: flex; flex-direction: row-reverse; align-items: center;"><div style="margin-right: 10px; margin-top: -1.5em;"></div></div><div class="description"><div class="ui grid"><div class="six wide computer sixteen wide mobile six wide tablet column"><p>In Progress</p><p>2023-08-18T02:13:46.947976Z</p><p>2023-08-18T04:59:59Z</p><p>Full Stack Flex</p></div><div class="six wide computer sixteen wide mobile six wide tablet column"><p>Cotton, Gage</p><p>UTA-VIRT-FSF-PT-03-2023-U-LOLC-MWTH(A)</p></div></div></div><a style="bottom: 0px; right: 0px; position: absolute;" class="ui grey button" role="button" href="https://grading.bootcampspot.com/canvasSubmission/820697"><i class="right arrow icon"></i></a></div></div>';
    clonableAssCard = clonableAssCard.firstChild;

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

    const getAssignmentData = ()=>{
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

    const createAssCard = (data)=>{
        let newCard = clonableAssCard.cloneNode(true);

        let header = newCard.querySelector(".header");
        header.textContent = data.assignmentName;
        header.parentElement.href = `https://grading.bootcampspot.com/canvasSubmission/${data.id}`;

        let descContainerLeft = newCard.querySelector(".description > .ui.grid").children[0];
        descContainerLeft.children[0].textContent = data.status;
        descContainerLeft.children[1].textContent = data.date;
        descContainerLeft.children[2].textContent = data.assignmentDueDate;
        descContainerLeft.children[3].textContent = data.program.name;

        let descContainerRight = newCard.querySelector(".description > .ui.grid").children[1];
        descContainerRight.children[0].textContent = data.studentName;
        descContainerRight.children[1].textContent = data.course.name;

        newCard.querySelector(".ui.grey.button").href = `https://grading.bootcampspot.com/canvasSubmission/${data.id}`;

        return newCard;
    }

    const displayAssignments = (assignments, container)=>{
        let assCardContainer = container.querySelector(".ui.items");

        while(assCardContainer.children.length > 0){
            assCardContainer.removeChild(assCardContainer.lastChild);
        }
        for(let i = 0; i < assignments.length; i++){
            let newCard = createAssCard(assignments[i]);
            assCardContainer.appendChild(newCard);
        }

        try{
            document.querySelector(".ui.pagination.menu").style.display = "none";
        }catch(e){}
    }

    const getClaimed = (container)=>{
        fetch("https://grading.bootcampspot.com/api/centralgrading/v1/myClaimedSubmissions", {
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                offset: 0,
                resultsPerPage: 500,
                role: {
                    id: 1,
                    name: "Central Grader"
                }
            })
        })
            .then(r=>r.json())
            .then((response)=>{
                ungraded = [];
                waitingReview = [];
                pastDue = [];
                for(let i = 0; i < response.data.length; i++){
                    let status = response.data[i].status;
                    if(status === "In Progress"){
                        ungraded.push(response.data[i]);
                    }else if(status === "Ready for Review" || status === "Flagged"){
                        waitingReview.push(response.data[i]);
                    }else{
                        pastDue.push(response.data[i]);
                    }
                }

                displayAssignments(ungraded, container);
            })
            .catch((err)=>{
                console.error(err);
            });
    }

    const submissionPage = ()=>{
        getAssignmentData();

        let loadedInterval = setInterval(()=>{
            if(!currentPage.includes("canvasSubmission")) clearInterval(loadedInterval);
            if(document.querySelectorAll(".ui.header").length > 0){
                clearInterval(loadedInterval);
                addRubric();
            }
        }, 100);
    }

    const claimedPage = ()=>{
        let container = null;
        let uiGrid = null;
        let newContainer = document.createElement("div");
        let wait = setInterval(()=>{
            try{
                uiGrid = document.querySelector(".ui.grid");
                container = uiGrid.children[1];
            }catch(e){}

            if(container !== null){
                clearInterval(wait);
                container.style.display = "none";

                //Create and modify new container
                newContainer = container.cloneNode(true);
                let menu = newContainer.querySelector(".ui.secondary.menu");

                for(let i = 0; i < menu.children.length; i++){
                    menu.children[i].addEventListener("click", ()=>{
                        for(let j = 0; j < menu.children.length; j++){
                            menu.children[j].classList.remove("active");
                        }

                        let data = [];
                        switch(i){
                            case 0: data = ungraded; break;
                            case 1: data = pastDue; break;
                            case 2: data = waitingReview; break;
                        }

                        menu.children[i].classList.add("active");
                        displayAssignments(data, newContainer);
                    });
                }

                newContainer.style.display = "block";
                uiGrid.appendChild(newContainer);
                getClaimed(newContainer);
            }
        }, 100);


    }

    // HANDLE PAGE CHANGES
    const handlePage = ()=>{
        if(currentPage.includes("canvasSubmission")) submissionPage();
        if(currentPage.includes("claimed")) claimedPage();
    }

    setInterval(()=>{
        let newUrl = window.location.href;
        if(newUrl !== currentPage){
            currentPage = newUrl;
            handlePage();
        }
    }, 250);

    handlePage();
    applyStyle();
})();